import os
import unittest
from types import SimpleNamespace

os.environ["DEBUG"] = "false"

from app.api.routes import _project_submission_new_score_context


class ProjectSubmissionNewScoreContextTests(unittest.TestCase):
    def test_context_contains_requested_detail_groups_and_selected_innovation_values(self):
        submission = SimpleNamespace(
            CreativeIdeaName="Score context title",
            TargetCustomerTypeText="Target segment",
            TargetCustomerProblemHtml="<p>Customer pain</p>",
            IdeaConceptHtml="<div>Idea concept</div>",
            NoveltyLevelText="Novelty level",
            InnovationValueFinancial=False,
            FinancialValueRevenue=True,
            FinancialValueCostSaving=False,
            FinancialValueDetailHtml="<p>Financial impact</p>",
            InnovationValueNonFinancial=False,
            NonFinancialValueCustomerSatisfaction=False,
            NonFinancialValueWorkEfficiency=True,
            NonFinancialValueCustomerQuality=False,
            NonFinancialValueEnvironment=False,
            NonFinancialValueDetailHtml="<p>Nonfinancial impact</p>",
            ChallengeText="Unrequested challenge field",
            ChallengeCategoryText="Unrequested challenge category",
            InnovationTypeText="Unrequested innovation type",
            DigitalInnovationText="Unrequested digital innovation field",
        )

        context = _project_submission_new_score_context(submission)

        expected_fragments = [
            "ชื่อผลงาน: Score context title",
            "ลูกค้ากลุ่มเป้าหมาย: Target segment",
            "ปัญหา/ความต้องการของกลุ่มลูกค้า: Customer pain",
            "แนวคิดนวัตกรรมโดยสังเขป: Idea concept",
            "ระดับความใหม่ของความคิดสร้างสรรค์: Novelty level",
            "มูลค่านวัตกรรม (Innovation Value):",
            "ด้านการเงิน:\nรายการที่เลือก: สร้างรายได้ (รายได้ธนาคาร/รายได้ลูกค้า)",
            "รายละเอียด: Financial impact",
            "ด้านที่ไม่ใช่การเงิน:\nรายการที่เลือก: ลดขั้นตอนการทำงาน เพื่อเพิ่มเวลา Free Time สำหรับงานที่สร้างมูลค่า Value Added",
            "รายละเอียด: Nonfinancial impact",
        ]
        for fragment in expected_fragments:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, context)

        self.assertNotIn("Unrequested challenge field", context)
        self.assertNotIn("Unrequested challenge category", context)
        self.assertNotIn("Unrequested innovation type", context)
        self.assertNotIn("Unrequested digital innovation field", context)


if __name__ == "__main__":
    unittest.main()
