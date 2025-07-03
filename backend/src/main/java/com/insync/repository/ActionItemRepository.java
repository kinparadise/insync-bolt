package com.insync.repository;

import com.insync.entity.ActionItem;
import com.insync.entity.Meeting;
import com.insync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, Long> {
    List<ActionItem> findByMeeting(Meeting meeting);
    
    List<ActionItem> findByAssignee(User assignee);
    
    List<ActionItem> findByAssigneeAndStatus(User assignee, ActionItem.ActionItemStatus status);
    
    @Query("SELECT ai FROM ActionItem ai WHERE ai.assignee = :user AND ai.dueDate <= :date AND ai.status != 'COMPLETED'")
    List<ActionItem> findOverdueActionItems(@Param("user") User user, @Param("date") LocalDate date);
    
    @Query("SELECT ai FROM ActionItem ai WHERE ai.assignee = :user AND ai.dueDate BETWEEN :startDate AND :endDate")
    List<ActionItem> findActionItemsDueBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(ai) FROM ActionItem ai WHERE ai.assignee = :user AND ai.status = :status")
    Long countByAssigneeAndStatus(@Param("user") User user, @Param("status") ActionItem.ActionItemStatus status);
}