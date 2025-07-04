package com.insync.dto.request;

import jakarta.validation.constraints.NotBlank;

public class JoinMeetingRequest {
    @NotBlank
    private String meetingId;

    // Constructors
    public JoinMeetingRequest() {}

    public JoinMeetingRequest(String meetingId) {
        this.meetingId = meetingId;
    }

    // Getters and Setters
    public String getMeetingId() { return meetingId; }
    public void setMeetingId(String meetingId) { this.meetingId = meetingId; }
}
