package com.insync.dto;

import java.time.LocalDateTime;

public class CallParticipantDto {
    private Long id;
    private UserDto user;
    private String name;
    private String avatar;
    private Boolean isMuted;
    private Boolean isVideoOn;
    private Boolean isHandRaised;
    private Boolean isScreenSharing;
    private Boolean isPresenter;
    private Boolean isInBreakoutRoom;
    private String breakoutRoomId;
    private String connectionQuality;
    private LocalDateTime joinTime;
    private LocalDateTime leaveTime;
    private Integer speakingTimeMinutes;
    private Integer cameraOnTimeMinutes;
    private Integer micOnTimeMinutes;
    private Integer messagesCount;
    private Integer engagementScore;
    private String status;

    public CallParticipantDto() {}

    public CallParticipantDto(Long id, UserDto user, String name, String avatar) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.avatar = avatar;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Boolean getIsMuted() {
        return isMuted;
    }

    public void setIsMuted(Boolean isMuted) {
        this.isMuted = isMuted;
    }

    public Boolean getIsVideoOn() {
        return isVideoOn;
    }

    public void setIsVideoOn(Boolean isVideoOn) {
        this.isVideoOn = isVideoOn;
    }

    public Boolean getIsHandRaised() {
        return isHandRaised;
    }

    public void setIsHandRaised(Boolean isHandRaised) {
        this.isHandRaised = isHandRaised;
    }

    public Boolean getIsScreenSharing() {
        return isScreenSharing;
    }

    public void setIsScreenSharing(Boolean isScreenSharing) {
        this.isScreenSharing = isScreenSharing;
    }

    public Boolean getIsPresenter() {
        return isPresenter;
    }

    public void setIsPresenter(Boolean isPresenter) {
        this.isPresenter = isPresenter;
    }

    public Boolean getIsInBreakoutRoom() {
        return isInBreakoutRoom;
    }

    public void setIsInBreakoutRoom(Boolean isInBreakoutRoom) {
        this.isInBreakoutRoom = isInBreakoutRoom;
    }

    public String getBreakoutRoomId() {
        return breakoutRoomId;
    }

    public void setBreakoutRoomId(String breakoutRoomId) {
        this.breakoutRoomId = breakoutRoomId;
    }

    public String getConnectionQuality() {
        return connectionQuality;
    }

    public void setConnectionQuality(String connectionQuality) {
        this.connectionQuality = connectionQuality;
    }

    public LocalDateTime getJoinTime() {
        return joinTime;
    }

    public void setJoinTime(LocalDateTime joinTime) {
        this.joinTime = joinTime;
    }

    public LocalDateTime getLeaveTime() {
        return leaveTime;
    }

    public void setLeaveTime(LocalDateTime leaveTime) {
        this.leaveTime = leaveTime;
    }

    public Integer getSpeakingTimeMinutes() {
        return speakingTimeMinutes;
    }

    public void setSpeakingTimeMinutes(Integer speakingTimeMinutes) {
        this.speakingTimeMinutes = speakingTimeMinutes;
    }

    public Integer getCameraOnTimeMinutes() {
        return cameraOnTimeMinutes;
    }

    public void setCameraOnTimeMinutes(Integer cameraOnTimeMinutes) {
        this.cameraOnTimeMinutes = cameraOnTimeMinutes;
    }

    public Integer getMicOnTimeMinutes() {
        return micOnTimeMinutes;
    }

    public void setMicOnTimeMinutes(Integer micOnTimeMinutes) {
        this.micOnTimeMinutes = micOnTimeMinutes;
    }

    public Integer getMessagesCount() {
        return messagesCount;
    }

    public void setMessagesCount(Integer messagesCount) {
        this.messagesCount = messagesCount;
    }

    public Integer getEngagementScore() {
        return engagementScore;
    }

    public void setEngagementScore(Integer engagementScore) {
        this.engagementScore = engagementScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
} 