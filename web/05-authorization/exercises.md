# Exercises

Use the shapes in the lecture. No admin bypass.

1. `permissionsFor(user)` returns a `Set` of strings from `user.permissions` and from every `user.roles[].permissions`. Missing arrays count as empty.

2. `canAccess(user, page)` follows the deny-by-default table in the lecture.

3. `guard(user, page)` returns `{ status, decision }`. 200 when allowed, 401 when the reason is `login-required`, 403 otherwise.

4. `visiblePages(user, pages)` returns the pages `canAccess` allows, in the original order. Do not mutate `pages`.
