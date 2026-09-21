import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("project submission list provides a link back to Idea Tank", async () => {
  const pagePath = new URL("./page.tsx", import.meta.url);
  const source = await readFile(fileURLToPath(pagePath), "utf8");

  assert.match(
    source,
    /href="\/idea_tank"[^>]*>กลับหน้าหลัก<\//,
  );
});
