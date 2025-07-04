# InSync Calendar Integration

A professional calendar picker system for adding scheduled meeting reminders to users' calendars.

## Features

### 🗓️ Professional Calendar Integration
- **Multi-platform support**: Google Calendar, Outlook, and device calendar
- **Smart time management**: Visual calendar picker with time selection
- **Industry-standard formats**: ICS file generation for universal compatibility
- **Professional reminders**: 15-minute and 5-minute default alerts

### 🎯 User Experience
- **Intuitive interface**: Clean, modern calendar picker modal
- **Multiple integration options**: Direct calendar apps or downloadable files
- **Real-time validation**: Ensures meeting times are logical
- **Professional styling**: Consistent with InSync brand

### 🔧 Technical Implementation

#### Backend (Spring Boot)
- **CalendarService**: Generates calendar events and URLs
- **CalendarEventDto**: Professional data structure for calendar events
- **RESTful API**: Endpoints for calendar integration
- **ICS generation**: Standards-compliant calendar file creation

#### Frontend (React Native)
- **CalendarPickerModal**: Feature-rich calendar selection component
- **Cross-platform support**: iOS and Android compatibility
- **Native integrations**: Device calendar permissions and API access
- **URL handling**: Deep links to external calendar applications

## API Endpoints

### Get Calendar Event
```http
GET /meetings/{meetingId}/calendar
```
Returns calendar event data with Google/Outlook URLs.

### Download ICS File
```http
GET /meetings/{meetingId}/calendar/download
```
Returns downloadable ICS calendar file.

## Component Usage

```tsx
import CalendarPickerModal from '@/components/CalendarPickerModal';

<CalendarPickerModal
  visible={showCalendarModal}
  onClose={() => setShowCalendarModal(false)}
  meeting={{
    meetingId: "ABC-123-DEF",
    title: "Team Standup",
    description: "Daily team sync meeting",
    startTime: "2025-07-04T10:00:00",
    endTime: "2025-07-04T10:30:00",
  }}
  onAddToCalendar={(calendarId) => {
    console.log('Added to calendar:', calendarId);
  }}
/>
```

## Calendar Integration Options

### 1. Device Calendar
- **Native integration**: Uses expo-calendar for device access
- **Permission handling**: Requests calendar permissions gracefully
- **Smart defaults**: Adds professional 15 and 5-minute reminders
- **Cross-platform**: Works on iOS and Android

### 2. Google Calendar
- **Web integration**: Opens Google Calendar with pre-filled event
- **URL generation**: Creates properly formatted Google Calendar URLs
- **Professional details**: Includes meeting ID and join URL

### 3. Outlook Calendar
- **Microsoft integration**: Opens Outlook with meeting details
- **Business-ready**: Perfect for corporate environments
- **URL compatibility**: Works with Outlook web and desktop

### 4. ICS Download
- **Universal format**: Works with any calendar application
- **File sharing**: Can be sent via email or messaging
- **Standard compliance**: RFC 5545 compliant ICS format

## Professional Features

### Meeting Reminders
- **15 minutes before**: Primary reminder for preparation
- **5 minutes before**: Final reminder to join
- **Customizable**: Backend supports different reminder intervals

### Meeting Details
- **Comprehensive info**: Title, description, meeting ID, join URL
- **Professional formatting**: Clean, readable event descriptions
- **InSync branding**: Powered by InSync footer

### Time Management
- **Visual picker**: Interactive calendar for date selection
- **Time validation**: Ensures end time is after start time
- **Smart defaults**: Auto-adjusts end time when start time changes

## Security & Privacy

- **Permission-based**: Only accesses calendars with user consent
- **No data storage**: Calendar data handled locally when possible
- **Secure URLs**: Meeting join URLs are properly formatted
- **Privacy-first**: No unnecessary data collection

## Installation

The calendar integration uses existing dependencies:

```json
{
  "expo-calendar": "^14.1.4",
  "react-native-calendars": "^1.1313.0",
  "@react-native-community/datetimepicker": "^8.4.1"
}
```

## Configuration

No additional configuration required. The system works out of the box with:
- Standard calendar permissions
- Professional default settings
- Cross-platform compatibility

## Professional Grade

This calendar integration is designed for business use with:
- **Enterprise ready**: Supports corporate calendar systems
- **Professional styling**: Clean, modern interface
- **Reliable functionality**: Tested across platforms
- **Scalable architecture**: Easy to extend and maintain

---

*Very professional, innit?* ✨ This calendar integration elevates the InSync meeting experience to enterprise standards.
