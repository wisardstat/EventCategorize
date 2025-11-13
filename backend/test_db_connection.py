#!/usr/bin/env python3
"""
Test script to verify database connection with the new pool configuration
"""

import asyncio
import sys
from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.core.config import get_settings

def test_basic_connection():
    """Test basic database connection"""
    print("Testing basic database connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"✅ Basic connection successful: {result.fetchone()}")
            return True
    except Exception as e:
        print(f"❌ Basic connection failed: {e}")
        return False

def test_connection_pool():
    """Test connection pool behavior"""
    print("\nTesting connection pool behavior...")
    try:
        # Test multiple connections
        connections = []
        for i in range(3):
            conn = engine.connect()
            connections.append(conn)
            print(f"✅ Connection {i+1} established")
        
        # Close all connections
        for i, conn in enumerate(connections):
            conn.close()
            print(f"✅ Connection {i+1} closed")
        
        return True
    except Exception as e:
        print(f"❌ Connection pool test failed: {e}")
        return False

def test_session_creation():
    """Test session creation"""
    print("\nTesting session creation...")
    try:
        db = SessionLocal()
        try:
            result = db.execute(text("SELECT 1"))
            print(f"✅ Session creation successful: {result.fetchone()}")
            return True
        finally:
            db.close()
            print("✅ Session closed")
    except Exception as e:
        print(f"❌ Session creation failed: {e}")
        return False

def print_pool_config():
    """Print current pool configuration"""
    print("\nCurrent pool configuration:")
    settings = get_settings()
    print(f"  Pool Size: {settings.db_pool_size}")
    print(f"  Max Overflow: {settings.db_max_overflow}")
    print(f"  Pool Recycle: {settings.db_pool_recycle}s")
    print(f"  Pool Timeout: {settings.db_pool_timeout}s")
    print(f"  Connect Timeout: {settings.db_connect_timeout}s")

async def main():
    """Main test function"""
    print("🔧 Database Connection Test")
    print("=" * 50)
    
    print_pool_config()
    
    tests = [
        test_basic_connection,
        test_connection_pool,
        test_session_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Database connection pool is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))