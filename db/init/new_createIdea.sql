/* =========================================================
   IDEA Tank 2026
   SQL Server Table Design

   Design Concept:
   - ProjectSubmission = 1 row ต่อ 1 ผลงาน / 1 โครงการ / 1 ทีม หรือ 1 บุคคล
   - ProjectSubmissionMember = ตารางเก็บสมาชิก / ทีมงาน
   - ไม่ Normalize ตัวเลือก checkbox/radio เพื่อลด JOIN และ Export ง่าย
   - Master data เช่น ประเภทนวัตกรรม, แหล่งที่มา, ทักษะ ให้ hard code ฝั่ง Application

   Hard Code: SubmissionTypeCode
   - INDIVIDUAL = ประเภทบุคคล
   - TEAM       = ประเภททีม

   Hard Code: ChallengeNo
   - 1 = เราจะเพิ่มประสิทธิภาพกระบวนการทำงานด้าน “การปรับปรุงโครงสร้างหนี้” ให้ถูกต้อง สะดวกรวดเร็ว และสามารถนำไปปฏิบัติจริงได้อย่างไร
   - 2 = เราจะเพิ่มประสิทธิภาพกระบวนการทำงานด้าน “การบริหารจัดการหนี้” ให้ถูกต้อง สะดวกรวดเร็ว และสามารถนำไปปฏิบัติจริงได้อย่างไร

   Hard Code: InnovationTypeNo
   - 1 = นวัตกรรมผลิตภัณฑ์
   - 2 = นวัตกรรมบริการ
   - 3 = นวัตกรรมกระบวนการ
   - 4 = นวัตกรรมรูปแบบการดำเนินธุรกิจหรือการค้าใหม่ขององค์กร
   - 5 = นวัตกรรมเกษตรที่ส่งเสริมการยกระดับอาชีพเกษตร

   Validation ที่แนะนำฝั่ง Application:
   - ถ้า SubmissionTypeCode = INDIVIDUAL ต้องมีสมาชิก 1 คน
   - ถ้า SubmissionTypeCode = TEAM ต้องมีสมาชิก 3-5 คน
   ========================================================= */
 


CREATE TABLE ProjectSubmission
(
    ProjectId BIGINT IDENTITY(1,1) NOT NULL -- Primary Key: รหัสรายการส่งประกวด / รหัสโครงการ
        CONSTRAINT PK_ProjectSubmission PRIMARY KEY,

    EventYear SMALLINT NOT NULL -- ปีของโครงการ เช่น 2026
        CONSTRAINT DF_ProjectSubmission_EventYear DEFAULT (2026),

    SubmissionTypeCode VARCHAR(20) NOT NULL -- ประเภทการส่งประกวด: INDIVIDUAL=ประเภทบุคคล, TEAM=ประเภททีม
        CONSTRAINT DF_ProjectSubmission_SubmissionTypeCode DEFAULT ('TEAM'),

    SubmissionTypeNameTh NVARCHAR(100) NOT NULL -- ชื่อประเภทการส่งประกวดภาษาไทย เช่น ประเภทบุคคล, ประเภททีม
        CONSTRAINT DF_ProjectSubmission_SubmissionTypeNameTh DEFAULT (N'ประเภททีม'),

    TeamName NVARCHAR(200) NOT NULL, -- ชื่อทีม / ถ้าเป็นประเภทบุคคลให้เก็บชื่อผู้ส่งประกวดหรือชื่อผลงาน

    /* =====================================================
       ส่วนที่ 1: กรุณาเลือกโจทย์นวัตกรรมที่ท่านต้องการแก้ปัญหา
       ===================================================== */

    ChallengeNo TINYINT NULL, -- โจทย์นวัตกรรมที่เลือก: 1=ปรับปรุงโครงสร้างหนี้, 2=บริหารจัดการหนี้

    ChallengeText NVARCHAR(1000) NULL, -- ข้อความโจทย์นวัตกรรมที่เลือก เก็บซ้ำเพื่อให้ Export ได้ทันทีโดยไม่ต้อง map code

    /* =====================================================
       ส่วนที่ 2: แหล่งที่มาของแนวคิด
       เลือกได้มากกว่า 1 ข้อ
       ===================================================== */

    IdeaSourceCoPs BIT NOT NULL -- ชุมชนนักปฏิบัติ CoPs
        CONSTRAINT DF_ProjectSubmission_IdeaSourceCoPs DEFAULT (0),

    IdeaSourceCoPsDetail NVARCHAR(1000) NULL, -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ชุมชนนักปฏิบัติ CoPs

    IdeaSourceLR BIT NOT NULL -- คลังความรู้ LR
        CONSTRAINT DF_ProjectSubmission_IdeaSourceLR DEFAULT (0),

    IdeaSourceLRDetail NVARCHAR(1000) NULL ,-- รายละเอียดเพิ่มเติมของแหล่งที่มา: คลังความรู้ LR

    IdeaSourceResearch BIT NOT NULL -- ผลงานวิจัย
        CONSTRAINT DF_ProjectSubmission_IdeaSourceResearch DEFAULT (0),

    IdeaSourceResearchDetail NVARCHAR(1000) NULL, -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ผลงานวิจัย

    IdeaSourceExperience BIT NOT NULL -- ประสบการณ์
        CONSTRAINT DF_ProjectSubmission_IdeaSourceExperience DEFAULT (0),

    IdeaSourceExperienceDetail NVARCHAR(1000) NULL ,-- รายละเอียดเพิ่มเติมของแหล่งที่มา: ประสบการณ์

    IdeaSourceStudyVisit BIT NOT NULL -- ศึกษาดูงาน
        CONSTRAINT DF_ProjectSubmission_IdeaSourceStudyVisit DEFAULT (0),

    IdeaSourceStudyVisitDetail NVARCHAR(1000) NULL ,-- รายละเอียดเพิ่มเติมของแหล่งที่มา: ศึกษาดูงาน

    IdeaSourceKnowledgeExchange BIT NOT NULL -- การแลกเปลี่ยนเรียนรู้
        CONSTRAINT DF_ProjectSubmission_IdeaSourceKnowledgeExchange DEFAULT (0),

    IdeaSourceKnowledgeExchangeDetail NVARCHAR(1000) NULL ,-- รายละเอียดเพิ่มเติมของแหล่งที่มา: การแลกเปลี่ยนเรียนรู้

    IdeaSourceInnovationDatabase BIT NOT NULL -- ฐานข้อมูลนวัตกรรม
        CONSTRAINT DF_ProjectSubmission_IdeaSourceInnovationDatabase DEFAULT (0),

    IdeaSourceInnovationDatabaseDetail NVARCHAR(1000) NULL, -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ฐานข้อมูลนวัตกรรม

    IdeaSourceMarketStudy BIT NOT NULL -- ผลการศึกษาความต้องการของตลาด
        CONSTRAINT DF_ProjectSubmission_IdeaSourceMarketStudy DEFAULT (0),

    IdeaSourceMarketStudyDetail NVARCHAR(1000) NULL, -- รายละเอียดเพิ่มเติมของแหล่งที่มา: ผลการศึกษาความต้องการของตลาด

    IdeaSourceVOS BIT NOT NULL -- VOS: Voice of Stakeholder
        CONSTRAINT DF_ProjectSubmission_IdeaSourceVOS DEFAULT (0),

    IdeaSourceVOSDetail NVARCHAR(1000) NULL, -- รายละเอียดเพิ่มเติมของแหล่งที่มา: Voice of Stakeholder

    IdeaSourceOther BIT NOT NULL -- อื่นๆ
        CONSTRAINT DF_ProjectSubmission_IdeaSourceOther DEFAULT (0),

    IdeaSourceOtherDetail NVARCHAR(1000) NULL ,-- รายละเอียดเพิ่มเติมของแหล่งที่มา: อื่นๆ

    /* =====================================================
       ส่วนที่ 3: อธิบายถึงลูกค้าที่เป็นกลุ่มเป้าหมาย
       ===================================================== */

    TargetCustomerHtml NVARCHAR(MAX) NULL, -- รายละเอียดลูกค้ากลุ่มเป้าหมาย เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       ส่วนที่ 4: ประเภทนวัตกรรม
       เลือกได้ 1 ข้อ
       ===================================================== */

    InnovationTypeNo TINYINT NULL ,-- ประเภทนวัตกรรม: 1=ผลิตภัณฑ์, 2=บริการ, 3=กระบวนการ, 4=รูปแบบธุรกิจ, 5=เกษตร

    InnovationTypeText NVARCHAR(500) NULL ,-- ข้อความประเภทนวัตกรรมที่เลือก เก็บซ้ำเพื่อให้ Export ได้ทันทีโดยไม่ต้อง map code

    /* =====================================================
       ส่วนที่ 5: นำเสนอแนวคิดนวัตกรรมโดยสังเขป
       ===================================================== */

    IdeaConceptHtml NVARCHAR(MAX) NULL, -- รายละเอียดแนวคิดนวัตกรรม เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       ส่วนที่ 6: ประโยชน์ที่คาดว่าจะได้รับ
       ===================================================== */

    ExpectedBenefitHtml NVARCHAR(MAX) NULL ,-- ประโยชน์ที่คาดว่าจะได้รับ เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       ส่วนที่ 7: ทักษะ ความรู้ และความสามารถของสมาชิกภายในทีม
       General Capabilities
       ===================================================== */

    GenCapProjectManagement BIT NOT NULL -- General Capability: การบริหารโครงการ Project Management
        CONSTRAINT DF_ProjectSubmission_GenCapProjectManagement DEFAULT (0),

    GenCapCommunications BIT NOT NULL -- General Capability: การสื่อสารภายในหรือภายนอกองค์กร Communications
        CONSTRAINT DF_ProjectSubmission_GenCapCommunications DEFAULT (0),

    GenCapMarketing BIT NOT NULL -- General Capability: การตลาด Marketing
        CONSTRAINT DF_ProjectSubmission_GenCapMarketing DEFAULT (0),

    GenCapFinancialBusinessAnalysis BIT NOT NULL -- General Capability: การวิเคราะห์ทางการเงินและธุรกิจ Financial and Business Analysis
        CONSTRAINT DF_ProjectSubmission_GenCapFinancialBusinessAnalysis DEFAULT (0),

    GenCapCustomerManagement BIT NOT NULL -- General Capability: การดูแลลูกค้า Customer Management
        CONSTRAINT DF_ProjectSubmission_GenCapCustomerManagement DEFAULT (0),

    GenCapStakeholderPartnership BIT NOT NULL -- General Capability: การดูแลผู้มีส่วนได้เสียและพันธมิตร Stakeholders and Partnership Management
        CONSTRAINT DF_ProjectSubmission_GenCapStakeholderPartnership DEFAULT (0),

    GenCapOther BIT NOT NULL -- General Capability: อื่นๆ
        CONSTRAINT DF_ProjectSubmission_GenCapOther DEFAULT (0),

    GenCapOtherDetail NVARCHAR(1000) NULL ,-- รายละเอียด General Capability อื่นๆ

    /* =====================================================
       ส่วนที่ 7: Digital Capabilities
       ===================================================== */

    DigitalCapProductDevelopment BIT NOT NULL -- Digital Capability: การพัฒนาผลิตภัณฑ์ Product Development
        CONSTRAINT DF_ProjectSubmission_DigitalCapProductDevelopment DEFAULT (0),

    DigitalCapCodingProgramming BIT NOT NULL -- Digital Capability: การเขียนโค้ดหรือโปรแกรม Coding / Programming
        CONSTRAINT DF_ProjectSubmission_DigitalCapCodingProgramming DEFAULT (0),

    DigitalCapDataAnalysis BIT NOT NULL -- Digital Capability: การวิเคราะห์ข้อมูล Data Analysis
        CONSTRAINT DF_ProjectSubmission_DigitalCapDataAnalysis DEFAULT (0),

    DigitalCapUiUxGraphicDesign BIT NOT NULL -- Digital Capability: การออกแบบกราฟิก UI/UX & Graphic Design
        CONSTRAINT DF_ProjectSubmission_DigitalCapUiUxGraphicDesign DEFAULT (0),

    DigitalCapSoftwareTooling BIT NOT NULL -- Digital Capability: การพัฒนาซอฟต์แวร์และเครื่องมือต่างๆ Software and Tooling Development
        CONSTRAINT DF_ProjectSubmission_DigitalCapSoftwareTooling DEFAULT (0),

    DigitalCapOther BIT NOT NULL -- Digital Capability: อื่นๆ
        CONSTRAINT DF_ProjectSubmission_DigitalCapOther DEFAULT (0),

    DigitalCapOtherDetail NVARCHAR(1000) NULL ,-- รายละเอียด Digital Capability อื่นๆ

    /* =====================================================
       ส่วนที่ 8: แรงจูงใจในการเข้าร่วมโครงการ
       ===================================================== */

    HackathonMotivationHtml NVARCHAR(MAX) NULL, -- แรงจูงใจในการเข้าร่วมโครงการ Hackathon เก็บเป็น HTML จาก Rich Text Editor

    /* =====================================================
       Workflow / Status
       ===================================================== */

    StatusCode VARCHAR(20) NOT NULL -- สถานะรายการ: DRAFT=ร่าง, SUBMITTED=ส่งแล้ว, CANCELLED=ยกเลิก, APPROVED=ผ่าน, REJECTED=ไม่ผ่าน
        CONSTRAINT DF_ProjectSubmission_StatusCode DEFAULT ('DRAFT'),

    SubmittedAt DATETIME2(0) NULL ,-- วันที่และเวลาที่กดส่งข้อมูล

    /* =====================================================
       Audit Fields
       ===================================================== */

    CreatedByEmpCode VARCHAR(20) NULL ,-- รหัสพนักงานผู้สร้างรายการ

    CreatedAt DATETIME2(0) NOT NULL -- วันที่และเวลาที่สร้างรายการ
        CONSTRAINT DF_ProjectSubmission_CreatedAt DEFAULT (SYSDATETIME()),

    UpdatedByEmpCode VARCHAR(20) NULL, -- รหัสพนักงานผู้แก้ไขรายการล่าสุด

    UpdatedAt DATETIME2(0) NULL ,-- วันที่และเวลาที่แก้ไขรายการล่าสุด

    RowVer ROWVERSION NOT NULL, -- Row version สำหรับป้องกันการแก้ไขข้อมูลชนกัน

    CONSTRAINT CK_ProjectSubmission_SubmissionTypeCode
        CHECK (SubmissionTypeCode IN ('INDIVIDUAL', 'TEAM')),

    CONSTRAINT CK_ProjectSubmission_ChallengeNo
        CHECK (ChallengeNo IS NULL OR ChallengeNo IN (1, 2)),

    CONSTRAINT CK_ProjectSubmission_InnovationTypeNo
        CHECK (InnovationTypeNo IS NULL OR InnovationTypeNo BETWEEN 1 AND 5),

    CONSTRAINT CK_ProjectSubmission_StatusCode
        CHECK (StatusCode IN ('DRAFT', 'SUBMITTED', 'CANCELLED', 'APPROVED', 'REJECTED'))
);

CREATE TABLE ProjectSubmissionMember
(
    ProjectMemberId BIGINT IDENTITY(1,1) NOT NULL -- Primary Key: รหัสรายการสมาชิก
        CONSTRAINT PK_ProjectSubmissionMember PRIMARY KEY,

    ProjectId BIGINT NOT NULL, -- Foreign Key: อ้างอิงไปยัง ProjectSubmission.ProjectId

    MemberSeq TINYINT NOT NULL, -- ลำดับสมาชิกในทีม ใช้เรียงลำดับการแสดงผล เช่น 1, 2, 3, 4, 5

    EmpCode VARCHAR(20) NOT NULL ,-- รหัสพนักงาน

    FullNameTh NVARCHAR(200) NOT NULL, -- ชื่อ-นามสกุลพนักงาน

    PositionName NVARCHAR(200) NULL ,-- ตำแหน่งงาน

    OrgName NVARCHAR(300) NULL ,-- สังกัด / ฝ่าย / สำนัก / สาขา

    MobileNo VARCHAR(50) NULL, -- เบอร์ติดต่อ

    IsTeamLeader BIT NOT NULL -- เป็นหัวหน้าทีม / ผู้ประสานงานหลักหรือไม่
        CONSTRAINT DF_ProjectSubmissionMember_IsTeamLeader DEFAULT (0),

    IsMainContact BIT NOT NULL -- เป็นผู้ติดต่อหลักของโครงการหรือไม่
        CONSTRAINT DF_ProjectSubmissionMember_IsMainContact DEFAULT (0),

    CreatedAt DATETIME2(0) NOT NULL -- วันที่และเวลาที่เพิ่มสมาชิก
        CONSTRAINT DF_ProjectSubmissionMember_CreatedAt DEFAULT (SYSDATETIME()),

    UpdatedAt DATETIME2(0) NULL, -- วันที่และเวลาที่แก้ไขข้อมูลสมาชิกล่าสุด

    CONSTRAINT FK_ProjectSubmissionMember_ProjectSubmission
        FOREIGN KEY (ProjectId)
        REFERENCES ProjectSubmission (ProjectId)
        ON DELETE CASCADE,

    CONSTRAINT UQ_ProjectSubmissionMember_Project_MemberSeq
        UNIQUE (ProjectId, MemberSeq),

    CONSTRAINT UQ_ProjectSubmissionMember_Project_EmpCode
        UNIQUE (ProjectId, EmpCode),

    CONSTRAINT CK_ProjectSubmissionMember_MemberSeq
        CHECK (MemberSeq BETWEEN 1 AND 5)
);
