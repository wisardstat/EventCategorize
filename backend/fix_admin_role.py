#!/usr/bin/env python3
"""
Script to fix the admin user role from 'user' to 'admin'
This script updates the existing admin user to have the correct role.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models

def fix_admin_role():
    """Update the admin user's role from 'user' to 'admin'"""
    print("🔧 Fixing admin user role...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Find the admin user by login
        admin_user = db.query(models.User).filter(models.User.user_login == "admin").first()
        
        if not admin_user:
            print("❌ Admin user not found in database")
            return False
        
        print(f"Found admin user: {admin_user.user_login}")
        print(f"Current role: {admin_user.user_role}")
        
        # Update the role to admin
        if admin_user.user_role != "admin":
            admin_user.user_role = "admin"
            db.commit()
            print("✅ Admin user role updated to 'admin'")
        else:
            print("✅ Admin user already has 'admin' role")
        
        # Verify the update
        updated_user = db.query(models.User).filter(models.User.user_login == "admin").first()
        print(f"Verified role: {updated_user.user_role}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating admin role: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    """Main function"""
    print("🧪 Admin Role Fix Script")
    print("=" * 50)
    
    if fix_admin_role():
        print("\n🎉 Admin role fix completed successfully!")
        print("The admin user now has the correct 'admin' role and should be able to access the user list.")
        return 0
    else:
        print("\n💥 Admin role fix failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())