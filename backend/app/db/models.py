from sqlalchemy import Column, Integer, BigInteger, Text, TIMESTAMP, text, String, DateTime, Boolean, SmallInteger, ForeignKey
from sqlalchemy.dialects.mssql import TINYINT
from sqlalchemy.orm import relationship
from sqlalchemy.sql.elements import quoted_name

from app.db.database import Base


class Question(Base):
    __tablename__ = quoted_name("Question", True)
    __table_args__ = {"schema": "dbo"}

    question_id = Column(String(100), primary_key=True, nullable=False)
    question_title = Column(String(500), nullable=False)
    question_description = Column(Text)
    question_categories = Column(Text)  # Changed from ARRAY(Text) to Text for MSSQL
    qrcode_url = Column(String(500))
    created_at = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )

    # No ORM relationship to Answer


class Answer(Base):
    __tablename__ = quoted_name("Answer", True)
    __table_args__ = {"schema": "dbo"}

    answer_id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    # Plain text field; no ForeignKey relation
    question_id = Column(String(255), nullable=False)
    answer_title = Column(Text)
    answer_painpoint = Column(Text)
    answer_text = Column(Text, nullable=False)
    answer_outcome = Column(Text)
    category = Column(String(255), nullable=False)
    create_user_name = Column(String(255))
    create_user_code = Column(String(100))
    create_user_department = Column(String(255))
    answer_keywords = Column(Text)
    model_scores_criterion = Column(String(1000), nullable=True)
    model_overall_score = Column(Integer, nullable=True)
    model_overall_feedback = Column(Text, nullable=True)
    created_at = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    # No ORM relationship to Question


class IdeaTank(Base):
    __tablename__ = quoted_name("idea_tank", True)
    __table_args__ = {"schema": "dbo"}

    idea_seq = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    idea_code = Column(String(10))
    category_idea_type1 = Column(String(100))
    idea_name = Column(String(500))
    idea_subject = Column(Text)
    idea_source = Column(Text)
    customer_target = Column(Text)
    idea_inno_type = Column(Text)
    idea_detail = Column(Text)
    idea_finance_impact = Column(Text)
    idea_nonfinance_impact = Column(Text)
    idea_status = Column(Text)
    idea_status_md = Column(String(50))
    idea_status_md_remark = Column(Text)
    idea_owner_empcode = Column(String(50))
    idea_owner_empname = Column(String(200))
    idea_owner_deposit = Column(String(100))
    idea_owner_contacts = Column(String(200))
    idea_keywords = Column(Text)
    idea_comment = Column(Text)
    idea_summary_byai = Column(Text)
    idea_score = Column(Integer, nullable=True)
    idea_score_comment = Column(Text, nullable=True)
    create_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    update_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )




class User(Base):
    __tablename__ = quoted_name("idea_users", True)
    __table_args__ = {"schema": "dbo"}

    user_code = Column(String(50), primary_key=True, nullable=False)
    user_fname = Column(String(100), nullable=False)
    user_lname = Column(String(100), nullable=False)
    user_login = Column(String(50), unique=True, nullable=False)
    user_password = Column(String(255), nullable=False)
    user_createdate = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    user_updatedate = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    user_role = Column(String(50), nullable=True, default='user')


class ProjectSubmission(Base):
    __tablename__ = quoted_name("ProjectSubmission", True)
    __table_args__ = {"schema": "dbo"}

    ProjectId = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    EventYear = Column(SmallInteger, nullable=False, server_default=text("2026"))
    SubmissionTypeCode = Column(String(20), nullable=False)
    SubmissionTypeNameTh = Column(String(100), nullable=False)
    TeamName = Column(String(200), nullable=False)

    ChallengeNo = Column(TINYINT, nullable=True)
    ChallengeText = Column(String(1000), nullable=True)

    IdeaSourceCoPs = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceCoPsDetail = Column(String(1000), nullable=True)
    IdeaSourceLR = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceLRDetail = Column(String(1000), nullable=True)
    IdeaSourceResearch = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceResearchDetail = Column(String(1000), nullable=True)
    IdeaSourceExperience = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceExperienceDetail = Column(String(1000), nullable=True)
    IdeaSourceStudyVisit = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceStudyVisitDetail = Column(String(1000), nullable=True)
    IdeaSourceKnowledgeExchange = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceKnowledgeExchangeDetail = Column(String(1000), nullable=True)
    IdeaSourceInnovationDatabase = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceInnovationDatabaseDetail = Column(String(1000), nullable=True)
    IdeaSourceMarketStudy = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceMarketStudyDetail = Column(String(1000), nullable=True)
    IdeaSourceVOS = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceVOSDetail = Column(String(1000), nullable=True)
    IdeaSourceOther = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceOtherDetail = Column(String(1000), nullable=True)

    TargetCustomerHtml = Column(Text, nullable=True)

    InnovationTypeNo = Column(TINYINT, nullable=True)
    InnovationTypeText = Column(String(500), nullable=True)

    IdeaConceptHtml = Column(Text, nullable=True)
    ExpectedBenefitHtml = Column(Text, nullable=True)

    GenCapProjectManagement = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapCommunications = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapMarketing = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapFinancialBusinessAnalysis = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapCustomerManagement = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapStakeholderPartnership = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapOther = Column(Boolean, nullable=False, server_default=text("0"))
    GenCapOtherDetail = Column(String(1000), nullable=True)

    DigitalCapProductDevelopment = Column(Boolean, nullable=False, server_default=text("0"))
    DigitalCapCodingProgramming = Column(Boolean, nullable=False, server_default=text("0"))
    DigitalCapDataAnalysis = Column(Boolean, nullable=False, server_default=text("0"))
    DigitalCapUiUxGraphicDesign = Column(Boolean, nullable=False, server_default=text("0"))
    DigitalCapSoftwareTooling = Column(Boolean, nullable=False, server_default=text("0"))
    DigitalCapOther = Column(Boolean, nullable=False, server_default=text("0"))
    DigitalCapOtherDetail = Column(String(1000), nullable=True)

    HackathonMotivationHtml = Column(Text, nullable=True)

    StatusCode = Column(String(20), nullable=False, server_default=text("'DRAFT'"))
    SubmittedAt = Column(DateTime, nullable=True)

    CreatedByEmpCode = Column(String(20), nullable=True)
    CreatedAt = Column(DateTime, nullable=False, server_default=text("SYSDATETIME()"))
    UpdatedByEmpCode = Column(String(20), nullable=True)
    UpdatedAt = Column(DateTime, nullable=True)

    members = relationship(
        "ProjectSubmissionMember",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectSubmissionMember.MemberSeq",
    )


class ProjectSubmissionMember(Base):
    __tablename__ = quoted_name("ProjectSubmissionMember", True)
    __table_args__ = {"schema": "dbo"}

    ProjectMemberId = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    ProjectId = Column(BigInteger, ForeignKey("dbo.ProjectSubmission.ProjectId", ondelete="CASCADE"), nullable=False)
    MemberSeq = Column(TINYINT, nullable=False)
    EmpCode = Column(String(20), nullable=False)
    FullNameTh = Column(String(200), nullable=False)
    PositionName = Column(String(200), nullable=True)
    OrgName = Column(String(300), nullable=True)
    MobileNo = Column(String(50), nullable=True)
    IsTeamLeader = Column(Boolean, nullable=False, server_default=text("0"))
    IsMainContact = Column(Boolean, nullable=False, server_default=text("0"))
    CreatedAt = Column(DateTime, nullable=False, server_default=text("SYSDATETIME()"))
    UpdatedAt = Column(DateTime, nullable=True)

    project = relationship("ProjectSubmission", back_populates="members")


class ProjectSubmissionNew(Base):
    __tablename__ = quoted_name("ProjectSubmissionNew", True)
    __table_args__ = {"schema": "dbo"}

    ProjectId = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    EventYear = Column(SmallInteger, nullable=False, server_default=text("2026"))
    SubmissionTypeCode = Column(String(20), nullable=False)
    SubmissionTypeNameTh = Column(String(100), nullable=False)
    TeamName = Column(String(200), nullable=True)
    CreativeIdeaName = Column(String(300), nullable=False)

    ChallengeNo = Column(TINYINT, nullable=True)
    ChallengeText = Column(String(1000), nullable=True)

    ChallengeCategoryNo = Column(TINYINT, nullable=True)
    ChallengeCategoryText = Column(String(500), nullable=True)

    StrategicObjectiveSO1 = Column(Boolean, nullable=False, server_default=text("0"))
    StrategicObjectiveSO2 = Column(Boolean, nullable=False, server_default=text("0"))
    StrategicObjectiveSO3 = Column(Boolean, nullable=False, server_default=text("0"))
    StrategicObjectiveSO4 = Column(Boolean, nullable=False, server_default=text("0"))
    StrategicObjectiveSO5 = Column(Boolean, nullable=False, server_default=text("0"))
    StrategicObjectiveSO6 = Column(Boolean, nullable=False, server_default=text("0"))

    IdeaSourceCoPs = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceCoPsDetail = Column(String(1000), nullable=True)
    IdeaSourceLR = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceLRDetail = Column(String(1000), nullable=True)
    IdeaSourceResearch = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceResearchDetail = Column(String(1000), nullable=True)
    IdeaSourceExperience = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceExperienceDetail = Column(String(1000), nullable=True)
    IdeaSourceStudyVisit = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceStudyVisitDetail = Column(String(1000), nullable=True)
    IdeaSourceKnowledgeExchange = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceKnowledgeExchangeDetail = Column(String(1000), nullable=True)
    IdeaSourceInnovationDatabase = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceInnovationDatabaseDetail = Column(String(1000), nullable=True)
    IdeaSourceMarketStudy = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceMarketStudyDetail = Column(String(1000), nullable=True)
    IdeaSourceVOS = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceVOSDetail = Column(String(1000), nullable=True)
    IdeaSourceOther = Column(Boolean, nullable=False, server_default=text("0"))
    IdeaSourceOtherDetail = Column(String(1000), nullable=True)

    TargetCustomerTypeNo = Column(TINYINT, nullable=True)
    TargetCustomerTypeText = Column(String(100), nullable=True)
    TargetCustomerProblemHtml = Column(Text, nullable=True)

    InnovationTypeNo = Column(TINYINT, nullable=True)
    InnovationTypeText = Column(String(500), nullable=True)

    IdeaConceptHtml = Column(Text, nullable=True)

    DigitalInnovationNo = Column(TINYINT, nullable=True)
    DigitalInnovationText = Column(String(300), nullable=True)

    NoveltyLevelNo = Column(TINYINT, nullable=True)
    NoveltyLevelText = Column(String(1000), nullable=True)

    InnovationValueFinancial = Column(Boolean, nullable=False, server_default=text("0"))
    FinancialValueRevenue = Column(Boolean, nullable=False, server_default=text("0"))
    FinancialValueCostSaving = Column(Boolean, nullable=False, server_default=text("0"))
    FinancialValueDetailHtml = Column(Text, nullable=True)

    InnovationValueNonFinancial = Column(Boolean, nullable=False, server_default=text("0"))
    NonFinancialValueCustomerSatisfaction = Column(Boolean, nullable=False, server_default=text("0"))
    NonFinancialValueWorkEfficiency = Column(Boolean, nullable=False, server_default=text("0"))
    NonFinancialValueCustomerQuality = Column(Boolean, nullable=False, server_default=text("0"))
    NonFinancialValueEnvironment = Column(Boolean, nullable=False, server_default=text("0"))
    NonFinancialValueDetailHtml = Column(Text, nullable=True)

    StatusCode = Column(String(20), nullable=False, server_default=text("'DRAFT'"))
    SubmittedAt = Column(DateTime, nullable=True)

    CreatedByEmpCode = Column(String(20), nullable=True)
    CreatedAt = Column(DateTime, nullable=False, server_default=text("SYSDATETIME()"))
    UpdatedByEmpCode = Column(String(20), nullable=True)
    UpdatedAt = Column(DateTime, nullable=True)

    members = relationship(
        "ProjectSubmissionNewMember",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectSubmissionNewMember.MemberSeq",
    )


class ProjectSubmissionNewMember(Base):
    __tablename__ = quoted_name("ProjectSubmissionNewMember", True)
    __table_args__ = {"schema": "dbo"}

    ProjectMemberId = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    ProjectId = Column(BigInteger, ForeignKey("dbo.ProjectSubmissionNew.ProjectId", ondelete="CASCADE"), nullable=False)
    MemberSeq = Column(TINYINT, nullable=False)
    EmpCode = Column(String(20), nullable=False)
    FullNameTh = Column(String(200), nullable=False)
    PositionName = Column(String(200), nullable=True)
    OrgName = Column(String(300), nullable=True)
    MobileNo = Column(String(50), nullable=True)
    IsTeamLeader = Column(Boolean, nullable=False, server_default=text("0"))
    IsMainContact = Column(Boolean, nullable=False, server_default=text("0"))
    CreatedAt = Column(DateTime, nullable=False, server_default=text("SYSDATETIME()"))
    UpdatedAt = Column(DateTime, nullable=True)

    project = relationship("ProjectSubmissionNew", back_populates="members")


class Setting(Base):
    __tablename__ = quoted_name("tb_setting", True)
    __table_args__ = {"schema": "dbo"}

    set_code = Column(String(50), primary_key=True, nullable=False)
    set_name = Column(String(255), nullable=True)
    set_value = Column(Text, nullable=False)
    set_description = Column(Text, nullable=True)
    create_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    update_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
