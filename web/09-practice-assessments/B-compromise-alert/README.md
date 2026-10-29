# Assessment B — account compromise alerts

> [!WARNING]
> The starter tests fail until the exercise is fixed. That failure is the assignment.

45 minutes. This is an original exercise. It is not a vendor's exam.

You are adding the check that decides whether the signed-in user should see a security alert. You are given sign-in events the server already stored. You are not detecting intrusions on a network, and you do not need passwords.

## Input

```javascript
detectCompromise(user, logins)
```

`user` is `{ knownCountries: ["US"] }` or `null`.

Each login is `{ ts, country, success, ip }`. `ts` is milliseconds. `success` is boolean when it is well formed. `ip` must never appear in a message.

## Rules

Windows are inclusive: a gap of exactly 10 minutes counts, a gap of one millisecond more does not.

| Code | Severity | When |
| --- | --- | --- |
| `failed-then-success` | high | Some successful event has at least 5 earlier events with `success === false` in the 10 minutes before it |
| `failed-attempts` | medium | Some 10-minute stretch, ending at an event's timestamp, contains at least 5 failures, and `failed-then-success` did not fire |
| `new-country` | medium | A success has a non-empty string `country` that is not in `knownCountries`. One alert is enough |
| `impossible-travel` | high | Two successes have different non-empty countries and timestamps at most 30 minutes apart. One alert is enough |

If `failed-then-success` fires, do not also add `failed-attempts`.

Messages, exact strings:

| Code | Message |
| --- | --- |
| `failed-then-success` | `A sign-in succeeded after several recent failures.` |
| `failed-attempts` | `Several sign-in attempts failed recently.` |
| `new-country` | `A sign-in came from a country we have not seen on this account.` |
| `impossible-travel` | `Two recent sign-ins came from different countries in a short time.` |

Sort alerts by severity (`high` first), then by `code`.

Return `[]` for a missing or empty login list. Do not throw on a missing country.

## Time

| Minutes | Do this |
| --- | --- |
| 0–8 | Read the rules and the test names |
| 8–30 | Implement one code at a time |
| 30–40 | Check the boundary tests and the IP ban |
| 40–45 | Note which rule you would unit-test first in production |

```bash
node --test 09-practice-assessments/B-compromise-alert/detect.test.mjs
```

Run that from the `web/` folder.

## Rubric

| Points | Item |
| --- | --- |
| 25 | Failure rules, including the choice between the two codes |
| 20 | New country, ignoring blank countries |
| 20 | Impossible travel, 30-minute boundary |
| 15 | Messages and sort order |
| 10 | No IP in any message |
| 10 | Empty input returns `[]` and does not throw |

## Sample

Five failures at t = 0, 1, 2, 3, and 4 minutes, then a success at 9 minutes from country `CA`, known countries `["US"]`.

Expected codes: `failed-then-success`, `new-country`. Not `failed-attempts`.
