package com.insync.service;

import com.insync.entity.Meeting;
import com.insync.entity.Notification;
import com.insync.entity.NotificationPreference;
import com.insync.entity.User;
import com.insync.repository.NotificationRepository;
import com.insync.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferenceRepository notificationPreferenceRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");

    /**
     * Schedules all notifications for a meeting when it's created or updated
     */
    public void scheduleMeetingNotifications(Meeting meeting) {
        if (meeting.getStartTime() == null) {
            return; // Can't schedule notifications without a start time
        }

        // Schedule notifications for the host
        scheduleNotificationsForUser(meeting, meeting.getHost());

        // Schedule notifications for all participants
        meeting.getParticipants().forEach(participant -> 
            scheduleNotificationsForUser(meeting, participant.getUser())
        );
    }

    /**
     * Schedules notifications for a specific user and meeting
     */
    private void scheduleNotificationsForUser(Meeting meeting, User user) {
        NotificationPreference preferences = getOrCreateNotificationPreferences(user);
        LocalDateTime startTime = meeting.getStartTime();
        LocalDateTime endTime = meeting.getEndTime();

        // Schedule 15-minute reminder
        LocalDateTime reminder15Min = startTime.minusMinutes(15);
        if (reminder15Min.isAfter(LocalDateTime.now())) {
            scheduleNotification(meeting, user, Notification.NotificationType.MEETING_REMINDER_15MIN, 
                               reminder15Min, preferences);
        }

        // Schedule 5-minute reminder
        LocalDateTime reminder5Min = startTime.minusMinutes(5);
        if (reminder5Min.isAfter(LocalDateTime.now())) {
            scheduleNotification(meeting, user, Notification.NotificationType.MEETING_REMINDER_5MIN, 
                               reminder5Min, preferences);
        }

        // Schedule meeting started notification
        if (startTime.isAfter(LocalDateTime.now())) {
            scheduleNotification(meeting, user, Notification.NotificationType.MEETING_STARTED, 
                               startTime, preferences);
        }

        // Schedule meeting ending soon notification (5 minutes before end)
        if (endTime != null) {
            LocalDateTime endingSoon = endTime.minusMinutes(5);
            if (endingSoon.isAfter(LocalDateTime.now()) && endingSoon.isAfter(startTime)) {
                scheduleNotification(meeting, user, Notification.NotificationType.MEETING_ENDING_SOON, 
                                   endingSoon, preferences);
            }

            // Schedule meeting ended notification
            if (endTime.isAfter(LocalDateTime.now())) {
                scheduleNotification(meeting, user, Notification.NotificationType.MEETING_ENDED, 
                                   endTime, preferences);
            }
        }
    }

    /**
     * Schedules a notification for multiple channels based on user preferences
     */
    private void scheduleNotification(Meeting meeting, User user, Notification.NotificationType type, 
                                    LocalDateTime scheduledTime, NotificationPreference preferences) {
        
        // Schedule email notification if enabled
        if (preferences.isEnabled(type, Notification.NotificationChannel.EMAIL)) {
            createNotification(meeting, user, type, Notification.NotificationChannel.EMAIL, scheduledTime);
        }

        // Schedule SMS notification if enabled and user has a phone number
        if (preferences.isEnabled(type, Notification.NotificationChannel.SMS) && 
            user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            createNotification(meeting, user, type, Notification.NotificationChannel.SMS, scheduledTime);
        }

        // Schedule push notification if enabled (for future implementation)
        if (preferences.isEnabled(type, Notification.NotificationChannel.PUSH)) {
            createNotification(meeting, user, type, Notification.NotificationChannel.PUSH, scheduledTime);
        }
    }

    /**
     * Creates and saves a notification entity
     */
    private void createNotification(Meeting meeting, User user, Notification.NotificationType type, 
                                  Notification.NotificationChannel channel, LocalDateTime scheduledTime) {
        Notification notification = new Notification();
        notification.setMeeting(meeting);
        notification.setUser(user);
        notification.setType(type);
        notification.setChannel(channel);
        notification.setScheduledTime(scheduledTime);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        notification.setMessage(generateNotificationMessage(meeting, type));
        notification.setTitle(generateNotificationSubject(meeting, type));

        notificationRepository.save(notification);
    }

    /**
     * Processes pending notifications that are due to be sent
     * This method is called every minute by Spring's scheduler
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    public void processPendingNotifications() {
        List<Notification> pendingNotifications = notificationRepository
            .findPendingNotificationsToSend(LocalDateTime.now());

        for (Notification notification : pendingNotifications) {
            sendNotification(notification);
        }
    }

    /**
     * Sends a notification via the appropriate channel
     */
    @Async
    public void sendNotification(Notification notification) {
        try {
            boolean success = false;
            
            switch (notification.getChannel()) {
                case EMAIL:
                    success = sendEmailNotification(notification);
                    break;
                case SMS:
                    success = sendSmsNotification(notification);
                    break;
                case PUSH:
                    success = sendPushNotification(notification);
                    break;
                case IN_APP:
                    success = sendPushNotification(notification); // Handle IN_APP same as PUSH for now
                    break;
            }

            if (success) {
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentTime(LocalDateTime.now());
            } else {
                notification.setStatus(Notification.NotificationStatus.FAILED);
                notification.setErrorMessage("Failed to send notification");
            }

        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notificationRepository.save(notification);
    }

    /**
     * Sends email notification
     */
    private boolean sendEmailNotification(Notification notification) {
        try {
            emailService.sendEmail(
                notification.getUser().getEmail(),
                notification.getTitle(),
                notification.getMessage()
            );
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
            return false;
        }
    }

    /**
     * Sends SMS notification
     */
    private boolean sendSmsNotification(Notification notification) {
        try {
            String phoneNumber = notification.getUser().getPhone();
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return false;
            }

            return smsService.sendSms(
                smsService.formatPhoneNumber(phoneNumber),
                notification.getMessage()
            );
        } catch (Exception e) {
            System.err.println("Failed to send SMS notification: " + e.getMessage());
            return false;
        }
    }

    /**
     * Sends push notification (placeholder for future implementation)
     */
    private boolean sendPushNotification(Notification notification) {
        // TODO: Implement push notification logic
        System.out.println("Push notification would be sent to: " + notification.getUser().getEmail() + 
                          " - " + notification.getMessage());
        return true;
    }

    /**
     * Generates notification message based on type and meeting
     */
    private String generateNotificationMessage(Meeting meeting, Notification.NotificationType type) {
        String meetingTitle = meeting.getTitle();
        String meetingTime = meeting.getStartTime().format(TIME_FORMATTER);
        String meetingDateTime = meeting.getStartTime().format(DATE_TIME_FORMATTER);
        String meetingId = meeting.getMeetingId();

        switch (type) {
            case MEETING_REMINDER_15MIN:
                return String.format("Reminder: '%s' starts in 15 minutes at %s. Meeting ID: %s", 
                                    meetingTitle, meetingTime, meetingId);
            case MEETING_REMINDER_5MIN:
                return String.format("Reminder: '%s' starts in 5 minutes at %s. Meeting ID: %s", 
                                    meetingTitle, meetingTime, meetingId);
            case MEETING_STARTED:
                return String.format("'%s' has started! Join now with Meeting ID: %s", 
                                    meetingTitle, meetingId);
            case MEETING_ENDING_SOON:
                return String.format("'%s' will end in 5 minutes. Please wrap up your discussion.", 
                                    meetingTitle);
            case MEETING_ENDED:
                return String.format("'%s' has ended. Thank you for participating!", meetingTitle);
            case MEETING_CANCELLED:
                return String.format("'%s' scheduled for %s has been cancelled.", 
                                    meetingTitle, meetingDateTime);
            case MEETING_RESCHEDULED:
                return String.format("'%s' has been rescheduled to %s. Meeting ID: %s", 
                                    meetingTitle, meetingDateTime, meetingId);
            default:
                return String.format("Meeting update: %s", meetingTitle);
        }
    }

    /**
     * Generates notification subject for email notifications
     */
    private String generateNotificationSubject(Meeting meeting, Notification.NotificationType type) {
        String meetingTitle = meeting.getTitle();

        switch (type) {
            case MEETING_REMINDER_15MIN:
                return String.format("Meeting Reminder: %s starts in 15 minutes", meetingTitle);
            case MEETING_REMINDER_5MIN:
                return String.format("Meeting Reminder: %s starts in 5 minutes", meetingTitle);
            case MEETING_STARTED:
                return String.format("Meeting Started: %s", meetingTitle);
            case MEETING_ENDING_SOON:
                return String.format("Meeting Ending Soon: %s", meetingTitle);
            case MEETING_ENDED:
                return String.format("Meeting Ended: %s", meetingTitle);
            case MEETING_CANCELLED:
                return String.format("Meeting Cancelled: %s", meetingTitle);
            case MEETING_RESCHEDULED:
                return String.format("Meeting Rescheduled: %s", meetingTitle);
            default:
                return String.format("Meeting Update: %s", meetingTitle);
        }
    }

    /**
     * Gets or creates notification preferences for a user
     */
    private NotificationPreference getOrCreateNotificationPreferences(User user) {
        return notificationPreferenceRepository.findByUser_Id(user.getId())
            .orElseGet(() -> {
                NotificationPreference preferences = new NotificationPreference(user);
                return notificationPreferenceRepository.save(preferences);
            });
    }

    /**
     * Cancels all pending notifications for a meeting
     */
    public void cancelMeetingNotifications(Meeting meeting) {
        List<Notification> notifications = notificationRepository.findByMeeting(meeting);
        for (Notification notification : notifications) {
            if (notification.getStatus() == Notification.NotificationStatus.PENDING) {
                notification.setStatus(Notification.NotificationStatus.CANCELLED);
                notificationRepository.save(notification);
            }
        }
    }

    /**
     * Sends immediate notification for meeting cancellation or rescheduling
     */
    public void sendImmediateMeetingNotification(Meeting meeting, Notification.NotificationType type) {
        // Send to host
        sendImmediateNotificationToUser(meeting, meeting.getHost(), type);

        // Send to all participants
        meeting.getParticipants().forEach(participant -> 
            sendImmediateNotificationToUser(meeting, participant.getUser(), type)
        );
    }

    /**
     * Sends immediate notification to a specific user
     */
    private void sendImmediateNotificationToUser(Meeting meeting, User user, Notification.NotificationType type) {
        NotificationPreference preferences = getOrCreateNotificationPreferences(user);

        // Send email notification if enabled
        if (preferences.isEnabled(type, Notification.NotificationChannel.EMAIL)) {
            Notification emailNotification = new Notification();
            emailNotification.setMeeting(meeting);
            emailNotification.setUser(user);
            emailNotification.setType(type);
            emailNotification.setChannel(Notification.NotificationChannel.EMAIL);
            emailNotification.setScheduledTime(LocalDateTime.now());
            emailNotification.setStatus(Notification.NotificationStatus.PENDING);
            emailNotification.setMessage(generateNotificationMessage(meeting, type));
            emailNotification.setTitle(generateNotificationSubject(meeting, type));
            
            notificationRepository.save(emailNotification);
            sendNotification(emailNotification);
        }

        // Send SMS notification if enabled and user has phone
        if (preferences.isEnabled(type, Notification.NotificationChannel.SMS) && 
            user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            Notification smsNotification = new Notification();
            smsNotification.setMeeting(meeting);
            smsNotification.setUser(user);
            smsNotification.setType(type);
            smsNotification.setChannel(Notification.NotificationChannel.SMS);
            smsNotification.setScheduledTime(LocalDateTime.now());
            smsNotification.setStatus(Notification.NotificationStatus.PENDING);
            smsNotification.setMessage(generateNotificationMessage(meeting, type));
            smsNotification.setTitle(generateNotificationSubject(meeting, type));
            
            notificationRepository.save(smsNotification);
            sendNotification(smsNotification);
        }
    }

    /**
     * Retries failed notifications (can be called by a scheduled job)
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void retryFailedNotifications() {
        List<Notification> failedNotifications = notificationRepository.findFailedNotifications();
        
        for (Notification notification : failedNotifications) {
            sendNotification(notification);
        }
    }
}
