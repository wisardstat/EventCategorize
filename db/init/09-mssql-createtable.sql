
create DATABASE [srakraisoft2_pos_may_shop2];

CREATE TABLE [dbo].[Answer](
	[answer_id] [int] IDENTITY(1,1) NOT NULL,
	[question_id] [varchar](255) NOT NULL,
	[answer_text] [text] NOT NULL,
	[category] [varchar](255) NOT NULL,
	[create_user_name] [varchar](255) NULL,
	[create_user_department] [varchar](255) NULL,
	[answer_keywords] [text] NULL,
	[create_user_code] [varchar](100) NULL,
	[created_at] [datetime2](6) NULL,
 CONSTRAINT [PK__Answer__33724318BBC18F78] PRIMARY KEY CLUSTERED 
(
	[answer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]


CREATE TABLE [dbo].[idea_tank](
	[idea_seq] [int] IDENTITY(1,1) NOT NULL,
	[idea_code] [varchar](10) NULL,
	[category_idea_type1] [varchar](100) NULL,
	[idea_name] [varchar](500) NULL,
	[idea_subject] [text] NULL,
	[idea_source] [text] NULL,
	[customer_target] [text] NULL,
	[idea_inno_type] [text] NULL,
	[idea_detail] [text] NULL,
	[idea_finance_impact] [text] NULL,
	[idea_nonfinance_impact] [text] NULL,
	[idea_status] [text] NULL,
	[idea_owner_empcode] [varchar](50) NULL,
	[idea_owner_empname] [varchar](200) NULL,
	[idea_owner_deposit] [varchar](100) NULL,
	[idea_owner_contacts] [varchar](200) NULL,
	[idea_keywords] [text] NULL,
	[idea_comment] [text] NULL,
	[idea_summary_byai] [text] NULL,
	[create_datetime] [datetime2](6) NOT NULL,
	[update_datetime] [datetime2](6) NOT NULL,
	[idea_score] [bigint] NULL,
	[idea_score_comment] [text] NULL,
	[idea_status_md] [varchar](50) NULL,
	[idea_status_md_remark] [text] NULL,
 CONSTRAINT [PK__idea_tan__A03270A08174775E] PRIMARY KEY CLUSTERED 
(
	[idea_seq] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE [dbo].[idea_users](
	[user_code] [varchar](50) NOT NULL,
	[user_fname] [varchar](100) NOT NULL,
	[user_lname] [varchar](100) NOT NULL,
	[user_login] [varchar](50) NOT NULL,
	[user_password] [varchar](255) NOT NULL,
	[user_createdate] [datetime2](6) NOT NULL,
	[user_updatedate] [datetime2](6) NOT NULL,
	[user_role] [varchar](50) NULL,
 CONSTRAINT [PK__idea_use__EDC4140E0026DF95] PRIMARY KEY CLUSTERED 
(
	[user_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UQ__idea_use__9EA1B5AFAB9A654A] UNIQUE NONCLUSTERED 
(
	[user_login] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

CREATE TABLE [dbo].[tb_setting](
	[set_code] [varchar](50) NOT NULL,
	[set_name] [varchar](255) NULL,
	[set_value] [varchar](max) NOT NULL,
	[set_description] [varchar](max) NULL,
	[create_datetime] [datetime2](6) NOT NULL,
	[update_datetime] [datetime2](6) NOT NULL,
 CONSTRAINT [PK__tb_setti__A6E4DB69CF7B4952] PRIMARY KEY CLUSTERED 
(
	[set_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]



CREATE TABLE [dbo].[Question](
	[question_id] [varchar](100) NOT NULL,
	[question_title] [varchar](500) NOT NULL,
	[question_description] [varchar](max) NULL,
	[question_categories] [nvarchar](max) NULL,
	[qrcode_url] [varchar](500) NULL,
	[created_at] [datetime2](6) NULL,
 CONSTRAINT [PK__Question__2EC21549A0D0D8A0] PRIMARY KEY CLUSTERED 
(
	[question_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]



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
COMMENT ON COLUMN public.idea_tank.idea_status_md IS 'สถานะประเมินโดยกรรมการ';
COMMENT ON COLUMN public.idea_tank.idea_status_md_remark IS 'รายละเอียดเพิ่มเติมสถานะประเมินโดยกรรมการ';
COMMENT ON COLUMN public.idea_tank.idea_owner_empcode IS 'รหัสพนักงาน-เจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_owner_empname IS 'ชื่อพนักงาน-เจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_owner_deposit IS 'ส่วนงาน-เจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_owner_contacts IS 'เบอร์ติดต่อเจ้าของไอเดีย';
COMMENT ON COLUMN public.idea_tank.idea_keywords IS 'Keywords';
COMMENT ON COLUMN public.idea_tank.idea_comment IS 'Comment จากกรรมการ';
COMMENT ON COLUMN public.idea_tank.idea_summary_byai IS 'สรุปไอเดียจาก AI';
COMMENT ON COLUMN public.idea_tank.create_datetime IS 'วันที่สร้าง';
COMMENT ON COLUMN public.idea_tank.update_datetime IS 'วันที่อัปเดต';


-- Add comments to columns for better documentation
COMMENT ON TABLE public.idea_users IS 'ตารางเก็บข้อมูลผู้ใช้งานระบบ';

COMMENT ON COLUMN public.idea_users.user_code IS 'รหัสผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_fname IS 'ชื่อผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_lname IS 'นามสกุลผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_login IS 'ชื่อผู้ใช้งานสำหรับ login';
COMMENT ON COLUMN public.idea_users.user_password IS 'รหัสผ่านผู้ใช้งาน';
COMMENT ON COLUMN public.idea_users.user_createdate IS 'วันที่สร้าง';
COMMENT ON COLUMN public.idea_users.user_updatedate IS 'วันที่อัปเดต';
COMMENT ON COLUMN public.idea_users.user_role IS 'สิทธิ์ผู้ใช้งาน (admin, user)';