# Project Submission Score Filters and Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add score-presence filtering and score ordering to the ProjectSubmissionNew list, and include score plus summary in its Excel export.

**Architecture:** Keep the existing list and export endpoints as the source of truth. Pass the active score filters through the existing query-string builder, and share backend score filtering/ordering helpers between list and export so both use the same criteria. Reuse existing `AiScore` and `AiIdeaSummary` columns; no schema migration is needed.

**Tech Stack:** Next.js/React, TypeScript, FastAPI, SQLAlchemy, pandas/openpyxl, Node `node:test`, Python `unittest`.

## Global Constraints

- Score-status values are `scored` and `unscored`; score-order values are `asc` and `desc`.
- “มีคะแนนแล้ว” means `AiScore IS NOT NULL`; “ยังไม่มีคะแนน” means `AiScore IS NULL`.
- When score ordering is selected, null scores remain after scored rows; ties use `CreatedAt DESC`, then `ProjectId DESC`.
- Excel headers for the added fields are exactly `Score` and `Summary`, sourced from `AiScore` and `AiIdeaSummary`.
- The existing batch-score action honors the selected score-status filter; score ordering controls list/export order only.
- Existing filters, pagination defaults, default list/export ordering, access control, export filename, and AI scoring behavior remain unchanged.
- Do not alter database schema or run migrations; both data fields already exist.

---

### Task 1: Add shared backend score filters and ordering

**Files:**
- Modify: `backend/app/api/routes.py`
- Create: `backend/app/services/project_submission_new_query.py`
- Test: `backend/test_project_submission_new_list_filters.py`

**Interfaces:**
- `score_status: Optional[Literal["scored", "unscored"]]` and `score_order: Optional[Literal["asc", "desc"]]` are accepted by the list and export endpoints; batch scoring accepts the same optional `score_status`.
- `apply_project_submission_score_status_filter(query, score_column, score_status)` adds the null/not-null predicate and returns the query.
- `apply_project_submission_score_order(query, score_column, created_at_column, project_id_column, score_order)` adds stable null-last score ordering and returns the query.

- [x] Write a unit test with a recording query to verify `scored`/`unscored` generate `IS NOT NULL`/`IS NULL` and `asc`/`desc` order by `AiScore` in the requested direction with a null-last expression.
- [x] Run `python -m unittest test_project_submission_new_list_filters -v` from `backend`; confirm the missing helper contract fails.
- [x] Implement the helpers in `backend/app/services/project_submission_new_query.py` with SQLAlchemy `case((score_column.is_(None), 1), else_=0)`, the requested score direction, and deterministic `CreatedAt DESC`, `ProjectId DESC` tie-breakers. Preserve list default `CreatedAt DESC` and export default `ProjectId DESC` in `backend/app/api/routes.py`.
- [x] Apply the same status filter helper in list, export, and batch-score; apply score ordering in list/export only. Leave `count`, pagination, batch limit, and existing filters intact.
- [x] Rerun `python -m unittest test_project_submission_new_list_filters -v`; expect all focused backend tests to pass.

### Task 2: Add score controls to the list and query string

**Files:**
- Modify: `frontend/src/app/project_submission_new_list/page.tsx`
- Modify: `frontend/src/app/project_submission_new/project_submission_new.css`
- Test: `frontend/src/app/project_submission_new_list/page.filters.test.mjs`

**Interfaces:**
- Add selectors for all/scored/unscored and default/ascending/descending score order.
- Extend `buildParams` with `score_status` and `score_order`; both list fetch and export already consume this builder. Pass `score_status` in the batch-score body so its eligibility matches the selected status filter.

- [x] Add a source-contract regression test for the Thai filter labels, parameter names, and shared use of `buildParams` by list/export.
- [x] Run `node --test src/app/project_submission_new_list/page.filters.test.mjs` from `frontend`; confirm it fails before the controls exist.
- [x] Add controlled selector state, query parameters, effect dependencies, and two responsive filter-grid columns while preserving existing search/filter behavior.
- [x] Rerun the focused frontend test; expect it to pass.

### Task 3: Add Score and Summary columns to Excel export

**Files:**
- Modify: `backend/app/api/routes.py`
- Test: `backend/test_project_submission_new_list_filters.py`

**Interfaces:**
- Export adds `Score` from `AiScore` and `Summary` from `AiIdeaSummary`.
- Export applies the same score-status and ordering parameters as the list; page and page-size parameters remain excluded by the existing frontend export handler.

- [x] Add a failing assertion that the export column map contains exactly the `Score`/`Summary` headers for `AiScore`/`AiIdeaSummary`.
- [x] Run the focused backend test and confirm the export-column assertion fails before implementation.
- [x] Add the two export columns and ensure the existing row projection includes their values.
- [x] Run `python -m unittest test_project_submission_new_list_filters -v` from `backend`; expect all focused backend tests to pass.

### Final verification

- [x] Run the focused frontend and backend tests.
- [x] Run `npm run lint -- src/app/project_submission_new_list/page.tsx` and `npx tsc --noEmit` from `frontend`.
- [x] Run `git diff --check` for the touched files and inspect the final diff for unintended schema or scoring changes.
