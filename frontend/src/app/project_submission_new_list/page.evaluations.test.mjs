import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("list shows separate VP and committee result columns using only pass/fail icons", async () => {
  const pagePath = new URL("./page.tsx", import.meta.url);
  const source = await readFile(fileURLToPath(pagePath), "utf8");

  assert.match(source, /<th[^>]*>ผลประเมิน วพ\.<\/th>/);
  assert.match(source, /<th[^>]*>ผลประเมินกรรมการ<\/th>/);
  assert.match(source, /FaCheck/);
  assert.match(source, /FaTimes/);
  assert.match(source, /status === "ผ่านคัดเลือก"/);
  assert.match(source, /status === "ไม่ผ่านคัดเลือก"/);
  assert.match(source, /return null;/);
  assert.match(source, /EvaluationStatusIcon status=\{item\.VpEvaluationStatus\}/);
  assert.match(source, /EvaluationStatusIcon status=\{item\.CommitteeEvaluationStatus\}/);
});
