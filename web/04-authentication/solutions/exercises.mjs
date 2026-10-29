import assert from "node:assert/strict";

export function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}

export function publicAlert(event) {
  if (event.success !== true) return null;
  if (typeof event.country !== "string" || event.country.length === 0) return null;
  if (event.knownCountries.includes(event.country)) return null;
  return {
    code: "new-country",
    message: "A sign-in came from a country we have not seen on this account.",
  };
}

export function logoutResult(session) {
  return { cleared: session != null };
}

assert.equal(currentUser(null, 1), null);
assert.equal(currentUser({ userId: "a", expiresAt: 5 }, 5), null);
assert.deepEqual(currentUser({ userId: "a", expiresAt: 5 }, 4), { id: "a" });
const alert = publicAlert({ success: true, country: "CA", knownCountries: ["US"], ip: "1.1.1.1" });
assert.equal(alert.message.includes("1.1.1.1"), false);
assert.equal(publicAlert({ success: true, country: "", knownCountries: [], ip: "1.1.1.1" }), null);
assert.deepEqual(logoutResult(null), { cleared: false });
assert.equal(JSON.stringify(logoutResult({ id: "secret" })).includes("secret"), false);
console.log("exercise solutions ok");
