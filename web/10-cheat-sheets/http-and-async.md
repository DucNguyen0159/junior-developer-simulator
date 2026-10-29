# HTTP and async

| Status | Meaning |
| --- | --- |
| 200 / 201 | Success / created |
| 400 | Bad input |
| 401 | Not logged in |
| 403 | Logged in, not allowed |
| 404 | Missing |
| 500 | Server fault |

`fetch` rejects on network failure, not on 500. Check `response.ok`.

`await` pauses the function. A later `.then` must not overwrite a newer request. Keep a token and ignore stale results.

Empty list: success. Error: the request failed. Loading: not finished.
