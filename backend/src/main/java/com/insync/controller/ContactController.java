package com.insync.controller;

import com.insync.dto.UserDto;
import com.insync.dto.response.ApiResponse;
import com.insync.entity.Contact;
import com.insync.entity.User;
import com.insync.repository.ContactRepository;
import com.insync.repository.UserRepository;
import com.insync.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/contacts")
public class ContactController {
    
    @Autowired
    private ContactRepository contactRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getContacts(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<User> contacts = contactRepository.findAcceptedContactsForUser(user);
            List<UserDto> contactDtos = contacts.stream()
                    .map(UserDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Contacts retrieved successfully", contactDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/add/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addContact(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                      @PathVariable Long userId) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            User contactUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Contact user not found"));
            
            if (user.getId().equals(userId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Cannot add yourself as contact"));
            }
            
            // Check if contact already exists
            Optional<Contact> existingContact = contactRepository.findContactBetweenUsers(user, contactUser);
            if (existingContact.isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Contact already exists"));
            }
            
            Contact contact = new Contact(user, contactUser);
            contact.setStatus(Contact.ContactStatus.ACCEPTED); // Auto-accept for simplicity
            contactRepository.save(contact);
            
            return ResponseEntity.ok(ApiResponse.success("Contact added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> removeContact(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                         @PathVariable Long userId) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            User contactUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Contact user not found"));
            
            Optional<Contact> contact = contactRepository.findContactBetweenUsers(user, contactUser);
            if (contact.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Contact not found"));
            }
            
            contactRepository.delete(contact.get());
            
            return ResponseEntity.ok(ApiResponse.success("Contact removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getPendingContacts(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Contact> pendingContacts = contactRepository.findByContactUserAndStatus(user, Contact.ContactStatus.PENDING);
            List<UserDto> contactDtos = pendingContacts.stream()
                    .map(contact -> new UserDto(contact.getUser()))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Pending contacts retrieved successfully", contactDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/accept/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> acceptContact(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                         @PathVariable Long userId) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            User contactUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Contact user not found"));
            
            Optional<Contact> contact = contactRepository.findContactBetweenUsers(user, contactUser);
            if (contact.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Contact request not found"));
            }
            
            Contact contactEntity = contact.get();
            if (contactEntity.getStatus() != Contact.ContactStatus.PENDING) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Contact is not pending"));
            }
            
            contactEntity.setStatus(Contact.ContactStatus.ACCEPTED);
            contactRepository.save(contactEntity);
            
            return ResponseEntity.ok(ApiResponse.success("Contact accepted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/block/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> blockContact(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                        @PathVariable Long userId) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            User contactUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Contact user not found"));
            
            Optional<Contact> contact = contactRepository.findContactBetweenUsers(user, contactUser);
            if (contact.isEmpty()) {
                // Create a blocked contact entry
                Contact blockedContact = new Contact(user, contactUser);
                blockedContact.setStatus(Contact.ContactStatus.BLOCKED);
                contactRepository.save(blockedContact);
            } else {
                Contact contactEntity = contact.get();
                contactEntity.setStatus(Contact.ContactStatus.BLOCKED);
                contactRepository.save(contactEntity);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Contact blocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
