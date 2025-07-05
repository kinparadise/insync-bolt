package com.insync.dto;

import java.time.LocalDateTime;

public class TranscriptionEntryDto {
    private String id;
    private String speaker;
    private String text;
    private LocalDateTime timestamp;
    private Double confidence;

    public TranscriptionEntryDto() {}

    public TranscriptionEntryDto(String id, String speaker, String text, LocalDateTime timestamp, Double confidence) {
        this.id = id;
        this.speaker = speaker;
        this.text = text;
        this.timestamp = timestamp;
        this.confidence = confidence;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
} 