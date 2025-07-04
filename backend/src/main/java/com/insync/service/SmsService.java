package com.insync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {
    
    @Value("${sms.provider.api.key:#{null}}")
    private String apiKey;
    
    @Value("${sms.provider.api.url:#{null}}")
    private String apiUrl;
    
    @Value("${sms.provider.from.number:#{null}}")
    private String fromNumber;
    
    private final RestTemplate restTemplate;
    
    public SmsService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Sends an SMS message to the specified phone number
     * This is a generic implementation that can be adapted to different SMS providers
     * (Twilio, AWS SNS, etc.)
     */
    public boolean sendSms(String toPhoneNumber, String message) {
        // If SMS service is not configured, log and return false
        if (apiKey == null || apiUrl == null || fromNumber == null) {
            System.out.println("SMS service not configured. Would send SMS to: " + toPhoneNumber + " with message: " + message);
            return false;
        }
        
        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey); // For services that use Bearer token
            
            // Prepare request body (generic format - adapt based on your SMS provider)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to", toPhoneNumber);
            requestBody.put("from", fromNumber);
            requestBody.put("body", message);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Send the SMS
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            
            // Check if the SMS was sent successfully
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Validates if a phone number is in the correct format
     * Basic validation - you might want to use a more sophisticated library
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        
        // Remove all non-digit characters for validation
        String digitsOnly = phoneNumber.replaceAll("[^0-9]", "");
        
        // Check if it's a reasonable length (7-15 digits is typical for most phone numbers)
        return digitsOnly.length() >= 7 && digitsOnly.length() <= 15;
    }
    
    /**
     * Formats a phone number to E.164 format (+1234567890)
     * This is a basic implementation - you might want to use a library like libphonenumber
     */
    public String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        
        // Remove all non-digit characters
        String digitsOnly = phoneNumber.replaceAll("[^0-9]", "");
        
        // If it doesn't start with country code, assume US (+1)
        if (digitsOnly.length() == 10) {
            digitsOnly = "1" + digitsOnly;
        }
        
        return "+" + digitsOnly;
    }
}
