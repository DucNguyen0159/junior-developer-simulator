# Junior web practice

Practice for a junior web role. Three timed simulations: debugging with limited information (35 min), showing when an account may be compromised (45 min), and checking which pages a user may access (45 min). Total 125 minutes.

These three simulations are original exercises. They are not a vendor's exam.

The stack is JavaScript, a short Vue 3 comparison with React, Python (Flask-style handlers), REST, testing, and auth. This track prioritizes JavaScript and the ideas that transfer. Vue appears only as a short comparison with React. Django and FastAPI are named, not taught.

## How to study

Read the lecture. Run the examples. Do the exercises in a new file before you open `solutions/`. Take the quiz, then check `solutions/quiz.md`.

Write code yourself. Turn off autocomplete when you practice. After each exercise, say out loud what the function returns and why.

Do not open `answer-keys/` until you have finished a timed assessment or given up after the time limit.

> [!TIP]
> Read the tests before editing the starter.

## Roadmap

| Order | Folder | What you can do after it | Time |
| --- | --- | --- | --- |
| 1 | `01-javascript-fundamentals` | Read and write everyday JS without guessing `==`, copies, or array methods | 5–6 h |
| 2 | `02-debugging` | Reproduce a bug from a thin report and name the root cause | 3 h |
| 3 | `03-async-and-apis` | `await` a `fetch`, handle non-200 responses, and ignore a stale response | 3 h |
| 4 | `04-authentication` | Explain login, cookies, expiry, and what a compromise alert may say | 2.5 h |
| 5 | `05-authorization` | Decide access with deny-by-default roles and permissions | 2.5 h |
| 6 | `06-frontend-state-and-ui` | Render loading, error, and alert states. Map the idea to Vue later | 2 h |
| 7 | `07-python-backend` | Validate a request and return 401 vs 403 from a Flask-style handler | 2 h |
| 8 | `08-testing` | Read a failing test and add one regression case | 2 h |
| 9 | `10-cheat-sheets` | One-page refresh the morning of a timed simulation | 45 min |
| 10 | `09-practice-assessments` | Three original simulations at the time limits above | 125 min + 2 h review |

About 24 hours if you do every exercise. If you have one weekend, use the priority list and still run all three simulations.

## Priority

| Priority | Topic | Why |
| --- | --- | --- |
| 1 | Debugging under a vague report | Simulation 1 is 35 minutes of this |
| 2 | Authorization, deny by default | Simulation 3 |
| 3 | Compromise signals and safe messages | Simulation 2. Product judgment, not hacking |
| 4 | `===`, truthiness, array methods, shallow copy | These cause the bugs you will be asked to see |
| 5 | `async/await`, failed fetches, race conditions | A late response must not overwrite a newer one |
| 6 | Tests as a spec | The simulations include tests. Read them before you code |
| 7 | Flask status codes | Useful if a simulation is Python. The ideas match Express |
| 8 | Vue 3 syntax | Transfer later. Do not block on it |

## Commands

From this folder (`web/`):

```bash
node 01-javascript-fundamentals/examples.mjs
node 02-debugging/examples.mjs
node 03-async-and-apis/examples.mjs
node 04-authentication/examples.mjs
node 05-authorization/examples.mjs
node 06-frontend-state-and-ui/examples.mjs
node 08-testing/examples.mjs
python3 07-python-backend/examples.py
```

Lesson solutions, only after you attempt the exercises:

```bash
node 01-javascript-fundamentals/solutions/exercises.mjs
node 02-debugging/solutions/exercises.mjs
node 03-async-and-apis/solutions/exercises.mjs
node 04-authentication/solutions/exercises.mjs
node 05-authorization/solutions/exercises.mjs
node 06-frontend-state-and-ui/solutions/exercises.mjs
node 08-testing/solutions/exercises.mjs
python3 07-python-backend/solutions/exercises.py
```

Assessment tests. These fail until you fix the starter. That is intentional.

```bash
node --test 09-practice-assessments/A-debug/activity.test.mjs
node --test 09-practice-assessments/B-compromise-alert/detect.test.mjs
node --test 09-practice-assessments/C-page-authorization/access.test.mjs
```

No `npm install`. Examples use Node's built-in test style (`node:assert`) and the Python standard library. Flask is shown in the lecture. The runnable Python is plain functions so you do not need a virtualenv.

## Checklist

- [ ] 01 lecture, examples, exercises, quiz
- [ ] 02 lecture, examples, exercises, quiz
- [ ] 03 lecture, examples, exercises, quiz
- [ ] 04 lecture, examples, exercises, quiz
- [ ] 05 lecture, examples, exercises, quiz
- [ ] 06 lecture, examples, exercises, quiz
- [ ] 07 lecture, examples, exercises, quiz
- [ ] 08 lecture, examples, exercises, quiz
- [ ] Cheat sheets read once
- [ ] Assessment A, 35 minutes, then review
- [ ] Assessment B, 45 minutes, then review
- [ ] Assessment C, 45 minutes, then review

## Rules for the timed simulations

1. Read the scenario README and the tests before editing.
2. Start a timer. Stop when it rings.
3. Write a short explanation of the bug or the decision, even if the code is unfinished.
4. Open `answer-keys/assessments/` only after the timer.
