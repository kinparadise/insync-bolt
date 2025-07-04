package com.insync.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    @Size(max = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @NotNull
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @NotNull
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    @NotNull
    private LocalDateTime scheduledTime;

    private LocalDateTime sentTime;

    @Size(max = 500)
    private String errorMessage;

    @CreatedDate
    private LocalDateTime createdAt;

    // Constructors
    public Notification() {}

    public Notification(User user, Meeting meeting, String title, String message, 
                       NotificationType type, NotificationChannel channel, LocalDateTime scheduledTime) {
        this.user = user;
        this.meeting = meeting;
        this.title = title;
        this.message = message;
        this.type = type;
        this.channel = channel;
        this.scheduledTime = scheduledTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }

    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public LocalDateTime getSentTime() { return sentTime; }
    public void setSentTime(LocalDateTime sentTime) { this.sentTime = sentTime; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public enum NotificationType {
        MEETING_REMINDER_15MIN,
        MEETING_REMINDER_5MIN,
        MEETING_STARTED,
        MEETING_ENDING_SOON,
        MEETING_ENDED,
        MEETING_CANCELLED,
        MEETING_RESCHEDULED
    }

    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH,
        IN_APP
    }

    public enum NotificationStatus {
        PENDING,
        SENT,
        FAILED,
        CANCELLED
    }
}
