package com.insync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        if (mailSender == null) {
            // Log warning instead of failing if mail sender is not configured
            System.out.println("Email service not configured. Would send email to: " + to + " with subject: " + subject);
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
} 