// Circuit breaker to prevent infinite API calls
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly timeWindow: number;

  constructor(
    failureThreshold = 5,
    recoveryTimeout = 30000, // 30 seconds
    timeWindow = 60000 // 1 minute
  ) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.timeWindow = timeWindow;
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker moving to HALF_OPEN state');
      } else {
        console.log('Circuit breaker is OPEN, rejecting request');
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN - too many failures');
      }
    }

    try {
      const result = await operation();
      
      // Reset on success
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.log('Circuit breaker reset to CLOSED state');
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // Reset count if failures are outside time window
    if (this.lastFailureTime - this.lastFailureTime > this.timeWindow) {
      this.failureCount = 1;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`Circuit breaker OPENED after ${this.failureCount} failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
    console.log('Circuit breaker manually reset');
  }
}

// Create circuit breakers for different API operations with adjusted settings for video calling app
export const authCircuitBreaker = new CircuitBreaker(5, 30000, 60000); // 5 failures, 30s recovery, 1min window
export const meetingsCircuitBreaker = new CircuitBreaker(8, 45000, 120000); // 8 failures, 45s recovery, 2min window  
export const generalApiCircuitBreaker = new CircuitBreaker(15, 30000, 60000); // 15 failures, 30s recovery, 1min window

// Utility to prevent rapid successive calls
class RateLimiter {
  private lastCallTime = 0;
  private readonly minInterval: number;

  constructor(minInterval = 1000) { // 1 second by default
    this.minInterval = minInterval;
  }

  canExecute(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime >= this.minInterval) {
      this.lastCallTime = now;
      return true;
    }
    return false;
  }

  getTimeUntilNext(): number {
    const now = Date.now();
    const timeElapsed = now - this.lastCallTime;
    return Math.max(0, this.minInterval - timeElapsed);
  }
}

export const authRateLimiter = new RateLimiter(1500); // 1.5 seconds between auth calls
export const meetingsRateLimiter = new RateLimiter(500); // 0.5 seconds between meeting calls
