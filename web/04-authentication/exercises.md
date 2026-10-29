# Exercises

1. `currentUser(session, now)` returns `{ id: session.userId }` when `now < session.expiresAt`. Return `null` when `session` is `null` or the session is expired. `now === expiresAt` is expired.

2. `publicAlert(event)` returns `{ code: "new-country", message }` only when `event.success === true` and `event.country` is a non-empty string not in `event.knownCountries`. Otherwise return `null`. The message must not contain `event.ip`.

3. `logoutResult(session)` returns `{ cleared: true }` when a session object was passed, and `{ cleared: false }` when `session` is `null`. It does not return the session id.
