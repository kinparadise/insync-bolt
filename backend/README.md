# InSync Backend API

A Spring Boot backend application for the InSync video calling platform, providing REST APIs for user management, meetings, contacts, and real-time communication features.

## Features

- **User Authentication & Authorization** (JWT-based)
- **User Management** (Profile, Status, Search)
- **Meeting Management** (Create, Join, Schedule)
- **Contact Management** (Add, Search, Manage contacts)
- **Action Items** (Meeting follow-ups and tasks)
- **Real-time Communication** (WebSocket support)
- **Meeting Analytics** (Participation tracking, engagement metrics)

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** (Database operations)
- **PostgreSQL** (Primary database)
- **Redis** (Caching and session management)
- **WebSocket** (Real-time communication)
- **Maven** (Dependency management)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd backend
```

### 2. Start Database with Docker

```bash
docker-compose up -d postgres redis
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### 3. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# Database
DB_USERNAME=insync_user
DB_PASSWORD=insync_password

# JWT
JWT_SECRET=mySecretKey123456789012345678901234567890

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "department": "Engineering"
}
```

#### Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "OFFLINE",
    "roles": ["USER"]
  }
}
```

### User Endpoints

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890",
  "department": "Product",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Update User Status
```http
PUT /api/users/me/status?status=ONLINE
Authorization: Bearer <token>
```

#### Search Users
```http
GET /api/users/search?query=john
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

### Meeting Endpoints

#### Create Meeting
```http
POST /api/meetings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Standup",
  "description": "Daily team sync",
  "startTime": "2024-01-15T10:00:00",
  "endTime": "2024-01-15T10:30:00",
  "type": "GENERAL",
  "participantIds": [2, 3, 4]
}
```

#### Get User Meetings
```http
GET /api/meetings/my
Authorization: Bearer <token>
```

#### Get Meeting by ID
```http
GET /api/meetings/{id}
Authorization: Bearer <token>
```

#### Join Meeting
```http
POST /api/meetings/{id}/join
Authorization: Bearer <token>
```

#### Leave Meeting
```http
POST /api/meetings/{id}/leave
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, encrypted)
- `avatar` (String, optional)
- `phone` (String, optional)
- `department` (String, optional)
- `status` (Enum: ONLINE, OFFLINE, AWAY, BUSY)
- `last_seen` (Timestamp)
- `roles` (Set of Enum: USER, ADMIN, MODERATOR)
- `created_at`, `updated_at` (Timestamps)

### Meetings Table
- `id` (Primary Key)
- `title` (String, required)
- `description` (Text, optional)
- `start_time`, `end_time` (Timestamps)
- `host_id` (Foreign Key to Users)
- `status` (Enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `type` (Enum: GENERAL, CLASSROOM, BUSINESS, ONE_ON_ONE)
- `meeting_id` (String, unique meeting room identifier)
- `recording_url`, `transcript_url` (Strings, optional)
- `created_at`, `updated_at` (Timestamps)

### Meeting Participants Table
- `id` (Primary Key)
- `meeting_id` (Foreign Key to Meetings)
- `user_id` (Foreign Key to Users)
- `join_time`, `leave_time` (Timestamps)
- `speaking_time_minutes` (Integer)
- `camera_on_time_minutes` (Integer)
- `mic_on_time_minutes` (Integer)
- `messages_count` (Integer)
- `engagement_score` (Integer, 0-100)
- `status` (Enum: INVITED, JOINED, LEFT, REMOVED)

### Action Items Table
- `id` (Primary Key)
- `task` (String, required)
- `description` (Text, optional)
- `meeting_id` (Foreign Key to Meetings)
- `assignee_id` (Foreign Key to Users)
- `created_by_id` (Foreign Key to Users)
- `due_date` (Date)
- `status` (Enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `created_at`, `updated_at` (Timestamps)

### Contacts Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `contact_user_id` (Foreign Key to Users)
- `status` (Enum: PENDING, ACCEPTED, BLOCKED)
- `created_at` (Timestamp)

## Security

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Password Encryption**: BCrypt hashing for secure password storage
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Role-based Access Control**: Different permission levels (USER, ADMIN, MODERATOR)

## Development

### Running Tests
```bash
mvn test
```

### Building for Production
```bash
mvn clean package -DskipTests
```

### Docker Build
```bash
docker build -t insync-backend .
```

## Environment Configuration

The application supports multiple environments through Spring profiles:

- `application.yml` - Default configuration
- `application-dev.yml` - Development environment
- `application-prod.yml` - Production environment

Set the active profile:
```bash
export SPRING_PROFILES_ACTIVE=prod
```

## Monitoring and Health Checks

The application includes Spring Boot Actuator for monitoring:

- Health Check: `GET /api/actuator/health`
- Metrics: `GET /api/actuator/metrics`
- Info: `GET /api/actuator/info`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.