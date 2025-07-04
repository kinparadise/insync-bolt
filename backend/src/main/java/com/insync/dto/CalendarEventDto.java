package com.insync.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CalendarEventDto {
    
    private String id;
    private String title;
    private String description;
    private String location;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    
    private boolean allDay = false;
    private String meetingId;
    private String meetingUrl;
    
    private List<Reminder> reminders = new ArrayList<>();
    private List<Attendee> attendees = new ArrayList<>();
    
    // Calendar integration URLs
    private String googleCalendarUrl;
    private String outlookCalendarUrl;
    private String icsDownloadUrl;
    
    // Constructors
    public CalendarEventDto() {}
    
    public CalendarEventDto(String title, String description, LocalDateTime startTime, LocalDateTime endTime) {
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public boolean isAllDay() {
        return allDay;
    }
    
    public void setAllDay(boolean allDay) {
        this.allDay = allDay;
    }
    
    public String getMeetingId() {
        return meetingId;
    }
    
    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }
    
    public String getMeetingUrl() {
        return meetingUrl;
    }
    
    public void setMeetingUrl(String meetingUrl) {
        this.meetingUrl = meetingUrl;
    }
    
    public List<Reminder> getReminders() {
        return reminders;
    }
    
    public void setReminders(List<Reminder> reminders) {
        this.reminders = reminders;
    }
    
    public List<Attendee> getAttendees() {
        return attendees;
    }
    
    public void setAttendees(List<Attendee> attendees) {
        this.attendees = attendees;
    }
    
    public String getGoogleCalendarUrl() {
        return googleCalendarUrl;
    }
    
    public void setGoogleCalendarUrl(String googleCalendarUrl) {
        this.googleCalendarUrl = googleCalendarUrl;
    }
    
    public String getOutlookCalendarUrl() {
        return outlookCalendarUrl;
    }
    
    public void setOutlookCalendarUrl(String outlookCalendarUrl) {
        this.outlookCalendarUrl = outlookCalendarUrl;
    }
    
    public String getIcsDownloadUrl() {
        return icsDownloadUrl;
    }
    
    public void setIcsDownloadUrl(String icsDownloadUrl) {
        this.icsDownloadUrl = icsDownloadUrl;
    }
    
    // Inner Classes
    public static class Reminder {
        private int value;
        private String unit; // MINUTE, HOUR, DAY
        
        public Reminder() {}
        
        public Reminder(int value, String unit) {
            this.value = value;
            this.unit = unit;
        }
        
        public int getValue() {
            return value;
        }
        
        public void setValue(int value) {
            this.value = value;
        }
        
        public String getUnit() {
            return unit;
        }
        
        public void setUnit(String unit) {
            this.unit = unit;
        }
    }
    
    public static class Attendee {
        private String email;
        private String name;
        private String status; // NEEDS_ACTION, ACCEPTED, DECLINED, TENTATIVE
        private boolean organizer = false;
        
        public Attendee() {}
        
        public Attendee(String email, String name) {
            this.email = email;
            this.name = name;
            this.status = "NEEDS_ACTION";
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public boolean isOrganizer() {
            return organizer;
        }
        
        public void setOrganizer(boolean organizer) {
            this.organizer = organizer;
        }
    }
}
