import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("score filters and ordering are included in list and export query params", async () => {
  const pagePath = new URL("./page.tsx", import.meta.url);
  const source = await readFile(fileURLToPath(pagePath), "utf8");

  assert.match(source, /ประเภทคะแนน/);
  assert.match(source, /value="scored">มีคะแนนแล้ว/);
  assert.match(source, /value="unscored">ยังไม่มีคะแนน/);
  assert.match(source, /value="asc">คะแนนน้อย → มาก/);
  assert.match(source, /value="desc">คะแนนมาก → น้อย/);
  assert.match(source, /params\.set\("score_status", scoreStatus\)/);
  assert.match(source, /params\.set\("score_order", scoreOrder\)/);
  assert.match(source, /score_status: scoreStatus/);
  assert.match(source, /const params = buildParams\(1\);[\s\S]*?project-submissions-new\/export/);
});
