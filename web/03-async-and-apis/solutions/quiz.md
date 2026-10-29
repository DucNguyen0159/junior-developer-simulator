# Quiz answers

1. No. `fetch` fulfills with a response. Check `response.ok` or `status`. It rejects when the network fails.
2. 401 means the caller is not authenticated. 403 means they are authenticated and still not allowed.
3. The current `async` function. Other JavaScript can run while it waits.
4. Parsed JSON can be any value. Reading `.id` on `null` throws, and a number `id` is the wrong type.
5. An empty list is a successful result with nothing to show. An error means the request did not succeed.
