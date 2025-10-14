#!/usr/bin/env python3
"""
Test script to verify Supabase connection
"""
import os
import sys
from pathlib import Path

# Ensure the backend root directory is on sys.path (so `app` package is importable)
sys.path.append(str(Path(__file__).parent))

from app.core.config import get_settings
from app.db.database import engine
from sqlalchemy import text

def test_supabase_connection():
    """Test Supabase database connection"""
    try:
        settings = get_settings()
        print("🔧 Configuration loaded:")
        print(f"   Database URL: {settings.sqlalchemy_database_uri}")
        print(f"   Supabase URL: {settings.supabase_url}")
        print(f"   Environment: {settings.environment}")
        print(f"   Debug: {settings.debug}")
 
        
        # Test database connection
        print("\n🔌 Testing database connection...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Database connection successful!")
            print(f"   PostgreSQL version: {version}")
            
            # Test if we can access the database
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()[0]
            print(f"   Connected to database: {db_name}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    return True

def test_supabase_client():
    """Test Supabase client initialization"""
    try:
        from supabase import create_client, Client
        
        settings = get_settings()
        
        if not settings.supabase_url or not settings.supabase_key:
            print("⚠️  Supabase URL or Key not configured")
            return False
            
        print("\n🔌 Testing Supabase client...")
        supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
        print("✅ Supabase client created successfully!")
        
        # Test a simple query
        response = supabase.table('_supabase_migrations').select('*').limit(1).execute()
        print("✅ Supabase query executed successfully!")
        
    except Exception as e:
        print(f"❌ Supabase client test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Testing Supabase Integration")
    print("=" * 50)
    
    # Test database connection
    db_success = test_supabase_connection()
    
    # Test Supabase client
    client_success = test_supabase_client()
    
    print("\n" + "=" * 50)
    if db_success and client_success:
        print("🎉 All tests passed! Supabase integration is working correctly.")
    else:
        print("❌ Some tests failed. Please check your configuration.")
        sys.exit(1)
