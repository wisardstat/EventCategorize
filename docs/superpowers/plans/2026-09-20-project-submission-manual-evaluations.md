# Project Submission Manual Evaluations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add separate, role-protected วพ. and committee evaluation forms to the new project submission detail page and persist their outcomes in `dbo.ProjectSubmissionNew`.

**Architecture:** Add four nullable Unicode fields for each evaluator's status and comment, with an idempotent transactional SQL Server migration and matching ORM/response schema. Add two authenticated PUT endpoints that enforce the example page's role matrix on the server; the detail page exposes matching buttons, preloads saved data, saves asynchronously, and displays both saved evaluations.

**Tech Stack:** FastAPI, Pydantic, SQLAlchemy, Microsoft SQL Server, Next.js 15, React 19, TypeScript, SweetAlert2.

## Global Constraints

- วพ. evaluator roles: `admin`, `superuser`.
- Committee evaluator roles: `admin`, `superuser_md`.
- Evaluation status options follow `idea_tank_detail`: วพ. = `ส่งแนวคิด`, `ผ่านคัดเลือก`, `ไม่ผ่านคัดเลือก`; committee = `ผ่านคัดเลือก`, `ไม่ผ่านคัดเลือก`.
- Existing rows remain valid; all new evaluation columns are nullable and have no default.
- Thai status/comment text must use SQL Server Unicode column types.
- UI role gating is convenience only; both API routes must independently require a valid Bearer token and matching role.
- Never run a schema migration against the configured database during implementation; provide explicit backup, verification, and rollback commands.

---

### Task 1: Define evaluation contracts and add regression tests

**Files:**
- Modify: `backend/app/db/schemas.py`
- Modify: `backend/app/api/routes.py`
- Create: `backend/app/services/project_submission_new_evaluation.py`
- Modify: `frontend/src/app/project_submission_new_view/page.actions.test.mjs`
- Test: `backend/test_project_submission_new_evaluations.py`

**Interfaces:**
- `PUT /project-submissions-new/{project_id}/vp-evaluation` accepts `{status: null | "ส่งแนวคิด" | "ผ่านคัดเลือก" | "ไม่ผ่านคัดเลือก", comment: string | null}`.
- `PUT /project-submissions-new/{project_id}/committee-evaluation` accepts `{status: null | "ผ่านคัดเลือก" | "ไม่ผ่านคัดเลือก", comment: string | null}`.
- Both return `ProjectSubmissionNewOut`; missing IDs return 404 and disallowed roles return 403.

- [x] Add backend contract tests for the four ORM/schema fields, both route paths, bearer-user dependency, role allowlists, and rejection of unsupported statuses.
- [x] Add frontend source-contract tests for both buttons, role helpers, route names, saved values, and modal accessibility.
- [x] Run those tests and confirm they fail before implementing behavior.

### Task 2: Persist evaluation fields and expose authorized APIs

**Files:**
- Modify: `backend/app/db/models.py`
- Modify: `backend/app/db/schemas.py`
- Modify: `backend/app/api/routes.py`
- Modify: `db/new_projectsubmission.sql`
- Create: `backend/migrate_project_submission_new_evaluations.py`
- Test: `backend/test_project_submission_new_evaluations.py`

**Interfaces:**
- ORM/response fields: `VpEvaluationStatus`, `VpEvaluationComment`, `CommitteeEvaluationStatus`, `CommitteeEvaluationComment`.
- API role checks use `get_current_user_with_permissions` and JWT `payload.role`; `app/services/project_submission_new_evaluation.py` exposes a testable role guard with VP allowlist `{"admin", "superuser"}` and committee allowlist `{"admin", "superuser_md"}`.
- Migration checks each field with `COL_LENGTH`, creates a timestamped full-table backup before altering, and performs backup plus DDL in one `engine.begin()` transaction.

- [x] Add nullable `Unicode(100)` / `UnicodeText` ORM columns and response schema fields.
- [x] Add matching `NVARCHAR(100)` / `NVARCHAR(MAX)` columns to the base DDL.
- [x] Implement an idempotent migration and document verify query plus rollback statements in its module docstring.
- [x] Add two PUT handlers that validate requested role, update only that evaluator's fields, commit atomically, and return the refreshed detail.
- [x] Run the targeted backend tests and verify migration script syntax without connecting to or modifying the live database.

### Task 3: Add evaluator forms and saved result display

**Files:**
- Modify: `frontend/src/utils/permissions.ts`
- Modify: `frontend/src/app/project_submission_new_view/page.tsx`
- Modify: `frontend/src/app/project_submission_new/detail-shared.tsx`
- Modify: `frontend/src/app/project_submission_new_view/page.actions.test.mjs`

**Interfaces:**
- Permission helpers: `canEvaluateProjectSubmissionVp()` and `canEvaluateProjectSubmissionCommittee()`.
- The page uses `putWithAuth`, refreshes `data` from each successful PUT response, and shows an accessible modal with status, comment, save/loading/error states.
- Read-only detail cards show both saved statuses and comments, including a clear empty-state label when not yet evaluated.

- [x] Add permission helpers matching the two role allowlists.
- [x] Add buttons and separate modals; initialize form values from the loaded submission and prevent repeat saves while pending.
- [x] Render both persisted evaluations in the detail cards; ensure modal labels, close controls, and focusable native controls are accessible.
- [x] Run frontend contract tests and the project TypeScript/build checks.

### Task 4: Verify migration safety and complete the checks

- [x] Run focused Python and Node tests, then project lint/type/build checks available in `frontend/package.json`.
- [x] Review the diff to ensure unrelated dirty worktree changes remain untouched.
- [x] Report the exact migration command, backup table behavior, verification query, and rollback SQL; do not run the migration automatically.
