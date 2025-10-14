# Supabase Setup Guide

## การตั้งค่า Supabase สำหรับ EventCategorize

### 1. สร้าง Supabase Project

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. สร้าง project ใหม่
3. ตั้งชื่อ project และเลือก region ที่เหมาะสม
4. รอให้ project สร้างเสร็จ

### 2. รับข้อมูลการเชื่อมต่อ

จาก Supabase Dashboard:

1. ไปที่ **Settings** > **API**
2. คัดลอกข้อมูลต่อไปนี้:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

3. ไปที่ **Settings** > **Database**
4. คัดลอก **Connection string** (DATABASE_URL)

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
DEBUG=True
ENVIRONMENT=development
```

### 4. ติดตั้ง Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. ทดสอบการเชื่อมต่อ

```bash
cd backend
python test_supabase_connection.py
```

### 6. Migration Database Schema

หากมี existing schema ที่ต้อง migrate:

```bash
# สร้าง migration
alembic revision --autogenerate -m "Initial migration"

# รัน migration
alembic upgrade head
```

### 7. เริ่มต้น Application

```bash
# Development
uvicorn app.main:app --reload

# หรือใช้ Docker
docker-compose up
```

## การใช้งาน Supabase Features

### Database
- Supabase ใช้ PostgreSQL เป็น database engine
- รองรับ SQLAlchemy และ Alembic migrations
- มี built-in connection pooling

### Authentication (อนาคต)
- Supabase Auth สำหรับ user management
- Row Level Security (RLS)
- JWT tokens

### Real-time (อนาคต)
- Real-time subscriptions
- WebSocket connections

### Storage (อนาคต)
- File uploads
- Image storage

## Troubleshooting

### Connection Issues
1. ตรวจสอบ DATABASE_URL format
2. ตรวจสอบ network connectivity
3. ตรวจสอบ Supabase project status

### Authentication Issues
1. ตรวจสอบ API keys
2. ตรวจสอบ project permissions
3. ตรวจสอบ RLS policies

### Migration Issues
1. ตรวจสอบ Alembic configuration
2. ตรวจสอบ database permissions
3. ตรวจสอบ schema conflicts
