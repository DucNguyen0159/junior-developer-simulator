import assert from "node:assert/strict";

function guardStatus(user, allowed) {
  if (!user) return 401;
  if (!allowed) return 403;
  return 200;
}

assert.equal(guardStatus(null, false), 401);
assert.equal(guardStatus({ id: "ada" }, false), 403);
assert.equal(guardStatus({ id: "ada" }, true), 200);
console.log("401, 403, and 200 checked");
console.log("examples ok");
