# KelanaAI

AI-powered Travel Assistant — part of [Mastering Artificial Intelligence for Nation-building (MAIN)](https://main.alkademi.foundation/) program.

## Prerequisites

| Name                                      | Version      | Description                        |
| ----------------------------------------- | ------------ | ---------------------------------- |
| [Git](https://git-scm.com/)               | v2.55.0[^1]  | Distributed version control system |
| [Python](https://www.python.org/)         | v3.14[^1]    | Programming language               |
| [pnpm](https://pnpm.io/)                  | v11.22.0[^1] | Node.js package manager            |
| [PostgreSQL](https://www.postgresql.org/) | v18.6[^1]    | Relational Database                |

## Instalation

- **Pre-requisites**
  
  > *Refer to the homepage or official documentation for each pre-requisites for install instruction.*

- **Backend**
  
  TBA

- **Frontend**
  
  TBA

## Project Structure

```
<ROOT>/
├─ backend/                    # Backend codes
│  ├─ migrations/              # Database migration files
│  ├─ models/                  # Domain models
│  ├─ services/                # Backend services
│  ├─ tasks/                   # Background tasks
│  ├─ .env                     # Backend environment variables
│  ├─ database.py              # Database codes
│  ├─ main.py                  # Backend main entrypoint
│  ├─ migrate.py               # Database migration script
│  ╰─ requirements.txt         # Backend Project manifest
├─ docs/                       # Documentation folder
├─ frontend/                   # Frontend codes
│  ├─ app/                     # Next.js app router files
│  ├─ components/              # React components
│  ├─ hooks/                   # React hooks
│  ├─ lib/                     # Frontend utility codes
│  ├─ public/                  # Next.js public folder
│  ├─ services/                # Frontend services
│  ├─ types/                   # Typescript type definitions
│  ├─ .env                     # Frontend environment variables
│  ├─ components.json          # Shadcn UI manifest
│  ├─ eslint.config.mjs        # ESLint configuration file
│  ├─ next.config.ts           # Next.js configuration file
│  ├─ package.json             # Frontend project manifest
│  ├─ pnpm-lock.yaml           # PNPM lock file
│  ├─ pnpm-workspace.yaml      # PNPM configuration
│  ├─ postcss.config.mjs       # PostCSS configuration file
│  ╰─ tsconfig.json            # Typescript configuration
╰─ README.md                   # Project README
```

## Development

- **Backend Environment Variables**
  
  ```dotenv
  FRONTEND_URL=
  DATABASE_URL=
  AWS_BEARER_TOKEN_BEDROCK=
  AWS_REGION=
  AWS_BEDROCK_MODEL_ID=
  AWS_BEDROCK_TEMPERATURE=
  AWS_BEDROCK_TOKENS_PER_DAY=
  AWS_BEDROCK_MIN_TOKENS=
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  AWS_KNOWLEDGE_BASE_ID=
  AWS_KNOWLEDGE_BASE_MODEL_ARN=
  JWT_SECRET_KEY=
  ```

- **Frontend Environment Variables**
  
  ```dotenv
  NEXT_PUBLIC_API_URL=
  ```

- **Run backend server**
  
  ```sh
  cd backend && uvicorn app.main:app --reload && cd -
  ```

- **Run frontend server**
  
  ```sh
  cd frontend && pnpm run dev && cd -
  ```

## Sessions

| Session                                                               | Title                                  | Documentation                          |
| --------------------------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| [Session 01](https://github.com/IronGeek/kelana-ai/commits/session-1) | Building the First Feature of KelanaAI | [README.md](docs/session-01/README.md) |
| [Session 02](https://github.com/IronGeek/kelana-ai/commits/session-2) | Making KelanaAI Smarter                | [README.md](docs/session-02/README.md) |
| [Session 03](https://github.com/IronGeek/kelana-ai/commits/session-3) | Teaching KelanaAI to Communicate       | [README.md](docs/session-03/README.md) |
| [Session 04](https://github.com/IronGeek/kelana-ai/commits/session-4) | Teaching KelanaAI to Remember          | [README.md](docs/session-04/README.md) |
| [Session 05](https://github.com/IronGeek/kelana-ai/commits/session-5) | Teaching KelanaAI to Think with AI     | [README.md](docs/session-05/README.md) |
| [Session 06](https://github.com/IronGeek/kelana-ai/commits/session-6) | Giving KelanaAI a Face                 | [README.md](docs/session-06/README.md) |
| [Session 07](https://github.com/IronGeek/kelana-ai/commits/session-7) | Connecting KelanaAI's Brain and Face   | [README.md](docs/session-07/README.md) |
| [Session 08](https://github.com/IronGeek/kelana-ai/commits/session-8) | Teaching KelanaAI to Know Its Users    | [README.md](docs/session-08/README.md) |
| [Session 09](https://github.com/IronGeek/kelana-ai/commits/session-9) | Teaching KelanaAI to Read Knowledge    | [README.md](docs/session-09/README.md) |

## License

Copyright (c) 2026 Jakka Prihatna. All rights reserved.

---

[^1]: The the latest version available the time of writing. KelanaAI may or may not work with lower version.
