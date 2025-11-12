#!/usr/bin/env python3
"""
ทดสอบการเชื่อมต่อ MSSQL Database
"""

import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import get_settings


def test_mssql_connection():
    """ทดสอบการเชื่อมต่อ MSSQL"""
    try:
        settings = get_settings()
        print("🔧 Configuration loaded:")
        print(f"   MSSQL User: {settings.mssql_user}")
        print(f"   MSSQL Host: {settings.mssql_host}")
        print(f"   MSSQL Database: {settings.mssql_dbname}")
        print(f"   Environment: {settings.environment}")
        print(f"   Debug: {settings.debug}")
        
        # ทดสอบการสร้าง connection string
        print(f"\n🔌 Testing MSSQL connection...")
        print(f"   Database URL: {settings.sqlalchemy_database_uri}")
        
        # สร้าง engine และทดสอบการเชื่อมต่อ
        engine = create_engine(settings.sqlalchemy_database_uri, pool_pre_ping=True)
        
        with engine.connect() as connection:
            # ทดสอบ query version
            result = connection.execute(text("SELECT @@VERSION"))
            version = result.fetchone()[0]
            print(f"✅ MSSQL connection successful!")
            print(f"   MSSQL Version: {version[:100]}...")
            
            # ทดสอบว่าสามารถเข้าถึง database ได้
            result = connection.execute(text("SELECT DB_NAME()"))
            db_name = result.fetchone()[0]
            print(f"   Connected to database: {db_name}")
            
            # ทดสอบดูว่ามี tables อะไรบ้าง
            result = connection.execute(text("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'dbo'
                ORDER BY TABLE_NAME
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"   Available tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ MSSQL connection failed: {e}")
        return False
    
    return True


if __name__ == "__main__":
    print("🚀 Starting MSSQL Connection Test")
    print("=" * 50)
    
    if test_mssql_connection():
        print("\n🎉 MSSQL connection test completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 MSSQL connection test failed!")
        sys.exit(1)