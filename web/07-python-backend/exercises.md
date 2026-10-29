# Exercises

1. `require_text(body, key)` returns `(stripped, None)` for a non-blank string, and `(None, {"error": "<key> is required"})` otherwise.

2. `require_count(body)` reads `count`. Reject bools, non-integers, and numbers below 0 with `(None, {"error": "count must be a non-negative integer"})`. Accept `0`.

3. `guard(user, permission, role_permissions)` returns `(401, {"error": "login required"})`, `(403, {"error": "forbidden"})`, or `None`.

4. `handle_create(user, body, role_permissions)` uses `guard` for `"alerts:write"` and `require_text(body, "message")`. Return `(body, status)`. Success is `({"message": stripped}, 201)`.
