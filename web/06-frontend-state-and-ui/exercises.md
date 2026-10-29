# Exercises

1. `fieldError(value, allowed)` returns `"Required"` when `value.trim()` is empty, `"Choose a listed value"` when `value` is not in `allowed`, and `null` when it is valid.

2. `alertView(state)` implements the table in the lecture. Drop every field except `code`, `severity`, and `message`. Sort `high` before `medium`. Do not mutate `state.items`.

3. `nextState(current, action)` returns a new state. `"loading"` and `"error"` replace the previous state. `"ready"` stores `action.items`. An unknown action returns `current`.
