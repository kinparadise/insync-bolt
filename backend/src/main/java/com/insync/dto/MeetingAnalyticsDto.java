package com.insync.dto;

import java.util.Map;

public class MeetingAnalyticsDto {
    private Integer totalDuration;
    private Integer participantCount;
    private Integer engagementScore;
    private Map<Long, Integer> talkTimeDistribution;
    private Integer chatMessageCount;
    private Integer pollCount;
    private Integer screenShareDuration;
    private Integer recordingDuration;

    public MeetingAnalyticsDto() {}

    public MeetingAnalyticsDto(Integer totalDuration, Integer participantCount, Integer engagementScore,
                              Map<Long, Integer> talkTimeDistribution, Integer chatMessageCount, 
                              Integer pollCount, Integer screenShareDuration, Integer recordingDuration) {
        this.totalDuration = totalDuration;
        this.participantCount = participantCount;
        this.engagementScore = engagementScore;
        this.talkTimeDistribution = talkTimeDistribution;
        this.chatMessageCount = chatMessageCount;
        this.pollCount = pollCount;
        this.screenShareDuration = screenShareDuration;
        this.recordingDuration = recordingDuration;
    }

    public Integer getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(Integer totalDuration) {
        this.totalDuration = totalDuration;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(Integer participantCount) {
        this.participantCount = participantCount;
    }

    public Integer getEngagementScore() {
        return engagementScore;
    }

    public void setEngagementScore(Integer engagementScore) {
        this.engagementScore = engagementScore;
    }

    public Map<Long, Integer> getTalkTimeDistribution() {
        return talkTimeDistribution;
    }

    public void setTalkTimeDistribution(Map<Long, Integer> talkTimeDistribution) {
        this.talkTimeDistribution = talkTimeDistribution;
    }

    public Integer getChatMessageCount() {
        return chatMessageCount;
    }

    public void setChatMessageCount(Integer chatMessageCount) {
        this.chatMessageCount = chatMessageCount;
    }

    public Integer getPollCount() {
        return pollCount;
    }

    public void setPollCount(Integer pollCount) {
        this.pollCount = pollCount;
    }

    public Integer getScreenShareDuration() {
        return screenShareDuration;
    }

    public void setScreenShareDuration(Integer screenShareDuration) {
        this.screenShareDuration = screenShareDuration;
    }

    public Integer getRecordingDuration() {
        return recordingDuration;
    }

    public void setRecordingDuration(Integer recordingDuration) {
        this.recordingDuration = recordingDuration;
    }
} 