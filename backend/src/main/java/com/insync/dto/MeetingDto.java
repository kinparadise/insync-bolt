package com.insync.dto;

import com.insync.entity.Meeting;

import java.time.LocalDateTime;
import java.util.List;

public class MeetingDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private UserDto host;
    private Meeting.MeetingStatus status;
    private Meeting.MeetingType type;
    private String meetingId;
    private String recordingUrl;
    private String transcriptUrl;
    private List<MeetingParticipantDto> participants;
    private List<ActionItemDto> actionItems;
    private LocalDateTime createdAt;

    // Constructors
    public MeetingDto() {}

    public MeetingDto(Meeting meeting) {
        this.id = meeting.getId();
        this.title = meeting.getTitle();
        this.description = meeting.getDescription();
        this.startTime = meeting.getStartTime();
        this.endTime = meeting.getEndTime();
        this.host = new UserDto(meeting.getHost());
        this.status = meeting.getStatus();
        this.type = meeting.getType();
        this.meetingId = meeting.getMeetingId();
        this.recordingUrl = meeting.getRecordingUrl();
        this.transcriptUrl = meeting.getTranscriptUrl();
        this.createdAt = meeting.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public UserDto getHost() { return host; }
    public void setHost(UserDto host) { this.host = host; }

    public Meeting.MeetingStatus getStatus() { return status; }
    public void setStatus(Meeting.MeetingStatus status) { this.status = status; }

    public Meeting.MeetingType getType() { return type; }
    public void setType(Meeting.MeetingType type) { this.type = type; }

    public String getMeetingId() { return meetingId; }
    public void setMeetingId(String meetingId) { this.meetingId = meetingId; }

    public String getRecordingUrl() { return recordingUrl; }
    public void setRecordingUrl(String recordingUrl) { this.recordingUrl = recordingUrl; }

    public String getTranscriptUrl() { return transcriptUrl; }
    public void setTranscriptUrl(String transcriptUrl) { this.transcriptUrl = transcriptUrl; }

    public List<MeetingParticipantDto> getParticipants() { return participants; }
    public void setParticipants(List<MeetingParticipantDto> participants) { this.participants = participants; }

    public List<ActionItemDto> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItemDto> actionItems) { this.actionItems = actionItems; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}