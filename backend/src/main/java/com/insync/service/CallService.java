package com.insync.service;

import com.insync.entity.Call;
import com.insync.entity.User;
import com.insync.repository.CallRepository;
import com.insync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CallService {
    
    @Autowired
    private CallRepository callRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Call initiateCall(User caller, Long receiverId, Call.CallType type) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        if (caller.getId().equals(receiverId)) {
            throw new RuntimeException("Cannot call yourself");
        }
        
        String callId = generateCallId();
        Call call = new Call(callId, caller, receiver, type);
        call.setStatus(Call.CallStatus.RINGING);
        
        return callRepository.save(call);
    }
    
    public Call acceptCall(String callId, User user) {
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getReceiver().getId().equals(user.getId())) {
            throw new RuntimeException("Only receiver can accept the call");
        }
        
        if (call.getStatus() != Call.CallStatus.RINGING) {
            throw new RuntimeException("Call is not in ringing state");
        }
        
        call.setStatus(Call.CallStatus.ACCEPTED);
        call.setStartedAt(LocalDateTime.now());
        
        return callRepository.save(call);
    }
    
    public Call declineCall(String callId, User user, String reason) {
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getReceiver().getId().equals(user.getId())) {
            throw new RuntimeException("Only receiver can decline the call");
        }
        
        if (call.getStatus() != Call.CallStatus.RINGING) {
            throw new RuntimeException("Call is not in ringing state");
        }
        
        call.setStatus(Call.CallStatus.DECLINED);
        call.setEndedAt(LocalDateTime.now());
        call.setEndReason(reason != null ? reason : "Declined by receiver");
        
        return callRepository.save(call);
    }
    
    public Call endCall(String callId, User user, String reason) {
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getCaller().getId().equals(user.getId()) && 
            !call.getReceiver().getId().equals(user.getId())) {
            throw new RuntimeException("Only call participants can end the call");
        }
        
        if (call.getStatus() == Call.CallStatus.ENDED || 
            call.getStatus() == Call.CallStatus.CANCELLED ||
            call.getStatus() == Call.CallStatus.DECLINED) {
            throw new RuntimeException("Call is already ended");
        }
        
        call.setStatus(Call.CallStatus.ENDED);
        call.setEndedAt(LocalDateTime.now());
        call.setEndReason(reason != null ? reason : "Call ended");
        
        if (call.getStartedAt() != null) {
            long duration = ChronoUnit.SECONDS.between(call.getStartedAt(), call.getEndedAt());
            call.setDurationSeconds((int) duration);
        }
        
        return callRepository.save(call);
    }
    
    public Call cancelCall(String callId, User user, String reason) {
        Call call = callRepository.findByCallId(callId)
                .orElseThrow(() -> new RuntimeException("Call not found"));
        
        if (!call.getCaller().getId().equals(user.getId())) {
            throw new RuntimeException("Only caller can cancel the call");
        }
        
        if (call.getStatus() != Call.CallStatus.RINGING) {
            throw new RuntimeException("Can only cancel ringing calls");
        }
        
        call.setStatus(Call.CallStatus.CANCELLED);
        call.setEndedAt(LocalDateTime.now());
        call.setEndReason(reason != null ? reason : "Cancelled by caller");
        
        return callRepository.save(call);
    }
    
    public Optional<Call> getCall(String callId) {
        return callRepository.findByCallId(callId);
    }
    
    public List<Call> getCallHistory(User user) {
        return callRepository.findCallHistoryForUser(user);
    }
    
    public List<Call> getRecentCalls(User user, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return callRepository.findRecentCallsForUser(user, since);
    }
    
    public List<Call> getCallHistoryBetweenUsers(User user1, User user2) {
        return callRepository.findCallHistoryBetweenUsers(user1, user2);
    }
    
    public List<Call> getIncomingCalls(User user) {
        List<Call.CallStatus> activeStatuses = List.of(
            Call.CallStatus.RINGING, 
            Call.CallStatus.PENDING
        );
        return callRepository.findIncomingCallsForUser(user, activeStatuses);
    }
    
    public void markMissedCalls(User user) {
        List<Call> incomingCalls = getIncomingCalls(user);
        for (Call call : incomingCalls) {
            if (call.getStatus() == Call.CallStatus.RINGING) {
                call.setStatus(Call.CallStatus.MISSED);
                call.setEndedAt(LocalDateTime.now());
                call.setEndReason("Missed call");
                callRepository.save(call);
            }
        }
    }
    
    private String generateCallId() {
        return "call-" + UUID.randomUUID().toString();
    }
}
