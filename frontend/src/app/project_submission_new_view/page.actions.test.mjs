import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("detail page shows a compact accessible delete icon after AI scoring", async () => {
  const pagePath = new URL("./page.tsx", import.meta.url);
  const cssPath = new URL("../project_submission_new/project_submission_new.css", import.meta.url);
  const [source, styles] = await Promise.all([
    readFile(fileURLToPath(pagePath), "utf8"),
    readFile(fileURLToPath(cssPath), "utf8"),
  ]);

  const scoreAction = source.indexOf("onClick={scoreSubmission}");
  const deleteAction = source.indexOf("onClick={deleteSubmission}");
  assert.ok(scoreAction >= 0 && deleteAction > scoreAction, "delete action should follow AI scoring");
  assert.match(source, /className="btn btn-danger btn-icon-only"[\s\S]*?aria-label=/);
  assert.match(source, /<FaTrash aria-hidden="true"\s*\/>/);
  assert.match(styles, /\.ps-wizard \.btn-icon-only\s*\{[^}]*width:\s*48px;[^}]*min-width:\s*48px;[^}]*height:\s*48px;[^}]*padding:\s*0;/s);
});

test("AI scoring and delete actions share a right-side action group", async () => {
  const pagePath = new URL("./page.tsx", import.meta.url);
  const source = await readFile(fileURLToPath(pagePath), "utf8");
  const actionGroup = source.match(/<div className="view-action-group">([\s\S]*?)<\/div>/);

  assert.ok(actionGroup, "AI and delete actions should have a shared action group");
  const scoreAction = actionGroup[1].indexOf("onClick={scoreSubmission}");
  const deleteAction = actionGroup[1].indexOf("onClick={deleteSubmission}");
  assert.ok(scoreAction >= 0 && deleteAction > scoreAction, "AI action should be immediately before delete");
});

test("detail page exposes role-specific persisted evaluation forms", async () => {
  const pagePath = new URL("./page.tsx", import.meta.url);
  const [source, permissions] = await Promise.all([
    readFile(fileURLToPath(pagePath), "utf8"),
    readFile(fileURLToPath(new URL("../../utils/permissions.ts", import.meta.url)), "utf8"),
  ]);

  assert.match(source, /บันทึกผลการประเมินโดย วพ\./);
  assert.match(source, /บันทึกผลการประเมินโดยกรรมการ/);
  assert.match(source, /putWithAuth\(`\/project-submissions-new\/\$\{id\}\/vp-evaluation`/);
  assert.match(source, /putWithAuth\(`\/project-submissions-new\/\$\{id\}\/committee-evaluation`/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /event\.key === "Tab"/);
  assert.match(permissions, /canEvaluateProjectSubmissionVp/);
  assert.match(permissions, /canEvaluateProjectSubmissionCommittee/);
});
