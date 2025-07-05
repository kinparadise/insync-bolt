package com.insync.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PollDto {
    private String id;
    private String question;
    private List<String> options;
    private Map<String, Integer> responses;
    private Boolean isActive;
    private Long createdBy;
    private LocalDateTime createdAt;

    public PollDto() {}

    public PollDto(String id, String question, List<String> options, Map<String, Integer> responses, 
                  Boolean isActive, Long createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.responses = responses;
        this.isActive = isActive;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Map<String, Integer> getResponses() {
        return responses;
    }

    public void setResponses(Map<String, Integer> responses) {
        this.responses = responses;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 