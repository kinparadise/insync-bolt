package com.insync.dto.request;

import java.util.Map;

public class MeetingSettingsRequest {
    private Map<String, Object> settings;

    public MeetingSettingsRequest() {}

    public MeetingSettingsRequest(Map<String, Object> settings) {
        this.settings = settings;
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = settings;
    }
} 