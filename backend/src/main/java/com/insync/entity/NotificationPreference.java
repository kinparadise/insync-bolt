package com.insync.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@EntityListeners(AuditingEntityListener.class)
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Email notification preferences
    private boolean emailMeetingReminder15Min = true;
    private boolean emailMeetingReminder5Min = true;
    private boolean emailMeetingStarted = true;
    private boolean emailMeetingEndingSoon = true;
    private boolean emailMeetingEnded = false;
    private boolean emailMeetingCancelled = true;
    private boolean emailMeetingRescheduled = true;

    // SMS notification preferences
    private boolean smsMeetingReminder15Min = false;
    private boolean smsMeetingReminder5Min = true;
    private boolean smsMeetingStarted = false;
    private boolean smsMeetingEndingSoon = false;
    private boolean smsMeetingEnded = false;
    private boolean smsMeetingCancelled = true;
    private boolean smsMeetingRescheduled = true;

    // Push notification preferences
    private boolean pushMeetingReminder15Min = true;
    private boolean pushMeetingReminder5Min = true;
    private boolean pushMeetingStarted = true;
    private boolean pushMeetingEndingSoon = true;
    private boolean pushMeetingEnded = true;
    private boolean pushMeetingCancelled = true;
    private boolean pushMeetingRescheduled = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public NotificationPreference() {}

    public NotificationPreference(User user) {
        this.user = user;
    }

    // Helper methods to check if a specific notification type and channel is enabled
    public boolean isEnabled(Notification.NotificationType type, Notification.NotificationChannel channel) {
        switch (channel) {
            case EMAIL:
                return isEmailEnabled(type);
            case SMS:
                return isSmsEnabled(type);
            case PUSH:
                return isPushEnabled(type);
            default:
                return false;
        }
    }

    private boolean isEmailEnabled(Notification.NotificationType type) {
        switch (type) {
            case MEETING_REMINDER_15MIN: return emailMeetingReminder15Min;
            case MEETING_REMINDER_5MIN: return emailMeetingReminder5Min;
            case MEETING_STARTED: return emailMeetingStarted;
            case MEETING_ENDING_SOON: return emailMeetingEndingSoon;
            case MEETING_ENDED: return emailMeetingEnded;
            case MEETING_CANCELLED: return emailMeetingCancelled;
            case MEETING_RESCHEDULED: return emailMeetingRescheduled;
            default: return false;
        }
    }

    private boolean isSmsEnabled(Notification.NotificationType type) {
        switch (type) {
            case MEETING_REMINDER_15MIN: return smsMeetingReminder15Min;
            case MEETING_REMINDER_5MIN: return smsMeetingReminder5Min;
            case MEETING_STARTED: return smsMeetingStarted;
            case MEETING_ENDING_SOON: return smsMeetingEndingSoon;
            case MEETING_ENDED: return smsMeetingEnded;
            case MEETING_CANCELLED: return smsMeetingCancelled;
            case MEETING_RESCHEDULED: return smsMeetingRescheduled;
            default: return false;
        }
    }

    private boolean isPushEnabled(Notification.NotificationType type) {
        switch (type) {
            case MEETING_REMINDER_15MIN: return pushMeetingReminder15Min;
            case MEETING_REMINDER_5MIN: return pushMeetingReminder5Min;
            case MEETING_STARTED: return pushMeetingStarted;
            case MEETING_ENDING_SOON: return pushMeetingEndingSoon;
            case MEETING_ENDED: return pushMeetingEnded;
            case MEETING_CANCELLED: return pushMeetingCancelled;
            case MEETING_RESCHEDULED: return pushMeetingRescheduled;
            default: return false;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public boolean isEmailMeetingReminder15Min() { return emailMeetingReminder15Min; }
    public void setEmailMeetingReminder15Min(boolean emailMeetingReminder15Min) { this.emailMeetingReminder15Min = emailMeetingReminder15Min; }

    public boolean isEmailMeetingReminder5Min() { return emailMeetingReminder5Min; }
    public void setEmailMeetingReminder5Min(boolean emailMeetingReminder5Min) { this.emailMeetingReminder5Min = emailMeetingReminder5Min; }

    public boolean isEmailMeetingStarted() { return emailMeetingStarted; }
    public void setEmailMeetingStarted(boolean emailMeetingStarted) { this.emailMeetingStarted = emailMeetingStarted; }

    public boolean isEmailMeetingEndingSoon() { return emailMeetingEndingSoon; }
    public void setEmailMeetingEndingSoon(boolean emailMeetingEndingSoon) { this.emailMeetingEndingSoon = emailMeetingEndingSoon; }

    public boolean isEmailMeetingEnded() { return emailMeetingEnded; }
    public void setEmailMeetingEnded(boolean emailMeetingEnded) { this.emailMeetingEnded = emailMeetingEnded; }

    public boolean isEmailMeetingCancelled() { return emailMeetingCancelled; }
    public void setEmailMeetingCancelled(boolean emailMeetingCancelled) { this.emailMeetingCancelled = emailMeetingCancelled; }

    public boolean isEmailMeetingRescheduled() { return emailMeetingRescheduled; }
    public void setEmailMeetingRescheduled(boolean emailMeetingRescheduled) { this.emailMeetingRescheduled = emailMeetingRescheduled; }

    public boolean isSmsMeetingReminder15Min() { return smsMeetingReminder15Min; }
    public void setSmsMeetingReminder15Min(boolean smsMeetingReminder15Min) { this.smsMeetingReminder15Min = smsMeetingReminder15Min; }

    public boolean isSmsMeetingReminder5Min() { return smsMeetingReminder5Min; }
    public void setSmsMeetingReminder5Min(boolean smsMeetingReminder5Min) { this.smsMeetingReminder5Min = smsMeetingReminder5Min; }

    public boolean isSmsMeetingStarted() { return smsMeetingStarted; }
    public void setSmsMeetingStarted(boolean smsMeetingStarted) { this.smsMeetingStarted = smsMeetingStarted; }

    public boolean isSmsMeetingEndingSoon() { return smsMeetingEndingSoon; }
    public void setSmsMeetingEndingSoon(boolean smsMeetingEndingSoon) { this.smsMeetingEndingSoon = smsMeetingEndingSoon; }

    public boolean isSmsMeetingEnded() { return smsMeetingEnded; }
    public void setSmsMeetingEnded(boolean smsMeetingEnded) { this.smsMeetingEnded = smsMeetingEnded; }

    public boolean isSmsMeetingCancelled() { return smsMeetingCancelled; }
    public void setSmsMeetingCancelled(boolean smsMeetingCancelled) { this.smsMeetingCancelled = smsMeetingCancelled; }

    public boolean isSmsMeetingRescheduled() { return smsMeetingRescheduled; }
    public void setSmsMeetingRescheduled(boolean smsMeetingRescheduled) { this.smsMeetingRescheduled = smsMeetingRescheduled; }

    public boolean isPushMeetingReminder15Min() { return pushMeetingReminder15Min; }
    public void setPushMeetingReminder15Min(boolean pushMeetingReminder15Min) { this.pushMeetingReminder15Min = pushMeetingReminder15Min; }

    public boolean isPushMeetingReminder5Min() { return pushMeetingReminder5Min; }
    public void setPushMeetingReminder5Min(boolean pushMeetingReminder5Min) { this.pushMeetingReminder5Min = pushMeetingReminder5Min; }

    public boolean isPushMeetingStarted() { return pushMeetingStarted; }
    public void setPushMeetingStarted(boolean pushMeetingStarted) { this.pushMeetingStarted = pushMeetingStarted; }

    public boolean isPushMeetingEndingSoon() { return pushMeetingEndingSoon; }
    public void setPushMeetingEndingSoon(boolean pushMeetingEndingSoon) { this.pushMeetingEndingSoon = pushMeetingEndingSoon; }

    public boolean isPushMeetingEnded() { return pushMeetingEnded; }
    public void setPushMeetingEnded(boolean pushMeetingEnded) { this.pushMeetingEnded = pushMeetingEnded; }

    public boolean isPushMeetingCancelled() { return pushMeetingCancelled; }
    public void setPushMeetingCancelled(boolean pushMeetingCancelled) { this.pushMeetingCancelled = pushMeetingCancelled; }

    public boolean isPushMeetingRescheduled() { return pushMeetingRescheduled; }
    public void setPushMeetingRescheduled(boolean pushMeetingRescheduled) { this.pushMeetingRescheduled = pushMeetingRescheduled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
