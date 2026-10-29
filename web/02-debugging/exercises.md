# Exercises

The buggy functions are in `buggy.mjs`. Do not edit that file. Write fixed functions in your own file.

1. `recordLogin` stores one object for every user. Write `recordLoginFixed(store, userId, event)` so that changing one user's stored ip does not change another's, and so that mutating the original `event` after the call does not change the store.

2. `countFailures` uses `==` and divides milliseconds by `1000`. Write `countFailuresFixed(events, windowMinutes, now)` that counts events with `success === false` whose timestamp is inside the last `windowMinutes` before `now`. Do not sort the caller's array.

3. `loadSummary` returns before the fetch finishes. Write an `async` function that waits for `fetchEvents(userId)` and returns `{ userId, count }` where `count` is the number of events. If `fetchEvents` rejects, the function should reject too.

4. Two calls to `saveLatest(value, delay)` are in flight. Write a version that records only the value from the call that started last. A slower earlier call must not overwrite it.
