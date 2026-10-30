# Python backend

The assessment may be JavaScript. If a scenario is a small API, the decisions are the same in Flask. This page is the part you need, not Django or FastAPI.

Frontend: render, collect input, send it.

Backend: validate input, decide who the user is, decide whether they may do this, return JSON and a status.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`. Run them with `python3`.

## 1. Functions, dicts, errors

### Concept

A function returns a value or raises. `dict.get` on a missing key is `None`. `data["city"]` on a missing key raises `KeyError`. `isinstance(True, int)` is `True`, so reject bools before an int check. Pass request values as data.

### Terms

| Expression | Result |
| --- | --- |
| `data.get("city")` when the key is missing | `None` |
| `data["city"]` when the key is missing | `KeyError` |
| `"ada" in {"ada", "bea"}` | `True` |
| `isinstance(True, int)` | `True` |
| `isinstance(False, int)` | `True` |

### Methods

| Form | What it does |
| --- | --- |
| `data.get(key)` | `None` for a missing key, unless you pass a default |
| `data[key]` | The value, or `KeyError` |
| `isinstance(value, bool)` before `isinstance(value, int)` | Keeps `True` and `False` out of an integer field |
| `except ValueError` | Catches the conversion error you mean |

### Examples

**Case: `isinstance(True, int)` is `True`**

```python
flag = isinstance(True, int)
also = isinstance(False, int)
```

Result: `flag` is `True`. `also` is `True`.

Why: `True` and `False` are integers in Python. A later `int` check accepts them unless you reject bools first.

**Case: an int check that forgets bools returns `True`**

```python
def parse_count(value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("count must be an integer")
    return value

def allows_bool(value):
    if isinstance(value, int) and value >= 0:
        return value
    raise ValueError("no")

accepted = allows_bool(True)
number = parse_count(2)
raised = None
try:
    parse_count(True)
except ValueError as error:
    raised = str(error)
```

Result: `accepted` is `True`. `number` is `2`. `raised` is `"count must be an integer"`.

Why: `allows_bool` sees `True` as an int and `True >= 0`, so it returns the bool. `parse_count` rejects bools before the int check, then accepts `2`.

**Case: `dict.get` on a missing key is `None`**

```python
data = {"city": "Irvine"}
missing = data.get("zip")
present = data.get("city")
```

Result: `missing` is `None`. `present` is `"Irvine"`.

Why: `get` returns `None` when the key is absent. It does not raise.

**Case: square brackets raise `KeyError`**

```python
data = {"city": "Irvine"}
found = "ada" in {"ada", "bea"}
try:
    data["zip"]
    name = "no error"
except KeyError:
    name = "KeyError"
```

Result: `found` is `True`. `name` is `"KeyError"`.

Why: `data["zip"]` raises because the key is missing. Membership on a set is a separate test: `"ada"` is in `{"ada", "bea"}`.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| `isinstance(value, int)` with no bool check | `True` passes and comes back as `True` | Reject `isinstance(value, bool)` first |
| `except:` with no type | You also catch `KeyboardInterrupt` | Catch `ValueError` or the type you mean |
| `data[key]` for a field the client may omit | `KeyError` | `data.get(key)` and then validate |

### Tip

`data.get("zip", "")` returns `""` when you pass that default. With no default, a missing key is `None`.

### Practice

`allows_bool(True)` from the second case. Say what it returns.

### Solution

```python
def allows_bool(value):
    if isinstance(value, int) and value >= 0:
        return value
    raise ValueError("no")

accepted = allows_bool(True)
```

Result: `True`. The bool passed the int check.

## 2. A Flask route

### Concept

Flask is a function per path. You do not need Flask installed to practice the decision. `request.get_json(silent=True)` returns `None` on a bad body. A blank required string is 400. A stripped city is 201.

### Terms

| Return | Status |
| --- | --- |
| `{"ok": True}` | 200 |
| `(body, 201)` | 201 |
| `(body, 400)` | 400 |
| `abort(404)` | 404, handled by an error handler |

### Methods

| Call | Result |
| --- | --- |
| `request.get_json(silent=True)` on a bad body | `None` |
| `body.get("city", "")` | The string, or `""` when the key is missing |
| `return {"error": "city is required"}, 400` | Status 400 |
| `return {"city": city.strip()}, 201` | Status 201 |

### Examples

**Case: a bad body and `silent=True` returns `None`**

```python
def get_json(silent=True):
    bad_body = True
    if bad_body and silent:
        return None
    raise ValueError("bad json")

value = get_json(silent=True)
```

Result: `None`.

Why: this models `request.get_json(silent=True)` on a bad body. The call returns `None` instead of raising. The route then treats that `None` as an empty object or rejects it.

**Case: a missing body is a blank city and status 400**

```python
def create_alert(parsed):
    body = parsed if parsed is not None else {}
    city = body.get("city", "")
    if not isinstance(city, str) or not city.strip():
        return {"error": "city is required"}, 400
    return {"city": city.strip()}, 201

result = create_alert(None)
```

Result: `({"error": "city is required"}, 400)`.

Why: `None` becomes `{}`. `get` returns `""`. A blank required string is 400.

**Case: surrounding spaces are stripped on success**

```python
def create_alert(parsed):
    body = parsed if parsed is not None else {}
    city = body.get("city", "")
    if not isinstance(city, str) or not city.strip():
        return {"error": "city is required"}, 400
    return {"city": city.strip()}, 201

result = create_alert({"city": " Irvine "})
```

Result: `({"city": "Irvine"}, 201)`.

Why: the string is non-blank after `strip`. The response uses the stripped value and status 201.

**Case: whitespace only, and a non-string, are both 400**

```python
def create_alert(parsed):
    body = parsed if parsed is not None else {}
    city = body.get("city", "")
    if not isinstance(city, str) or not city.strip():
        return {"error": "city is required"}, 400
    return {"city": city.strip()}, 201

blank = create_alert({"city": "  "})
number = create_alert({"city": 1})
```

Result: `blank` is `({"error": "city is required"}, 400)`. `number` is `({"error": "city is required"}, 400)`.

Why: `"  ".strip()` is empty. `1` is not a string. A blank required string is 400, and so is the wrong type.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Calling `get_json()` on a bad body with silent left off | The call raises | `request.get_json(silent=True)` and handle `None` |
| Returning 200 for a blank city | The client thinks the write worked | Return `({"error": "city is required"}, 400)` |
| Saving the city with the surrounding spaces | The stored value is `" Irvine "` | `strip()` after the blank check |

### Tip

You can practice `create_alert` in plain Python. The decorator `@app.post("/alerts")` is the Flask wrapper around the same decision.

### Practice

`create_alert({"city": "  "})` with the function in this section.

### Solution

```python
def create_alert(parsed):
    body = parsed if parsed is not None else {}
    city = body.get("city", "")
    if not isinstance(city, str) or not city.strip():
        return {"error": "city is required"}, 400
    return {"city": city.strip()}, 201

result = create_alert({"city": "  "})
```

Result: `({"error": "city is required"}, 400)`.

## 3. Request validation

### Concept

Validate type and presence before you use a field. A required string is rejected when it is missing, not a string, or blank after `strip`. That rejection is status 400. An integer field rejects bools, non-integers, and negatives when the rule says so. `0` is a valid count. Reject bools before the int check, because `isinstance(True, int)` is `True`.

### Terms

| Field | Reject |
| --- | --- |
| Required string | Missing, not a string, or blank after `strip` |
| Integer | Boolean, non-integer, negative when the rule says so |
| Choice | Not in the allowed set |

### Methods

| Function | Success | Failure |
| --- | --- | --- |
| `require_text(body, key)` | `(stripped, None)` | `(None, {"error": "<key> is required"})` |
| `require_count(body)` | `(number, None)`, including `0` | `(None, {"error": "count must be a non-negative integer"})` |

A route that gets the error tuple returns that body with status 400.

### Examples

**Case: a blank string fails `require_text`**

```python
def require_text(body, key):
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        return None, {"error": f"{key} is required"}
    return value.strip(), None

value, error = require_text({"city": "  "}, "city")
```

Result: `value` is `None`. `error` is `{"error": "city is required"}`.

Why: `strip()` is empty. The route returns that error with status 400. A blank required string is 400.

**Case: a padded string comes back stripped**

```python
def require_text(body, key):
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        return None, {"error": f"{key} is required"}
    return value.strip(), None

value, error = require_text({"city": " Irvine "}, "city")
```

Result: `value` is `"Irvine"`. `error` is `None`.

Why: the string is non-blank. The caller stores the stripped text.

**Case: `True` is rejected as a count**

```python
def require_count(body):
    value = body.get("count")
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        return None, {"error": "count must be a non-negative integer"}
    return value, None

value, error = require_count({"count": True})
```

Result: `value` is `None`. `error` is `{"error": "count must be a non-negative integer"}`.

Why: `isinstance(True, int)` is `True`. The bool test is first, so `True` never reaches the `int` success path. `False` fails the same way.

**Case: zero is a valid count**

```python
def require_count(body):
    value = body.get("count")
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        return None, {"error": "count must be a non-negative integer"}
    return value, None

zero, zero_error = require_count({"count": 0})
negative, negative_error = require_count({"count": -1})
```

Result: `zero` is `0` and `zero_error` is `None`. `negative` is `None` and `negative_error` is `{"error": "count must be a non-negative integer"}`.

Why: `0` is an int, it is not a bool, and it is not below 0. `-1` fails the range check.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Checking `isinstance(value, int)` first | `True` is accepted as `1` | `isinstance(value, bool)` first |
| Returning 200 with `{"error": "city is required"}` | The client treats a bad field as success | Status 400 for a blank required string |
| Rejecting `0` | A legal count fails | Allow `0`. Reject negatives |

### Tip

`require_text` returns the error dict. The route is what attaches status 400: `return error, 400`.

### Practice

`require_text({}, "message")`.

### Solution

```python
def require_text(body, key):
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        return None, {"error": f"{key} is required"}
    return value.strip(), None

value, error = require_text({}, "message")
```

Result: `value` is `None`. `error` is `{"error": "message is required"}`. The route status is 400.

## 4. Auth middleware

### Concept

Middleware runs before the route. It either stops the request or lets the route run. `user is None` returns `401` and `{"error": "login required"}`. A user without the permission returns `403` and `{"error": "forbidden"}`. A user who has the permission returns `None`, and the route runs.

Permissions are the user's direct set union `role_permissions[role]` for each role. The role comes from the session, not the JSON body.

### Terms

| Check | Status | Body |
| --- | --- | --- |
| No user | 401 | `{"error": "login required"}` |
| User, missing permission | 403 | `{"error": "forbidden"}` |
| User has permission | The route runs | The route's body. `guard` returns `None` |

### Methods

```python
def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None
```

`None` means the route may run. The route does not re-read the role from the JSON body.

### Examples

**Case: no user is 401**

```python
def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None

result = guard(None, "reports:read", {"analyst": ["reports:read"]})
```

Result: `(401, {"error": "login required"})`.

Why: `user is None`. The permission map is never consulted. This is not 403.

**Case: a user without the permission is 403**

```python
def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None

result = guard({"roles": [], "permissions": []}, "reports:read", {"analyst": ["reports:read"]})
```

Result: `(403, {"error": "forbidden"})`.

Why: the user is known. Their direct set is empty and they have no role, so `reports:read` is missing. A logged-in user without the permission is 403.

**Case: the role on the session supplies the permission**

```python
def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None

result = guard(
    {"roles": ["analyst"], "permissions": []},
    "reports:read",
    {"analyst": ["reports:read"]},
)
```

Result: `None`.

Why: the direct set is empty. `role_permissions["analyst"]` is `["reports:read"]`, and the union contains the permission. `None` means the route runs.

**Case: the role comes from the session, and a direct permission also counts**

```python
def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None

body = {"role": "admin"}
session_user = {"roles": ["analyst"], "permissions": []}
from_session = guard(session_user, "reports:read", {"analyst": ["reports:read"]})
from_direct = guard(
    {"roles": [], "permissions": ["reports:read"]},
    "reports:read",
    {"analyst": ["reports:read"]},
)
```

Result: `from_session` is `None`. `from_direct` is `None`. `body["role"]` is `"admin"` and is not passed to `guard`.

Why: permissions are the direct set union `role_permissions[role]` for each session role. The JSON field `role` is not the session. A direct permission is the other half of the union, so the second call also returns `None` and the route runs.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Reading `role` from the client payload | The client picks `"admin"` | Read the user from the session |
| One middleware for the whole app that allows a missing permission | Every route opens | Pass the required permission into `guard` |
| 401 and 403 swapped | A logged-in user is told to log in, or a stranger is told they are forbidden | No user is 401. The wrong permission is 403 |

### Tip

`guard` returns `None` on success so the route can build its own body and status. On failure the tuple is already `(status, body)`.

### Practice

`guard(None, "alerts:write", {"editor": ["alerts:write"]})`.

### Solution

```python
def guard(user, permission, role_permissions):
    if user is None:
        return 401, {"error": "login required"}
    held = set(user.get("permissions", []))
    for role in user.get("roles", []):
        held.update(role_permissions.get(role, []))
    if permission not in held:
        return 403, {"error": "forbidden"}
    return None

result = guard(None, "alerts:write", {"editor": ["alerts:write"]})
```

Result: `(401, {"error": "login required"})`.

## Exercises

See `exercises.md`. Run with `python3`.

## Quiz

1. Why is `isinstance(True, int)` a trap?
2. What does `dict.get` return for a missing key?
3. Which status is a blank required field?
4. Which status is a logged-in user without the permission?
5. Where does the user's role come from?
