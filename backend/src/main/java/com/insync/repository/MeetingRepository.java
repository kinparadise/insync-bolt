package com.insync.repository;

import com.insync.entity.Meeting;
import com.insync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    Optional<Meeting> findByMeetingId(String meetingId);
    
    List<Meeting> findByHostOrderByStartTimeDesc(User host);
    
    @Query("SELECT m FROM Meeting m JOIN m.participants p WHERE p.user = :user ORDER BY m.startTime DESC")
    List<Meeting> findMeetingsByParticipant(@Param("user") User user);
    
    @Query("SELECT m FROM Meeting m WHERE m.host = :user OR m.id IN (SELECT p.meeting.id FROM MeetingParticipant p WHERE p.user = :user) ORDER BY m.startTime DESC")
    List<Meeting> findAllUserMeetings(@Param("user") User user);
    
    @Query("SELECT m FROM Meeting m WHERE m.startTime BETWEEN :startDate AND :endDate ORDER BY m.startTime")
    List<Meeting> findMeetingsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    List<Meeting> findByStatusOrderByStartTimeDesc(Meeting.MeetingStatus status);
    
    @Query("SELECT m FROM Meeting m WHERE m.startTime > :now AND (m.host = :user OR m.id IN (SELECT p.meeting.id FROM MeetingParticipant p WHERE p.user = :user)) ORDER BY m.startTime")
    List<Meeting> findUpcomingMeetingsForUser(@Param("user") User user, @Param("now") LocalDateTime now);
}