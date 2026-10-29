def require_text(body, key):
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        return None, {"error": f"{key} is required"}
    return value.strip(), None


def require_count(body):
    value = body.get("count")
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        return None, {"error": "count must be a non-negative integer"}
    return value, None


def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None


def handle_create(user, body, role_permissions):
    blocked = guard(user, "alerts:write", role_permissions)
    if blocked is not None:
        status, payload = blocked
        return payload, status
    message, error = require_text(body, "message")
    if error is not None:
        return error, 400
    return {"message": message}, 201


assert require_text({"city": " A "}, "city") == ("A", None)
assert require_count({"count": True})[0] is None
assert require_count({"count": 0}) == (0, None)
roles = {"editor": ["alerts:write"]}
assert handle_create(None, {"message": "hi"}, roles)[1] == 401
assert handle_create({"roles": [], "permissions": []}, {"message": "hi"}, roles)[1] == 403
assert handle_create({"roles": ["editor"], "permissions": []}, {"message": "  hi "}, roles) == (
    {"message": "hi"},
    201,
)
print("exercise solutions ok")
