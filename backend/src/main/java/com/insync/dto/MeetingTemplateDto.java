package com.insync.dto;

import java.time.Duration;

import com.insync.entity.Meeting;

public class MeetingTemplateDto {
    private String id;
    private String name;
    private String description;
    private Duration duration;
    private Meeting.MeetingType type;
    private String category;
    private String icon;
    private String color;
    private String participants;
    private boolean isDefault;

    public MeetingTemplateDto() {}

    public MeetingTemplateDto(String id, String name, String description, Duration duration, 
                             Meeting.MeetingType type, String category, String icon, String color, 
                             String participants, boolean isDefault) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.type = type;
        this.category = category;
        this.icon = icon;
        this.color = color;
        this.participants = participants;
        this.isDefault = isDefault;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Duration getDuration() {
        return duration;
    }

    public void setDuration(Duration duration) {
        this.duration = duration;
    }

    public Meeting.MeetingType getType() {
        return type;
    }

    public void setType(Meeting.MeetingType type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getParticipants() {
        return participants;
    }

    public void setParticipants(String participants) {
        this.participants = participants;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }
} 