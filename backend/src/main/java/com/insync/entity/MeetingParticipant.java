package com.insync.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_participants")
@EntityListeners(AuditingEntityListener.class)
public class MeetingParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime joinTime;
    private LocalDateTime leaveTime;
    
    private Integer speakingTimeMinutes = 0;
    private Integer cameraOnTimeMinutes = 0;
    private Integer micOnTimeMinutes = 0;
    private Integer messagesCount = 0;
    private Integer engagementScore = 0;

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status = ParticipantStatus.INVITED;

    @CreatedDate
    private LocalDateTime createdAt;

    // Constructors
    public MeetingParticipant() {}

    public MeetingParticipant(Meeting meeting, User user) {
        this.meeting = meeting;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public ParticipantStatus getStatus() { return status; }
    public void setStatus(ParticipantStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public enum ParticipantStatus {
        INVITED, JOINED, LEFT, REMOVED
    }
}