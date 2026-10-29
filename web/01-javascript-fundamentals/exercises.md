# Exercises

Write these in a new file. Run them with `node your-file.mjs`. Open `solutions/exercises.mjs` only after you have a result for each one.

1. `failedCount(events)` returns how many events have `success === false`. An event with `success: 0` does not count. Do not use `==`.

2. `activeUsers(users)` returns a new array of users whose `active` field is exactly `true`. Keep the original array unchanged.

3. `withPrice(card, price)` returns a new card object with that price. The caller's object must keep its old price. Nested fields may stay shared.

4. `total(numbers)` returns the sum. An empty array returns `0`.

5. `labelFor(user)` returns `user.name` when the user exists, and `"guest"` when `user` is `null` or `undefined`. A user with name `""` stays `""`.

6. `firstOver(prices, limit)` returns the first price strictly greater than `limit`, or `null` if none. Do not return `undefined`.
