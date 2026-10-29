# Auth and access

Authentication: who. Authorization: what they may do.

| Situation | Status |
| --- | --- |
| No session, or expired session | 401 |
| Session, missing permission | 403 |
| Public page | 200, even with no user |
| Allowed | 200 |

Deny when the page is missing, the permission is blank, or the user lacks it. No admin shortcut unless the role lists the permission.

Do not trust `role` from the JSON body. Do not put an IP or a password in a user-facing alert.

| Alert | When |
| --- | --- |
| `failed-attempts` | 5 failures inside some 10-minute window, and no failed-then-success |
| `failed-then-success` | A success has 5 failures in the 10 minutes before it |
| `new-country` | Successful sign-in, non-empty country, not in `knownCountries` |
| `impossible-travel` | Two successes, different countries, at most 30 minutes apart |

Windows are inclusive (`<=`).
