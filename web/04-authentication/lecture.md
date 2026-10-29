# Authentication

Authentication answers "who is this?". Authorization answers "what may they do?". This folder is the first question. A login screen that hides a button is not authentication. The server decides.

## 1. Login and logout

| Step | Browser | Server |
| --- | --- | --- |
| Login | Sends identifier and password over HTTPS | Checks the password against a hash. Never against a stored plain password |
| Success | Stores nothing sensitive in JavaScript if it can be avoided | Starts a session or issues a token |
| Logout | Drops client state | Invalidates the session or token |
| Later request | Sends the cookie or token automatically or in a header | Looks up the current user. Missing or expired means 401 |

| Mistake | Why it matters |
| --- | --- |
| Comparing the password to a string in the database | A leaked database is a list of passwords |
| Treating "the form was filled" as logged in | Anyone can post the form |
| Logout that only hides the button | The cookie still works |

You will not be asked to build a password hasher in 45 minutes. You do need to know the server checks a secret and then remembers the user.

## 2. Sessions and tokens

| | Session | Token (bearer) |
| --- | --- | --- |
| Server stores | A session record | Often nothing, if the token is signed |
| Browser sends | Cookie | `Authorization` header, unless it is also in a cookie |
| Logout | Delete the server record | Drop the token. A signed token still works until it expires unless you keep a deny list |
| Expiry | Server can drop it at any time | Honor `exp`. A token past `exp` is logged out |

| Mistake | What happens |
| --- | --- |
| Putting the user id in `localStorage` and trusting it | The user can edit it. The server must be the source of identity |
| A token with no expiry | A stolen token works until you rotate a secret |

## 3. Cookies

| Flag | Effect |
| --- | --- |
| `HttpOnly` | JavaScript on the page cannot read it. A script cannot steal it with `document.cookie` |
| `Secure` | Sent only over HTTPS |
| `SameSite=Lax` | Not sent on most cross-site posts. A common default |
| `SameSite=Strict` | Sent only for same-site requests |

The cookie value is the session id, not the user's roles and not their password.

| Mistake | Fix |
| --- | --- |
| Storing a role in a cookie the browser can edit | Look up roles on the server from the session |
| Showing the session id in the UI | The user does not need it |

## 4. Account compromise indicators

These are product signals, not instructions for breaking into an account. Given a list of sign-in events you already have, decide whether to warn the signed-in user.

| Signal | Why it is a warning | Severity to show |
| --- | --- | --- |
| Many recent failures, then a success | Someone may have guessed a password and then gotten in | High |
| Many recent failures, no success | Someone is trying passwords | Medium |
| Success from a country not on the account's known list | The password may be in use somewhere new | Medium |
| Two successes from different countries a few minutes apart | Both cannot be the same traveler | High |

A missing country is unknown, not "suspicious" by itself. Do not invent a country.

| Field on an alert | Include? |
| --- | --- |
| A short code, such as `new-country` | Yes, for the program |
| A sentence the user can read | Yes |
| Severity | Yes |
| The account's own country name | Only if the product copy needs it. Prefer a generic sentence |
| IP address | No. It is sensitive and easy to mis-copy |
| Another user's events | No |
| The password or the hash | No |

## 5. Session expiration

If `now >= session.expiresAt`, the user is logged out. Return 401 and ask them to sign in again. Do not return 403. 403 would mean you know who they are and they are forbidden.

Refreshing a session on activity is a product choice. For the assessment, follow the rule you were given. If the scenario says "expired sessions are logged out," do not silently extend them.

## 6. Sensitive information

| Place | Allowed |
| --- | --- |
| Server log, access-controlled | Status codes, user id, alert code |
| Response to that user | Their own alert sentences |
| Response to anyone else | Nothing about this user's sessions |
| Frontend source | No secrets, no other user's data |

| Mistake | What leaks |
| --- | --- |
| Putting the IP in the toast | The IP is now in the DOM, screenshots, and analytics |
| Returning the full event list to the browser "so it can decide" | The browser now holds more than the user should see. Decide on the server, send the alerts |

## Exercises

See `exercises.md`.

## Quiz

1. Which status means "not logged in"?
2. Why is a role stored only in `localStorage` not proof of that role?
3. What does `HttpOnly` stop?
4. Should a compromise message include the IP? Why?
5. An expired session should return 401 or 403?
