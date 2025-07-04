package com.insync.repository;

import com.insync.entity.Notification;
import com.insync.entity.Meeting;
import com.insync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all pending notifications that should be sent now or before the given time
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.scheduledTime <= :currentTime")
    List<Notification> findPendingNotificationsToSend(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find all notifications for a specific meeting
     */
    List<Notification> findByMeeting(Meeting meeting);
    
    /**
     * Find all notifications for a specific user
     */
    List<Notification> findByUser(User user);
    
    /**
     * Find notifications by meeting and type
     */
    @Query("SELECT n FROM Notification n WHERE n.meeting = :meeting AND n.type = :type")
    List<Notification> findByMeetingAndType(@Param("meeting") Meeting meeting, @Param("type") Notification.NotificationType type);
    
    /**
     * Find notifications that failed to send
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED'")
    List<Notification> findFailedNotifications();
}
