#!/usr/bin/env python3
"""
Script to create a new user via the API endpoint.
This script uses the FastAPI backend to create new users in the idea_users table.
"""

import requests
import json
import sys
import argparse
from typing import Optional

def create_user_via_api(
    base_url: str,
    user_code: str,
    user_fname: str,
    user_lname: str,
    user_login: str,
    user_password: str
) -> bool:
    """
    Create a new user via the API registration endpoint.
    
    Args:
        base_url: Base URL of the API (e.g., http://localhost:8000)
        user_code: Unique user code
        user_fname: User's first name
        user_lname: User's last name
        user_login: User's login username
        user_password: User's password (plain text)
    
    Returns:
        bool: True if successful, False otherwise
    """
    
    # API endpoint for user registration
    url = f"{base_url}/auth/register"
    
    # Prepare the user data
    user_data = {
        "user_code": user_code,
        "user_fname": user_fname,
        "user_lname": user_lname,
        "user_login": user_login,
        "user_password": user_password
    }
    
    try:
        # Make the POST request to create the user
        response = requests.post(url, json=user_data, timeout=10)
        
        # Check if the request was successful
        if response.status_code == 201:
            print(f"✅ User '{user_login}' created successfully!")
            print(f"   User Code: {user_code}")
            print(f"   Name: {user_fname} {user_lname}")
            print(f"   Login: {user_login}")
            print("⚠️  Warning: Password is stored as plain text!")
            return True
        else:
            # Handle error responses
            error_data = response.json()
            print(f"❌ Failed to create user '{user_login}':")
            print(f"   Status Code: {response.status_code}")
            print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error while creating user '{user_login}': {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse response: {e}")
        return False

def check_api_health(base_url: str) -> bool:
    """
    Check if the API is accessible and healthy.
    
    Args:
        base_url: Base URL of the API
    
    Returns:
        bool: True if API is healthy, False otherwise
    """
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def main():
    """Main function to handle command line arguments and create user."""
    
    parser = argparse.ArgumentParser(
        description="Create a new user in the idea_users table via API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python create_new_user.py USER001 John Doe johndoe password123
  python create_new_user.py USER002 Jane Smith janesmith secret456 --url http://localhost:8000
  python create_new_user.py --interactive
        """
    )
    
    parser.add_argument(
        "user_code",
        nargs="?",
        help="Unique user code (e.g., USER001)"
    )
    
    parser.add_argument(
        "user_fname",
        nargs="?",
        help="User's first name"
    )
    
    parser.add_argument(
        "user_lname",
        nargs="?",
        help="User's last name"
    )
    
    parser.add_argument(
        "user_login",
        nargs="?",
        help="User's login username"
    )
    
    parser.add_argument(
        "user_password",
        nargs="?",
        help="User's password"
    )
    
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL of the API (default: http://localhost:8000)"
    )
    
    parser.add_argument(
        "--interactive",
        "-i",
        action="store_true",
        help="Run in interactive mode"
    )
    
    args = parser.parse_args()
    
    # Interactive mode
    if args.interactive:
        print("🚀 Interactive User Creation Mode")
        print("=" * 40)
        
        user_code = input("Enter user code (e.g., USER001): ").strip()
        user_fname = input("Enter first name: ").strip()
        user_lname = input("Enter last name: ").strip()
        user_login = input("Enter login username: ").strip()
        user_password = input("Enter password: ").strip()
        
        if not all([user_code, user_fname, user_lname, user_login, user_password]):
            print("❌ All fields are required!")
            sys.exit(1)
            
    else:
        # Command line mode
        if not all([args.user_code, args.user_fname, args.user_lname, args.user_login, args.user_password]):
            print("❌ Missing required arguments!")
            print("Usage: python create_new_user.py USER_CODE FIRST_NAME LAST_NAME LOGIN PASSWORD")
            print("Use --interactive for interactive mode or --help for more options.")
            sys.exit(1)
        
        user_code = args.user_code
        user_fname = args.user_fname
        user_lname = args.user_lname
        user_login = args.user_login
        user_password = args.user_password
    
    # Check API health
    print(f"🔍 Checking API health at {args.url}...")
    if not check_api_health(args.url):
        print(f"❌ API is not accessible at {args.url}")
        print("   Make sure the backend server is running.")
        sys.exit(1)
    
    print("✅ API is healthy!")
    
    # Create the user
    print(f"👤 Creating user '{user_login}'...")
    success = create_user_via_api(
        base_url=args.url,
        user_code=user_code,
        user_fname=user_fname,
        user_lname=user_lname,
        user_login=user_login,
        user_password=user_password
    )
    
    if success:
        print("\n🎉 User creation completed successfully!")
        print(f"   You can now login with: {user_login}")
    else:
        print("\n💥 User creation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()