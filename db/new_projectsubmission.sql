/* =========================================================
   A-Inno / IDEA Tank - ProjectSubmissionNew Table

   Design:
   - 1 row = 1 รายการส่งไอเดีย / 1 ความคิดสร้างสรรค์
   - เก็บรายละเอียดฟอร์มหลักไว้ใน ProjectSubmissionNew
   - ประเภทบุคคล / ประเภททีม ยังมีไว้เหมือนเดิม
   - ทีมงาน / สมาชิก แนะนำให้ใช้ตาราง ProjectSubmissionMember แยกต่างหาก
   - ตัวเลือก Radio / Checkbox ใช้ Hard Code ฝั่ง Application
   - Constraint ทุกตัวตั้งชื่อให้มีเลข 2 เพื่อไม่ให้ซ้ำกับ Table เดิม

   Hard Code: SubmissionTypeCode
   - INDIVIDUAL = ประเภทบุคคล
   - TEAM       = ประเภททีม

   Hard Code: TargetCustomerTypeNo
   - 1 = ลูกค้าเดิม
   - 2 = ลูกค้าใหม่
   ========================================================= */

CREATE TABLE dbo.ProjectSubmissionNew
(
    ProjectId BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_ProjectSubmissionNew2 PRIMARY KEY,
        -- Primary Key: รหัสรายการส่งไอเดีย / รหัสรายการส่งประกวด

    EventYear SMALLINT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_EventYear DEFAULT (2026),
        -- ปีของกิจกรรม เช่น 2026

    SubmissionTypeCode VARCHAR(20) NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_SubmissionTypeCode DEFAULT ('TEAM'),
        -- ประเภทการส่งประกวด: INDIVIDUAL=ประเภทบุคคล, TEAM=ประเภททีม

    SubmissionTypeNameTh NVARCHAR(100) NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_SubmissionTypeNameTh DEFAULT (N'ประเภททีม'),
        -- ชื่อประเภทการส่งประกวดภาษาไทย เช่น ประเภทบุคคล, ประเภททีม

    TeamName NVARCHAR(200) NULL,
        -- ชื่อทีม กรณี SubmissionTypeCode = TEAM

    CreativeIdeaName NVARCHAR(300) NOT NULL,
        -- 1.1 ชื่อความคิดสร้างสรรค์

    /* =====================================================
       1.2 โจทย์นวัตกรรมที่ท่านต้องการแก้ปัญหา
       Input Type: Radio
       ===================================================== */

    ChallengeNo TINYINT NULL,
        -- 1.2 โจทย์นวัตกรรมที่เลือก
        -- 1 = สนับสนุนการให้บริการให้สินเชื่อในภาค/นอกภาคการเกษตร
        -- 2 = สนับสนุนการให้บริการทางการเงิน
        -- 3 = กระบวนการติดตามการชำระหนี้
        -- 4 = เพิ่มโอกาสธุรกิจประกันภัย
        -- 5 = การลดการใช้พลังงาน
        -- 6 = การจัดการข้อมูลลูกค้า
        -- 7 = การเพิ่มรายได้ FBI
        -- 8 = การบริหารจัดการโครงการนโยบายรัฐ
        -- 9 = การเข้าถึงบริการทางการเงินของผู้สูงอายุ
        -- 10 = เพิ่มมูลค่าจากบริการ mobile digital
        -- 11 = ช่องทางการเข้าถึงตลาดสินค้าเกษตร
        -- 12 = การยกระดับชุมชนของธนาคาร
        -- 13 = การสร้างรายได้ใหม่ให้เกษตรกร

    ChallengeText NVARCHAR(1000) NULL,
        -- ข้อความโจทย์นวัตกรรมที่เลือก เก็บซ้ำเพื่อให้ Export ได้ทันทีโดยไม่ต้อง map code

    /* =====================================================
       1.3 ประเภทของโจทย์นวัตกรรม
       Input Type: Radio
       ===================================================== */

    ChallengeCategoryNo TINYINT NULL,
        -- 1.3 ประเภทของโจทย์นวัตกรรม
        -- 1 = เงินฝาก
        -- 2 = FBI
        -- 3 = การเติบโตของสินเชื่อ Growth
        -- 4 = การบริหารจัดการหนี้
        -- 5 = การพัฒนาลูกค้า
        -- 6 = การพัฒนาปรับปรุงกระบวนการ
        -- 7 = การลดค่าใช้จ่ายของส่วนงาน
        -- 8 = การดำเนินธุรกิจอย่างยั่งยืน ESG

    ChallengeCategoryText NVARCHAR(500) NULL,
        -- ข้อความประเภทของโจทย์นวัตกรรมที่เลือก เก็บซ้ำเพื่อให้ Export ได้ง่าย

    /* =====================================================
       1.4 ความสอดคล้องกับวัตถุประสงค์เชิงยุทธศาสตร์ SO
       Input Type: Checkbox
       ===================================================== */

    StrategicObjectiveSO1 BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StrategicObjectiveSO1 DEFAULT (0),
        -- SO1: บริหารจัดการสินทรัพย์เพื่อสร้างรายได้ให้สมดุล

    StrategicObjectiveSO2 BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StrategicObjectiveSO2 DEFAULT (0),
        -- SO2: บริหารจัดการคุณภาพสินเชื่อเพื่อความแข็งแกร่งทางการเงิน

    StrategicObjectiveSO3 BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StrategicObjectiveSO3 DEFAULT (0),
        -- SO3: เพิ่มขีดความสามารถลูกค้าและชุมชนผ่านแกนกลางการเกษตร

    StrategicObjectiveSO4 BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StrategicObjectiveSO4 DEFAULT (0),
        -- SO4: เพิ่มขีดความสามารถองค์กรด้วยเทคโนโลยีดิจิทัลและนวัตกรรม

    StrategicObjectiveSO5 BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StrategicObjectiveSO5 DEFAULT (0),
        -- SO5: เพิ่มศักยภาพบุคลากรและ GRC รองรับการเติบโตทางธุรกิจ

    StrategicObjectiveSO6 BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StrategicObjectiveSO6 DEFAULT (0),
        -- SO6: บริหารจัดการองค์กรและชุมชนเพื่อมุ่งสู่ Net Zero Emissions

    /* =====================================================
       1.5 แหล่งที่มาของแนวคิด
       Input Type: Checkbox
       ===================================================== */

    IdeaSourceCoPs BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceCoPs DEFAULT (0),
        -- ชุมชนนักปฏิบัติ CoPs

    IdeaSourceCoPsDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ชุมชนนักปฏิบัติ CoPs

    IdeaSourceLR BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceLR DEFAULT (0),
        -- คลังความรู้ LR

    IdeaSourceLRDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: คลังความรู้ LR

    IdeaSourceResearch BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceResearch DEFAULT (0),
        -- ผลงานวิจัย

    IdeaSourceResearchDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ผลงานวิจัย

    IdeaSourceExperience BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceExperience DEFAULT (0),
        -- ประสบการณ์

    IdeaSourceExperienceDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ประสบการณ์

    IdeaSourceStudyVisit BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceStudyVisit DEFAULT (0),
        -- ศึกษาดูงาน

    IdeaSourceStudyVisitDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ศึกษาดูงาน

    IdeaSourceKnowledgeExchange BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceKnowledgeExchange DEFAULT (0),
        -- การแลกเปลี่ยนเรียนรู้

    IdeaSourceKnowledgeExchangeDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: การแลกเปลี่ยนเรียนรู้

    IdeaSourceInnovationDatabase BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceInnovationDatabase DEFAULT (0),
        -- ฐานข้อมูลนวัตกรรม

    IdeaSourceInnovationDatabaseDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ฐานข้อมูลนวัตกรรม

    IdeaSourceMarketStudy BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceMarketStudy DEFAULT (0),
        -- ผลการศึกษาความต้องการของตลาด

    IdeaSourceMarketStudyDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ผลการศึกษาความต้องการของตลาด

    IdeaSourceVOS BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceVOS DEFAULT (0),
        -- VOS: Voice of Stakeholder

    IdeaSourceVOSDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: VOS Voice of Stakeholder

    IdeaSourceOther BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_IdeaSourceOther DEFAULT (0),
        -- อื่น ๆ

    IdeaSourceOtherDetail NVARCHAR(1000) NULL,
        -- รายละเอียดเพิ่มเติมของแหล่งที่มา: อื่น ๆ

    /* =====================================================
       1.6 ลูกค้ากลุ่มเป้าหมาย และประเด็นปัญหาของลูกค้า
       Input Type: Radio + Textarea / Rich Text Editor
       ===================================================== */

    TargetCustomerTypeNo TINYINT NULL,
        -- 1.6 ลูกค้ากลุ่มเป้าหมาย
        -- Input Type: Radio
        -- 1 = ลูกค้าเดิม
        -- 2 = ลูกค้าใหม่

    TargetCustomerTypeText NVARCHAR(100) NULL,
        -- ข้อความลูกค้ากลุ่มเป้าหมายที่เลือก
        -- เช่น ลูกค้าเดิม, ลูกค้าใหม่
        -- เก็บซ้ำเพื่อให้ Export ได้ทันทีโดยไม่ต้อง map code

    TargetCustomerProblemHtml NVARCHAR(MAX) NULL,
        -- 1.6 อธิบายลูกค้ากลุ่มเป้าหมาย และประเด็นปัญหาของลูกค้ากลุ่มเป้าหมาย
        -- Input Type: Rich Text Editor / Textarea
        -- เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       1.7 ประเภทของนวัตกรรม
       Input Type: Radio
       ===================================================== */

    InnovationTypeNo TINYINT NULL,
        -- 1.7 ประเภทของนวัตกรรม
        -- 1 = นวัตกรรมผลิตภัณฑ์
        -- 2 = นวัตกรรมบริการ
        -- 3 = นวัตกรรมกระบวนการ
        -- 4 = นวัตกรรมรูปแบบการดำเนินธุรกิจหรือภารกิจใหม่ขององค์กร
        -- 5 = นวัตกรรมเกษตรที่ส่งเสริมการยกระดับอาชีพเกษตร

    InnovationTypeText NVARCHAR(500) NULL,
        -- ข้อความประเภทของนวัตกรรมที่เลือก เก็บซ้ำเพื่อให้ Export ได้ง่าย

    /* =====================================================
       1.8 นำเสนอแนวคิดนวัตกรรมโดยสังเขป
       Input Type: Textarea / Rich Text Editor
       ===================================================== */

    IdeaConceptHtml NVARCHAR(MAX) NULL,
        -- 1.8 รายละเอียดแนวคิดนวัตกรรมโดยสังเขป เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       1.9 ผลงานนวัตกรรมเทคโนโลยีดิจิทัล
       Input Type: Radio
       ===================================================== */

    DigitalInnovationNo TINYINT NULL,
        -- 1.9 ผลงานนวัตกรรมเทคโนโลยีดิจิทัล
        -- 1 = เป็นนวัตกรรมที่ใช้เทคโนโลยีดิจิทัล
        -- 2 = เป็นนวัตกรรมที่ไม่ใช้เทคโนโลยีดิจิทัล

    DigitalInnovationText NVARCHAR(300) NULL,
        -- ข้อความประเภทผลงานนวัตกรรมเทคโนโลยีดิจิทัลที่เลือก

    /* =====================================================
       1.10 ระดับความใหม่ของความคิดสร้างสรรค์
       Input Type: Radio
       ===================================================== */

    NoveltyLevelNo TINYINT NULL,
        -- 1.10 ระดับความใหม่ของความคิดสร้างสรรค์
        -- 1 = การปรับปรุงผลิตภัณฑ์ บริการ กระบวนการ หรือองค์ความรู้เดิม
        -- 2 = การพัฒนา/ต่อยอดผลิตภัณฑ์ บริการ กระบวนการ หรือองค์ความรู้เดิม
        -- 3 = การคิดสร้างสรรค์ผลิตภัณฑ์ บริการ กระบวนการ หรือองค์ความรู้ใหม่ระดับองค์กร
        -- 4 = การคิดสร้างสรรค์ผลิตภัณฑ์ บริการ กระบวนการ หรือองค์ความรู้ใหม่ระดับอุตสาหกรรม/ธุรกิจ
        -- 5 = การคิดสร้างสรรค์ผลิตภัณฑ์ บริการ กระบวนการ หรือองค์ความรู้ใหม่ระดับประเทศ

    NoveltyLevelText NVARCHAR(1000) NULL,
        -- ข้อความระดับความใหม่ของความคิดสร้างสรรค์ที่เลือก

    /* =====================================================
       1.11 มูลค่านวัตกรรม Innovation Value
       ด้านการเงิน / ไม่ใช่การเงิน
       Input Type: Checkbox + Textarea / Rich Text Editor
       ===================================================== */

    InnovationValueFinancial BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_InnovationValueFinancial DEFAULT (0),
        -- มูลค่านวัตกรรมด้านการเงิน

    FinancialValueRevenue BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_FinancialValueRevenue DEFAULT (0),
        -- ด้านการเงิน: สร้างรายได้

    FinancialValueCostSaving BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_FinancialValueCostSaving DEFAULT (0),
        -- ด้านการเงิน: ลดค่าใช้จ่าย

    FinancialValueDetailHtml NVARCHAR(MAX) NULL,
        -- รายละเอียดเพิ่มเติมของมูลค่านวัตกรรมด้านการเงิน เก็บเป็น HTML จาก Rich Text Editor

    InnovationValueNonFinancial BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_InnovationValueNonFinancial DEFAULT (0),
        -- มูลค่านวัตกรรมที่ไม่ใช่การเงิน

    NonFinancialValueCustomerSatisfaction BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_NonFinancialValueCustomerSatisfaction DEFAULT (0),
        -- ไม่ใช่การเงิน: ความพึงพอใจ

    NonFinancialValueWorkEfficiency BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_NonFinancialValueWorkEfficiency DEFAULT (0),
        -- ไม่ใช่การเงิน: ลดขั้นตอนการทำงาน เพิ่มเวลาสำหรับงานที่สร้างมูลค่า Value Added

    NonFinancialValueCustomerQuality BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_NonFinancialValueCustomerQuality DEFAULT (0),
        -- ไม่ใช่การเงิน: ด้านคุณภาพชีวิตลูกค้า ลดภาระหรือลดระยะเวลาการทำธุรกรรมของลูกค้า

    NonFinancialValueEnvironment BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_NonFinancialValueEnvironment DEFAULT (0),
        -- ไม่ใช่การเงิน: ด้านสิ่งแวดล้อม เช่น ลดการปล่อยก๊าซเรือนกระจก หรือเพิ่มปริมาณคาร์บอนเครดิต

    NonFinancialValueDetailHtml NVARCHAR(MAX) NULL,
        -- รายละเอียดเพิ่มเติมของมูลค่านวัตกรรมที่ไม่ใช่การเงิน เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       Workflow / Status
       ===================================================== */

    StatusCode VARCHAR(20) NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_StatusCode DEFAULT ('DRAFT'),
        -- สถานะรายการ: DRAFT=ร่าง, SUBMITTED=ส่งแล้ว, CANCELLED=ยกเลิก, APPROVED=ผ่าน, REJECTED=ไม่ผ่าน

    SubmittedAt DATETIME2(0) NULL,
        -- วันที่และเวลาที่กดส่งข้อมูล

    /* =====================================================
       Audit Fields
       ===================================================== */

    CreatedByEmpCode VARCHAR(20) NULL,
        -- รหัสพนักงานผู้สร้างรายการ

    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_ProjectSubmissionNew2_CreatedAt DEFAULT (SYSDATETIME()),
        -- วันที่และเวลาที่สร้างรายการ

    UpdatedByEmpCode VARCHAR(20) NULL,
        -- รหัสพนักงานผู้แก้ไขรายการล่าสุด

    UpdatedAt DATETIME2(0) NULL,
        -- วันที่และเวลาที่แก้ไขรายการล่าสุด

    RowVer ROWVERSION NOT NULL,
        -- Row version สำหรับป้องกันการแก้ไขข้อมูลชนกัน

    CONSTRAINT CK_ProjectSubmissionNew2_SubmissionTypeCode
        CHECK (SubmissionTypeCode IN ('INDIVIDUAL', 'TEAM')),

    CONSTRAINT CK_ProjectSubmissionNew2_ChallengeNo
        CHECK (ChallengeNo IS NULL OR ChallengeNo BETWEEN 1 AND 13),

    CONSTRAINT CK_ProjectSubmissionNew2_ChallengeCategoryNo
        CHECK (ChallengeCategoryNo IS NULL OR ChallengeCategoryNo BETWEEN 1 AND 8),

    CONSTRAINT CK_ProjectSubmissionNew2_TargetCustomerTypeNo
        CHECK (TargetCustomerTypeNo IS NULL OR TargetCustomerTypeNo IN (1, 2)),

    CONSTRAINT CK_ProjectSubmissionNew2_InnovationTypeNo
        CHECK (InnovationTypeNo IS NULL OR InnovationTypeNo BETWEEN 1 AND 5),

    CONSTRAINT CK_ProjectSubmissionNew2_DigitalInnovationNo
        CHECK (DigitalInnovationNo IS NULL OR DigitalInnovationNo IN (1, 2)),

    CONSTRAINT CK_ProjectSubmissionNew2_NoveltyLevelNo
        CHECK (NoveltyLevelNo IS NULL OR NoveltyLevelNo BETWEEN 1 AND 5),

    CONSTRAINT CK_ProjectSubmissionNew2_StatusCode
        CHECK (StatusCode IN ('DRAFT', 'SUBMITTED', 'CANCELLED', 'APPROVED', 'REJECTED'))
);
GO


/* =========================================================
   Index สำหรับค้นหา / รายงาน / Export
   ========================================================= */

CREATE INDEX IX_ProjectSubmissionNew2_EventYear_StatusCode
ON dbo.ProjectSubmissionNew (EventYear, StatusCode);
GO

CREATE INDEX IX_ProjectSubmissionNew2_SubmissionTypeCode
ON dbo.ProjectSubmissionNew (SubmissionTypeCode);
GO

CREATE INDEX IX_ProjectSubmissionNew2_CreativeIdeaName
ON dbo.ProjectSubmissionNew (CreativeIdeaName);
GO

CREATE INDEX IX_ProjectSubmissionNew2_ChallengeNo
ON dbo.ProjectSubmissionNew (ChallengeNo);
GO

CREATE INDEX IX_ProjectSubmissionNew2_ChallengeCategoryNo
ON dbo.ProjectSubmissionNew (ChallengeCategoryNo);
GO

CREATE INDEX IX_ProjectSubmissionNew2_TargetCustomerTypeNo
ON dbo.ProjectSubmissionNew (TargetCustomerTypeNo);
GO

CREATE INDEX IX_ProjectSubmissionNew2_InnovationTypeNo
ON dbo.ProjectSubmissionNew (InnovationTypeNo);
GO

CREATE INDEX IX_ProjectSubmissionNew2_DigitalInnovationNo
ON dbo.ProjectSubmissionNew (DigitalInnovationNo);
GO

CREATE INDEX IX_ProjectSubmissionNew2_NoveltyLevelNo
ON dbo.ProjectSubmissionNew (NoveltyLevelNo);
GO


/* =========================================================
   A-Inno / IDEA Tank - ProjectSubmissionNewMember Table

   Design:
   - 1 row = 1 สมาชิกในทีมของรายการส่งไอเดีย (ProjectSubmissionNew)
   - ประเภทบุคคล: มีสมาชิก 1 คน (เป็นทั้งหัวหน้าทีมและผู้ติดต่อหลัก)
   - ประเภททีม: มีสมาชิก 3-5 คน
   ========================================================= */

CREATE TABLE dbo.ProjectSubmissionNewMember
(
    ProjectMemberId BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_ProjectSubmissionNewMember2 PRIMARY KEY,

    ProjectId BIGINT NOT NULL
        CONSTRAINT FK_ProjectSubmissionNewMember2_ProjectSubmissionNew2
            REFERENCES dbo.ProjectSubmissionNew (ProjectId) ON DELETE CASCADE,

    MemberSeq TINYINT NOT NULL,
        -- ลำดับสมาชิกในทีม 1-5

    EmpCode VARCHAR(20) NOT NULL,
        -- รหัสพนักงาน

    FullNameTh NVARCHAR(200) NOT NULL,
        -- ชื่อ-นามสกุล

    PositionName NVARCHAR(200) NULL,
        -- ตำแหน่งงาน

    OrgName NVARCHAR(300) NULL,
        -- สังกัด/ฝ่าย

    MobileNo VARCHAR(50) NULL,
        -- เบอร์ติดต่อ

    IsTeamLeader BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNewMember2_IsTeamLeader DEFAULT (0),
        -- เป็นหัวหน้าทีมหรือไม่

    IsMainContact BIT NOT NULL
        CONSTRAINT DF_ProjectSubmissionNewMember2_IsMainContact DEFAULT (0),
        -- เป็นผู้ติดต่อหลักหรือไม่

    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_ProjectSubmissionNewMember2_CreatedAt DEFAULT (SYSDATETIME()),

    UpdatedAt DATETIME2(0) NULL
);
GO

CREATE INDEX IX_ProjectSubmissionNewMember2_ProjectId
ON dbo.ProjectSubmissionNewMember (ProjectId);
GO