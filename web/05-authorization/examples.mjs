import assert from "node:assert/strict";

export function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}

export function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}

const analyst = { id: "ada", roles: [{ name: "analyst", permissions: ["reports:read"] }], permissions: [] };
const reports = { id: "reports", public: false, permission: "reports:read" };
console.log("analyst reports =>", canAccess(analyst, reports));
console.log("stranger reports =>", canAccess(null, reports));
console.log("blank permission =>", canAccess(analyst, { id: "secret", public: false }));
assert.equal(canAccess(analyst, reports).allowed, true);
assert.equal(canAccess(null, reports).reason, "login-required");
assert.equal(canAccess(analyst, { id: "secret", public: false }).allowed, false);
console.log("examples ok");
