import importlib.util
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).with_name("import_project_submission_new.py")


def load_importer():
    spec = importlib.util.spec_from_file_location("project_submission_new_importer", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Cannot load project_submission_new importer")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ProjectSubmissionNewImportTests(unittest.TestCase):
    def test_map_source_row_sets_a_inno_data_source(self):
        importer = load_importer()
        row = {
            "year": "2026",
            "creativityName": "Test idea",
            "รูปแบบ": "รายบุคคล",
            "topic1": "การลดการใช้พลังงาน",
            "topic2": "การพัฒนาปรับปรุงกระบวนการ",
            "topic2_so": "4. SO4-test",
            "topic3": "ประสบการณ์",
            "topic4": "ลูกค้าเดิม",
            "topic4_detail": "Customer problem",
            "topic5": "นวัตกรรมกระบวนการ",
            "topic6": "Idea detail",
            "topic7": "เป็นนวัตกรรมที่ใช้เทคโนโลยีดิจิทัล",
            "topic8": "การพัฒนา/ต่อยอดผลิตภัณฑ์ บริการ กระบวนการ หรือองค์ความรู้เดิม",
            "topic9": "1. ด้านการเงิน",
            "topic9_1": "1. สร้างรายได้ (รายได้ธนาคาร/รายได้ลูกค้า)",
            "topic9_2": "Financial detail",
            "topic9_3": "",
            "topic9_4": "",
            "SendBy_EmpID": "100001",
            "SendBy_contact": "0812345678",
            "EmpCode1": "100001",
            "FullName1": "Tester",
            "division_name1": "Innovation",
        }

        mapped = importer.map_source_row(row, excel_row=2)

        self.assertEqual(mapped.project["data_source"], "a-inno")
        self.assertEqual(mapped.project["StatusCode"], "SUBMITTED")
        self.assertEqual(len(mapped.members), 1)

    def test_selected_workbook_maps_all_rows_with_a_inno_data_source(self):
        importer = load_importer()
        workbook = next((Path(__file__).parent.parent / "datasource").glob("*.xlsx"))

        mapped = [importer.map_source_row(row, excel_row) for excel_row, row in importer.read_source_rows(workbook)]

        self.assertEqual(len(mapped), 358)
        self.assertTrue(all(item.project["data_source"] == "a-inno" for item in mapped))
        self.assertEqual(sum(len(item.members) for item in mapped), 1374)
        self.assertTrue(all(len(item.members) <= 10 for item in mapped))

    def test_shifted_member_columns_are_recovered_from_team_detail(self):
        importer = load_importer()
        row = {
            "year": "2026", "creativityName": "Shifted members", "submission_type": "รายทีม",
            "topic1": "การลดการใช้พลังงาน", "topic2": "การพัฒนาปรับปรุงกระบวนการ",
            "topic3": "ประสบการณ์", "topic4": "ลูกค้าเดิม", "topic5": "นวัตกรรมกระบวนการ",
            "SendBy_EmpID": "4600243", "SendBy_division_name": "สำนักพัฒนาองค์กร",
            "SendBy_contact": "นายหนึ่ง ทดสอบ#4600243#เบอร์ติดต่อ-8442,น.ส.สอง ทดสอบ#5200129#เบอร์ติดต่อ-8692",
            "EmpCode1": "นายหนึ่ง ทดสอบ", "FullName1": "สำนักพัฒนาองค์กร", "division_name1": "5200129",
        }

        mapped = importer.map_source_row(row, excel_row=211)

        self.assertEqual([member["EmpCode"] for member in mapped.members], ["4600243", "5200129"])
        self.assertEqual(mapped.members[0]["MobileNo"], "8442")

    def test_data_source_migration_model_and_export_contract(self):
        backend = Path(__file__).parent
        migration = (backend / "migrate_project_submission_new_data_source.py").read_text(encoding="utf-8")
        model = (backend / "app" / "db" / "models.py").read_text(encoding="utf-8")
        routes = (backend / "app" / "api" / "routes.py").read_text(encoding="utf-8")

        self.assertIn("COL_LENGTH('dbo.ProjectSubmissionNew', 'data_source')", migration)
        self.assertIn("DEFAULT ('idea-tank') WITH VALUES", migration)
        self.assertIn('data_source = Column(String(50), nullable=False, server_default=text("\'idea-tank\'"))', model)
        self.assertIn('"data_source": "แหล่งข้อมูล"', routes)


if __name__ == "__main__":
    unittest.main()
