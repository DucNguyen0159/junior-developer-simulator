# Assessment A — debug a security summary

> [!WARNING]
> The starter tests fail until the exercise is fixed. That failure is the assignment.

35 minutes. This is an original exercise. It is not a vendor's exam.

## Report

A teammate wrote:

> The security page sometimes shows the wrong IP as the user's last login. It got worse after we cached the last event. The failed-attempt count looks too small, and the summary endpoint comes back empty.

There is no stack trace. The tests in `activity.test.mjs` are the behavior the page needs.

## Your job

Fix `activity.mjs`. Do not change the tests.

| Function | Required behavior |
| --- | --- |
| `recordLogin(store, userId, event)` | Remember `ip` and `ts` for that user only. Later changes to `event` must not change the store |
| `getLastLogin(store, userId)` | A copy of the stored login, or `null`. Changing the returned object must not change the store |
| `countRecentFailures(events, windowMinutes, now)` | How many events have `success === false` and a timestamp within `windowMinutes` of `now`, inclusive. Do not reorder `events` |
| `loadAccountSummary(fetchEvents, userId)` | Wait for the events. Return `{ userId, count }` where `count` is `events.length` |

## Time

| Minutes | Do this |
| --- | --- |
| 0–5 | Read this file and the test names |
| 5–15 | Run the tests. Write down which assertion fails |
| 15–30 | Fix one failure at a time |
| 30–35 | Write `explanation.md` with symptom, cause, fix, and check |

```bash
node --test 09-practice-assessments/A-debug/activity.test.mjs
```

Run that from the `web/` folder.

## Edge cases the tests lock in

- Two users must not share one object.
- `success: 0` is not a failure.
- The window is in minutes, compared using milliseconds.
- A timestamp exactly `windowMinutes` old still counts. One millisecond older does not.
- The summary is not `null`.

## Rubric

| Points | Item |
| --- | --- |
| 30 | Last login is per user and is not affected by later edits to the input |
| 20 | Returned login is a copy |
| 25 | Failure count uses `===` and the right units, and does not sort the input |
| 15 | Summary waits for the fetch |
| 10 | `explanation.md` names the cause, not only the new code |

## Sample

`recordLogin` for user `a` with ip `1.1.1.1`, then for user `b` with ip `2.2.2.2`. `getLastLogin(store, "a").ip` is `1.1.1.1`.

Do not open `answer-keys/` until the timer ends.
