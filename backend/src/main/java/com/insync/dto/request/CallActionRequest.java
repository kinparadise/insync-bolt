package com.insync.dto.request;

import com.insync.entity.Call;

public class CallActionRequest {
    private String callId;
    private Call.CallStatus action;
    private String reason;

    // Constructors
    public CallActionRequest() {}

    public CallActionRequest(String callId, Call.CallStatus action) {
        this.callId = callId;
        this.action = action;
    }

    public CallActionRequest(String callId, Call.CallStatus action, String reason) {
        this.callId = callId;
        this.action = action;
        this.reason = reason;
    }

    // Getters and Setters
    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public Call.CallStatus getAction() { return action; }
    public void setAction(Call.CallStatus action) { this.action = action; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
