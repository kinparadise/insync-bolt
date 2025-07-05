package com.insync.dto.request;

import com.insync.entity.Call;

public class InitiateCallRequest {
    private Long receiverId;
    private Call.CallType type;

    // Constructors
    public InitiateCallRequest() {}

    public InitiateCallRequest(Long receiverId, Call.CallType type) {
        this.receiverId = receiverId;
        this.type = type;
    }

    // Getters and Setters
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public Call.CallType getType() { return type; }
    public void setType(Call.CallType type) { this.type = type; }
}
