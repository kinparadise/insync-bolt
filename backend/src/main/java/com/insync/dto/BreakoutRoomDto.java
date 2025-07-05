package com.insync.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BreakoutRoomDto {
    private String id;
    private String name;
    private List<Long> participantIds;
    private Boolean isActive;
    private Integer maxParticipants;
    private LocalDateTime createdAt;

    public BreakoutRoomDto() {}

    public BreakoutRoomDto(String id, String name, List<Long> participantIds, Boolean isActive, 
                          Integer maxParticipants, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.participantIds = participantIds;
        this.isActive = isActive;
        this.maxParticipants = maxParticipants;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Long> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<Long> participantIds) {
        this.participantIds = participantIds;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 