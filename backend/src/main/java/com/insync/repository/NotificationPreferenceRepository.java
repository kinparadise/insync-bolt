package com.insync.repository;

import com.insync.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    
    /**
     * Find notification preference by user ID (since it's OneToOne relationship)
     */
    Optional<NotificationPreference> findByUser_Id(Long userId);
}
