-- Create idea_users table
CREATE TABLE IF NOT EXISTS public.idea_users (
    user_code VARCHAR(50) PRIMARY KEY,
    user_fname VARCHAR(100) NOT NULL,
    user_lname VARCHAR(100) NOT NULL,
    user_login VARCHAR(50) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_createdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_updatedate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add comments to columns for better documentation
COMMENT ON TABLE public.idea_users IS 'ตารางเก็บข้อมูลผู้ใช้งานระบบ';

COMMENT ON COLUMN public.idea_users.user_code IS 'รหัสผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_fname IS 'ชื่อผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_lname IS 'นามสกุลผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_login IS 'ชื่อผู้ใช้งานสำหรับ login';
COMMENT ON COLUMN public.idea_users.user_password IS 'รหัสผ่านผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_createdate IS 'วันที่สร้าง';
COMMENT ON COLUMN public.idea_users.user_updatedate IS 'วันที่อัปเดต';

-- Create trigger to automatically update user_updatedate
CREATE OR REPLACE FUNCTION update_user_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_updatedate = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_idea_users_modified_timestamp
    BEFORE UPDATE ON public.idea_users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_modified_timestamp();


create table public.tb_setting (
  set_code character varying not null default '100'::character varying,
  set_name character varying null,
  set_value text not null,
  constraint tb_setting_pkey primary key (set_code)
) TABLESPACE pg_default;    