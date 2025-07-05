package com.insync.repository;

import com.insync.entity.Call;
import com.insync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {
    
    Optional<Call> findByCallId(String callId);
    
    @Query("SELECT c FROM Call c WHERE (c.caller = :user OR c.receiver = :user) ORDER BY c.createdAt DESC")
    List<Call> findCallHistoryForUser(@Param("user") User user);
    
    @Query("SELECT c FROM Call c WHERE (c.caller = :user OR c.receiver = :user) AND c.createdAt >= :since ORDER BY c.createdAt DESC")
    List<Call> findRecentCallsForUser(@Param("user") User user, @Param("since") LocalDateTime since);
    
    @Query("SELECT c FROM Call c WHERE ((c.caller = :user1 AND c.receiver = :user2) OR (c.caller = :user2 AND c.receiver = :user1)) ORDER BY c.createdAt DESC")
    List<Call> findCallHistoryBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    @Query("SELECT c FROM Call c WHERE c.status = :status")
    List<Call> findCallsByStatus(@Param("status") Call.CallStatus status);
    
    @Query("SELECT c FROM Call c WHERE c.receiver = :user AND c.status IN :statuses")
    List<Call> findIncomingCallsForUser(@Param("user") User user, @Param("statuses") List<Call.CallStatus> statuses);
}
