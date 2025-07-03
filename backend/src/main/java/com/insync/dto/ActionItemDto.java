package com.insync.dto;

import com.insync.entity.ActionItem;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ActionItemDto {
    private Long id;
    private String task;
    private String description;
    private UserDto assignee;
    private UserDto createdBy;
    private LocalDate dueDate;
    private ActionItem.ActionItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ActionItemDto() {}

    public ActionItemDto(ActionItem actionItem) {
        this.id = actionItem.getId();
        this.task = actionItem.getTask();
        this.description = actionItem.getDescription();
        this.assignee = actionItem.getAssignee() != null ? new UserDto(actionItem.getAssignee()) : null;
        this.createdBy = actionItem.getCreatedBy() != null ? new UserDto(actionItem.getCreatedBy()) : null;
        this.dueDate = actionItem.getDueDate();
        this.status = actionItem.getStatus();
        this.createdAt = actionItem.getCreatedAt();
        this.updatedAt = actionItem.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UserDto getAssignee() { return assignee; }
    public void setAssignee(UserDto assignee) { this.assignee = assignee; }

    public UserDto getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserDto createdBy) { this.createdBy = createdBy; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public ActionItem.ActionItemStatus getStatus() { return status; }
    public void setStatus(ActionItem.ActionItemStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}