from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    question_title: str = Field(..., min_length=1)
    question_description: Optional[str] = None


class QuestionOut(BaseModel):
    question_id: str
    question_title: str
    question_description: Optional[str] = None
    question_categories: Optional[List[str]] = None
    qrcode_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnswerCreate(BaseModel):
    question_id: str
    answer_title: Optional[str] = None
    answer_painpoint: Optional[str] = None
    answer_text: str = Field(..., min_length=1)
    answer_outcome: Optional[str] = None
    category: Optional[str] = "General"
    create_user_name: Optional[str] = None
    create_user_code: Optional[str] = None
    create_user_department: Optional[str] = None


class AnswerOut(BaseModel):
    answer_id: int
    question_id: str
    answer_title: Optional[str] = None
    answer_painpoint: Optional[str] = None
    answer_text: str
    answer_outcome: Optional[str] = None
    category: str
    create_user_name: Optional[str] = None
    create_user_code: Optional[str] = None
    create_user_department: Optional[str] = None
    answer_keywords: Optional[str] = None
    model_scores_criterion: Optional[str] = None
    model_overall_score: Optional[int] = None
    model_overall_feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnswerModelEvaluationUpdate(BaseModel):
    scores: list[dict[str, Any]]
    overall_score: float
    overall_feedback: str





class IdeaCreate(BaseModel):
    idea_code: Optional[str] = Field(None, max_length=10)
    category_idea_type1: Optional[str] = Field(None, max_length=100)
    idea_name: Optional[str] = Field(None, max_length=500)
    idea_subject: Optional[str] = Field(None, max_length=1000)
    idea_source: Optional[str] = Field(None, max_length=1000)
    customer_target: Optional[str] = Field(None, max_length=1000)
    idea_inno_type: Optional[str] = Field(None, max_length=1000)
    idea_detail: Optional[str] = None
    idea_finance_impact: Optional[str] = None
    idea_nonfinance_impact: Optional[str] = None
    idea_status: Optional[str] = Field(None, max_length=100)
    idea_status_md: Optional[str] = Field(None, max_length=100)
    idea_status_md_remark: Optional[str] = None
    idea_owner_empcode: Optional[str] = Field(None, max_length=100)
    idea_owner_empname: Optional[str] = Field(None, max_length=100)
    idea_owner_deposit: Optional[str] = Field(None, max_length=100)
    idea_owner_contacts: Optional[str] = Field(None, max_length=100)
    idea_keywords: Optional[str] = Field(None, max_length=100)
    idea_comment: Optional[str] = Field(None, max_length=5000)
    idea_summary_byai: Optional[str] = None


class IdeaOut(BaseModel):
    idea_seq: int
    idea_code: Optional[str] = None
    category_idea_type1: Optional[str] = None
    idea_name: Optional[str] = None
    idea_subject: Optional[str] = None
    idea_source: Optional[str] = None
    customer_target: Optional[str] = None
    idea_inno_type: Optional[str] = None
    idea_detail: Optional[str] = None
    idea_finance_impact: Optional[str] = None
    idea_nonfinance_impact: Optional[str] = None
    idea_status: Optional[str] = None
    idea_status_md: Optional[str] = None
    idea_status_md_remark: Optional[str] = None
    idea_owner_empcode: Optional[str] = None
    idea_owner_empname: Optional[str] = None
    idea_owner_deposit: Optional[str] = None
    idea_owner_contacts: Optional[str] = None
    idea_keywords: Optional[str] = None
    idea_comment: Optional[str] = None
    idea_summary_byai: Optional[str] = None
    idea_score: Optional[int] = None
    idea_score_comment: Optional[str] = None
    create_datetime: datetime
    update_datetime: datetime

    class Config:
        from_attributes = True


class ProjectSubmissionMemberIn(BaseModel):
    EmpCode: str = Field(..., min_length=1, max_length=20)
    FullNameTh: str = Field(..., min_length=1, max_length=200)
    PositionName: Optional[str] = Field(None, max_length=200)
    OrgName: Optional[str] = Field(None, max_length=300)
    MobileNo: Optional[str] = Field(None, max_length=50)
    IsTeamLeader: bool = False
    IsMainContact: bool = False


class ProjectSubmissionMemberOut(BaseModel):
    ProjectMemberId: int
    ProjectId: int
    MemberSeq: int
    EmpCode: str
    FullNameTh: str
    PositionName: Optional[str] = None
    OrgName: Optional[str] = None
    MobileNo: Optional[str] = None
    IsTeamLeader: bool
    IsMainContact: bool
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectSubmissionStep1In(BaseModel):
    TeamName: str = Field(..., min_length=1, max_length=200)
    SubmissionTypeCode: str = Field(..., pattern="^(INDIVIDUAL|TEAM)$")
    Members: List[ProjectSubmissionMemberIn] = Field(..., min_length=1)


class ProjectSubmissionStep2In(BaseModel):
    ChallengeNo: Optional[int] = None
    ChallengeText: Optional[str] = Field(None, max_length=1000)

    IdeaSourceCoPs: bool = False
    IdeaSourceCoPsDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceLR: bool = False
    IdeaSourceLRDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceResearch: bool = False
    IdeaSourceResearchDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceExperience: bool = False
    IdeaSourceExperienceDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceStudyVisit: bool = False
    IdeaSourceStudyVisitDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceKnowledgeExchange: bool = False
    IdeaSourceKnowledgeExchangeDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceInnovationDatabase: bool = False
    IdeaSourceInnovationDatabaseDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceMarketStudy: bool = False
    IdeaSourceMarketStudyDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceVOS: bool = False
    IdeaSourceVOSDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceOther: bool = False
    IdeaSourceOtherDetail: Optional[str] = Field(None, max_length=1000)

    TargetCustomerHtml: Optional[str] = None

    InnovationTypeNo: Optional[int] = None
    InnovationTypeText: Optional[str] = Field(None, max_length=500)

    IdeaConceptHtml: Optional[str] = None
    ExpectedBenefitHtml: Optional[str] = None

    GenCapProjectManagement: bool = False
    GenCapCommunications: bool = False
    GenCapMarketing: bool = False
    GenCapFinancialBusinessAnalysis: bool = False
    GenCapCustomerManagement: bool = False
    GenCapStakeholderPartnership: bool = False
    GenCapOther: bool = False
    GenCapOtherDetail: Optional[str] = Field(None, max_length=1000)

    DigitalCapProductDevelopment: bool = False
    DigitalCapCodingProgramming: bool = False
    DigitalCapDataAnalysis: bool = False
    DigitalCapUiUxGraphicDesign: bool = False
    DigitalCapSoftwareTooling: bool = False
    DigitalCapOther: bool = False
    DigitalCapOtherDetail: Optional[str] = Field(None, max_length=1000)

    HackathonMotivationHtml: Optional[str] = None


class ProjectSubmissionOut(BaseModel):
    ProjectId: int
    EventYear: int
    SubmissionTypeCode: str
    SubmissionTypeNameTh: str
    TeamName: str

    ChallengeNo: Optional[int] = None
    ChallengeText: Optional[str] = None

    IdeaSourceCoPs: bool
    IdeaSourceCoPsDetail: Optional[str] = None
    IdeaSourceLR: bool
    IdeaSourceLRDetail: Optional[str] = None
    IdeaSourceResearch: bool
    IdeaSourceResearchDetail: Optional[str] = None
    IdeaSourceExperience: bool
    IdeaSourceExperienceDetail: Optional[str] = None
    IdeaSourceStudyVisit: bool
    IdeaSourceStudyVisitDetail: Optional[str] = None
    IdeaSourceKnowledgeExchange: bool
    IdeaSourceKnowledgeExchangeDetail: Optional[str] = None
    IdeaSourceInnovationDatabase: bool
    IdeaSourceInnovationDatabaseDetail: Optional[str] = None
    IdeaSourceMarketStudy: bool
    IdeaSourceMarketStudyDetail: Optional[str] = None
    IdeaSourceVOS: bool
    IdeaSourceVOSDetail: Optional[str] = None
    IdeaSourceOther: bool
    IdeaSourceOtherDetail: Optional[str] = None

    TargetCustomerHtml: Optional[str] = None

    InnovationTypeNo: Optional[int] = None
    InnovationTypeText: Optional[str] = None

    IdeaConceptHtml: Optional[str] = None
    ExpectedBenefitHtml: Optional[str] = None

    GenCapProjectManagement: bool
    GenCapCommunications: bool
    GenCapMarketing: bool
    GenCapFinancialBusinessAnalysis: bool
    GenCapCustomerManagement: bool
    GenCapStakeholderPartnership: bool
    GenCapOther: bool
    GenCapOtherDetail: Optional[str] = None

    DigitalCapProductDevelopment: bool
    DigitalCapCodingProgramming: bool
    DigitalCapDataAnalysis: bool
    DigitalCapUiUxGraphicDesign: bool
    DigitalCapSoftwareTooling: bool
    DigitalCapOther: bool
    DigitalCapOtherDetail: Optional[str] = None

    HackathonMotivationHtml: Optional[str] = None

    StatusCode: str
    SubmittedAt: Optional[datetime] = None

    CreatedByEmpCode: Optional[str] = None
    CreatedAt: datetime
    UpdatedByEmpCode: Optional[str] = None
    UpdatedAt: Optional[datetime] = None

    Members: List[ProjectSubmissionMemberOut] = Field(default_factory=list, alias="members")

    class Config:
        from_attributes = True
        populate_by_name = True


class ProjectSubmissionListItem(BaseModel):
    ProjectId: int
    TeamName: str
    ChallengeText: Optional[str] = None
    InnovationTypeText: Optional[str] = None
    CreatedAt: datetime

    class Config:
        from_attributes = True


class ProjectSubmissionListResponse(BaseModel):
    items: List[ProjectSubmissionListItem]
    total: int
    page: int
    page_size: int


class ProjectSubmissionNewMemberIn(BaseModel):
    EmpCode: str = Field(..., min_length=1, max_length=20)
    FullNameTh: str = Field(..., min_length=1, max_length=200)
    PositionName: Optional[str] = Field(None, max_length=200)
    OrgName: Optional[str] = Field(None, max_length=300)
    MobileNo: Optional[str] = Field(None, max_length=50)
    IsTeamLeader: bool = False
    IsMainContact: bool = False


class ProjectSubmissionNewMemberOut(BaseModel):
    ProjectMemberId: int
    ProjectId: int
    MemberSeq: int
    EmpCode: str
    FullNameTh: str
    PositionName: Optional[str] = None
    OrgName: Optional[str] = None
    MobileNo: Optional[str] = None
    IsTeamLeader: bool
    IsMainContact: bool
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectSubmissionNewStep1In(BaseModel):
    CreativeIdeaName: str = Field(..., min_length=1, max_length=300)
    TeamName: Optional[str] = Field(None, max_length=200)
    SubmissionTypeCode: str = Field(..., pattern="^(INDIVIDUAL|TEAM)$")
    Members: List[ProjectSubmissionNewMemberIn] = Field(..., min_length=1)


class ProjectSubmissionNewStep2In(BaseModel):
    ChallengeNo: Optional[int] = None
    ChallengeText: Optional[str] = Field(None, max_length=1000)

    ChallengeCategoryNo: Optional[int] = None
    ChallengeCategoryText: Optional[str] = Field(None, max_length=500)

    StrategicObjectiveSO1: bool = False
    StrategicObjectiveSO2: bool = False
    StrategicObjectiveSO3: bool = False
    StrategicObjectiveSO4: bool = False
    StrategicObjectiveSO5: bool = False
    StrategicObjectiveSO6: bool = False

    IdeaSourceCoPs: bool = False
    IdeaSourceCoPsDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceLR: bool = False
    IdeaSourceLRDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceResearch: bool = False
    IdeaSourceResearchDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceExperience: bool = False
    IdeaSourceExperienceDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceStudyVisit: bool = False
    IdeaSourceStudyVisitDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceKnowledgeExchange: bool = False
    IdeaSourceKnowledgeExchangeDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceInnovationDatabase: bool = False
    IdeaSourceInnovationDatabaseDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceMarketStudy: bool = False
    IdeaSourceMarketStudyDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceVOS: bool = False
    IdeaSourceVOSDetail: Optional[str] = Field(None, max_length=1000)
    IdeaSourceOther: bool = False
    IdeaSourceOtherDetail: Optional[str] = Field(None, max_length=1000)

    TargetCustomerTypeNo: Optional[int] = None
    TargetCustomerTypeText: Optional[str] = Field(None, max_length=100)
    TargetCustomerProblemHtml: Optional[str] = None

    InnovationTypeNo: Optional[int] = None
    InnovationTypeText: Optional[str] = Field(None, max_length=500)

    IdeaConceptHtml: Optional[str] = None

    DigitalInnovationNo: Optional[int] = None
    DigitalInnovationText: Optional[str] = Field(None, max_length=300)

    NoveltyLevelNo: Optional[int] = None
    NoveltyLevelText: Optional[str] = Field(None, max_length=1000)

    InnovationValueFinancial: bool = False
    FinancialValueRevenue: bool = False
    FinancialValueCostSaving: bool = False
    FinancialValueDetailHtml: Optional[str] = None

    InnovationValueNonFinancial: bool = False
    NonFinancialValueCustomerSatisfaction: bool = False
    NonFinancialValueWorkEfficiency: bool = False
    NonFinancialValueCustomerQuality: bool = False
    NonFinancialValueEnvironment: bool = False
    NonFinancialValueDetailHtml: Optional[str] = None


class ProjectSubmissionNewOut(BaseModel):
    ProjectId: int
    EventYear: int
    SubmissionTypeCode: str
    SubmissionTypeNameTh: str
    TeamName: Optional[str] = None
    CreativeIdeaName: str

    ChallengeNo: Optional[int] = None
    ChallengeText: Optional[str] = None

    ChallengeCategoryNo: Optional[int] = None
    ChallengeCategoryText: Optional[str] = None

    StrategicObjectiveSO1: bool
    StrategicObjectiveSO2: bool
    StrategicObjectiveSO3: bool
    StrategicObjectiveSO4: bool
    StrategicObjectiveSO5: bool
    StrategicObjectiveSO6: bool

    IdeaSourceCoPs: bool
    IdeaSourceCoPsDetail: Optional[str] = None
    IdeaSourceLR: bool
    IdeaSourceLRDetail: Optional[str] = None
    IdeaSourceResearch: bool
    IdeaSourceResearchDetail: Optional[str] = None
    IdeaSourceExperience: bool
    IdeaSourceExperienceDetail: Optional[str] = None
    IdeaSourceStudyVisit: bool
    IdeaSourceStudyVisitDetail: Optional[str] = None
    IdeaSourceKnowledgeExchange: bool
    IdeaSourceKnowledgeExchangeDetail: Optional[str] = None
    IdeaSourceInnovationDatabase: bool
    IdeaSourceInnovationDatabaseDetail: Optional[str] = None
    IdeaSourceMarketStudy: bool
    IdeaSourceMarketStudyDetail: Optional[str] = None
    IdeaSourceVOS: bool
    IdeaSourceVOSDetail: Optional[str] = None
    IdeaSourceOther: bool
    IdeaSourceOtherDetail: Optional[str] = None

    TargetCustomerTypeNo: Optional[int] = None
    TargetCustomerTypeText: Optional[str] = None
    TargetCustomerProblemHtml: Optional[str] = None

    InnovationTypeNo: Optional[int] = None
    InnovationTypeText: Optional[str] = None

    IdeaConceptHtml: Optional[str] = None

    DigitalInnovationNo: Optional[int] = None
    DigitalInnovationText: Optional[str] = None

    NoveltyLevelNo: Optional[int] = None
    NoveltyLevelText: Optional[str] = None

    InnovationValueFinancial: bool
    FinancialValueRevenue: bool
    FinancialValueCostSaving: bool
    FinancialValueDetailHtml: Optional[str] = None

    InnovationValueNonFinancial: bool
    NonFinancialValueCustomerSatisfaction: bool
    NonFinancialValueWorkEfficiency: bool
    NonFinancialValueCustomerQuality: bool
    NonFinancialValueEnvironment: bool
    NonFinancialValueDetailHtml: Optional[str] = None

    StatusCode: str
    SubmittedAt: Optional[datetime] = None

    CreatedByEmpCode: Optional[str] = None
    CreatedAt: datetime
    UpdatedByEmpCode: Optional[str] = None
    UpdatedAt: Optional[datetime] = None

    Members: List[ProjectSubmissionNewMemberOut] = Field(default_factory=list, alias="members")

    class Config:
        from_attributes = True
        populate_by_name = True


class ProjectSubmissionNewListItem(BaseModel):
    ProjectId: int
    TeamName: Optional[str] = None
    CreativeIdeaName: str
    ChallengeText: Optional[str] = None
    InnovationTypeText: Optional[str] = None
    CreatedAt: datetime

    class Config:
        from_attributes = True


class ProjectSubmissionNewListResponse(BaseModel):
    items: List[ProjectSubmissionNewListItem]
    total: int
    page: int
    page_size: int


class UserCreate(BaseModel):
    user_code: str = Field(..., min_length=1, max_length=50)
    user_fname: str = Field(..., min_length=1, max_length=100)
    user_lname: str = Field(..., min_length=1, max_length=100)
    user_login: str = Field(..., min_length=1, max_length=50)
    user_password: str = Field(..., min_length=1)
    user_role: str = Field(default="user", max_length=50)


class UserOut(BaseModel):
    user_code: str
    user_fname: str
    user_lname: str
    user_login: str
    user_createdate: datetime
    user_updatedate: datetime
    user_role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    user_login: str = Field(..., min_length=1)
    user_password: str = Field(..., min_length=1)


class UserUpdate(BaseModel):
    user_code: str = Field(..., min_length=1, max_length=50)
    user_fname: str = Field(..., min_length=1, max_length=100)
    user_lname: str = Field(..., min_length=1, max_length=100)
    user_login: str = Field(..., min_length=1, max_length=50)
    user_password: Optional[str] = Field(None, min_length=1)
    user_role: str = Field(default="user", max_length=50)


class UserResponse(BaseModel):
    user_code: str
    user_fname: str
    user_lname: str
    user_login: str
    user_role: str
    token: str

    class Config:
        from_attributes = True
