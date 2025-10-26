-- Create idea_tank table
CREATE TABLE IF NOT EXISTS public.idea_tank (
    idea_seq SERIAL PRIMARY KEY,
    idea_code VARCHAR(10),
    category_idea_type1 VARCHAR(100),
    idea_name VARCHAR(500),
    idea_subject VARCHAR(1000),
    idea_source VARCHAR(1000),
    customer_target VARCHAR(1000),
    idea_inno_type VARCHAR(1000),
    idea_detail TEXT,
    idea_finance_impact TEXT,
    idea_nonfinance_impact TEXT,
    idea_status VARCHAR(100),
    idea_owner_empcode VARCHAR(100),
    idea_owner_empname VARCHAR(100),
    idea_owner_deposit VARCHAR(100),
    idea_owner_contacts VARCHAR(100),
    idea_keywords VARCHAR(100),
    idea_comment VARCHAR(100),
    idea_summary_byai TEXT,
    create_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add comments to columns for better documentation
COMMENT ON TABLE public.idea_tank IS 'ตารางเก็บข้อมูลความคิดสร้างสรรค์ (Idea Tank)';

COMMENT ON COLUMN public.idea_tank.idea_seq IS 'สร้างรหัสอัตโนมัติ';
COMMENT ON COLUMN public.idea_tank.idea_code IS 'รหัสไอเดีย';
COMMENT ON COLUMN public.idea_tank.category_idea_type1 IS 'ประเภทนวัตกรรม by ai';
COMMENT ON COLUMN public.idea_tank.idea_name IS 'ชื่อความคิดสร้างสรรค์';
COMMENT ON COLUMN public.idea_tank.idea_subject IS 'เลือกโจทย์นวัตกรรมที่ท่านต้องการแก้ไขปัญหา';
COMMENT ON COLUMN public.idea_tank.idea_source IS 'แหล่งที่มาของแนวคิด';
COMMENT ON COLUMN public.idea_tank.customer_target IS 'ลูกค้าที่เป็นกลุ่มเป้าหมาย';
COMMENT ON COLUMN public.idea_tank.idea_inno_type IS 'ประเภทของนวัตกรรม';
COMMENT ON COLUMN public.idea_tank.idea_detail IS 'นำเสนอแนวคิดนวัตกรรมโดยสังเขป';
COMMENT ON COLUMN public.idea_tank.idea_finance_impact IS 'ประโยชน์ที่คาดว่าจะได้รับ_ด้านที่เป็นตัวเงิน';
COMMENT ON COLUMN public.idea_tank.idea_nonfinance_impact IS 'ประโยชน์ที่คาดว่าจะได้รับ_ด้านที่ไม่ใช่ตัวเงิน';
COMMENT ON COLUMN public.idea_tank.idea_status IS 'สถานะ';
COMMENT ON COLUMN public.idea_tank.idea_owner_empcode IS 'รหัสพนักงาน-เจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_owner_empname IS 'ชื่อพนักงาน-เจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_owner_deposit IS 'ส่วนงาน-เจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_owner_contacts IS 'เบอร์ติดต่อเจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_keywords IS 'Keywords';
COMMENT ON COLUMN public.idea_tank.idea_comment IS 'Comment จากกรรมการ';
COMMENT ON COLUMN public.idea_tank.idea_summary_byai IS 'สรุปไอเดียจาก AI';
COMMENT ON COLUMN public.idea_tank.create_datetime IS 'วันที่สร้าง';
COMMENT ON COLUMN public.idea_tank.update_datetime IS 'วันที่อัปเดต';

-- Create trigger to automatically update update_datetime
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_datetime = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_idea_tank_modified_timestamp
    BEFORE UPDATE ON public.idea_tank
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp();