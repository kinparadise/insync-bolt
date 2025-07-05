package com.insync.dto.request;

public class ChatMessageRequest {
    private String message;
    private String type;

    public ChatMessageRequest() {}

    public ChatMessageRequest(String message, String type) {
        this.message = message;
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
} 