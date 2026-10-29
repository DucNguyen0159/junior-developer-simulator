# Junior developer simulator

Practice tracks for junior roles. Lessons exist only where a track says `lessons`.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=flat&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

> [!IMPORTANT]
> `web/` is the only track with lectures and runnable exercises. The other folders are roadmaps. Lessons get added when there is an application, or when a topic is already weak.

> [!NOTE]
> Software developer and application developer both use `web/`. AWS engineer, cloud engineer, and deployment engineer all use `cloud/`.

| Track | Status | What finishing it lets you do |
| --- | --- | --- |
| [web/](web/) | lessons | Finish the junior web lectures, exercises, and three timed simulations |
| [cloud/](cloud/) | roadmap | Read the study order for AWS, cloud, and deployment |
| [data-analyst/](data-analyst/) | roadmap | Read the study order for a data analyst track |
| [data-engineer/](data-engineer/) | roadmap | Read the study order for a data engineer track |
| [ai-engineer/](ai-engineer/) | roadmap | Read the study order for an AI engineer track |

## Commands

From this folder:

```bash
node web/01-javascript-fundamentals/examples.mjs
node web/02-debugging/examples.mjs
node web/03-async-and-apis/examples.mjs
node web/04-authentication/examples.mjs
node web/05-authorization/examples.mjs
node web/06-frontend-state-and-ui/examples.mjs
node web/08-testing/examples.mjs
python3 web/07-python-backend/examples.py
```

Lesson solutions, only after you attempt the exercises:

```bash
node web/01-javascript-fundamentals/solutions/exercises.mjs
node web/02-debugging/solutions/exercises.mjs
node web/03-async-and-apis/solutions/exercises.mjs
node web/04-authentication/solutions/exercises.mjs
node web/05-authorization/solutions/exercises.mjs
node web/06-frontend-state-and-ui/solutions/exercises.mjs
node web/08-testing/solutions/exercises.mjs
python3 web/07-python-backend/solutions/exercises.py
```

Assessment tests. These fail until you fix the starter. That is intentional.

```bash
node --test web/09-practice-assessments/A-debug/activity.test.mjs
node --test web/09-practice-assessments/B-compromise-alert/detect.test.mjs
node --test web/09-practice-assessments/C-page-authorization/access.test.mjs
```
