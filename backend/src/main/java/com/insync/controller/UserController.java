package com.insync.controller;

import com.insync.dto.UserDto;
import com.insync.dto.response.ApiResponse;
import com.insync.entity.User;
import com.insync.repository.UserRepository;
import com.insync.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", new UserDto(user)));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                             @RequestBody UserDto userDto) {
        User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userDto.getName());
        user.setPhone(userDto.getPhone());
        user.setDepartment(userDto.getDepartment());
        user.setAvatar(userDto.getAvatar());

        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", new UserDto(user)));
    }

    @PutMapping("/me/status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateUserStatus(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                            @RequestParam User.UserStatus status) {
        User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(status);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Status updated successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> searchUsers(@RequestParam String query,
                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<User> users = userRepository.searchUsers(query);
        List<UserDto> userDtos = users.stream()
                .filter(user -> !user.getEmail().equals(userPrincipal.getEmail()))
                .map(UserDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users found", userDtos));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User currentUser = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> users = userRepository.findAllExceptUser(currentUser.getId());
        List<UserDto> userDtos = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users retrieved", userDtos));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("User found", new UserDto(user)));
    }
}