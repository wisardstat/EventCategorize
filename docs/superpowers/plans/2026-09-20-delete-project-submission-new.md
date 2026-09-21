# Delete Project Submission New Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authorized administrator delete a submitted IDEA Tank 2026 project from `/project_submission_new_view?id=197` only after confirmation, then show `ลบเสร็จแล้ว` and redirect to `/project_submission_new_list`.

**Architecture:** Add a protected FastAPI `DELETE /project-submissions-new/{project_id}` endpoint that deletes one project inside a transaction. The database relationship has `ondelete="CASCADE"` for `ProjectSubmissionNewMember`, so deleting the project also removes its members. In the Next.js detail page, use SweetAlert2 for the irreversible-action confirmation and success/error states; redirect only after the success modal is dismissed.

**Tech Stack:** FastAPI, SQLAlchemy, Microsoft SQL Server, Next.js 15, React 19, TypeScript, SweetAlert2.

## Global Constraints

- The endpoint must require a Bearer token and a new `delete:project_submissions` permission granted only to `admin` and inherited by `super_admin`.
- HTTP `404` is returned for a missing `ProjectId`; HTTP `500` rolls back an unsuccessful transaction without a success response.
- The UI must issue the destructive request only when SweetAlert2 returns `isConfirmed === true`.
- Exact success text: `ลบเสร็จแล้ว`.
- Exact redirect destination: `/project_submission_new_list`.

---

### Task 1: Authorize and expose deletion in the backend

**Files:**
- Modify: `backend/app/services/authorization_service.py:28-43`
- Modify: `backend/app/api/routes.py:2060-2062`
- Test: `backend/test_project_submission_new_delete.py`

**Interfaces:**
- Consumes: `AuthorizationService.ROLE_PERMISSIONS`, `models.ProjectSubmissionNew`, `get_db`, and `require_permission`.
- Produces: `DELETE /project-submissions-new/{project_id}` returning `{"deleted_project_id": project_id}` with status `200`.

- [ ] **Step 1: Write the failing authorization and route tests**

```python
from app.services.authorization_service import AuthorizationService


def test_admin_can_delete_project_submissions():
    assert AuthorizationService.check_role_permission("admin", "delete:project_submissions") is True
    assert AuthorizationService.check_role_permission("super_admin", "delete:project_submissions") is True
    assert AuthorizationService.check_role_permission("user", "delete:project_submissions") is False
```

Add a route test using a test database session that creates a `ProjectSubmissionNew` record and one `ProjectSubmissionNewMember`, calls `DELETE /project-submissions-new/{project_id}` with an admin Bearer token, and asserts `200`, `{"deleted_project_id": project_id}`, then asserts both rows are absent. Add a separate missing-id request that asserts `404` and `{"detail": "Project submission not found"}`.

- [ ] **Step 2: Run the backend test to verify it fails**

Run: `cd backend; ..\venv\Scripts\python.exe -m pytest test_project_submission_new_delete.py -q`

Expected: FAIL because `delete:project_submissions` is not granted and `DELETE /project-submissions-new/{project_id}` does not exist.

- [ ] **Step 3: Grant the permission and implement the transactional endpoint**

In `AuthorizationService.ROLE_PERMISSIONS["admin"]`, add the exact entry:

```python
"delete:project_submissions",
```

Immediately after `get_project_submission_new`, add:

```python
@router.delete("/project-submissions-new/{project_id}")
def delete_project_submission_new(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("delete:project_submissions")),
):
    submission = _get_submission_new_or_404(db, project_id)
    try:
        db.delete(submission)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete project submission")

    return {"deleted_project_id": project_id}
```

- [ ] **Step 4: Run the backend test to verify it passes**

Run: `cd backend; ..\venv\Scripts\python.exe -m pytest test_project_submission_new_delete.py -q`

Expected: PASS with all assertions green, including deletion of the member row and `404` for an absent ID.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/authorization_service.py backend/app/api/routes.py backend/test_project_submission_new_delete.py
git commit -m "feat: add authorized project submission deletion"
```

### Task 2: Add confirmed deletion UX to the project detail page

**Files:**
- Modify: `frontend/src/app/project_submission_new_view/page.tsx:3-128`
- Test: Manual browser verification at `http://localhost:3000/project_submission_new_view?id=197`

**Interfaces:**
- Consumes: `deleteWithAuth(endpoint: string): Promise<Response>` and `DELETE /project-submissions-new/{project_id}`.
- Produces: A `ลบผลงาน` button whose confirmed flow calls the endpoint, displays `ลบเสร็จแล้ว`, and navigates to `/project_submission_new_list`.

- [ ] **Step 1: Write the failing UI acceptance check**

At `http://localhost:3000/project_submission_new_view?id=197`, verify there is no `ลบผลงาน` button and that cancel/confirm/success/redirect behavior is therefore unavailable. Record the current submission `ProjectId` and title so it can be verified after the test.

- [ ] **Step 2: Implement the minimal deletion interaction**

Update the imports to:

```typescript
import Swal from "sweetalert2";
import { deleteWithAuth, getWithAuth } from "@/utils/api";
```

Add this handler before the `return` in `ViewContent`:

```typescript
const deleteSubmission = async () => {
  if (!id) return;

  const confirmResult = await Swal.fire({
    icon: "warning",
    title: "ยืนยันการลบผลงาน?",
    text: "ข้อมูลผลงานและรายชื่อสมาชิกจะถูกลบอย่างถาวร",
    showCancelButton: true,
    confirmButtonText: "ลบผลงาน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#3a3f75",
  });
  if (!confirmResult.isConfirmed) return;

  try {
    const res = await deleteWithAuth(`/project-submissions-new/${id}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.detail || "ลบผลงานไม่สำเร็จ");
    await Swal.fire({ icon: "success", title: "ลบเสร็จแล้ว" });
    router.push("/project_submission_new_list");
  } catch (e) {
    await Swal.fire({ icon: "error", title: "ลบผลงานไม่สำเร็จ", text: (e as Error).message });
  }
};
```

In the existing `.wizard-nav` block, add:

```tsx
<button type="button" className="btn btn-danger" onClick={deleteSubmission}>ลบผลงาน</button>
```

- [ ] **Step 3: Run lint to verify TypeScript and JSX quality**

Run: `cd frontend; npm run lint`

Expected: exit code `0`.

- [ ] **Step 4: Perform the browser acceptance check**

1. Visit `http://localhost:3000/project_submission_new_view?id=197` while signed in as an administrator.
2. Select `ลบผลงาน`, then select `ยกเลิก`; verify no API deletion occurs and the detail remains visible.
3. Select `ลบผลงาน`, then select `ลบผลงาน`; verify the confirmation displays before the request, then the modal title is exactly `ลบเสร็จแล้ว`.
4. Dismiss the success modal; verify URL is `http://localhost:3000/project_submission_new_list` and the deleted `ProjectId` is absent from the list.
5. Navigate again to `http://localhost:3000/project_submission_new_view?id=197`; verify the API/UI reports the missing record.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/project_submission_new_view/page.tsx
git commit -m "feat: confirm project submission deletion in detail view"
```

## Verification and rollback

- Verification: Run `cd backend; ..\venv\Scripts\python.exe -m pytest test_project_submission_new_delete.py -q` and `cd frontend; npm run lint`, then complete Task 2 Step 4 with a disposable record rather than production `ProjectId=197`.
- Backup: Export or copy the intended production record and member rows before confirmation; deletion is permanent.
- Rollback: Revert the two feature commits before deployment. If a record has already been deleted, restore it and its members from the backup because code rollback cannot recover database rows.
