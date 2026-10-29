import assert from "node:assert/strict";
import { test } from "node:test";

export function register(api) {
  const analyst = {
    id: "ada",
    permissions: [],
    roles: [{ name: "analyst", permissions: ["reports:read"] }],
  };

  test("a missing page is denied", () => {
    assert.deepEqual(api.canAccess(analyst, null), { allowed: false, reason: "unknown-page" });
  });

  test("a public page allows a signed-out user", () => {
    assert.equal(api.canAccess(null, { id: "home", public: true }).allowed, true);
  });

  test("a private page with no user asks for login", () => {
    const decision = api.canAccess(null, { id: "reports", public: false, permission: "reports:read" });
    assert.equal(decision.reason, "login-required");
    assert.equal(api.guard(null, { id: "reports", public: false, permission: "reports:read" }).status, 401);
  });

  test("a blank permission is denied even for a signed-in user", () => {
    assert.equal(api.canAccess(analyst, { id: "secret", public: false }).reason, "deny-by-default");
  });

  test("role permissions allow the page", () => {
    const page = { id: "reports", public: false, permission: "reports:read" };
    assert.equal(api.canAccess(analyst, page).reason, "permitted");
    assert.equal(api.guard(analyst, page).status, 200);
  });

  test("permission names are case-sensitive", () => {
    const page = { id: "reports", public: false, permission: "Reports:read" };
    assert.equal(api.canAccess(analyst, page).allowed, false);
  });

  test("an admin name is not a bypass", () => {
    const admin = { id: "bea", permissions: [], roles: [{ name: "admin", permissions: [] }] };
    const page = { id: "reports", public: false, permission: "reports:read" };
    assert.equal(api.canAccess(admin, page).allowed, false);
    assert.equal(api.guard(admin, page).status, 403);
  });

  test("direct permissions count", () => {
    const user = { id: "cy", permissions: ["billing:read"], roles: [] };
    assert.equal(api.canAccess(user, { public: false, permission: "billing:read" }).allowed, true);
  });

  test("visiblePages keeps order and does not mutate", () => {
    const pages = [
      { id: "home", public: true },
      { id: "reports", public: false, permission: "reports:read" },
      { id: "secret", public: false },
    ];
    const visible = api.visiblePages(analyst, pages);
    assert.deepEqual(visible.map((page) => page.id), ["home", "reports"]);
    assert.equal(pages.length, 3);
  });
}
