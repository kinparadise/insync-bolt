package com.insync.repository;

import com.insync.entity.Meeting;
import com.insync.entity.MeetingParticipant;
import com.insync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    List<MeetingParticipant> findByMeeting(Meeting meeting);
    
    List<MeetingParticipant> findByUser(User user);
    
    Optional<MeetingParticipant> findByMeetingAndUser(Meeting meeting, User user);
    
    @Query("SELECT mp FROM MeetingParticipant mp WHERE mp.meeting = :meeting ORDER BY mp.engagementScore DESC")
    List<MeetingParticipant> findByMeetingOrderByEngagementDesc(@Param("meeting") Meeting meeting);
    
    @Query("SELECT AVG(mp.engagementScore) FROM MeetingParticipant mp WHERE mp.meeting = :meeting")
    Double getAverageEngagementForMeeting(@Param("meeting") Meeting meeting);
}