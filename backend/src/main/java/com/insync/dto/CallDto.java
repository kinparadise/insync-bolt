package com.insync.dto;

import com.insync.entity.Call;

import java.time.LocalDateTime;

public class CallDto {
    private Long id;
    private String callId;
    private UserDto caller;
    private UserDto receiver;
    private Call.CallType type;
    private Call.CallStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;
    private String endReason;

    // Constructors
    public CallDto() {}

    public CallDto(Call call) {
        this.id = call.getId();
        this.callId = call.getCallId();
        this.caller = new UserDto(call.getCaller());
        this.receiver = new UserDto(call.getReceiver());
        this.type = call.getType();
        this.status = call.getStatus();
        this.createdAt = call.getCreatedAt();
        this.startedAt = call.getStartedAt();
        this.endedAt = call.getEndedAt();
        this.durationSeconds = call.getDurationSeconds();
        this.endReason = call.getEndReason();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public UserDto getCaller() { return caller; }
    public void setCaller(UserDto caller) { this.caller = caller; }

    public UserDto getReceiver() { return receiver; }
    public void setReceiver(UserDto receiver) { this.receiver = receiver; }

    public Call.CallType getType() { return type; }
    public void setType(Call.CallType type) { this.type = type; }

    public Call.CallStatus getStatus() { return status; }
    public void setStatus(Call.CallStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getEndReason() { return endReason; }
    public void setEndReason(String endReason) { this.endReason = endReason; }
}
