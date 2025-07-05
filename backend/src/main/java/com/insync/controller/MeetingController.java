package com.insync.controller;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insync.dto.BreakoutRoomDto;
import com.insync.dto.CalendarEventDto;
import com.insync.dto.CallParticipantDto;
import com.insync.dto.ChatMessageDto;
import com.insync.dto.MeetingAnalyticsDto;
import com.insync.dto.MeetingDto;
import com.insync.dto.MeetingTemplateDto;
import com.insync.dto.PollDto;
import com.insync.dto.TranscriptionEntryDto;
import com.insync.dto.request.CallStateUpdateRequest;
import com.insync.dto.request.ChatMessageRequest;
import com.insync.dto.request.CreateBreakoutRoomRequest;
import com.insync.dto.request.CreateMeetingRequest;
import com.insync.dto.request.CreatePollRequest;
import com.insync.dto.request.ExportRequest;
import com.insync.dto.request.HostSettingsRequest;
import com.insync.dto.request.JoinMeetingRequest;
import com.insync.dto.request.MeetingSettingsRequest;
import com.insync.dto.request.PollResponseRequest;
import com.insync.dto.request.RescheduleMeetingRequest;
import com.insync.dto.response.ApiResponse;
import com.insync.dto.response.ExportResponse;
import com.insync.dto.response.MeetingSettingsResponse;
import com.insync.entity.Meeting;
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

    /**
     * Cancel a meeting and send notifications
     */
    @DeleteMapping("/{meetingId}")
    public ResponseEntity<?> cancelMeeting(@PathVariable String meetingId, Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.cancelMeeting(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting cancelled successfully", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to cancel meeting: " + e.getMessage()));
        }
    }

    /**
     * Reschedule a meeting and send notifications
     */
    @PutMapping("/{meetingId}/reschedule")
    public ResponseEntity<?> rescheduleMeeting(@PathVariable String meetingId,
                                             @RequestBody RescheduleMeetingRequest request,
                                             Authentication authentication) {
        try {
            MeetingDto meeting = meetingService.rescheduleMeeting(meetingId, 
                request.getNewStartTime(), request.getNewEndTime(), authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting rescheduled successfully", meeting));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to reschedule meeting: " + e.getMessage()));
        }
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

    // Meeting Settings Endpoints
    
    @PutMapping("/{meetingId}/settings")
    public ResponseEntity<?> updateMeetingSettings(@PathVariable String meetingId, 
                                                  @RequestBody MeetingSettingsRequest request,
                                                  Authentication authentication) {
        try {
            MeetingSettingsResponse response = meetingService.updateMeetingSettings(meetingId, 
                    request.getSettings(), authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting settings updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update meeting settings: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}/settings")
    public ResponseEntity<?> getMeetingSettings(@PathVariable String meetingId, Authentication authentication) {
        try {
            MeetingSettingsResponse response = meetingService.getMeetingSettings(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting settings retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get meeting settings: " + e.getMessage()));
        }
    }

    @PostMapping("/{meetingId}/host-settings")
    public ResponseEntity<?> applyHostSettings(@PathVariable String meetingId, 
                                             @RequestBody HostSettingsRequest request,
                                             Authentication authentication) {
        try {
            meetingService.applyHostSettings(meetingId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Host settings applied successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to apply host settings: " + e.getMessage()));
        }
    }

    // Real-time Call Management Endpoints
    
    @PutMapping("/{meetingId}/call-state")
    public ResponseEntity<?> updateCallState(@PathVariable String meetingId, 
                                           @RequestBody CallStateUpdateRequest request,
                                           Authentication authentication) {
        try {
            meetingService.updateCallState(meetingId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Call state updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update call state: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}/participants")
    public ResponseEntity<?> getMeetingParticipants(@PathVariable String meetingId, Authentication authentication) {
        try {
            List<CallParticipantDto> participants = meetingService.getMeetingParticipants(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting participants retrieved", participants));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get participants: " + e.getMessage()));
        }
    }

    // Chat Management
    
    @PostMapping("/{meetingId}/chat")
    public ResponseEntity<?> sendChatMessage(@PathVariable String meetingId, 
                                           @RequestBody ChatMessageRequest request,
                                           Authentication authentication) {
        try {
            ChatMessageDto message = meetingService.sendChatMessage(meetingId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}/chat")
    public ResponseEntity<?> getChatMessages(@PathVariable String meetingId, Authentication authentication) {
        try {
            List<ChatMessageDto> messages = meetingService.getChatMessages(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Chat messages retrieved", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get chat messages: " + e.getMessage()));
        }
    }

    // Polls Management
    
    @PostMapping("/{meetingId}/polls")
    public ResponseEntity<?> createPoll(@PathVariable String meetingId, 
                                      @RequestBody CreatePollRequest request,
                                      Authentication authentication) {
        try {
            PollDto poll = meetingService.createPoll(meetingId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Poll created successfully", poll));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create poll: " + e.getMessage()));
        }
    }

    @PostMapping("/{meetingId}/polls/{pollId}/respond")
    public ResponseEntity<?> submitPollResponse(@PathVariable String meetingId, 
                                              @PathVariable String pollId,
                                              @RequestBody PollResponseRequest request,
                                              Authentication authentication) {
        try {
            meetingService.submitPollResponse(meetingId, pollId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Poll response submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to submit poll response: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}/polls/active")
    public ResponseEntity<?> getActivePolls(@PathVariable String meetingId, Authentication authentication) {
        try {
            List<PollDto> polls = meetingService.getActivePolls(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Active polls retrieved", polls));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get active polls: " + e.getMessage()));
        }
    }

    // Breakout Rooms Management
    
    @PostMapping("/{meetingId}/breakout-rooms")
    public ResponseEntity<?> createBreakoutRoom(@PathVariable String meetingId, 
                                              @RequestBody CreateBreakoutRoomRequest request,
                                              Authentication authentication) {
        try {
            BreakoutRoomDto room = meetingService.createBreakoutRoom(meetingId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Breakout room created successfully", room));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create breakout room: " + e.getMessage()));
        }
    }

    @PostMapping("/{meetingId}/breakout-rooms/{roomId}/join")
    public ResponseEntity<?> joinBreakoutRoom(@PathVariable String meetingId, 
                                            @PathVariable String roomId,
                                            Authentication authentication) {
        try {
            meetingService.joinBreakoutRoom(meetingId, roomId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Joined breakout room successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to join breakout room: " + e.getMessage()));
        }
    }

    @PostMapping("/{meetingId}/breakout-rooms/{roomId}/leave")
    public ResponseEntity<?> leaveBreakoutRoom(@PathVariable String meetingId, 
                                             @PathVariable String roomId,
                                             Authentication authentication) {
        try {
            meetingService.leaveBreakoutRoom(meetingId, roomId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Left breakout room successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to leave breakout room: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}/breakout-rooms")
    public ResponseEntity<?> getBreakoutRooms(@PathVariable String meetingId, Authentication authentication) {
        try {
            List<BreakoutRoomDto> rooms = meetingService.getBreakoutRooms(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Breakout rooms retrieved", rooms));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get breakout rooms: " + e.getMessage()));
        }
    }

    // Recording Management
    
    @PostMapping("/{meetingId}/recording/start")
    public ResponseEntity<?> startRecording(@PathVariable String meetingId, Authentication authentication) {
        try {
            meetingService.startRecording(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Recording started successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to start recording: " + e.getMessage()));
        }
    }

    @PostMapping("/{meetingId}/recording/stop")
    public ResponseEntity<?> stopRecording(@PathVariable String meetingId, Authentication authentication) {
        try {
            meetingService.stopRecording(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Recording stopped successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to stop recording: " + e.getMessage()));
        }
    }

    // Analytics and Transcription
    
    @GetMapping("/{meetingId}/analytics")
    public ResponseEntity<?> getMeetingAnalytics(@PathVariable String meetingId, Authentication authentication) {
        try {
            MeetingAnalyticsDto analytics = meetingService.getMeetingAnalytics(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting analytics retrieved", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/{meetingId}/transcription")
    public ResponseEntity<?> getTranscription(@PathVariable String meetingId, Authentication authentication) {
        try {
            List<TranscriptionEntryDto> transcription = meetingService.getTranscription(meetingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Transcription retrieved", transcription));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get transcription: " + e.getMessage()));
        }
    }

    // Export Meeting Data
    
    @PostMapping("/{meetingId}/export")
    public ResponseEntity<?> exportMeetingData(@PathVariable String meetingId, 
                                             @RequestBody ExportRequest request,
                                             Authentication authentication) {
        try {
            ExportResponse exportResponse = meetingService.exportMeetingData(meetingId, request, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Meeting data exported successfully", exportResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to export meeting data: " + e.getMessage()));
        }
    }

    /**
     * Get available meeting templates
     */
    @GetMapping("/templates")
    public ResponseEntity<?> getMeetingTemplates(Authentication authentication) {
        try {
            List<MeetingTemplateDto> templates = Arrays.asList(
                new MeetingTemplateDto(
                    "daily-standup",
                    "Daily Standup",
                    "Quick 15-minute sync for team alignment and progress updates",
                    Duration.ofMinutes(15),
                    Meeting.MeetingType.BUSINESS,
                    "Team Sync",
                    "Target",
                    "#10B981",
                    "3-8 people",
                    false
                ),
                new MeetingTemplateDto(
                    "one-on-one",
                    "One-on-One",
                    "Private discussion for feedback, goals, and personal development",
                    Duration.ofMinutes(30),
                    Meeting.MeetingType.ONE_ON_ONE,
                    "Performance",
                    "MessageCircle",
                    "#8B5CF6",
                    "2 people",
                    false
                ),
                new MeetingTemplateDto(
                    "project-review",
                    "Project Review",
                    "Comprehensive review of project deliverables and milestones",
                    Duration.ofMinutes(60),
                    Meeting.MeetingType.BUSINESS,
                    "Project Management",
                    "BarChart3",
                    "#F59E0B",
                    "4-10 people",
                    false
                ),
                new MeetingTemplateDto(
                    "training-session",
                    "Training Session",
                    "Educational workshop for skill development and knowledge sharing",
                    Duration.ofMinutes(90),
                    Meeting.MeetingType.CLASSROOM,
                    "Learning",
                    "GraduationCap",
                    "#3B82F6",
                    "5-20 people",
                    false
                ),
                new MeetingTemplateDto(
                    "team-retrospective",
                    "Team Retrospective",
                    "Reflect on past sprint performance and identify improvements",
                    Duration.ofMinutes(45),
                    Meeting.MeetingType.BUSINESS,
                    "Agile",
                    "Eye",
                    "#EF4444",
                    "3-12 people",
                    false
                ),
                new MeetingTemplateDto(
                    "client-presentation",
                    "Client Presentation",
                    "Professional presentation of project updates to stakeholders",
                    Duration.ofMinutes(60),
                    Meeting.MeetingType.BUSINESS,
                    "Client Relations",
                    "Briefcase",
                    "#06B6D4",
                    "2-15 people",
                    false
                )
            );
            return ResponseEntity.ok(ApiResponse.success("Meeting templates retrieved", templates));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve templates: " + e.getMessage()));
        }
    }
}
