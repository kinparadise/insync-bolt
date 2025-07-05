package com.insync.dto.request;

public class CreateBreakoutRoomRequest {
    private String name;
    private Integer maxParticipants;

    public CreateBreakoutRoomRequest() {}

    public CreateBreakoutRoomRequest(String name, Integer maxParticipants) {
        this.name = name;
        this.maxParticipants = maxParticipants;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
} 