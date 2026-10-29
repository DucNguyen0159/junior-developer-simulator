# Python backend

The assessment may be JavaScript. If a scenario is a small API, the decisions are the same in Flask. This page is the part you need, not Django or FastAPI.

Frontend: render, collect input, send it.

Backend: validate input, decide who the user is, decide whether they may do this, return JSON and a status.

## 1. Functions, dicts, errors

```python
def parse_price(text):
    try:
        price = int(text)
    except (TypeError, ValueError) as error:
        raise ValueError("price must be an integer") from error
    if price < 0:
        raise ValueError("price must be an integer")
    return price
```

| Expression | Result |
| --- | --- |
| `data.get("city")` | `None` when the key is missing |
| `data["city"]` | `KeyError` when the key is missing |
| `"ada" in {"ada", "bea"}` | `True` |

| Mistake | Fix |
| --- | --- |
| `except:` with no type | You also catch `KeyboardInterrupt`. Catch `ValueError` or the type you mean |
| Building SQL or a shell command from the request string | Pass the value as data. The lecture stays on request checks |

## 2. A Flask route

Flask is a function per path. You do not need it installed to practice the decision below. The shape is:

```python
@app.post("/alerts")
def create_alert():
    body = request.get_json(silent=True) or {}
    city = body.get("city", "")
    if not isinstance(city, str) or not city.strip():
        return {"error": "city is required"}, 400
    return {"city": city.strip()}, 201
```

| Return | Status |
| --- | --- |
| `{"ok": True}` | 200 |
| `(body, 201)` | 201 |
| `(body, 400)` | 400 |
| `abort(404)` | 404, handled by an error handler |

`request.get_json(silent=True)` returns `None` on a bad body instead of throwing.

## 3. Request validation

Validate type and presence before you use a field.

| Field | Reject |
| --- | --- |
| Required string | Missing, not a string, or blank after `strip` |
| Integer | Boolean (because `bool` is an `int` in Python), non-integer, negative when the rule says so |
| Choice | Not in the allowed set |

```python
def require_text(body, key):
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        return None, {"error": f"{key} is required"}
    return value.strip(), None
```

A boolean slipping through `isinstance(value, int)` is a real bug. `isinstance(True, int)` is `True`. Reject bools first.

## 4. Auth middleware

Middleware is a function that runs before the route. It either stops the request or calls the route.

| Check | Status | Body |
| --- | --- | --- |
| No user | 401 | `{"error": "login required"}` |
| User, missing permission | 403 | `{"error": "forbidden"}` |
| User has permission | Call the route | The route's body, status 200 |

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

| Mistake | Fix |
| --- | --- |
| Reading `role` from the client payload | Read the user from the session |
| One middleware for the whole app that allows missing permissions | Pass the required permission into the guard |
| 401 and 403 swapped | No user is 401. Wrong permission is 403 |

## Exercises

See `exercises.md`. Run with `python3`.

## Quiz

1. Why is `isinstance(True, int)` a trap?
2. What does `dict.get` return for a missing key?
3. Which status is a blank required field?
4. Which status is a logged-in user without the permission?
5. Where does the user's role come from?
