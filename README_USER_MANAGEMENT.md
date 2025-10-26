# User Management System Setup

This document provides instructions for setting up and using the user management system for the EventCategorize application.

## Overview

The user management system includes:
- User authentication (login/logout)
- User registration and management
- Role-based access control
- Protected routes for Idea Tank pages

## Database Setup

1. **Create the idea_users table**:
   The table creation script is located at `db/init/03-create-idea-users-table.sql`
   
   Execute this script on your PostgreSQL database:
   ```bash
   psql -d eventfeedback -f db/init/03-create-idea-users-table.sql
   ```

## Backend Setup

1. **Install required dependencies**:
   ```bash
   cd backend
   pip install python-jose[cryptography] passlib[bcrypt]
   ```

2. **Environment Variables**:
   Make sure to set the following environment variables:
   ```bash
   SECRET_KEY=your-secret-key-here-change-in-production
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run the backend application**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Frontend Setup

1. **Run the frontend application**:
   ```bash
   cd frontend
   npm run dev
   ```

## Create Admin User

After starting the backend application, create the admin user:

1. **Using the provided script**:
   ```bash
   chmod +x scripts/create_admin_user.sh
   ./scripts/create_admin_user.sh
   ```

2. **Manual creation**:
   Alternatively, you can create the admin user by making a POST request:
   ```bash
   curl -X POST "http://localhost:8000/users/create-admin"
   ```

   **Default Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`

   ⚠️ **Security Note**: Change the default password after first login!

## Using the System

### 1. Login
- Navigate to `http://localhost:3000/login`
- Enter your username and password
- After successful login, you'll be redirected to the Idea Tank page

### 2. User Management
- Access user management at `http://localhost:3000/user_list`
- From here you can:
  - View all users
  - Create new users (`/user_create`)
  - Edit existing users (`/user_modify/{user_code}`)
  - Delete users (except your own account)

### 3. Protected Routes
- The following routes now require authentication:
  - `/idea_tank` - Idea Tank listing page
  - `/idea_tank_detail/{idea_seq}` - Idea Tank detail page
  - `/user_list` - User management page
  - `/user_create` - Create user page
  - `/user_modify/{user_code}` - Modify user page

### 4. Logout
- Click the "ออกจากระบบ" (Logout) button on any protected page

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### User Management
- `GET /users` - List all users (requires authentication)
- `GET /users/{user_code}` - Get user details (requires authentication)
- `PUT /users/{user_code}` - Update user (requires authentication)
- `DELETE /users/{user_code}` - Delete user (requires authentication)
- `POST /users/create-admin` - Create admin user

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Authentication uses JWT tokens with expiration
3. **Protected Routes**: All sensitive routes require valid authentication
4. **Token Validation**: Tokens are validated on each protected request

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure PostgreSQL is running
   - Check database connection parameters
   - Verify the `idea_users` table exists

2. **Authentication Errors**:
   - Check that the backend is running on the correct port
   - Verify the `SECRET_KEY` environment variable is set
   - Clear browser cache and localStorage if needed

3. **CORS Issues**:
   - Ensure the backend CORS settings allow requests from the frontend
   - Check that `NEXT_PUBLIC_API_URL` is correctly set

### Testing the System

1. **Test Admin Creation**:
   ```bash
   curl -X POST "http://localhost:8000/users/create-admin"
   ```

2. **Test Login**:
   ```bash
   curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"user_login":"admin","user_password":"admin123"}'
   ```

3. **Test Protected Route**:
   ```bash
   # First login to get token
   TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"user_login":"admin","user_password":"admin123"}' | jq -r '.token')
   
   # Then access protected route
   curl -X GET "http://localhost:8000/users" \
     -H "Authorization: Bearer $TOKEN"
   ```

## Additional Notes

- The system uses Thai language for the user interface
- User sessions are stored in localStorage on the frontend
- The admin user has full access to all user management functions
- Regular users cannot delete their own accounts
- Password changes are optional when editing users (leave blank to keep current password)