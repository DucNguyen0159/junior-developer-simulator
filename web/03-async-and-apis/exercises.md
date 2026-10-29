# Exercises

1. Write `statusMeaning(code)` that returns `"ok"` for 200 and 201, `"client"` for 400, 401, 403, and 404, and `"server"` for 500. Any other code returns `"other"`.

2. Write `async function readUser(fetchImpl, url)` that uses `fetchImpl(url)`. If `response.ok` is false, throw an error that includes the status. Parse JSON and return it only when `id` is a string. Otherwise throw `"invalid user"`.

3. Write `viewFor(state)` for `{ status: "loading" }`, `{ status: "error", message }`, and `{ status: "ready", items }`. Return `"loading"`, `"error"`, `"empty"`, or `"list"`. Check the error status before the list.

4. Write `async function newestUser(fetchUser, ids)` that loads ids one after another and returns the user from the last id. If any call rejects, the function rejects and does not return a user.
