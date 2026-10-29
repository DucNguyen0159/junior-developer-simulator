def require_text(body, key):
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        return None, {"error": f"{key} is required"}
    return value.strip(), None


def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None


city, error = require_text({"city": "  Irvine  "}, "city")
print("city =>", city, error)
assert city == "Irvine" and error is None

_, missing = require_text({}, "city")
print("missing =>", missing)
assert missing == {"error": "city is required"}

roles = {"analyst": ["reports:read"]}
print("no user =>", guard(None, "reports:read", roles))
print("analyst =>", guard({"roles": ["analyst"], "permissions": []}, "reports:read", roles))
assert guard(None, "reports:read", roles)[0] == 401
assert guard({"roles": ["analyst"], "permissions": []}, "reports:read", roles) is None
assert guard({"roles": [], "permissions": []}, "reports:read", roles)[0] == 403
print("examples ok")
