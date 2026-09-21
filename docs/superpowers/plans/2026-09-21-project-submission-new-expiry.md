# Project Submission New Expiry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a closed-registration page when `/project_submission_new` is disabled by a local flag.

**Architecture:** Keep the switch in the submission route as the requested `flag_expire` boolean. When enabled it redirects to a dedicated static Next.js route, which reuses the established IDEA Tank visual styles without fetching or exposing submission data.

**Tech Stack:** Next.js 15.5.21, React 19.1.2, TypeScript 5, existing project submission CSS.

## Global Constraints

- Keep `flag_expire` in `frontend/src/app/project_submission_new/page.tsx` for future manual enable/disable.
- Redirect `/project_submission_new` to `/project_submission_new_expire` when the flag is `true`.
- Preserve existing in-progress work outside the files listed below.

---

### Task 1: Add the expiry route and route switch

**Files:**
- Create: `frontend/src/app/project_submission_new_expire/page.tsx`
- Modify: `frontend/src/app/project_submission_new/page.tsx`
- Test: `cd frontend; npx tsc --noEmit`

**Interfaces:**
- Consumes: `redirect(path: string): never` from `next/navigation`, `kanit` and `project_submission_new.css` from the existing submission feature.
- Produces: `/project_submission_new_expire`, a static closed-registration page; `flag_expire`, a boolean switch in the submission page.

- [ ] **Step 1: Add the failing route-switch expectation**

Check that `frontend/src/app/project_submission_new/page.tsx` does not yet define `const flag_expire = true` or redirect to `/project_submission_new_expire`.

- [ ] **Step 2: Implement the route switch**

Add this import and declaration to the submission page:

```tsx
import { redirect, useRouter } from "next/navigation";

const flag_expire = true;
```

At the start of the page component, add:

```tsx
if (flag_expire) {
  redirect("/project_submission_new_expire");
}
```

- [ ] **Step 3: Implement the expiry page**

Create a static page that imports the existing Kanit font and `project_submission_new.css`, presents the IDEA Tank label, and uses a Thai `<h1>` with `หมดเวลารับสมัครแล้ว` plus a short explanatory sentence.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `cd frontend; npx tsc --noEmit`

Expected: exit code `0`.
