package com.insync.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.insync.dto.CalendarEventDto;
import com.insync.dto.MeetingDto;
import com.insync.dto.request.CreateMeetingRequest;
import com.insync.dto.request.JoinMeetingRequest;
import com.insync.dto.response.ApiResponse;
import com.insync.service.CalendarService;
import com.insync.service.MeetingService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/meetings")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;
    
    @Autowired
    private CalendarService calendarService;

    @GetMapping("/my")
    public ResponseEntity<?> getUserMeetings(Authentication authentication) {
        try {
            List<MeetingDto> meetings = meetingService.getUserMeetings(authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("User meetings retrieved", meetings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve meetings: " + e.getMessage()));
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingMeetings(Authentication authentication) {
        try {
            List<MeetingDto> meetings = meetingService.getUpcomingMeetings(authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Upcoming meetings retrieved", meetings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve upcoming meetings: " + e.getMessage()));
        }
    }

    @PostMapping("/instant")
    public ResponseEntity<?> createInstantMeeting(Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.createInstantMeeting(authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Instant meeting created successfully", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create instant meeting: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createMeeting(@RequestBody CreateMeetingRequest request, Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.createMeeting(request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting created successfully", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create meeting: " + e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinMeetingByIdInBody(@RequestBody JoinMeetingRequest request, Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.joinMeetingById(request.getMeetingId(), authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Joined meeting successfully", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to join meeting: " + e.getMessage()));
        }
    }

    @PostMapping("/{meetingId}/join")
    public ResponseEntity<?> joinMeetingById(@PathVariable String meetingId, Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.joinMeetingById(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Joined meeting successfully", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to join meeting: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}")
    public ResponseEntity<?> getMeetingByMeetingId(@PathVariable String meetingId, Authentication authentication) {
        try {
            return meetingService.findByMeetingId(meetingId)
                    .map(meeting -> ResponseEntity.ok(ApiResponse.success("Meeting retrieved", meeting)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve meeting: " + e.getMessage()));
        }
    }

    @PutMapping("/{meetingId}/status")
    public ResponseEntity<?> updateMeetingStatus(@PathVariable String meetingId, 
                                                @RequestParam String status, 
                                                Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.updateMeetingStatus(meetingId, 
                    com.insync.entity.Meeting.MeetingStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(ApiResponse.success("Meeting status updated", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update meeting status: " + e.getMessage()));
        }
    }

    // Legacy endpoints for backward compatibility
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinMeeting(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Use /meetings/{meetingId}/join with the meeting ID instead"));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveMeeting(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Left meeting successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMeetingById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Use /meetings/{meetingId} with the meeting ID instead"));
    }

    // Calendar Integration Endpoints
    
    @GetMapping("/{meetingId}/calendar")
    public ResponseEntity<?> getCalendarEvent(@PathVariable String meetingId, Authentication authentication) {
        try {
            return meetingService.findByMeetingId(meetingId)
                    .map(meeting -> {
                        CalendarEventDto event = calendarService.createCalendarEvent(meeting, 
                                meetingService.getUserByEmail(authentication.getName()));
                        
                        // Generate calendar URLs
                        event.setGoogleCalendarUrl(calendarService.generateGoogleCalendarUrl(event));
                        event.setOutlookCalendarUrl(calendarService.generateOutlookCalendarUrl(event));
                        event.setIcsDownloadUrl("/meetings/" + meetingId + "/calendar/download");
                        
                        return ResponseEntity.ok(ApiResponse.success("Calendar event created", event));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create calendar event: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{meetingId}/calendar/download")
    public ResponseEntity<String> downloadCalendarFile(@PathVariable String meetingId, Authentication authentication) {
        try {
            return meetingService.findByMeetingId(meetingId)
                    .map(meeting -> {
                        CalendarEventDto event = calendarService.createCalendarEvent(meeting, 
                                meetingService.getUserByEmail(authentication.getName()));
                        String icsContent = calendarService.generateICSFile(event);
                        
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.TEXT_PLAIN);
                        headers.setContentDispositionFormData("attachment", 
                                "meeting-" + meetingId + ".ics");
                        
                        return ResponseEntity.ok()
                                .headers(headers)
                                .body(icsContent);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate calendar file: " + e.getMessage());
        }
    }
}
