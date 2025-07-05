package com.insync.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insync.dto.BreakoutRoomDto;
import com.insync.dto.CallParticipantDto;
import com.insync.dto.ChatMessageDto;
import com.insync.dto.MeetingAnalyticsDto;
import com.insync.dto.MeetingDto;
import com.insync.dto.MeetingParticipantDto;
import com.insync.dto.PollDto;
import com.insync.dto.TranscriptionEntryDto;
import com.insync.dto.UserDto;
import com.insync.dto.request.CallStateUpdateRequest;
import com.insync.dto.request.ChatMessageRequest;
import com.insync.dto.request.CreateBreakoutRoomRequest;
import com.insync.dto.request.CreateMeetingRequest;
import com.insync.dto.request.CreatePollRequest;
import com.insync.dto.request.ExportRequest;
import com.insync.dto.request.HostSettingsRequest;
import com.insync.dto.request.PollResponseRequest;
import com.insync.dto.response.ExportResponse;
import com.insync.dto.response.MeetingSettingsResponse;
import com.insync.entity.Meeting;
import com.insync.entity.MeetingParticipant;
import com.insync.entity.User;
import com.insync.repository.MeetingRepository;
import com.insync.repository.UserRepository;

@Service
@Transactional
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Creates an instant meeting for immediate use
     */
    public MeetingDto createInstantMeeting(String userEmail) {
        User host = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Meeting meeting = new Meeting();
        meeting.setTitle("Instant Meeting");
        meeting.setDescription("Instant meeting created on " + LocalDateTime.now().toString());
        meeting.setStartTime(LocalDateTime.now());
        meeting.setHost(host);
        meeting.setType(Meeting.MeetingType.GENERAL);
        meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);
        
        // Ensure unique meeting ID
        String meetingId;
        do {
            meetingId = generateUniqueId();
        } while (meetingRepository.findByMeetingId(meetingId).isPresent());
        
        meeting.setMeetingId(meetingId);
        
        Meeting savedMeeting = meetingRepository.save(meeting);
        
        // Schedule notifications for this instant meeting
        notificationService.scheduleMeetingNotifications(savedMeeting);
        
        return convertToDto(savedMeeting);
    }

    /**
     * Creates a new meeting with a unique meeting ID
     */
    public MeetingDto createMeeting(CreateMeetingRequest request, String userEmail) {
        User host = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setStartTime(request.getStartTime());
        meeting.setEndTime(request.getEndTime());
        meeting.setHost(host);
        meeting.setType(request.getType());
        
        // Ensure unique meeting ID
        String meetingId;
        do {
            meetingId = generateUniqueId();
        } while (meetingRepository.findByMeetingId(meetingId).isPresent());
        
        meeting.setMeetingId(meetingId);
        
        Meeting savedMeeting = meetingRepository.save(meeting);
        
        // Schedule notifications for this meeting
        notificationService.scheduleMeetingNotifications(savedMeeting);
        
        return convertToDto(savedMeeting);
    }

    /**
     * Finds a meeting by its unique meeting ID
     */
    public Optional<MeetingDto> findByMeetingId(String meetingId) {
        return meetingRepository.findByMeetingId(meetingId)
                .map(this::convertToDto);
    }

    /**
     * Joins a user to a meeting by meeting ID
     */
    public MeetingDto joinMeetingById(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is already a participant
        boolean isAlreadyParticipant = meeting.getParticipants().stream()
                .anyMatch(participant -> participant.getUser().getId().equals(user.getId()));

        if (!isAlreadyParticipant) {
            MeetingParticipant participant = new MeetingParticipant();
            participant.setMeeting(meeting);
            participant.setUser(user);
            participant.setJoinTime(LocalDateTime.now());
            meeting.getParticipants().add(participant);
            
            meetingRepository.save(meeting);
        }

        return convertToDto(meeting);
    }

    /**
     * Gets all meetings for a user (hosted or participated)
     */
    public List<MeetingDto> getUserMeetings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Meeting> meetings = meetingRepository.findAllUserMeetings(user);
        return meetings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Gets upcoming meetings for a user
     */
    public List<MeetingDto> getUpcomingMeetings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        List<Meeting> meetings = meetingRepository.findUpcomingMeetingsForUser(user, now);
        return meetings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Updates meeting status (e.g., when meeting starts, ends, or is cancelled)
     */
    public MeetingDto updateMeetingStatus(String meetingId, Meeting.MeetingStatus status) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        meeting.setStatus(status);
        
        if (status == Meeting.MeetingStatus.IN_PROGRESS) {
            meeting.setStartTime(LocalDateTime.now());
        } else if (status == Meeting.MeetingStatus.COMPLETED) {
            meeting.setEndTime(LocalDateTime.now());
        }

        Meeting savedMeeting = meetingRepository.save(meeting);
        return convertToDto(savedMeeting);
    }

    /**
     * Cancels a meeting and sends notifications
     */
    public MeetingDto cancelMeeting(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized to cancel (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can cancel the meeting");
        }

        // Cancel all pending notifications for this meeting
        notificationService.cancelMeetingNotifications(meeting);

        // Update meeting status
        meeting.setStatus(Meeting.MeetingStatus.CANCELLED);
        Meeting savedMeeting = meetingRepository.save(meeting);

        // Send immediate cancellation notifications
        notificationService.sendImmediateMeetingNotification(savedMeeting, 
            com.insync.entity.Notification.NotificationType.MEETING_CANCELLED);

        return convertToDto(savedMeeting);
    }

    /**
     * Reschedules a meeting and sends notifications
     */
    public MeetingDto rescheduleMeeting(String meetingId, LocalDateTime newStartTime, 
                                       LocalDateTime newEndTime, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized to reschedule (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can reschedule the meeting");
        }

        // Cancel all pending notifications for this meeting
        notificationService.cancelMeetingNotifications(meeting);

        // Update meeting times
        meeting.setStartTime(newStartTime);
        meeting.setEndTime(newEndTime);
        Meeting savedMeeting = meetingRepository.save(meeting);

        // Schedule new notifications for the rescheduled meeting
        notificationService.scheduleMeetingNotifications(savedMeeting);

        // Send immediate rescheduling notifications
        notificationService.sendImmediateMeetingNotification(savedMeeting, 
            com.insync.entity.Notification.NotificationType.MEETING_RESCHEDULED);

        return convertToDto(savedMeeting);
    }

    /*
      Generates a unique meeting ID in format XXX-XXX-XXX
    */
    private String generateUniqueId() {
        java.security.SecureRandom random = new java.security.SecureRandom();
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

    /**
     * Converts Meeting entity to MeetingDto
     */
    private MeetingDto convertToDto(Meeting meeting) {
        MeetingDto dto = new MeetingDto();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setStartTime(meeting.getStartTime());
        dto.setEndTime(meeting.getEndTime());
        dto.setStatus(meeting.getStatus());
        dto.setType(meeting.getType());
        dto.setMeetingId(meeting.getMeetingId());
        dto.setRecordingUrl(meeting.getRecordingUrl());
        dto.setTranscriptUrl(meeting.getTranscriptUrl());
        dto.setCreatedAt(meeting.getCreatedAt());
        dto.setUpdatedAt(meeting.getUpdatedAt());

        // Convert host
        if (meeting.getHost() != null) {
            UserDto hostDto = new UserDto();
            hostDto.setId(meeting.getHost().getId());
            hostDto.setName(meeting.getHost().getName());
            hostDto.setEmail(meeting.getHost().getEmail());
            dto.setHost(hostDto);
        }

        // Convert participants
        List<MeetingParticipantDto> participantDtos = meeting.getParticipants().stream()
                .map(participant -> {
                    MeetingParticipantDto participantDto = new MeetingParticipantDto();
                    participantDto.setId(participant.getId());
                    participantDto.setJoinTime(participant.getJoinTime());
                    participantDto.setLeaveTime(participant.getLeaveTime());
                    
                    UserDto userDto = new UserDto();
                    userDto.setId(participant.getUser().getId());
                    userDto.setName(participant.getUser().getName());
                    userDto.setEmail(participant.getUser().getEmail());
                    participantDto.setUser(userDto);
                    
                    return participantDto;
                })
                .collect(Collectors.toList());
        dto.setParticipants(participantDtos);

        return dto;
    }

    /**
     * Gets a user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Meeting Settings Methods
    
    /**
     * Updates meeting settings
     */
    public MeetingSettingsResponse updateMeetingSettings(String meetingId, 
                                                        java.util.Map<String, Object> settings, 
                                                        String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can update settings");
        }

        // Store settings in meeting entity (you might want to create a separate settings table)
        // For now, we'll store them as JSON in the description field
        try {
            String settingsJson = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(settings);
            meeting.setDescription("Settings: " + settingsJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize meeting settings", e);
        }
        
        Meeting savedMeeting = meetingRepository.save(meeting);
        
        return new MeetingSettingsResponse(meetingId, settings, LocalDateTime.now());
    }

    /**
     * Gets meeting settings
     */
    public MeetingSettingsResponse getMeetingSettings(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to access meeting settings");
        }

        // Parse settings from description (you might want to create a separate settings table)
        java.util.Map<String, Object> settings = new java.util.HashMap<>();
        if (meeting.getDescription() != null && meeting.getDescription().startsWith("Settings: ")) {
            try {
                String settingsJson = meeting.getDescription().substring(10);
                settings = new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(settingsJson, java.util.Map.class);
            } catch (Exception e) {
                // Return empty settings if parsing fails
            }
        }
        
        return new MeetingSettingsResponse(meetingId, settings, LocalDateTime.now());
    }

    /**
     * Applies host settings to the meeting
     */
    public void applyHostSettings(String meetingId, HostSettingsRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can apply settings");
        }

        // Apply the host settings
        // This is where you would implement the actual logic to apply settings
        // For now, we'll just log the settings
        
        System.out.println("Applying host settings for meeting " + meetingId + ":");
        System.out.println("  Mute All: " + request.isMuteAll());
        System.out.println("  Waiting Room: " + request.isWaitingRoom());
        System.out.println("  Recording: " + request.isRecording());
        System.out.println("  Host Muted: " + request.isHostMuted());
        System.out.println("  Host Video Off: " + request.isHostVideoOff());
        
        // In a real implementation, you would:
        // 1. Update participant states based on muteAll
        // 2. Configure waiting room settings
        // 3. Start/stop recording
        // 4. Update host audio/video states
        // 5. Send notifications to participants about the changes
    }

    // Real-time Call Management Methods
    
    /**
     * Updates call state for a participant
     */
    public void updateCallState(String meetingId, CallStateUpdateRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to update call state");
        }

        // Update participant state
        // In a real implementation, you would update the participant's call state
        // and broadcast the change to other participants via WebSocket
        
        System.out.println("Updating call state for meeting " + meetingId + ", participant " + request.getParticipantId());
        System.out.println("  Muted: " + request.getIsMuted());
        System.out.println("  Video On: " + request.getIsVideoOn());
        System.out.println("  Hand Raised: " + request.getIsHandRaised());
        System.out.println("  Screen Sharing: " + request.getIsScreenSharing());
    }

    /**
     * Gets meeting participants with real-time call states
     */
    public List<CallParticipantDto> getMeetingParticipants(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to access meeting participants");
        }

        // Convert participants to CallParticipantDto
        List<CallParticipantDto> callParticipants = meeting.getParticipants().stream()
                .map(participant -> {
                    CallParticipantDto dto = new CallParticipantDto();
                    dto.setId(participant.getId());
                    dto.setName(participant.getUser().getName());
                    dto.setAvatar(participant.getUser().getAvatar());
                    dto.setJoinTime(participant.getJoinTime());
                    dto.setLeaveTime(participant.getLeaveTime());
                    dto.setSpeakingTimeMinutes(participant.getSpeakingTimeMinutes());
                    dto.setCameraOnTimeMinutes(participant.getCameraOnTimeMinutes());
                    dto.setMicOnTimeMinutes(participant.getMicOnTimeMinutes());
                    dto.setMessagesCount(participant.getMessagesCount());
                    dto.setEngagementScore(participant.getEngagementScore());
                    dto.setStatus(participant.getStatus().toString());
                    
                    // Mock real-time states (in real implementation, these would come from WebSocket)
                    dto.setIsMuted(Math.random() > 0.7);
                    dto.setIsVideoOn(Math.random() > 0.3);
                    dto.setIsHandRaised(Math.random() > 0.9);
                    dto.setIsScreenSharing(false);
                    dto.setIsPresenter(false);
                    dto.setIsInBreakoutRoom(false);
                    dto.setConnectionQuality("excellent");
                    
                    return dto;
                })
                .collect(Collectors.toList());

        return callParticipants;
    }

    /**
     * Sends a chat message
     */
    public ChatMessageDto sendChatMessage(String meetingId, ChatMessageRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to send chat messages");
        }

        User user = getUserByEmail(userEmail);
        
        // Create chat message DTO
        ChatMessageDto message = new ChatMessageDto();
        message.setId(java.util.UUID.randomUUID().toString());
        message.setSenderId(user.getId());
        message.setSenderName(user.getName());
        message.setMessage(request.getMessage());
        message.setTimestamp(LocalDateTime.now());
        message.setType(request.getType() != null ? request.getType() : "text");

        // In a real implementation, you would:
        // 1. Save the message to database
        // 2. Broadcast the message to other participants via WebSocket
        
        return message;
    }

    /**
     * Gets chat messages for a meeting
     */
    public List<ChatMessageDto> getChatMessages(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to access chat messages");
        }

        // In a real implementation, you would fetch messages from database
        // For now, return mock data
        List<ChatMessageDto> messages = new ArrayList<>();
        
        ChatMessageDto message1 = new ChatMessageDto();
        message1.setId("1");
        message1.setSenderId(1L);
        message1.setSenderName("Host");
        message1.setMessage("Welcome to the meeting!");
        message1.setTimestamp(LocalDateTime.now().minusMinutes(5));
        message1.setType("text");
        messages.add(message1);
        
        return messages;
    }

    /**
     * Creates a poll
     */
    public PollDto createPoll(String meetingId, CreatePollRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can create polls");
        }

        User user = getUserByEmail(userEmail);
        
        // Create poll DTO
        PollDto poll = new PollDto();
        poll.setId(java.util.UUID.randomUUID().toString());
        poll.setQuestion(request.getQuestion());
        poll.setOptions(request.getOptions());
        poll.setResponses(new java.util.HashMap<>());
        poll.setIsActive(true);
        poll.setCreatedBy(user.getId());
        poll.setCreatedAt(LocalDateTime.now());

        // In a real implementation, you would:
        // 1. Save the poll to database
        // 2. Broadcast the poll to participants via WebSocket
        
        return poll;
    }

    /**
     * Submits a poll response
     */
    public void submitPollResponse(String meetingId, String pollId, PollResponseRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to submit poll responses");
        }

        // In a real implementation, you would:
        // 1. Save the response to database
        // 2. Update poll results
        // 3. Broadcast updated results to participants via WebSocket
        
        System.out.println("Poll response submitted for meeting " + meetingId + ", poll " + pollId);
        System.out.println("  Option Index: " + request.getOptionIndex());
    }

    /**
     * Gets active polls for a meeting
     */
    public List<PollDto> getActivePolls(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to access polls");
        }

        // In a real implementation, you would fetch active polls from database
        // For now, return empty list
        return new ArrayList<>();
    }

    /**
     * Creates a breakout room
     */
    public BreakoutRoomDto createBreakoutRoom(String meetingId, CreateBreakoutRoomRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can create breakout rooms");
        }

        // Create breakout room DTO
        BreakoutRoomDto room = new BreakoutRoomDto();
        room.setId(java.util.UUID.randomUUID().toString());
        room.setName(request.getName());
        room.setParticipantIds(new ArrayList<>());
        room.setIsActive(true);
        room.setMaxParticipants(request.getMaxParticipants());
        room.setCreatedAt(LocalDateTime.now());

        // In a real implementation, you would:
        // 1. Save the breakout room to database
        // 2. Notify participants about the new room via WebSocket
        
        return room;
    }

    /**
     * Joins a breakout room
     */
    public void joinBreakoutRoom(String meetingId, String roomId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to join breakout rooms");
        }

        // In a real implementation, you would:
        // 1. Update user's breakout room assignment in database
        // 2. Notify other participants via WebSocket
        
        System.out.println("User " + userEmail + " joined breakout room " + roomId + " in meeting " + meetingId);
    }

    /**
     * Leaves a breakout room
     */
    public void leaveBreakoutRoom(String meetingId, String roomId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to leave breakout rooms");
        }

        // In a real implementation, you would:
        // 1. Remove user's breakout room assignment in database
        // 2. Notify other participants via WebSocket
        
        System.out.println("User " + userEmail + " left breakout room " + roomId + " in meeting " + meetingId);
    }

    /**
     * Gets breakout rooms for a meeting
     */
    public List<BreakoutRoomDto> getBreakoutRooms(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to access breakout rooms");
        }

        // In a real implementation, you would fetch breakout rooms from database
        // For now, return empty list
        return new ArrayList<>();
    }

    /**
     * Starts recording for a meeting
     */
    public void startRecording(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can start recording");
        }

        // In a real implementation, you would:
        // 1. Start the recording service
        // 2. Update meeting status
        // 3. Notify participants that recording has started
        
        System.out.println("Recording started for meeting " + meetingId);
    }

    /**
     * Stops recording for a meeting
     */
    public void stopRecording(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can stop recording");
        }

        // In a real implementation, you would:
        // 1. Stop the recording service
        // 2. Update meeting status
        // 3. Generate recording URL
        // 4. Notify participants that recording has stopped
        
        System.out.println("Recording stopped for meeting " + meetingId);
    }

    /**
     * Gets meeting analytics
     */
    public MeetingAnalyticsDto getMeetingAnalytics(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can access analytics");
        }

        // In a real implementation, you would calculate analytics from meeting data
        // For now, return mock data
        MeetingAnalyticsDto analytics = new MeetingAnalyticsDto();
        analytics.setTotalDuration(45);
        analytics.setParticipantCount(meeting.getParticipants().size());
        analytics.setEngagementScore(85);
        analytics.setTalkTimeDistribution(new java.util.HashMap<>());
        analytics.setChatMessageCount(12);
        analytics.setPollCount(2);
        analytics.setScreenShareDuration(15);
        analytics.setRecordingDuration(45);
        
        return analytics;
    }

    /**
     * Gets transcription for a meeting
     */
    public List<TranscriptionEntryDto> getTranscription(String meetingId, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host or participant)
        boolean isHost = meeting.getHost().getEmail().equals(userEmail);
        boolean isParticipant = meeting.getParticipants().stream()
                .anyMatch(p -> p.getUser().getEmail().equals(userEmail));
        
        if (!isHost && !isParticipant) {
            throw new RuntimeException("User not authorized to access transcription");
        }

        // In a real implementation, you would fetch transcription from database
        // For now, return mock data
        List<TranscriptionEntryDto> transcription = new ArrayList<>();
        
        TranscriptionEntryDto entry1 = new TranscriptionEntryDto();
        entry1.setId("1");
        entry1.setSpeaker("Host");
        entry1.setText("Welcome everyone to our meeting.");
        entry1.setTimestamp(LocalDateTime.now().minusMinutes(10));
        entry1.setConfidence(0.95);
        transcription.add(entry1);
        
        return transcription;
    }

    /**
     * Exports meeting data
     */
    public ExportResponse exportMeetingData(String meetingId, ExportRequest request, String userEmail) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));

        // Check if user is authorized (host only)
        if (!meeting.getHost().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the meeting host can export meeting data");
        }

        // In a real implementation, you would:
        // 1. Generate the requested format (PDF, Excel, Video)
        // 2. Upload to cloud storage
        // 3. Return download URL
        
        ExportResponse response = new ExportResponse();
        response.setDownloadUrl("https://example.com/exports/meeting-" + meetingId + "." + request.getFormat());
        response.setFormat(request.getFormat());
        response.setStatus("completed");
        
        return response;
    }
}
