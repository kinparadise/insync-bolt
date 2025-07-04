package com.insync.service;

import com.insync.dto.MeetingDto;
import com.insync.dto.MeetingParticipantDto;
import com.insync.dto.UserDto;
import com.insync.dto.request.CreateMeetingRequest;
import com.insync.entity.Meeting;
import com.insync.entity.MeetingParticipant;
import com.insync.entity.User;
import com.insync.repository.MeetingRepository;
import com.insync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    /**
     * Generates a unique meeting ID in format XXX-XXX-XXX
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
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
