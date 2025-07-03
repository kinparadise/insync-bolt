package com.insync.dto;

import com.insync.entity.MeetingParticipant;

import java.time.LocalDateTime;

public class MeetingParticipantDto {
    private Long id;
    private UserDto user;
    private LocalDateTime joinTime;
    private LocalDateTime leaveTime;
    private Integer speakingTimeMinutes;
    private Integer cameraOnTimeMinutes;
    private Integer micOnTimeMinutes;
    private Integer messagesCount;
    private Integer engagementScore;
    private MeetingParticipant.ParticipantStatus status;

    // Constructors
    public MeetingParticipantDto() {}

    public MeetingParticipantDto(MeetingParticipant participant) {
        this.id = participant.getId();
        this.user = new UserDto(participant.getUser());
        this.joinTime = participant.getJoinTime();
        this.leaveTime = participant.getLeaveTime();
        this.speakingTimeMinutes = participant.getSpeakingTimeMinutes();
        this.cameraOnTimeMinutes = participant.getCameraOnTimeMinutes();
        this.micOnTimeMinutes = participant.getMicOnTimeMinutes();
        this.messagesCount = participant.getMessagesCount();
        this.engagementScore = participant.getEngagementScore();
        this.status = participant.getStatus();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public LocalDateTime getJoinTime() { return joinTime; }
    public void setJoinTime(LocalDateTime joinTime) { this.joinTime = joinTime; }

    public LocalDateTime getLeaveTime() { return leaveTime; }
    public void setLeaveTime(LocalDateTime leaveTime) { this.leaveTime = leaveTime; }

    public Integer getSpeakingTimeMinutes() { return speakingTimeMinutes; }
    public void setSpeakingTimeMinutes(Integer speakingTimeMinutes) { this.speakingTimeMinutes = speakingTimeMinutes; }

    public Integer getCameraOnTimeMinutes() { return cameraOnTimeMinutes; }
    public void setCameraOnTimeMinutes(Integer cameraOnTimeMinutes) { this.cameraOnTimeMinutes = cameraOnTimeMinutes; }

    public Integer getMicOnTimeMinutes() { return micOnTimeMinutes; }
    public void setMicOnTimeMinutes(Integer micOnTimeMinutes) { this.micOnTimeMinutes = micOnTimeMinutes; }

    public Integer getMessagesCount() { return messagesCount; }
    public void setMessagesCount(Integer messagesCount) { this.messagesCount = messagesCount; }

    public Integer getEngagementScore() { return engagementScore; }
    public void setEngagementScore(Integer engagementScore) { this.engagementScore = engagementScore; }

    public MeetingParticipant.ParticipantStatus getStatus() { return status; }
    public void setStatus(MeetingParticipant.ParticipantStatus status) { this.status = status; }
}