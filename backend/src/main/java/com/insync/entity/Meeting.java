package com.insync.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meetings")
@EntityListeners(AuditingEntityListener.class)
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id")
    private User host;

    @Enumerated(EnumType.STRING)
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    private MeetingType type = MeetingType.GENERAL;

    @Size(max = 100)
    @Column(unique = true)
    private String meetingId; // Unique meeting room ID

    @Size(max = 500)
    private String recordingUrl;

    @Size(max = 500)
    private String transcriptUrl;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MeetingParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ActionItem> actionItems = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Meeting() {}

    public Meeting(String title, LocalDateTime startTime, User host) {
        this.title = title;
        this.startTime = startTime;
        this.host = host;
        this.meetingId = generateMeetingId();
    }

    /**
     * Generates a unique meeting ID that users can use to join the meeting.
     * Format: XXX-XXX-XXX where X is a digit or uppercase letter (excluding 0, O, I, L for clarity)
     */
    private String generateMeetingId() {
        SecureRandom random = new SecureRandom();
        String chars = "123456789ABCDEFGHJKMNPQRSTUVWXYZ"; // Excludes 0, O, I, L for clarity
        StringBuilder idBuilder = new StringBuilder();
        
        for (int i = 0; i < 9; i++) {
            if (i == 3 || i == 6) {
                idBuilder.append("-");
            }
            idBuilder.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return idBuilder.toString();
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

    public User getHost() { return host; }
    public void setHost(User host) { this.host = host; }

    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }

    public MeetingType getType() { return type; }
    public void setType(MeetingType type) { this.type = type; }

    public String getMeetingId() { return meetingId; }
    public void setMeetingId(String meetingId) { this.meetingId = meetingId; }

    public String getRecordingUrl() { return recordingUrl; }
    public void setRecordingUrl(String recordingUrl) { this.recordingUrl = recordingUrl; }

    public String getTranscriptUrl() { return transcriptUrl; }
    public void setTranscriptUrl(String transcriptUrl) { this.transcriptUrl = transcriptUrl; }

    public List<MeetingParticipant> getParticipants() { return participants; }
    public void setParticipants(List<MeetingParticipant> participants) { this.participants = participants; }

    public List<ActionItem> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItem> actionItems) { this.actionItems = actionItems; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum MeetingStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum MeetingType {
        GENERAL, CLASSROOM, BUSINESS, ONE_ON_ONE
    }
}