package com.insync.dto.request;

import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class RescheduleMeetingRequest {
    
    @NotNull(message = "New start time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime newStartTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime newEndTime;
    
    // Constructors
    public RescheduleMeetingRequest() {}
    
    public RescheduleMeetingRequest(LocalDateTime newStartTime, LocalDateTime newEndTime) {
        this.newStartTime = newStartTime;
        this.newEndTime = newEndTime;
    }
    
    // Getters and Setters
    public LocalDateTime getNewStartTime() {
        return newStartTime;
    }
    
    public void setNewStartTime(LocalDateTime newStartTime) {
        this.newStartTime = newStartTime;
    }
    
    public LocalDateTime getNewEndTime() {
        return newEndTime;
    }
    
    public void setNewEndTime(LocalDateTime newEndTime) {
        this.newEndTime = newEndTime;
    }
}
