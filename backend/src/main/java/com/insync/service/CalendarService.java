package com.insync.service;

import com.insync.dto.CalendarEventDto;
import com.insync.dto.MeetingDto;
import com.insync.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Transactional
public class CalendarService {

    /**
     * Creates a calendar event for a meeting
     */
    public CalendarEventDto createCalendarEvent(MeetingDto meeting, User user) {
        CalendarEventDto event = new CalendarEventDto();
        
        // Basic event info
        event.setId(UUID.randomUUID().toString());
        event.setTitle(meeting.getTitle());
        event.setDescription(buildEventDescription(meeting));
        event.setLocation("InSync Meeting - ID: " + meeting.getMeetingId());
        
        // Timing
        event.setStartTime(meeting.getStartTime());
        event.setEndTime(meeting.getEndTime());
        event.setAllDay(false);
        
        // Meeting specific
        event.setMeetingId(meeting.getMeetingId());
        event.setMeetingUrl(buildMeetingUrl(meeting.getMeetingId()));
        
        // Reminders - professional default reminders
        event.getReminders().add(new CalendarEventDto.Reminder(15, "MINUTE")); // 15 min before
        event.getReminders().add(new CalendarEventDto.Reminder(5, "MINUTE"));  // 5 min before
        
        // Attendees
        if (meeting.getParticipants() != null) {
            meeting.getParticipants().forEach(participant -> {
                CalendarEventDto.Attendee attendee = new CalendarEventDto.Attendee();
                attendee.setEmail(participant.getUser().getEmail());
                attendee.setName(participant.getUser().getName());
                attendee.setStatus("NEEDS_ACTION");
                event.getAttendees().add(attendee);
            });
        }
        
        // Add host as organizer
        CalendarEventDto.Attendee organizer = new CalendarEventDto.Attendee();
        organizer.setEmail(meeting.getHost().getEmail());
        organizer.setName(meeting.getHost().getName());
        organizer.setStatus("ACCEPTED");
        organizer.setOrganizer(true);
        event.getAttendees().add(organizer);
        
        return event;
    }

    /**
     * Generates calendar file content (ICS format)
     */
    public String generateICSFile(CalendarEventDto event) {
        StringBuilder ics = new StringBuilder();
        
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//InSync//Meeting Calendar//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:REQUEST\r\n");
        
        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:").append(event.getId()).append("@insync.com\r\n");
        ics.append("DTSTAMP:").append(formatDateTime(java.time.LocalDateTime.now())).append("\r\n");
        ics.append("DTSTART:").append(formatDateTime(event.getStartTime())).append("\r\n");
        
        if (event.getEndTime() != null) {
            ics.append("DTEND:").append(formatDateTime(event.getEndTime())).append("\r\n");
        }
        
        ics.append("SUMMARY:").append(escapeText(event.getTitle())).append("\r\n");
        ics.append("DESCRIPTION:").append(escapeText(event.getDescription())).append("\r\n");
        ics.append("LOCATION:").append(escapeText(event.getLocation())).append("\r\n");
        
        // Add organizer
        event.getAttendees().stream()
            .filter(CalendarEventDto.Attendee::isOrganizer)
            .findFirst()
            .ifPresent(organizer -> {
                ics.append("ORGANIZER;CN=").append(escapeText(organizer.getName()))
                   .append(":MAILTO:").append(organizer.getEmail()).append("\r\n");
            });
        
        // Add attendees
        event.getAttendees().stream()
            .filter(attendee -> !attendee.isOrganizer())
            .forEach(attendee -> {
                ics.append("ATTENDEE;CN=").append(escapeText(attendee.getName()))
                   .append(";RSVP=TRUE:MAILTO:").append(attendee.getEmail()).append("\r\n");
            });
        
        // Add reminders
        event.getReminders().forEach(reminder -> {
            ics.append("BEGIN:VALARM\r\n");
            ics.append("TRIGGER:-PT").append(reminder.getValue()).append(reminder.getUnit().charAt(0)).append("\r\n");
            ics.append("ACTION:DISPLAY\r\n");
            ics.append("DESCRIPTION:InSync Meeting Reminder\r\n");
            ics.append("END:VALARM\r\n");
        });
        
        ics.append("STATUS:CONFIRMED\r\n");
        ics.append("SEQUENCE:0\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");
        
        return ics.toString();
    }

    /**
     * Generates Google Calendar URL
     */
    public String generateGoogleCalendarUrl(CalendarEventDto event) {
        StringBuilder url = new StringBuilder("https://calendar.google.com/calendar/render?action=TEMPLATE");
        
        url.append("&text=").append(urlEncode(event.getTitle()));
        url.append("&details=").append(urlEncode(event.getDescription()));
        url.append("&location=").append(urlEncode(event.getLocation()));
        
        // Format dates for Google Calendar
        String startDate = event.getStartTime().format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
        String endDate = event.getEndTime() != null ? 
            event.getEndTime().format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss")) :
            event.getStartTime().plusHours(1).format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
        
        url.append("&dates=").append(startDate).append("/").append(endDate);
        
        return url.toString();
    }

    /**
     * Generates Outlook Calendar URL
     */
    public String generateOutlookCalendarUrl(CalendarEventDto event) {
        StringBuilder url = new StringBuilder("https://outlook.live.com/calendar/0/deeplink/compose?");
        
        url.append("subject=").append(urlEncode(event.getTitle()));
        url.append("&body=").append(urlEncode(event.getDescription()));
        url.append("&location=").append(urlEncode(event.getLocation()));
        
        // ISO format for Outlook
        url.append("&startdt=").append(event.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        if (event.getEndTime() != null) {
            url.append("&enddt=").append(event.getEndTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return url.toString();
    }

    private String buildEventDescription(MeetingDto meeting) {
        StringBuilder desc = new StringBuilder();
        desc.append("Join InSync Meeting\\n\\n");
        desc.append("Meeting ID: ").append(meeting.getMeetingId()).append("\\n");
        desc.append("Join URL: ").append(buildMeetingUrl(meeting.getMeetingId())).append("\\n\\n");
        
        if (meeting.getDescription() != null && !meeting.getDescription().isEmpty()) {
            desc.append("Description:\\n").append(meeting.getDescription()).append("\\n\\n");
        }
        
        desc.append("Meeting Type: ").append(meeting.getType().toString().replace("_", " ")).append("\\n");
        desc.append("Host: ").append(meeting.getHost().getName()).append("\\n\\n");
        desc.append("Powered by InSync");
        
        return desc.toString();
    }

    private String buildMeetingUrl(String meetingId) {
        return "https://insync.app/join/" + meetingId;
    }

    private String formatDateTime(java.time.LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
    }

    private String escapeText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                  .replace(",", "\\,")
                  .replace(";", "\\;")
                  .replace("\n", "\\n");
    }

    private String urlEncode(String text) {
        if (text == null) return "";
        try {
            return java.net.URLEncoder.encode(text, "UTF-8");
        } catch (java.io.UnsupportedEncodingException e) {
            return text;
        }
    }
}
