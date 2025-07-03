package com.insync.repository;

import com.insync.entity.Contact;
import com.insync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    @Query("SELECT c FROM Contact c WHERE (c.user = :user OR c.contactUser = :user) AND c.status = :status")
    List<Contact> findContactsByUserAndStatus(@Param("user") User user, @Param("status") Contact.ContactStatus status);
    
    @Query("SELECT c FROM Contact c WHERE ((c.user = :user1 AND c.contactUser = :user2) OR (c.user = :user2 AND c.contactUser = :user1))")
    Optional<Contact> findContactBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    @Query("SELECT CASE WHEN c.user = :user THEN c.contactUser ELSE c.user END FROM Contact c WHERE (c.user = :user OR c.contactUser = :user) AND c.status = 'ACCEPTED'")
    List<User> findAcceptedContactsForUser(@Param("user") User user);
    
    List<Contact> findByUserAndStatus(User user, Contact.ContactStatus status);
    
    List<Contact> findByContactUserAndStatus(User contactUser, Contact.ContactStatus status);
}