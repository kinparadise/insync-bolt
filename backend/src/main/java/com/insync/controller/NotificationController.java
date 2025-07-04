package com.insync.controller;

import com.insync.entity.NotificationPreference;
import com.insync.entity.User;
import com.insync.repository.NotificationPreferenceRepository;
import com.insync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationPreferenceRepository notificationPreferenceRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get notification preferences for the authenticated user
     */
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreference> getNotificationPreferences(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        NotificationPreference preferences = notificationPreferenceRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    // Create default preferences if they don't exist
                    NotificationPreference defaultPreferences = new NotificationPreference(user);
                    return notificationPreferenceRepository.save(defaultPreferences);
                });

        return ResponseEntity.ok(preferences);
    }

    /**
     * Update notification preferences for the authenticated user
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreference> updateNotificationPreferences(
            @RequestBody NotificationPreference updatedPreferences,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        NotificationPreference existingPreferences = notificationPreferenceRepository.findByUser_Id(user.getId())
                .orElse(new NotificationPreference(user));

        // Update all preference fields
        existingPreferences.setEmailMeetingReminder15Min(updatedPreferences.isEmailMeetingReminder15Min());
        existingPreferences.setEmailMeetingReminder5Min(updatedPreferences.isEmailMeetingReminder5Min());
        existingPreferences.setEmailMeetingStarted(updatedPreferences.isEmailMeetingStarted());
        existingPreferences.setEmailMeetingEndingSoon(updatedPreferences.isEmailMeetingEndingSoon());
        existingPreferences.setEmailMeetingEnded(updatedPreferences.isEmailMeetingEnded());
        existingPreferences.setEmailMeetingCancelled(updatedPreferences.isEmailMeetingCancelled());
        existingPreferences.setEmailMeetingRescheduled(updatedPreferences.isEmailMeetingRescheduled());

        existingPreferences.setSmsMeetingReminder15Min(updatedPreferences.isSmsMeetingReminder15Min());
        existingPreferences.setSmsMeetingReminder5Min(updatedPreferences.isSmsMeetingReminder5Min());
        existingPreferences.setSmsMeetingStarted(updatedPreferences.isSmsMeetingStarted());
        existingPreferences.setSmsMeetingEndingSoon(updatedPreferences.isSmsMeetingEndingSoon());
        existingPreferences.setSmsMeetingEnded(updatedPreferences.isSmsMeetingEnded());
        existingPreferences.setSmsMeetingCancelled(updatedPreferences.isSmsMeetingCancelled());
        existingPreferences.setSmsMeetingRescheduled(updatedPreferences.isSmsMeetingRescheduled());

        existingPreferences.setPushMeetingReminder15Min(updatedPreferences.isPushMeetingReminder15Min());
        existingPreferences.setPushMeetingReminder5Min(updatedPreferences.isPushMeetingReminder5Min());
        existingPreferences.setPushMeetingStarted(updatedPreferences.isPushMeetingStarted());
        existingPreferences.setPushMeetingEndingSoon(updatedPreferences.isPushMeetingEndingSoon());
        existingPreferences.setPushMeetingEnded(updatedPreferences.isPushMeetingEnded());
        existingPreferences.setPushMeetingCancelled(updatedPreferences.isPushMeetingCancelled());
        existingPreferences.setPushMeetingRescheduled(updatedPreferences.isPushMeetingRescheduled());

        NotificationPreference savedPreferences = notificationPreferenceRepository.save(existingPreferences);
        return ResponseEntity.ok(savedPreferences);
    }

    /**
     * Reset notification preferences to defaults
     */
    @PostMapping("/preferences/reset")
    public ResponseEntity<NotificationPreference> resetNotificationPreferences(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete existing preferences if they exist
        notificationPreferenceRepository.findByUser_Id(user.getId())
                .ifPresent(notificationPreferenceRepository::delete);

        // Create new default preferences
        NotificationPreference defaultPreferences = new NotificationPreference(user);
        NotificationPreference savedPreferences = notificationPreferenceRepository.save(defaultPreferences);
        
        return ResponseEntity.ok(savedPreferences);
    }
}
