-- Create notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    meeting_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    scheduled_time TIMESTAMP NOT NULL,
    sent_time TIMESTAMP NULL,
    error_message VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- Email notification preferences
    email_meeting_reminder_15min BOOLEAN DEFAULT TRUE,
    email_meeting_reminder_5min BOOLEAN DEFAULT TRUE,
    email_meeting_started BOOLEAN DEFAULT TRUE,
    email_meeting_ending_soon BOOLEAN DEFAULT TRUE,
    email_meeting_ended BOOLEAN DEFAULT FALSE,
    email_meeting_cancelled BOOLEAN DEFAULT TRUE,
    email_meeting_rescheduled BOOLEAN DEFAULT TRUE,
    
    -- SMS notification preferences
    sms_meeting_reminder_15min BOOLEAN DEFAULT FALSE,
    sms_meeting_reminder_5min BOOLEAN DEFAULT TRUE,
    sms_meeting_started BOOLEAN DEFAULT FALSE,
    sms_meeting_ending_soon BOOLEAN DEFAULT FALSE,
    sms_meeting_ended BOOLEAN DEFAULT FALSE,
    sms_meeting_cancelled BOOLEAN DEFAULT TRUE,
    sms_meeting_rescheduled BOOLEAN DEFAULT TRUE,
    
    -- Push notification preferences
    push_meeting_reminder_15min BOOLEAN DEFAULT TRUE,
    push_meeting_reminder_5min BOOLEAN DEFAULT TRUE,
    push_meeting_started BOOLEAN DEFAULT TRUE,
    push_meeting_ending_soon BOOLEAN DEFAULT TRUE,
    push_meeting_ended BOOLEAN DEFAULT TRUE,
    push_meeting_cancelled BOOLEAN DEFAULT TRUE,
    push_meeting_rescheduled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_meeting_id ON notifications(meeting_id);
CREATE INDEX idx_notifications_scheduled_time ON notifications(scheduled_time);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
