# Meeting Notification System

## Overview

The notification system automatically sends SMS and email alerts to users when their meetings are about to start, end, or have status changes. The system is fully configurable and allows users to customize their notification preferences for different channels and event types.

## Features

### 1. Automated Notifications

The system automatically sends notifications for the following events:
- **15-minute reminder**: Sent 15 minutes before the meeting starts
- **5-minute reminder**: Sent 5 minutes before the meeting starts  
- **Meeting started**: Sent when the meeting begins
- **Meeting ending soon**: Sent 5 minutes before the meeting ends
- **Meeting ended**: Sent when the meeting officially ends
- **Meeting cancelled**: Sent immediately when a meeting is cancelled
- **Meeting rescheduled**: Sent immediately when a meeting is rescheduled

### 2. Multiple Notification Channels

- **Email**: Professional email notifications with meeting details
- **SMS**: Short text message alerts with key information
- **Push Notifications**: In-app notifications (future implementation)

### 3. User Preferences

Users can customize their notification preferences for each event type and channel through the API endpoints:
- `GET /api/notifications/preferences` - Get current preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/preferences/reset` - Reset to defaults

## How It Works

### 1. Meeting Creation
When a meeting is created or scheduled:
1. The `MeetingService.createMeeting()` method saves the meeting
2. `NotificationService.scheduleMeetingNotifications()` is called
3. Notification records are created in the database for each participant
4. Notifications are scheduled based on user preferences

### 2. Notification Processing
A scheduled job runs every minute (`@Scheduled(fixedRate = 60000)`):
1. Checks for notifications that are due to be sent
2. Sends notifications via the appropriate channel (email/SMS)
3. Updates notification status (SENT/FAILED)
4. Retries failed notifications every 5 minutes

### 3. Real-time Events
For immediate notifications (cancellation, rescheduling):
1. The system cancels all pending notifications for the meeting
2. Sends immediate notifications to all participants
3. Reschedules new notifications if the meeting was rescheduled

## Configuration

### Email Configuration (application.yml)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

### SMS Configuration (application.yml)
```yaml
sms:
  provider:
    api:
      key: ${SMS_API_KEY:your-sms-api-key}
      url: ${SMS_API_URL:https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json}
    from:
      number: ${SMS_FROM_NUMBER:+1234567890}
```

## API Endpoints

### Meeting Management with Notifications
- `POST /api/meetings` - Create a meeting (schedules notifications)
- `POST /api/meetings/instant` - Create instant meeting (schedules notifications)
- `DELETE /api/meetings/{meetingId}` - Cancel meeting (sends cancellation notifications)
- `PUT /api/meetings/{meetingId}/reschedule` - Reschedule meeting (updates notifications)

### Notification Preferences
- `GET /api/notifications/preferences` - Get user's notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/preferences/reset` - Reset preferences to defaults

## Database Schema

### Notifications Table
```sql
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notification Preferences Table
```sql
CREATE TABLE notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    email_meeting_reminder_15min BOOLEAN DEFAULT TRUE,
    email_meeting_reminder_5min BOOLEAN DEFAULT TRUE,
    sms_meeting_reminder_15min BOOLEAN DEFAULT FALSE,
    sms_meeting_reminder_5min BOOLEAN DEFAULT TRUE,
    -- ... other preference fields
);
```

## Default Notification Preferences

When a user is created, default preferences are:

### Email Notifications (Enabled by default)
- ✅ 15-minute reminder
- ✅ 5-minute reminder  
- ✅ Meeting started
- ✅ Meeting ending soon
- ❌ Meeting ended
- ✅ Meeting cancelled
- ✅ Meeting rescheduled

### SMS Notifications (Conservative defaults)
- ❌ 15-minute reminder
- ✅ 5-minute reminder
- ❌ Meeting started
- ❌ Meeting ending soon
- ❌ Meeting ended
- ✅ Meeting cancelled
- ✅ Meeting rescheduled

### Push Notifications (Enabled by default)
- ✅ All notification types enabled

## Environment Variables

To configure external services, set these environment variables:

```bash
# Email configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# SMS configuration (example for Twilio)
SMS_API_KEY=your-twilio-auth-token
SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
SMS_FROM_NUMBER=+1234567890
```

## Testing

### Manual Testing
1. Create a meeting with a start time in the near future
2. Check the `notifications` table for scheduled notifications
3. Wait for the scheduled time or manually trigger the processor
4. Verify notifications are sent and status is updated

### API Testing
```bash
# Get notification preferences
curl -X GET "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update preferences
curl -X PUT "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailMeetingReminder5Min": true,
    "smsMeetingReminder5Min": false
  }'
```

## Troubleshooting

### Common Issues

1. **Notifications not being sent**
   - Check email/SMS configuration in application.yml
   - Verify user has email/phone number in their profile
   - Check notification preferences are enabled
   - Look for errors in the `notifications` table `error_message` field

2. **Email notifications failing**
   - Verify SMTP configuration
   - Check if app password is correctly set for Gmail
   - Ensure firewall allows SMTP traffic

3. **SMS notifications failing**
   - Verify SMS provider API key and URL
   - Check phone number format (should be in E.164 format)
   - Verify SMS provider account has sufficient credits

### Monitoring

Check the application logs for notification processing:
```bash
# View notification processing logs
tail -f backend/backend.log | grep -i notification
```

## Future Enhancements

1. **Push Notifications**: Implement real push notifications for mobile apps
2. **WhatsApp Integration**: Add WhatsApp as a notification channel
3. **Slack Integration**: Send notifications to Slack channels
4. **Advanced Scheduling**: Custom reminder times per user
5. **Notification Templates**: Customizable message templates
6. **Analytics**: Track notification delivery rates and user engagement
