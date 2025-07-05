-- Create calls table
CREATE TABLE calls (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    call_id VARCHAR(255) UNIQUE NOT NULL,
    caller_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    type ENUM('AUDIO', 'VIDEO') NOT NULL,
    status ENUM('PENDING', 'RINGING', 'ACCEPTED', 'DECLINED', 'MISSED', 'ENDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    duration_seconds INT NULL,
    end_reason VARCHAR(500),
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_call_id (call_id),
    INDEX idx_caller_id (caller_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
