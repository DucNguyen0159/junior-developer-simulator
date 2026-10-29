# Assessment C — page authorization

> [!WARNING]
> The starter tests fail until the exercise is fixed. That failure is the assignment.

45 minutes. This is an original exercise. It is not a vendor's exam.

The product has pages, users, roles, and permissions. The UI will call these functions to decide what to render. The same functions are the rules the server would run. There is no admin bypass.

## Data

```javascript
user = {
  id: "ada",
  permissions: ["billing:read"],
  roles: [{ name: "analyst", permissions: ["reports:read"] }],
}

page = { id: "reports", public: false, permission: "reports:read" }
```

A user's permissions are the union of `permissions` and every role's `permissions`.

## Rules

| Situation | `allowed` | `reason` |
| --- | --- | --- |
| `page` is missing | false | `unknown-page` |
| `page.public === true` | true | `public` |
| No user, and the page is not public | false | `login-required` |
| Private page, `permission` missing or `""` | false | `deny-by-default` |
| User holds that exact permission | true | `permitted` |
| User does not hold it | false | `forbidden` |

`"Reports:read"` is not `"reports:read"`. A role named `admin` does not allow extra pages.

`guard(user, page)` returns `{ status, decision }`:

| Decision | Status |
| --- | --- |
| Allowed | 200 |
| `login-required` | 401 |
| Anything else denied | 403 |

`visiblePages(user, pages)` returns the allowed pages in the same order. It does not mutate `pages`.

## Time

| Minutes | Do this |
| --- | --- |
| 0–8 | Read the table and the tests |
| 8–25 | Implement `canAccess` |
| 25–35 | Implement `guard` and `visiblePages` |
| 35–45 | Say, in `notes.md`, why the server must run this even if the nav hides the link |

```bash
node --test 09-practice-assessments/C-page-authorization/access.test.mjs
```

Run that from the `web/` folder.

## Rubric

| Points | Item |
| --- | --- |
| 30 | Deny by default, including a blank permission |
| 20 | Public pages and signed-out users |
| 20 | Permissions from both the user and their roles |
| 15 | 401 versus 403 |
| 10 | `visiblePages` order and no mutation |
| 5 | A sentence on why the UI check is not enough |

## Sample

Analyst role has `reports:read`. User has no direct permissions. Page `reports` requires `reports:read`. `canAccess` allows it. A page with no permission field is denied. A signed-out user on that page gets status 401.
