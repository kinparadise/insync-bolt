package com.insync.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public class MeetingSettingsResponse {
    private String meetingId;
    private Map<String, Object> settings;
    private LocalDateTime updatedAt;

    public MeetingSettingsResponse() {}

    public MeetingSettingsResponse(String meetingId, Map<String, Object> settings, LocalDateTime updatedAt) {
        this.meetingId = meetingId;
        this.settings = settings;
        this.updatedAt = updatedAt;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = settings;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 