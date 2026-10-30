# Authorization

Authorization answers "may this user do this?". The server asks it on every protected request. The UI may hide a link. Hiding a link is not the check.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`.

## 1. RBAC

### Concept

Role-based access control: a user has roles, a role has permissions, and a page or action requires one permission. A user may also have permissions assigned directly. Union the direct permissions with the role permissions. There is no hidden admin bypass. If admin should see a page, admin's role lists that permission.

### Terms

| Piece | Example |
| --- | --- |
| Permission | `"reports:read"` |
| Role | `{ name: "analyst", permissions: ["reports:read"] }` |
| User | `{ id: "ada", roles: [analyst], permissions: [] }` |
| Page | `{ id: "reports", public: false, permission: "reports:read" }` |

### Methods

| Function | What it returns |
| --- | --- |
| `permissionsFor(user)` | A `Set` of the direct permissions plus every `role.permissions` |
| Missing `permissions` or `roles` | An empty array. The set can still be empty |

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
```

### Examples

**Case: direct permissions and role permissions are one set**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
const user = {
  permissions: ["billing:read"],
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
};
const set = permissionsFor(user);
```

Result: `set.has("billing:read")` is `true`. `set.has("reports:read")` is `true`. `set.size` is `2`.

Why: the set is the union. A direct permission and a role permission both count.

**Case: a role permission is enough**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
const analyst = {
  id: "ada",
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
  permissions: [],
};
const allowed = permissionsFor(analyst).has("reports:read");
```

Result: `true`.

Why: `permissions` is empty. `"reports:read"` still arrives through the analyst role.

**Case: a direct permission is enough**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
const user = { id: "bea", roles: [], permissions: ["reports:read"] };
const allowed = permissionsFor(user).has("reports:read");
```

Result: `true`.

Why: the union includes `user.permissions` even when `roles` is empty.

**Case: the name `admin` grants nothing by itself**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
const admin = { id: "ada", roles: [{ name: "admin", permissions: [] }], permissions: [] };
const allowed = permissionsFor(admin).has("reports:read");
```

Result: `false`.

Why: there is no admin bypass. The role name is not a permission. The permission list is empty, so the set does not contain `"reports:read"`.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Treating the role name `admin` as every permission | A role with an empty list walks into every page | Require `page.permission` in the union |
| Reading only `user.permissions` | Role permissions are ignored | Union `role.permissions` into the same set |
| Reading only roles | A direct permission is ignored | Start the set from `user.permissions` |

### Tip

Missing `permissions` and missing `roles` count as empty arrays. `permissionsFor({ id: "ada" })` is an empty set.

### Practice

Build the set for `{ permissions: ["billing:read"], roles: [{ permissions: ["reports:read"] }] }` and check both strings.

### Solution

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
const set = permissionsFor({
  permissions: ["billing:read"],
  roles: [{ permissions: ["reports:read"] }],
});
```

Result: both `set.has("billing:read")` and `set.has("reports:read")` are `true`.

## 2. ACL versus RBAC

### Concept

An ACL is attached to the resource: this person may read this report. RBAC is attached to the job: analysts may read reports. The junior default is RBAC when the scenario gives roles, and an ACL only when the scenario gives per-resource grants. If the scenario gives both, a user can access when either grant allows. If it gives neither, deny.

### Terms

| | ACL | RBAC |
| --- | --- | --- |
| Attached to | The resource: "ada may read report 9" | The job: "analysts may read reports" |
| Changes when | One person's access changes | A job's duties change |
| Junior assessment default | Use it only if the scenario gives per-resource grants | Use it when the scenario gives roles |

### Methods

| Input | Decision |
| --- | --- |
| Roles only | Allow when the role permission list contains the needed permission |
| Grants only | Allow when the grant list contains the user id |
| Both | Allow when either one allows |
| Neither | Deny |

### Examples

**Case: roles only**

```javascript
function can(userId, needed, rolePermissions, grants) {
  const hasRoles = rolePermissions != null;
  const hasGrants = grants != null;
  const byRole = hasRoles && rolePermissions.includes(needed);
  const byAcl = hasGrants && grants.includes(userId);
  if (hasRoles && hasGrants) return byRole || byAcl;
  if (hasRoles) return byRole;
  if (hasGrants) return byAcl;
  return false;
}
const allowed = can("ada", "reports:read", ["reports:read"], null);
```

Result: `true`.

Why: the scenario gave roles and no grants. The role list contains `"reports:read"`.

**Case: grants only**

```javascript
function can(userId, needed, rolePermissions, grants) {
  const hasRoles = rolePermissions != null;
  const hasGrants = grants != null;
  const byRole = hasRoles && rolePermissions.includes(needed);
  const byAcl = hasGrants && grants.includes(userId);
  if (hasRoles && hasGrants) return byRole || byAcl;
  if (hasRoles) return byRole;
  if (hasGrants) return byAcl;
  return false;
}
const allowed = can("ada", "reports:read", null, ["ada"]);
```

Result: `true`.

Why: the scenario gave an ACL and no roles. The grant list contains `"ada"`.

**Case: both, and either grant is enough**

```javascript
function can(userId, needed, rolePermissions, grants) {
  const hasRoles = rolePermissions != null;
  const hasGrants = grants != null;
  const byRole = hasRoles && rolePermissions.includes(needed);
  const byAcl = hasGrants && grants.includes(userId);
  if (hasRoles && hasGrants) return byRole || byAcl;
  if (hasRoles) return byRole;
  if (hasGrants) return byAcl;
  return false;
}
const byGrant = can("ada", "reports:read", ["billing:read"], ["ada"]);
const byNeither = can("ada", "reports:read", ["billing:read"], ["bea"]);
```

Result: `byGrant` is `true`. `byNeither` is `false`.

Why: when both lists exist, either one can allow. Here the role list misses the permission and the grant list misses the user, so the second call denies.

**Case: neither list means deny**

```javascript
function can(userId, needed, rolePermissions, grants) {
  const hasRoles = rolePermissions != null;
  const hasGrants = grants != null;
  const byRole = hasRoles && rolePermissions.includes(needed);
  const byAcl = hasGrants && grants.includes(userId);
  if (hasRoles && hasGrants) return byRole || byAcl;
  if (hasRoles) return byRole;
  if (hasGrants) return byAcl;
  return false;
}
const allowed = can("ada", "reports:read", null, null);
```

Result: `false`.

Why: the scenario gave neither roles nor grants. The result is deny.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Using RBAC when the scenario only gave grants | The role check denies a person the ACL allows | Read the grant list |
| Allowing when both lists are missing | An unspecified page opens | Deny when the scenario gives neither |
| Requiring both grants when the scenario gave both | A valid role is blocked by an empty ACL | Allow when either grant allows |

### Tip

The page checks in the next section are the RBAC default for this folder: one permission on the page, union of role and direct permissions on the user.

### Practice

`can("ada", "reports:read", ["billing:read"], ["bea"])` with the function above.

### Solution

```javascript
function can(userId, needed, rolePermissions, grants) {
  const hasRoles = rolePermissions != null;
  const hasGrants = grants != null;
  const byRole = hasRoles && rolePermissions.includes(needed);
  const byAcl = hasGrants && grants.includes(userId);
  if (hasRoles && hasGrants) return byRole || byAcl;
  if (hasRoles) return byRole;
  if (hasGrants) return byAcl;
  return false;
}
const allowed = can("ada", "reports:read", ["billing:read"], ["bea"]);
```

Result: `false`.

## 3. Deny by default

### Concept

`canAccess` checks in this order. Comparison is case-sensitive. There is no admin bypass.

1. No page: deny `unknown-page`.
2. `page.public === true`: allow `public`.
3. No user: deny `login-required`.
4. Permission missing or `""`: deny `deny-by-default`.
5. The user has `page.permission` in the union of role permissions and direct permissions: allow `permitted`.
6. Otherwise: deny `forbidden`.

Unknown pages are not public. An empty permission is not "anyone logged in." `"Reports:read"` is not `"reports:read"`.

### Terms

| Situation | Result | Reason |
| --- | --- | --- |
| Page is missing | Deny | `unknown-page` |
| `page.public === true` | Allow | `public` |
| No user, page is not public | Deny | `login-required` |
| `permission` is missing or `""` | Deny | `deny-by-default` |
| The user's set contains `page.permission` | Allow | `permitted` |
| User is known and lacks the permission | Deny | `forbidden` |

### Methods

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}

function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
```

`unknown-page` and `forbidden` are HTTP 403. `login-required` is 401. Allowed is 200. The guard in section 6 applies those statuses.

### Examples

**Case: no page, then a public page**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
const missing = canAccess({ id: "ada", permissions: [], roles: [] }, null);
const home = canAccess(null, { id: "home", public: true });
const stringPublic = canAccess(null, { public: "true" });
```

Result: `missing` is `{ allowed: false, reason: "unknown-page" }`. `home` is `{ allowed: true, reason: "public" }`. `stringPublic` is `{ allowed: false, reason: "login-required" }`.

Why: a missing page stops at step 1. `page.public === true` is step 2, so a signed-out user still gets a public page. The string `"true"` is not `true`, so that page is not public and step 3 denies it.

**Case: no user, then a blank permission**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
const analyst = {
  id: "ada",
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
  permissions: [],
};
const signedOut = canAccess(null, { id: "reports", public: false, permission: "reports:read" });
const blank = canAccess(analyst, { id: "secret", public: false });
const empty = canAccess(analyst, { id: "secret", public: false, permission: "" });
```

Result: `signedOut.reason` is `"login-required"`. `blank.reason` is `"deny-by-default"`. `empty.reason` is `"deny-by-default"`. All three have `allowed: false`.

Why: step 3 runs only after the page exists and is not public. Step 4 runs for a known user when `permission` is missing or `""`. An empty permission does not mean every logged-in user.

**Case: the union allows the page**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
const reports = { id: "reports", public: false, permission: "reports:read" };
const byRole = canAccess(
  { id: "ada", roles: [{ name: "analyst", permissions: ["reports:read"] }], permissions: [] },
  reports,
);
const byDirect = canAccess(
  { id: "bea", roles: [], permissions: ["reports:read"] },
  reports,
);
```

Result: both decisions are `{ allowed: true, reason: "permitted" }`.

Why: step 5 uses the same union as `permissionsFor`. The role list and the direct list are both enough.

**Case: case and the admin name both fail closed**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
const analyst = {
  id: "ada",
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
  permissions: [],
};
const wrongCase = canAccess(analyst, { id: "reports", public: false, permission: "Reports:read" });
const admin = canAccess(
  { id: "ada", roles: [{ name: "admin", permissions: [] }], permissions: [] },
  { id: "reports", public: false, permission: "reports:read" },
);
const missingPermission = canAccess(analyst, { id: "billing", public: false, permission: "billing:read" });
```

Result: `wrongCase`, `admin`, and `missingPermission` are each `{ allowed: false, reason: "forbidden" }`.

Why: `"Reports:read"` is a different string from `"reports:read"`. The admin role has an empty permission list, so step 5 fails. A known user who lacks the permission is `forbidden`, which is HTTP 403.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Treating a missing page as public | `canAccess` allows a bad id | Step 1 returns `unknown-page` |
| Treating a missing `permission` as open to every logged-in user | A private page with no rule is allowed | Step 4 returns `deny-by-default` |
| Comparing permissions with the wrong case | `"Reports:read"` passes or `"reports:read"` fails by accident | Compare with `===` or `Set.has`. The check is case-sensitive |
| An admin shortcut that is not in the data | The next role named `admin` or `administrator` skips the rules | Allow only when the union contains `page.permission` |

### Tip

Public is checked before the user. A public page allows a signed-out caller. A private page with no user is `login-required`, not `forbidden`.

### Practice

`canAccess(null, { id: "reports", public: false, permission: "reports:read" })` with the function in this section.

### Solution

```javascript
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  return { allowed: false, reason: "forbidden" };
}
const decision = canAccess(null, { id: "reports", public: false, permission: "reports:read" });
```

Result: `{ allowed: false, reason: "login-required" }`.

The practice function stops early for a missing user, which is step 3. It does not need the permission set for this input.

## 4. Frontend versus backend

### Concept

The frontend asks what to render. The backend asks whether this request may proceed. Hiding a link is not the check. Do not trust `user.role` from a JSON body. The session supplies the user, and the same `canAccess` rules run on the server. No user is 401. A user who lacks the permission is 403. Allowed is 200.

### Terms

| | Frontend | Backend |
| --- | --- | --- |
| Question | What should we render? | May this request proceed? |
| Input | A user object the server already sent | The session, then the same rules |
| If it is wrong | A user sees a link that will fail | A user gets data they must not have |
| Status | Not an HTTP status | 401 if no user, 403 if the user lacks permission, 200 if allowed |

### Methods

| Situation | Status |
| --- | --- |
| No page, or `forbidden`, or `deny-by-default` | 403 |
| `login-required` | 401 |
| `public` or `permitted` | 200 |

### Examples

**Case: the client can send any role**

```javascript
function roleFromBody(body) {
  return body.role;
}
function roleFromSession(session) {
  if (!session) return null;
  return session.role;
}
const claimed = roleFromBody({ role: "admin" });
const sessionRole = roleFromSession(null);
```

Result: `claimed` is `"admin"`. `sessionRole` is `null`.

Why: the client chose `body.role`. The guard uses the session user. A missing session has no role.

**Case: a hidden link still needs the API check**

```javascript
function uiShowsLink(decision) {
  return decision.allowed;
}
function apiStatus(decision) {
  if (decision.allowed) return 200;
  if (decision.reason === "login-required") return 401;
  return 403;
}
const decision = { allowed: false, reason: "forbidden" };
const shown = uiShowsLink(decision);
const status = apiStatus(decision);
```

Result: `shown` is `false`. `status` is `403`.

Why: the UI can hide the link. The API still returns 403. A client can call the API directly and skip the nav.

**Case: no user is 401**

```javascript
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  return { allowed: false, reason: "forbidden" };
}
const result = guard(null, { id: "reports", public: false, permission: "reports:read" });
```

Result: `{ status: 401, decision: { allowed: false, reason: "login-required" } }`.

Why: there is no authenticated user. 403 would mean the user is known and forbidden. This page is private, so the public step does not allow it.

**Case: a public page with no user is 200**

```javascript
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const result = guard(null, { id: "home", public: true });
```

Result: `{ status: 200, decision: { allowed: true, reason: "public" } }`.

Why: step 2 allows the page before the user check. Allowed is 200.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Checking the role only in the router | A client can call the API directly | Run `canAccess` on the server |
| Trusting `user.role` from the JSON body | The client chose that field | Load the user from the session |
| 403 when there is no session | The client cannot tell "please log in" from "you are not allowed" | 401 when the reason is `login-required` |
| Admin shortcut that is not in the data | A role named `admin` skips the rules | Allow only through the permission union |

### Tip

The frontend may hide a link after the server says `allowed` is false. The hide is a display choice. The status comes from `guard`.

### Practice

`guard(null, { public: false, permission: "reports:read" })` with the functions in the last two cases.

### Solution

```javascript
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const result = guard(null, { public: false, permission: "reports:read" });
```

Result: `{ status: 401, decision: { allowed: false, reason: "login-required" } }`.

## 5. Failures worth naming

### Concept

These are bugs in the check, not techniques to copy. A page that loads any id still needs the permission. A button the UI hides still needs `canAccess` on the API. A missing permission means deny. Roles are loaded on the server from the session user.

### Terms

| Bug | Safer rule |
| --- | --- |
| The page loads any id and returns it | Also require that this user may read that id |
| The UI hides the button and the API does not check | The API runs the same `canAccess` |
| A missing permission means allow | A missing permission means deny |
| Roles are read from a cookie the browser can edit | Roles are loaded on the server from the session user |

### Methods

| Check | Result for a private page |
| --- | --- |
| Permission field missing | `deny-by-default` |
| User lacks the permission | `forbidden` |
| API skips `canAccess` | The handler runs. That is the bug |
| Role taken from the JSON body | The client chose it. Ignore it |

### Examples

**Case: a missing permission denies**

```javascript
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  return { allowed: false, reason: "forbidden" };
}
const decision = canAccess(
  { id: "ada", permissions: ["reports:read"], roles: [] },
  { id: "secret", public: false },
);
```

Result: `{ allowed: false, reason: "deny-by-default" }`.

Why: the user is known and even has a permission, and the page still has no `permission` field. A missing permission means deny.

**Case: the API runs the same decision the UI used to hide the button**

```javascript
function canAccess(user, page) {
  if (!user) return { allowed: false, reason: "login-required" };
  if (!user.permissions.includes(page.permission)) {
    return { allowed: false, reason: "forbidden" };
  }
  return { allowed: true, reason: "permitted" };
}
const page = { id: "reports", public: false, permission: "reports:read" };
const user = { permissions: [] };
const decision = canAccess(user, page);
const uiHidesButton = decision.allowed === false;
const apiStatus = decision.reason === "forbidden" ? 403 : 401;
```

Result: `uiHidesButton` is `true`. `apiStatus` is `403`.

Why: hiding the button and returning 403 are the same decision. An API that skips `canAccess` would run the handler anyway.

**Case: the role comes from the session**

```javascript
function userForRequest(sessionUser, body) {
  return sessionUser;
}
const user = userForRequest(
  { id: "ada", roles: [{ name: "analyst", permissions: ["reports:read"] }] },
  { role: "admin" },
);
```

Result: `user.roles[0].name` is `"analyst"`. `body.role` is not copied onto `user`.

Why: the JSON body said `"admin"`. The session user is the analyst. Roles are loaded from that user.

**Case: knowing the id is not the same as being allowed to read it**

```javascript
function canAccess(user, page) {
  if (!user) return { allowed: false, reason: "login-required" };
  const set = new Set(user.permissions ?? []);
  if (!set.has(page.permission)) return { allowed: false, reason: "forbidden" };
  return { allowed: true, reason: "permitted" };
}
const decision = canAccess(
  { id: "ada", permissions: [] },
  { id: "report-9", public: false, permission: "reports:read" },
);
```

Result: `{ allowed: false, reason: "forbidden" }`.

Why: the caller named a real id. The permission is still required. Loading the row by id without this check is the bug.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Returning the row for any id | A user reads a report they must not have | Run `canAccess` for that page's permission |
| Hiding the button and skipping the API check | A direct request succeeds | Call the same `canAccess` in the handler |
| Allowing when `permission` is missing | A private page becomes public to every user | Return `deny-by-default` |

### Tip

`unknown-page` and `forbidden` are both 403. The caller is not owed a list of real page ids.

### Practice

`canAccess({ permissions: [] }, { permission: "reports:read" })` with the function from the last case.

### Solution

```javascript
function canAccess(user, page) {
  const set = new Set(user.permissions ?? []);
  if (!set.has(page.permission)) return { allowed: false, reason: "forbidden" };
  return { allowed: true, reason: "permitted" };
}
const decision = canAccess({ permissions: [] }, { permission: "reports:read" });
```

Result: `{ allowed: false, reason: "forbidden" }`.

## 6. A guard function

### Concept

`guard` turns a `canAccess` decision into a status. Allowed is 200. `login-required` is 401. Every other denial is 403, including `unknown-page`, `deny-by-default`, and `forbidden`.

```javascript
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
```

### Terms

| Reason | Status |
| --- | --- |
| `public` | 200 |
| `permitted` | 200 |
| `login-required` | 401 |
| `unknown-page` | 403 |
| `deny-by-default` | 403 |
| `forbidden` | 403 |

### Methods

The function above is the whole guard. It returns `{ status, decision }`. It does not throw a string. It does not return the permission list.

### Examples

**Case: a permitted user gets 200**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const analyst = {
  id: "ada",
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
  permissions: [],
};
const result = guard(analyst, { id: "reports", public: false, permission: "reports:read" });
```

Result: `{ status: 200, decision: { allowed: true, reason: "permitted" } }`.

Why: `decision.allowed` is true, so the first line of `guard` returns 200.

**Case: a signed-out user gets 401**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const result = guard(null, { id: "reports", public: false, permission: "reports:read" });
```

Result: `{ status: 401, decision: { allowed: false, reason: "login-required" } }`.

Why: the reason is `login-required`, so `guard` returns 401. That is the only denial that is 401.

**Case: an unknown page is 403**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const result = guard(
  { id: "ada", roles: [{ permissions: ["reports:read"] }], permissions: [] },
  null,
);
```

Result: `{ status: 403, decision: { allowed: false, reason: "unknown-page" } }`.

Why: `unknown-page` is not `login-required`. `guard` falls through to 403. The caller is not owed a list of real page ids.

**Case: forbidden and deny-by-default are both 403**

```javascript
function permissionsFor(user) {
  const set = new Set(user.permissions ?? []);
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return set;
}
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  if (typeof page.permission !== "string" || page.permission.length === 0) {
    return { allowed: false, reason: "deny-by-default" };
  }
  if (permissionsFor(user).has(page.permission)) return { allowed: true, reason: "permitted" };
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const analyst = {
  id: "ada",
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
  permissions: [],
};
const forbidden = guard(analyst, { id: "billing", public: false, permission: "billing:read" });
const deny = guard(analyst, { id: "secret", public: false });
```

Result: `forbidden.status` is `403` and `forbidden.decision.reason` is `"forbidden"`. `deny.status` is `403` and `deny.decision.reason` is `"deny-by-default"`.

Why: both reasons miss the 401 branch. `guard` returns 403 for each.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Returning 403 for `login-required` | The client cannot ask the user to sign in | Return 401 only for that reason |
| Returning the whole permission list in the 403 body | The response reveals every permission | Return `{ status, decision }` with the one reason |
| Throwing a string | The caller has no status to branch on | Return the status from `guard` |

### Tip

Allowed is the first branch. `login-required` is the second. Everything else is 403.

### Practice

`guard(null, { id: "home", public: true })` with the functions in this section.

### Solution

```javascript
function canAccess(user, page) {
  if (!page) return { allowed: false, reason: "unknown-page" };
  if (page.public === true) return { allowed: true, reason: "public" };
  if (!user) return { allowed: false, reason: "login-required" };
  return { allowed: false, reason: "forbidden" };
}
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
const result = guard(null, { id: "home", public: true });
```

Result: `{ status: 200, decision: { allowed: true, reason: "public" } }`.

## Exercises

See `exercises.md`.

## Quiz

1. What does deny by default mean for a page with no `permission` field?
2. Why is hiding a nav link not authorization?
3. When do you return 401 instead of 403?
4. Does an admin role pass every check automatically?
5. Are `"reports:read"` and `"Reports:read"` the same permission?
