#!/usr/bin/env python3
"""
Test script to verify the authorization fix for user list access.
This test ensures that the permission system is working correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.authorization_service import ROLE_PERMISSIONS, has_permission
from app.core.config import get_settings

def test_role_permissions():
    """Test that admin and moderator roles have read:users permission"""
    print("🔧 Testing Role Permissions...")
    
    # Test admin role permissions
    admin_permissions = ROLE_PERMISSIONS.get("admin", [])
    print(f"Admin permissions: {admin_permissions}")
    
    if "read:users" in admin_permissions:
        print("✅ Admin role has 'read:users' permission")
    else:
        print("❌ Admin role missing 'read:users' permission")
        return False
    
    # Test moderator role permissions
    moderator_permissions = ROLE_PERMISSIONS.get("moderator", [])
    print(f"Moderator permissions: {moderator_permissions}")
    
    if "read:users" in moderator_permissions:
        print("✅ Moderator role has 'read:users' permission")
    else:
        print("❌ Moderator role missing 'read:users' permission")
        return False
    
    # Test user role permissions (should not have read:users)
    user_permissions = ROLE_PERMISSIONS.get("user", [])
    print(f"User permissions: {user_permissions}")
    
    if "read:users" not in user_permissions:
        print("✅ User role correctly does not have 'read:users' permission")
    else:
        print("❌ User role incorrectly has 'read:users' permission")
        return False
    
    return True

def test_has_permission_function():
    """Test the has_permission function with different roles"""
    print("\n🔧 Testing has_permission function...")
    
    # Test admin role
    if has_permission("admin", "read:users"):
        print("✅ Admin can access read:users")
    else:
        print("❌ Admin cannot access read:users")
        return False
    
    # Test moderator role
    if has_permission("moderator", "read:users"):
        print("✅ Moderator can access read:users")
    else:
        print("❌ Moderator cannot access read:users")
        return False
    
    # Test user role
    if not has_permission("user", "read:users"):
        print("✅ User correctly cannot access read:users")
    else:
        print("❌ User incorrectly can access read:users")
        return False
    
    return True

def test_permission_inheritance():
    """Test that higher roles inherit permissions from lower roles"""
    print("\n🔧 Testing Permission Inheritance...")
    
    # Test that admin has all moderator permissions
    moderator_permissions = ROLE_PERMISSIONS.get("moderator", [])
    for permission in moderator_permissions:
        if not has_permission("admin", permission):
            print(f"❌ Admin missing moderator permission: {permission}")
            return False
    
    print("✅ Admin inherits all moderator permissions")
    
    # Test that moderator has all user permissions
    user_permissions = ROLE_PERMISSIONS.get("user", [])
    for permission in user_permissions:
        if not has_permission("moderator", permission):
            print(f"❌ Moderator missing user permission: {permission}")
            return False
    
    print("✅ Moderator inherits all user permissions")
    
    return True

def main():
    """Main test function"""
    print("🧪 Authorization Fix Test")
    print("=" * 50)
    
    tests = [
        test_role_permissions,
        test_has_permission_function,
        test_permission_inheritance
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                print(f"❌ Test {test.__name__} failed")
        except Exception as e:
            print(f"❌ Test {test.__name__} threw exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All authorization tests passed! The fix is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the authorization configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(main())