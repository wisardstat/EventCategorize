# User Creation Guide

This guide provides comprehensive instructions for creating new users in the `idea_users` table for the EventCategorize application.

## Overview

The EventCategorize application supports multiple methods for creating new users:

1. **Direct SQL Database Method** - Using SQL scripts to directly insert users into the database
2. **API Method** - Using the FastAPI backend endpoints to create users programmatically
3. **Interactive Python Script** - Using a user-friendly Python script with command-line interface

## Method 1: Direct SQL Database Method

### Prerequisites
- Access to the PostgreSQL database
- Database credentials with write permissions
- psql command-line tool or any PostgreSQL client

### Using the SQL Script

The [`scripts/create_new_user.sql`](scripts/create_new_user.sql) script provides a function-based approach to create users.

#### Steps:

1. **Connect to your database:**
   ```bash
   psql -d eventfeedback -U your_username -h your_host -p your_port
   ```

2. **Run the SQL script:**
   ```sql
   \i scripts/create_new_user.sql
   ```

3. **Create a new user using the function:**
   ```sql
   SELECT create_new_user('USER001', 'John', 'Doe', 'johndoe', 'password123');
   ```

#### Function Parameters:
- `p_user_code` (VARCHAR(50)): Unique user identifier
- `p_user_fname` (VARCHAR(100)): User's first name
- `p_user_lname` (VARCHAR(100)): User's last name
- `p_user_login` (VARCHAR(50)): Login username (must be unique)
- `p_user_password` (VARCHAR(255)): User's password (stored as plain text)

#### Example Usage:
```sql
-- Create a regular user
SELECT create_new_user('EMP001', 'Alice', 'Johnson', 'alicej', 'alicepass123');

-- Create a manager user
SELECT create_new_user('MGR001', 'Bob', 'Smith', 'bobsmith', 'managerpass456');

-- View all users
SELECT user_code, user_fname, user_lname, user_login, user_createdate 
FROM public.idea_users 
ORDER BY user_createdate DESC;
```

#### Manual SQL Insert (Alternative):
```sql
INSERT INTO public.idea_users (
    user_code,
    user_fname,
    user_lname,
    user_login,
    user_password,
    user_createdate,
    user_updatedate
) VALUES (
    'USER002',
    'Jane',
    'Doe',
    'janedoe',
    'janepass789',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

## Method 2: API Method

### Prerequisites
- Backend server running (typically on `http://localhost:8000`)
- Python with `requests` library installed
- Network access to the API endpoint

### Using the API Directly

The FastAPI backend provides a registration endpoint at `/auth/register`.

#### API Endpoint Details:
- **URL**: `POST /auth/register`
- **Content-Type**: `application/json`
- **Response Model**: `UserOut`

#### Request Body:
```json
{
    "user_code": "USER001",
    "user_fname": "John",
    "user_lname": "Doe",
    "user_login": "johndoe",
    "user_password": "password123"
}
```

#### Example using curl:
```bash
curl -X POST "http://localhost:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
           "user_code": "USER001",
           "user_fname": "John",
           "user_lname": "Doe",
           "user_login": "johndoe",
           "user_password": "password123"
         }'
```

#### Example using Python:
```python
import requests

url = "http://localhost:8000/auth/register"
user_data = {
    "user_code": "USER001",
    "user_fname": "John",
    "user_lname": "Doe",
    "user_login": "johndoe",
    "user_password": "password123"
}

response = requests.post(url, json=user_data)

if response.status_code == 201:
    print("User created successfully!")
    print(response.json())
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

## Method 3: Interactive Python Script

### Prerequisites
- Python 3.6+
- `requests` library installed
- Backend server running

### Installation:
```bash
pip install requests
```

### Using the Script

The [`scripts/create_new_user.py`](scripts/create_new_user.py) script provides a convenient command-line interface.

#### Command Line Mode:
```bash
python scripts/create_new_user.py USER001 John Doe johndoe password123
```

#### Interactive Mode:
```bash
python scripts/create_new_user.py --interactive
```

#### Custom API URL:
```bash
python scripts/create_new_user.py USER001 John Doe johndoe password123 --url http://localhost:8000
```

#### Script Features:
- ✅ API health check before attempting user creation
- ✅ Input validation
- ✅ Error handling with descriptive messages
- ✅ Interactive mode for ease of use
- ✅ Customizable API endpoint URL
- ✅ Success/error feedback

#### Interactive Mode Example:
```bash
$ python scripts/create_new_user.py --interactive
🚀 Interactive User Creation Mode
========================================
Enter user code (e.g., USER001): USER001
Enter first name: John
Enter last name: Doe
Enter login username: johndoe
Enter password: password123

🔍 Checking API health at http://localhost:8000...
✅ API is healthy!
👤 Creating user 'johndoe'...
✅ User 'johndoe' created successfully!
   User Code: USER001
   Name: John Doe
   Login: johndoe
⚠️  Warning: Password is stored as plain text!

🎉 User creation completed successfully!
   You can now login with: johndoe
```

## User Management Operations

### Viewing Users

#### SQL Method:
```sql
SELECT 
    user_code,
    user_fname,
    user_lname,
    user_login,
    user_createdate,
    user_updatedate
FROM public.idea_users 
ORDER BY user_createdate DESC;
```

#### API Method:
```bash
curl -X GET "http://localhost:8000/users" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Updating Users

#### SQL Method:
```sql
UPDATE public.idea_users
SET user_fname = 'Jane',
    user_lname = 'Smith',
    user_login = 'janesmith',
    user_password = 'newpassword123',
    user_updatedate = CURRENT_TIMESTAMP
WHERE user_code = 'USER001';
```

#### API Method:
```bash
curl -X PUT "http://localhost:8000/users/USER001" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
           "user_code": "USER001",
           "user_fname": "Jane",
           "user_lname": "Smith",
           "user_login": "janesmith",
           "user_password": "newpassword123"
         }'
```

### Deleting Users

#### SQL Method:
```sql
-- Using the provided function
SELECT delete_user('johndoe');

-- Direct SQL
DELETE FROM public.idea_users WHERE user_login = 'johndoe';
```

#### API Method:
```bash
curl -X DELETE "http://localhost:8000/users/USER001" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Important Security Notes

⚠️ **Security Warning**: The current implementation stores passwords as plain text in the database. This is not secure for production environments.

### Recommendations:
1. **For Development**: The current plain text password storage is acceptable for testing and development
2. **For Production**: Implement proper password hashing using bcrypt or similar algorithms
3. **Password Policy**: Enforce strong password requirements
4. **Access Control**: Implement proper role-based access control
5. **Audit Logging**: Log user creation, modification, and deletion activities

## Troubleshooting

### Common Issues and Solutions

#### 1. "User already exists" Error
**Cause**: User login or user code already exists in the database
**Solution**: Use a unique user login and user code

#### 2. API Connection Failed
**Cause**: Backend server is not running or incorrect URL
**Solution**: 
- Start the backend server: `cd backend && python -m uvicorn app.main:app --reload`
- Verify the API URL is correct
- Check network connectivity

#### 3. Database Connection Failed
**Cause**: Database credentials incorrect or database not running
**Solution**:
- Verify database connection parameters
- Ensure PostgreSQL service is running
- Check user permissions

#### 4. Permission Denied
**Cause**: Insufficient permissions to create users
**Solution**:
- Ensure database user has INSERT permissions on `idea_users` table
- For API method, ensure proper authentication token is provided

### Validation Rules

#### User Code:
- Maximum length: 50 characters
- Must be unique
- Required field

#### User Names:
- First name: Maximum 100 characters, required
- Last name: Maximum 100 characters, required

#### User Login:
- Maximum length: 50 characters
- Must be unique
- Required field
- Case-sensitive

#### User Password:
- Minimum length: 1 character
- Required field
- Stored as plain text (no validation on complexity)

## Best Practices

1. **Use meaningful user codes**: Follow a consistent pattern (e.g., EMP001, MGR001, ADM001)
2. **Enforce unique logins**: Ensure no duplicate usernames exist
3. **Document user creation**: Keep track of who creates users and when
4. **Regular cleanup**: Remove inactive or unnecessary users
5. **Backup before bulk operations**: Always backup database before mass user operations
6. **Test in development**: Validate user creation process in development environment first

## Support

For additional support or questions:
1. Check the existing documentation in the `README.md` and `scripts/` directory
2. Review the API endpoints in `backend/app/api/routes.py`
3. Examine the database schema in `db/init/03-create-idea-users-table.sql`
4. Contact the development team for complex requirements