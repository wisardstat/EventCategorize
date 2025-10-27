-- Create idea_tank table
create table public.idea_tank (
  idea_seq serial not null,
  idea_code character varying(10) null default '100'::character varying,
  category_idea_type1 character varying(100) null default '1200'::character varying,
  idea_name character varying(500) null default '2000'::character varying,
  idea_subject text null,
  idea_source text null,
  customer_target text null,
  idea_inno_type text null,
  idea_detail text null,
  idea_finance_impact text null,
  idea_nonfinance_impact text null,
  idea_status text null,
  idea_owner_empcode text null,
  idea_owner_empname text null,
  idea_owner_deposit text null,
  idea_owner_contacts text null,
  idea_keywords text null,
  idea_comment text null,
  idea_summary_byai text null,
  create_datetime timestamp without time zone not null default CURRENT_TIMESTAMP,
  update_datetime timestamp without time zone not null default CURRENT_TIMESTAMP,
  idea_score bigint null,
  idea_score_comment text null,
  constraint idea_tank_pkey primary key (idea_seq)
) TABLESPACE pg_default;

create trigger update_idea_tank_modified_timestamp BEFORE
update on idea_tank for EACH row
execute FUNCTION update_modified_timestamp ();


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