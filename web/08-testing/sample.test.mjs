import assert from "node:assert/strict";
import { test } from "node:test";

function guardStatus(user, allowed) {
  if (!user) return 401;
  if (!allowed) return 403;
  return 200;
}

test("signed-out user gets 401", () => {
  assert.equal(guardStatus(null, false), 401);
});

test("signed-in user without permission gets 403", () => {
  assert.equal(guardStatus({ id: "ada" }, false), 403);
});
