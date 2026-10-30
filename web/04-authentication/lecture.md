# Authentication

Authentication answers "who is this?". Authorization answers "what may they do?". This folder is the first question. A login screen that hides a button is not authentication. The server decides.

Every section has the same parts: the concept, the terms, the methods, several cases with a result, common mistakes, a tip, and a practice with a solution. Do the exercises in `exercises.md` before you open `solutions/`.

## 1. Login and logout

### Concept

The browser sends an identifier and a password over HTTPS. The server checks a hash, never a stored plain password. On success it starts a session. Logout invalidates that session. A filled form is not a session. Missing or expired means 401.

### Terms

| Step | Browser | Server |
| --- | --- | --- |
| Login | Sends identifier and password over HTTPS | Checks the password against a hash |
| Success | Keeps the session cookie. Avoids storing the password in JavaScript | Starts a session |
| Logout | Drops client state | Invalidates the session |
| Later request | Sends the cookie | Looks up the user. Missing or expired means 401 |

### Methods

| Function | Rule |
| --- | --- |
| `passwordMatches(storedHash, presentedHash)` | Compare hashes |
| `currentUser(session, now)` | `{ id }` while `now < session.expiresAt`, otherwise `null` |
| `logoutResult(session)` | `{ cleared: true }` when a session object was passed. The return value has no session id |

### Examples

**Case: the server compares hashes**

```javascript
function passwordMatches(storedHash, presentedHash) {
  return storedHash === presentedHash;
}
const same = passwordMatches("hash-of-secret", "hash-of-secret");
const different = passwordMatches("hash-of-secret", "hash-of-other");
```

Result: `same` is `true`. `different` is `false`.

Why: the stored value is a hash. The check compares that hash with the hash of what was typed. The database does not hold the plain password.

**Case: no session means no user**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
const user = currentUser(null, 50);
```

Result: `null`.

Why: a submitted form does not create this object. The server looks up a session. No session means the caller is logged out.

**Case: logout clears the session and does not return the id**

```javascript
function logoutResult(session) {
  if (session == null) return { cleared: false };
  return { cleared: true };
}
const body = logoutResult({ id: "sess-ada" });
const text = JSON.stringify(body);
```

Result: `body` is `{ cleared: true }`. `text` is `'{"cleared":true}'`.

Why: the session is invalidated. The response does not echo the session id. `logoutResult(null)` is `{ cleared: false }`.

**Case: hiding the button leaves the session in place**

```javascript
function hideButton(session) {
  return { buttonHidden: true, session };
}
const view = hideButton({ id: "sess-ada" });
```

Result: `view.buttonHidden` is `true`. `view.session.id` is `"sess-ada"`.

Why: the cookie still works. Logout has to invalidate the session on the server.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Comparing the password to a plain string in the database | A leaked database is a list of passwords | Store a hash. Compare hashes |
| Treating "the form was filled" as logged in | Anyone can post the form | Require a server session |
| Logout that only hides the button | The session id still works | Invalidate the session and return `{ cleared: true }` without the id |

### Tip

You will not be asked to build a password hasher in 45 minutes. You do need to know the server checks a hash and then remembers the user.

### Practice

`currentUser({ userId: "ada", expiresAt: 100 }, 50)` should return the user id object.

### Solution

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
const user = currentUser({ userId: "ada", expiresAt: 100 }, 50);
```

Result: `{ id: "ada" }`.

## 2. Sessions and tokens

### Concept

A session is a record on the server. The browser sends the session id in a cookie. A bearer token is sent in the `Authorization` header, unless it is also in a cookie. A user id in `localStorage` is not identity. The server is the source of identity. A token past `exp` is logged out. `now >= expiresAt` means the session is logged out.

### Terms

| | Session | Token (bearer) |
| --- | --- | --- |
| Server stores | A session record | Often nothing, if the token is signed |
| Browser sends | Cookie | `Authorization` header, unless it is also in a cookie |
| Logout | Delete the server record | Drop the token. A signed token still works until it expires unless you keep a deny list |
| Expiry | `now >= expiresAt` is logged out | Honor `exp`. A token past `exp` is logged out |

### Methods

| Call | Returns |
| --- | --- |
| `currentUser(session, now)` | `{ id: session.userId }` or `null` |
| `who(storedUserId, session)` | The session user, or `null` when there is no session |
| `bearerUser(token, now)` | `{ id: token.sub }` while `now < token.exp`, otherwise `null` |

### Examples

**Case: an active session returns the user id**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
const user = currentUser({ userId: "ada", expiresAt: 100 }, 50);
```

Result: `{ id: "ada" }`.

Why: `50 < 100`, so the session is still current. The id comes from the session record.

**Case: `now === expiresAt` is logged out**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
const user = currentUser({ userId: "ada", expiresAt: 100 }, 100);
```

Result: `null`.

Why: `now >= expiresAt` means logged out. The status for that caller is 401.

**Case: a `localStorage` user id is not identity**

```javascript
function who(storedUserId, session) {
  if (!session) return null;
  return { id: session.userId };
}
const user = who("admin", null);
```

Result: `null`.

Why: the browser can change `localStorage`. The string `"admin"` is not a session. The server loads the user from the session or the token.

**Case: a token at `exp` is logged out**

```javascript
function bearerUser(token, now) {
  if (!token || now >= token.exp) return null;
  return { id: token.sub };
}
const expired = bearerUser({ sub: "ada", exp: 100 }, 100);
const active = bearerUser({ sub: "ada", exp: 100 }, 99);
```

Result: `expired` is `null`. `active` is `{ id: "ada" }`.

Why: honor `exp`. A token past `exp`, including the instant `now === exp`, is logged out.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Putting the user id in `localStorage` and trusting it | The user can edit it and become someone else | Load the user from the session or token |
| A token with no expiry | A stolen token works until you rotate a secret | Honor `exp` |
| Treating `now === expiresAt` as still logged in | The session is already over | `now >= expiresAt` returns `null` |

### Tip

Logout for a session deletes the server record. Logout for a signed token drops the token, and the token still works until `exp` unless the server keeps a deny list.

### Practice

`who("ada", null)` and `who("ada", { userId: "ada" })`. Say which one is the user.

### Solution

```javascript
function who(storedUserId, session) {
  if (!session) return null;
  return { id: session.userId };
}
const fromStorage = who("ada", null);
const fromSession = who("ada", { userId: "ada" });
```

Result: `fromStorage` is `null`. `fromSession` is `{ id: "ada" }`.

## 3. Cookies

### Concept

The cookie value is the session id, not the user's roles and not their password. `HttpOnly` means JavaScript cannot read the cookie. `Secure` means HTTPS only. `SameSite=Lax` is a common default. `SameSite=Strict` is sent only for same-site requests. `SameSite=Lax` is not sent on most cross-site posts.

### Terms

| Flag | Effect |
| --- | --- |
| `HttpOnly` | JavaScript on the page cannot read it. `document.cookie` cannot copy it |
| `Secure` | Sent only over HTTPS |
| `SameSite=Lax` | A common default. Not sent on most cross-site posts |
| `SameSite=Strict` | Sent only for same-site requests |

### Methods

| Call | Result |
| --- | --- |
| `jsCanRead({ httpOnly: true })` | `false` |
| `sent({ secure: true }, https)` | `false` when `https` is false |
| `readSession(cookieValue)` | `{ sessionId: cookieValue }` |

### Examples

**Case: `HttpOnly` keeps the cookie out of JavaScript**

```javascript
function jsCanRead(cookie) {
  return cookie.httpOnly !== true;
}
const readable = jsCanRead({ httpOnly: true, value: "sess-ada" });
```

Result: `false`.

Why: page script cannot read the cookie, so it cannot copy it out with `document.cookie`.

**Case: `Secure` is HTTPS only**

```javascript
function sent(cookie, https) {
  if (cookie.secure && !https) return false;
  return true;
}
const onHttp = sent({ secure: true }, false);
const onHttps = sent({ secure: true }, true);
```

Result: `onHttp` is `false`. `onHttps` is `true`.

Why: a `Secure` cookie is not sent on plain HTTP.

**Case: the cookie value is the session id**

```javascript
function readSession(cookieValue) {
  return { sessionId: cookieValue };
}
const record = readSession("sess-ada");
```

Result: `{ sessionId: "sess-ada" }`.

Why: the value identifies the session. Roles and the password are not in the cookie. The server loads roles from the session record.

**Case: `Lax` is the usual choice, and a cross-site post does not send it**

```javascript
function browserSends(cookie, request) {
  if (cookie.secure && request.https === false) return false;
  if (cookie.sameSite === "Strict") return request.kind === "same-site";
  if (cookie.sameSite === "Lax") return request.kind !== "cross-site-post";
  return true;
}
const crossPost = browserSends(
  { secure: true, sameSite: "Lax" },
  { https: true, kind: "cross-site-post" },
);
const sameSite = browserSends(
  { secure: true, sameSite: "Lax" },
  { https: true, kind: "same-site" },
);
const strictGet = browserSends(
  { secure: true, sameSite: "Strict" },
  { https: true, kind: "cross-site-get" },
);
```

Result: `crossPost` is `false`. `sameSite` is `true`. `strictGet` is `false`.

Why: `SameSite=Lax` is a common default. It is not sent on a cross-site post. It is sent for a same-site request. `SameSite=Strict` is sent only when `kind` is `"same-site"`, so a cross-site GET is not sent.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Storing a role in a cookie the browser can edit | The client picks the role | Look up roles on the server from the session |
| A session cookie without `HttpOnly` | Page script can read `document.cookie` | Set `HttpOnly` |
| Showing the session id in the UI | The id is copied into screenshots and logs | Keep the value in the cookie. The user does not need it |

### Tip

The cookie answers "which session?". It does not answer "which roles?".

### Practice

`jsCanRead({ httpOnly: true })` and `readSession("sess-ada")`. Say what JavaScript can see, and what the value means.

### Solution

```javascript
function jsCanRead(cookie) {
  return cookie.httpOnly !== true;
}
function readSession(cookieValue) {
  return { sessionId: cookieValue };
}
const readable = jsCanRead({ httpOnly: true });
const record = readSession("sess-ada");
```

Result: `readable` is `false`. `record` is `{ sessionId: "sess-ada" }`.

## 4. Account compromise indicators

### Concept

These are product warnings for the signed-in user, not instructions for breaking into an account. You are given sign-in events the server already stored. You decide whether to show a warning.

Many recent failures, then a success, is high. Many failures and no success is medium. A success from a country not on the known list is medium. Two successes from different countries a few minutes apart is high. A missing country is unknown, not suspicious. Do not invent a country.

An alert has a short code, a sentence, and a severity. Do not include the IP, another user's events, the password, or the hash.

### Terms

| Signal | Severity |
| --- | --- |
| Many recent failures, then a success | High |
| Many recent failures, and no success | Medium |
| Success from a country not on the known list | Medium |
| Two successes from different countries a few minutes apart | High |
| Country missing or `""` | Unknown. No country alert |

### Methods

| Code | Severity | Sentence |
| --- | --- | --- |
| `failed-attempts` | medium | `Several sign-in attempts failed recently.` |
| `failed-then-success` | high | `A sign-in succeeded after several recent failures.` |
| `new-country` | medium | `A sign-in came from a country we have not seen on this account.` |
| `impossible-travel` | high | `Two recent sign-ins came from different countries in a short time.` |

### Examples

**Case: the four signals map to high or medium**

```javascript
function signalSeverity(signal) {
  if (signal === "many-failures-then-success") return "high";
  if (signal === "many-failures") return "medium";
  if (signal === "new-country") return "medium";
  if (signal === "two-successes-different-countries-minutes-apart") return "high";
  return "none";
}
const severities = [
  signalSeverity("many-failures-then-success"),
  signalSeverity("many-failures"),
  signalSeverity("new-country"),
  signalSeverity("two-successes-different-countries-minutes-apart"),
];
```

Result: `["high", "medium", "medium", "high"]`.

Why: failures followed by a success is high. Failures alone are medium. A new country is medium. Two countries a few minutes apart is high.

**Case: a missing country stays unknown**

```javascript
function countrySignal(country, knownCountries) {
  if (typeof country !== "string" || country.length === 0) return "unknown";
  if (!knownCountries.includes(country)) return "new-country";
  return "known";
}
const missing = countrySignal(undefined, ["US"]);
const blank = countrySignal("", ["US"]);
const unseen = countrySignal("CA", ["US"]);
const seen = countrySignal("US", ["US"]);
```

Result: `missing` is `"unknown"`. `blank` is `"unknown"`. `unseen` is `"new-country"`. `seen` is `"known"`.

Why: a missing country is unknown. The function does not invent `"US"` or any other country. A non-empty country outside the known list is the medium `new-country` signal.

**Case: `new-country` is a code, a sentence, and a severity**

```javascript
function alertMessage(code) {
  const messages = {
    "failed-attempts": "Several sign-in attempts failed recently.",
    "failed-then-success": "A sign-in succeeded after several recent failures.",
    "new-country": "A sign-in came from a country we have not seen on this account.",
    "impossible-travel": "Two recent sign-ins came from different countries in a short time.",
  };
  return messages[code];
}
function severityFor(code) {
  if (code === "failed-then-success" || code === "impossible-travel") return "high";
  if (code === "failed-attempts" || code === "new-country") return "medium";
  return null;
}
const alert = {
  code: "new-country",
  severity: severityFor("new-country"),
  message: alertMessage("new-country"),
};
```

Result: `{ code: "new-country", severity: "medium", message: "A sign-in came from a country we have not seen on this account." }`.

Why: the alert is a short code, a sentence, and a severity. The sentence does not contain an IP.

**Case: the failure alert leaves out the IP, the hash, and the other user**

```javascript
function alertMessage(code) {
  const messages = {
    "failed-attempts": "Several sign-in attempts failed recently.",
    "failed-then-success": "A sign-in succeeded after several recent failures.",
    "new-country": "A sign-in came from a country we have not seen on this account.",
    "impossible-travel": "Two recent sign-ins came from different countries in a short time.",
  };
  return messages[code];
}
function severityFor(code) {
  if (code === "failed-then-success" || code === "impossible-travel") return "high";
  if (code === "failed-attempts" || code === "new-country") return "medium";
  return null;
}
function toAlert(code) {
  return { code, severity: severityFor(code), message: alertMessage(code) };
}
const raw = {
  code: "failed-attempts",
  ip: "1.1.1.1",
  passwordHash: "hash-of-secret",
  otherUser: "bea",
};
const alert = toAlert(raw.code);
const text = JSON.stringify(alert);
```

Result: `alert` is `{ code: "failed-attempts", severity: "medium", message: "Several sign-in attempts failed recently." }`. `text` does not contain `1.1.1.1`, `hash-of-secret`, or `bea`.

Why: the product warning uses the code, the sentence, and the severity. It does not include the IP, another user's events, the password, or the hash. `raw` is not what the user sees.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Treating a missing country as a new country | An unknown event becomes a warning | Return `"unknown"` and do not invent a country |
| Putting the IP in the sentence | The IP shows up in the UI | Keep the sentences above. They have no IP |
| Returning the password or the hash on the alert | The secret leaves the server | Send `code`, `severity`, and `message` only |

### Tip

`failed-then-success` and `impossible-travel` are high. `failed-attempts` and `new-country` are medium. Use the four sentences in the methods table.

### Practice

Build the alert for `impossible-travel` with `alertMessage` and `severityFor` from the cases above.

### Solution

```javascript
function alertMessage(code) {
  const messages = {
    "failed-attempts": "Several sign-in attempts failed recently.",
    "failed-then-success": "A sign-in succeeded after several recent failures.",
    "new-country": "A sign-in came from a country we have not seen on this account.",
    "impossible-travel": "Two recent sign-ins came from different countries in a short time.",
  };
  return messages[code];
}
function severityFor(code) {
  if (code === "failed-then-success" || code === "impossible-travel") return "high";
  if (code === "failed-attempts" || code === "new-country") return "medium";
  return null;
}
const alert = {
  code: "impossible-travel",
  severity: severityFor("impossible-travel"),
  message: alertMessage("impossible-travel"),
};
```

Result: `{ code: "impossible-travel", severity: "high", message: "Two recent sign-ins came from different countries in a short time." }`.

## 5. Session expiration

### Concept

If `now >= session.expiresAt`, the user is logged out. Return 401 and ask them to sign in again. Do not return 403. 403 would mean you know who they are and they are forbidden. Do not silently extend an expired session.

### Terms

| `now` compared with `expiresAt` | User | Status |
| --- | --- | --- |
| `now < expiresAt` | `{ id: session.userId }` | 200 for a route that only needs a user |
| `now >= expiresAt` | `null` | 401 |
| `session` is `null` | `null` | 401 |

### Methods

| Function | Rule |
| --- | --- |
| `currentUser(session, now)` | `null` when the session is missing or `now >= expiresAt` |
| `statusFor(session, now)` | 401 when `currentUser` is `null`, otherwise 200 |

### Examples

**Case: one millisecond before expiry is still logged in**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
const user = currentUser({ userId: "ada", expiresAt: 100 }, 99);
```

Result: `{ id: "ada" }`.

Why: `99 < 100`. The session is still valid. `expiresAt` is unchanged.

**Case: the expiry instant is 401**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
function statusFor(session, now) {
  if (!currentUser(session, now)) return 401;
  return 200;
}
const status = statusFor({ userId: "ada", expiresAt: 100 }, 100);
```

Result: `401`.

Why: `now >= expiresAt` means logged out. You no longer have an authenticated user. 403 is for a known user who is not allowed.

**Case: after expiry is still logged out**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
const user = currentUser({ userId: "ada", expiresAt: 100 }, 101);
```

Result: `null`.

Why: the comparison is `>=`, not `>`. Anything at or after `expiresAt` is logged out.

**Case: extending `expiresAt` on the way out keeps a dead session alive**

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
function badExtend(session, now) {
  if (!session) return null;
  return { id: session.userId, expiresAt: now + 1000 };
}
const correct = currentUser({ userId: "ada", expiresAt: 100 }, 100);
const extended = badExtend({ userId: "ada", expiresAt: 100 }, 100);
```

Result: `correct` is `null`. `extended` is `{ id: "ada", expiresAt: 1100 }`.

Why: `badExtend` silently extends a session that is already expired. The rule in this folder is the `null` result. Do not silently extend.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Returning 403 for an expired session | The client treats a logged-out user as forbidden | Return 401 |
| Using `now > expiresAt` | The exact expiry instant stays logged in | Use `now >= expiresAt` |
| Sliding `expiresAt` forward when the check fails | An expired session comes back | Return `null` and ask the user to sign in |

### Tip

Refreshing a session on activity is a product choice. If the scenario says expired sessions are logged out, return 401 and do not move `expiresAt`.

### Practice

`statusFor({ userId: "ada", expiresAt: 100 }, 100)` with the functions in the cases above.

### Solution

```javascript
function currentUser(session, now) {
  if (!session || now >= session.expiresAt) return null;
  return { id: session.userId };
}
function statusFor(session, now) {
  if (!currentUser(session, now)) return 401;
  return 200;
}
const status = statusFor({ userId: "ada", expiresAt: 100 }, 100);
```

Result: `401`.

## 6. Sensitive information

### Concept

The signed-in user can see their own alert: a short code, a sentence, and a severity. A server log that is access-controlled can store the status, the user id, and the alert code. Another caller gets nothing about this user's sessions. The page source gets no secrets and no other user's data. Do not include the IP, another user's events, the password, or the hash.

### Terms

| Place | Allowed |
| --- | --- |
| Server log, access-controlled | Status, user id, alert code |
| Response to that user | Their own alert: code, sentence, severity |
| Response to anyone else | Nothing about this user's sessions |
| Frontend source | No secrets and no other user's data |

### Methods

| Function | Returns |
| --- | --- |
| `userResponse(alert)` | `{ code, severity, message }` |
| `logLine(status, userId, code)` | `{ status, userId, code }` |

### Examples

**Case: the toast is the three alert fields**

```javascript
function userResponse(alert) {
  return { code: alert.code, severity: alert.severity, message: alert.message };
}
const toast = userResponse({
  code: "new-country",
  severity: "medium",
  message: "A sign-in came from a country we have not seen on this account.",
  ip: "1.1.1.1",
});
const text = JSON.stringify(toast);
```

Result: `toast` is `{ code: "new-country", severity: "medium", message: "A sign-in came from a country we have not seen on this account." }`. `text` does not contain `1.1.1.1`.

Why: the IP stays off the toast. The sentence was already free of an IP. Screenshots and analytics then cannot pick the address up from the DOM.

**Case: the log line is status, user id, and code**

```javascript
function logLine(status, userId, code) {
  return { status, userId, code };
}
const line = logLine(401, "ada", "new-country");
```

Result: `{ status: 401, userId: "ada", code: "new-country" }`.

Why: an access-controlled log can store those three. It does not need the IP, the password, or the hash.

**Case: another user's events stay out of this response**

```javascript
function userResponse(alert) {
  return { code: alert.code, severity: alert.severity, message: alert.message };
}
const mine = userResponse({
  code: "failed-attempts",
  severity: "medium",
  message: "Several sign-in attempts failed recently.",
});
const other = { userId: "bea", code: "new-country" };
const text = JSON.stringify(mine);
```

Result: `text` is `'{"code":"failed-attempts","severity":"medium","message":"Several sign-in attempts failed recently."}'`.

Why: `other` is not copied into `mine`. The response is this user's alert only.

**Case: the password and the hash are not response fields**

```javascript
function userResponse(code, severity, message) {
  return { code, severity, message };
}
const body = userResponse(
  "failed-then-success",
  "high",
  "A sign-in succeeded after several recent failures.",
);
const keys = Object.keys(body);
```

Result: `keys` is `["code", "severity", "message"]`.

Why: those are the fields the user needs. The password and the hash are not among them.

### Common mistakes

| Mistake | What happens | Fix |
| --- | --- | --- |
| Putting the IP in the toast | The IP is in the DOM, screenshots, and analytics | Send code, severity, and message |
| Returning the full event list so the browser can decide | The browser holds more than the user should see | Decide on the server. Send the alerts |
| Writing the password or the hash into the response | The secret leaves the server | Keep those values off the response and off the alert |

### Tip

Decide on the server. The browser renders the alerts it was given.

### Practice

`userResponse` on an alert that also has `ip: "1.1.1.1"`. List the keys of the return value.

### Solution

```javascript
function userResponse(alert) {
  return { code: alert.code, severity: alert.severity, message: alert.message };
}
const toast = userResponse({
  code: "new-country",
  severity: "medium",
  message: "A sign-in came from a country we have not seen on this account.",
  ip: "1.1.1.1",
});
const keys = Object.keys(toast);
```

Result: `["code", "severity", "message"]`.

## Exercises

See `exercises.md`.

## Quiz

1. Which status means "not logged in"?
2. Why is a role stored only in `localStorage` not proof of that role?
3. What does `HttpOnly` stop?
4. Should a compromise message include the IP? Why?
5. An expired session should return 401 or 403?
