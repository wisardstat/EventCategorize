#!/usr/bin/env python3

"""
Check the current state of the admin user in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import get_db
from app.db import models

def check_admin_user():
    """Check the admin user's current role and permissions"""
    db = next(get_db())
    
    try:
        # Find the admin user
        admin_user = db.query(models.User).filter(models.User.user_login == "admin").first()
        
        if not admin_user:
            print("❌ Admin user not found in database")
            return
        
        print(f"✅ Admin user found:")
        print(f"   - User Login: {admin_user.user_login}")
        print(f"   - User Code: {admin_user.user_code}")
        print(f"   - User Name: {admin_user.user_fname} {admin_user.user_lname}")
        print(f"   - User Role: {admin_user.user_role}")
        print(f"   - Created: {admin_user.user_createdate}")
        
        # Check all users and their roles
        print("\n📋 All users in database:")
        all_users = db.query(models.User).all()
        for user in all_users:
            print(f"   - {user.user_login} (role: {user.user_role})")
        
        # Check if admin role has the required permission
        from app.services.authorization_service import ROLE_PERMISSIONS
        print(f"\n🔐 Current role permissions:")
        for role, permissions in ROLE_PERMISSIONS.items():
            print(f"   - {role}: {permissions}")
            if "read:users" in permissions:
                print(f"     ✅ Has 'read:users' permission")
            else:
                print(f"     ❌ Missing 'read:users' permission")
        
    except Exception as e:
        print(f"❌ Error checking admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin_user()