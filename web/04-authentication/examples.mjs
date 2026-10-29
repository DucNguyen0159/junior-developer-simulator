import assert from "node:assert/strict";

export function sessionUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}

export function alertMessage(code) {
  const messages = {
    "failed-attempts": "Several sign-in attempts failed recently.",
    "failed-then-success": "A sign-in succeeded after several recent failures.",
    "new-country": "A sign-in came from a country we have not seen on this account.",
    "impossible-travel": "Two recent sign-ins came from different countries in a short time.",
  };
  return messages[code] ?? "We noticed unusual sign-in activity.";
}

const active = sessionUser({ userId: "ada", expiresAt: 100 }, 50);
const expired = sessionUser({ userId: "ada", expiresAt: 100 }, 100);
console.log("active =>", active);
console.log("expired =>", expired);
console.log("message includes ip? =>", alertMessage("new-country").includes("1.1.1.1"));
assert.deepEqual(active, { id: "ada" });
assert.equal(expired, null);
assert.equal(alertMessage("new-country").includes("."), true);
assert.equal(/\d+\.\d+\.\d+\.\d+/.test(alertMessage("new-country")), false);
console.log("examples ok");
