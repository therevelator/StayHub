# StayHub - Modern Accommodation Booking Platform

A scalable and modern web application for booking accommodations worldwide, built with React, Node.js, and PostgreSQL.

## System Requirements

- Node.js v14 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Docker (optional, for containerized database)

## Tech Stack

### Frontend
- React 18
- Material-UI
- React Router
- Vite
- Axios for API calls

### Backend
- Node.js
- Express
- PostgreSQL (primary database)
- Redis (for session management)
- JWT for authentication

## Database Schema

The application uses PostgreSQL as its primary database with the following core tables:
- users: Core user information
- user_profiles: Extended user details
- user_security: Security-related information
- sessions: User session management
- email_verifications: Email verification process

## Setup Instructions

### 1. Database Setup

#### Using Docker (Recommended)
```bash
# Pull PostgreSQL image
docker pull postgres:14

# Create a Docker volume for persistent data
docker volume create stayhub_pgdata

# Start PostgreSQL container
docker run --name stayhub-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=stayhub \
  -v stayhub_pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  -d postgres:14
```

#### Manual PostgreSQL Setup
1. Install PostgreSQL 14
2. Create a new database:
```sql
CREATE DATABASE stayhub;
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# Initialize database tables
npm run db:migrate

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/stayhub
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001/api
```

## API Documentation

### Authentication Endpoints

#### Register User
- POST /api/auth/register
- Body: 
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

#### Login
- POST /api/auth/login
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

## Development

### Database Migrations

```bash
# Create a new migration
npm run migration:create name_of_migration

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

### Running Tests

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting on authentication endpoints
- Email verification
- Session management
- CORS protection
- SQL injection prevention
- XSS protection

## Deployment

### Production Considerations

1. Database
- Set up master-slave replication
- Configure regular backups
- Use connection pooling (PgBouncer)
- Set up monitoring

2. Application
- Use PM2 for process management
- Set up Nginx as reverse proxy
- Configure SSL certificates
- Set up monitoring and logging

3. Security
- Enable rate limiting
- Set up WAF
- Regular security audits
- Implement CSRF protection

## Monitoring and Maintenance

- Database monitoring using pgMetrics
- Application monitoring using PM2
- Error tracking using Sentry
- Performance monitoring using New Relic

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - see LICENSE.md for details
