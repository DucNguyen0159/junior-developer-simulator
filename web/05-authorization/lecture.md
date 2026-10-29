# Authorization

Authorization answers "may this user do this?". The server asks it on every protected request. The UI may hide a link. Hiding a link is not the check.

## 1. RBAC

Role-based access control: a user has roles, a role has permissions, a page or action requires one permission.

| Piece | Example |
| --- | --- |
| Permission | `"reports:read"` |
| Role | `{ name: "analyst", permissions: ["reports:read"] }` |
| User | `{ id: "ada", roles: [analyst], permissions: [] }` |
| Page | `{ id: "reports", public: false, permission: "reports:read" }` |

A user may also have permissions assigned directly. Union them with the role permissions.

There is no hidden admin bypass. If admin should see a page, admin's role lists that permission.

## 2. ACL versus RBAC

| | ACL | RBAC |
| --- | --- | --- |
| Attached to | The resource: "ada may read report 9" | The job: "analysts may read reports" |
| Changes when | One person's access changes | A job's duties change |
| Junior assessment default | Use it only if the scenario gives per-resource grants | Use it when the scenario gives roles |

If the scenario gives both, a user can access when either grant allows. If it gives neither, deny.

## 3. Deny by default

| Situation | Result | Reason string |
| --- | --- | --- |
| Page is missing | Deny | `unknown-page` |
| `page.public === true` | Allow | `public` |
| No user, page is not public | Deny | `login-required` |
| Page is private and `permission` is missing or `""` | Deny | `deny-by-default` |
| User's permission set contains `page.permission` | Allow | `permitted` |
| User is known but lacks the permission | Deny | `forbidden` |

Unknown pages are not public. An empty permission is not "anyone logged in."

Comparison is exact and case-sensitive. `"Reports:read"` is not `"reports:read"`.

## 4. Frontend versus backend

| | Frontend | Backend |
| --- | --- | --- |
| Question | What should we render? | May this request proceed? |
| Input | A user object the server already sent | The session, then the same rules |
| If it is wrong | A user sees a link that will fail | A user gets data they must not have |
| Status | Not an HTTP status | 401 if no user, 403 if the user lacks permission, 200 if allowed |

| Mistake | What goes wrong |
| --- | --- |
| Checking the role only in the router | A client can call the API directly |
| Trusting `user.role` from the JSON body | The client chose that field |
| 403 when there is no session | The client cannot tell "please log in" from "you are not allowed" |
| Admin shortcut that is not in the data | The next role named `Admin` or `administrator` skips the rules by accident |

## 5. Failures worth naming

These are bugs in the check, not techniques to copy.

| Bug | Safer rule |
| --- | --- |
| The page loads any id and returns it | Also require that this user may read that id |
| The UI hides the button and the API does not check | The API runs the same `canAccess` |
| A missing permission means allow | A missing permission means deny |
| Roles are read from a cookie the browser can edit | Roles are loaded on the server from the session user |

## 6. A guard function

```javascript
function guard(user, page) {
  const decision = canAccess(user, page);
  if (decision.allowed) return { status: 200, decision };
  if (decision.reason === "login-required") return { status: 401, decision };
  return { status: 403, decision };
}
```

`unknown-page` and `forbidden` are both 403. The caller is not owed a list of real page ids. `login-required` is 401.

| Mistake | Fix |
| --- | --- |
| Returning the whole permission list in the 403 body | Return a short error. The UI already knows what it asked for |
| Throwing a string | Return a status the caller can branch on |

## Exercises

See `exercises.md`.

## Quiz

1. What does deny by default mean for a page with no `permission` field?
2. Why is hiding a nav link not authorization?
3. When do you return 401 instead of 403?
4. Does an admin role pass every check automatically?
5. Are `"reports:read"` and `"Reports:read"` the same permission?
