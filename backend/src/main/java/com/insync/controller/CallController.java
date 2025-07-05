package com.insync.controller;

import com.insync.dto.CallDto;
import com.insync.dto.request.CallActionRequest;
import com.insync.dto.request.InitiateCallRequest;
import com.insync.dto.response.ApiResponse;
import com.insync.entity.Call;
import com.insync.entity.User;
import com.insync.repository.UserRepository;
import com.insync.security.UserPrincipal;
import com.insync.service.CallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/calls")
public class CallController {
    
    @Autowired
    private CallService callService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> initiateCall(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                        @RequestBody InitiateCallRequest request) {
        try {
            User caller = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Call call = callService.initiateCall(caller, request.getReceiverId(), request.getType());
            
            return ResponseEntity.ok(ApiResponse.success("Call initiated successfully", new CallDto(call)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/accept")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> acceptCall(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                      @RequestBody CallActionRequest request) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Call call = callService.acceptCall(request.getCallId(), user);
            
            return ResponseEntity.ok(ApiResponse.success("Call accepted successfully", new CallDto(call)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/decline")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> declineCall(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                       @RequestBody CallActionRequest request) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Call call = callService.declineCall(request.getCallId(), user, request.getReason());
            
            return ResponseEntity.ok(ApiResponse.success("Call declined successfully", new CallDto(call)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/end")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> endCall(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                   @RequestBody CallActionRequest request) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Call call = callService.endCall(request.getCallId(), user, request.getReason());
            
            return ResponseEntity.ok(ApiResponse.success("Call ended successfully", new CallDto(call)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> cancelCall(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                      @RequestBody CallActionRequest request) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Call call = callService.cancelCall(request.getCallId(), user, request.getReason());
            
            return ResponseEntity.ok(ApiResponse.success("Call cancelled successfully", new CallDto(call)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{callId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCall(@PathVariable String callId) {
        try {
            Call call = callService.getCall(callId)
                    .orElseThrow(() -> new RuntimeException("Call not found"));
            
            return ResponseEntity.ok(ApiResponse.success("Call found", new CallDto(call)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCallHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Call> calls = callService.getCallHistory(user);
            List<CallDto> callDtos = calls.stream()
                    .map(CallDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Call history retrieved", callDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getRecentCalls(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                          @RequestParam(defaultValue = "24") int hours) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Call> calls = callService.getRecentCalls(user, hours);
            List<CallDto> callDtos = calls.stream()
                    .map(CallDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Recent calls retrieved", callDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/incoming")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getIncomingCalls(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Call> calls = callService.getIncomingCalls(user);
            List<CallDto> callDtos = calls.stream()
                    .map(CallDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Incoming calls retrieved", callDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCallHistoryWithUser(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                   @PathVariable Long userId) {
        try {
            User currentUser = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            User otherUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Call> calls = callService.getCallHistoryBetweenUsers(currentUser, otherUser);
            List<CallDto> callDtos = calls.stream()
                    .map(CallDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Call history with user retrieved", callDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
