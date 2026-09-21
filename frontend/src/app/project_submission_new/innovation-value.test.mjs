import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowInnovationValueContent } from "./innovation-value.ts";

test("shows stored innovation detail even when its checkbox is not selected", () => {
  assert.equal(shouldShowInnovationValueContent(false, false, "stored detail"), true);
});
