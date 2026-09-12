# KelanaAI

AI-Powered Travel Assistant — part of [Mastering Artificial Intelligence for Nation-building (MAIN)](https://main.alkademi.foundation/) program.

## Prerequisites

| Name                                      | Version      | Description                        |
| ----------------------------------------- | ------------ | ---------------------------------- |
| [Git](https://git-scm.com/)               | v2.55.0[^1]  | Distributed version control system |
| [pre-commit](https://pre-commit.com/)     | v4.6.2[^1]   | Pre-commit hooks manager           |
| [Python](https://www.python.org/)         | v3.14[^1]    | Programming language               |
| [uv](https://docs.astral.sh/uv/)          | v0.12.10[^1] | Python package and project manager |
| [pnpm](https://pnpm.io/)                  | v11.22.0[^1] | Node.js package manager            |
| [PostgreSQL](https://www.postgresql.org/) | v18.6[^1]    | Relational Database                |

## Installation

- **Pre-requisites**

  > *Refer to the homepage or official documentation for each pre-requisites for install instruction.*

- **Backend**

  > *TBA*

- **Frontend**

  > *TBA*

## Project Structure

```
<ROOT>/
├─ backend/                    # Backend codes
│  ├─ models/                  # Domain models
│  ├─ services/                # Backend services
│  ├─ tasks/                   # Background tasks
│  ├─ .env                     # Backend environment variables
│  ├─ database.py              # Database codes
│  ├─ main.py                  # Backend main entrypoint
│  ├─ pyproject.toml           # Backend Project manifest
│  ╰─ uv.lock                  # Python uv lock file
├─ database/                   # Database related files
│  ├─ migrations/              # Database migration files
│  ╰─ migrate.py               # Database migration script
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
├─ .pre-commit-config.yaml     # Pre-commit configuration
╰─ README.md                   # Project README
```

## Environment Variables

The following list the variables that are reads from the environment.

**Backend** (`backend/.env`)

```dotenv
# The application name
APP_NAME=
# The database connection string
APP_DATABASE_URL=
# The frontend application site url
APP_FRONTEND_URL=

# System user
APP_SYSTEM_USER_NAME=
APP_SYSTEM_USER_EMAIL=
APP_SYSTEM_USER_PASSWORD=

# The secret key used to sign the authentication token
JWT_SECRET_KEY=
JWT_ALGORITHM=
JWT_EXPIRE_MINUTES=

# The AWS region to use
AWS_REGION=
# The AWS bearer token for authenticating with Bedrock runtime
AWS_BEARER_TOKEN_BEDROCK=
# The AWS model id used for conversing with Bedrock runtime
AWS_BEDROCK_MODEL_ID=
# The value for randomness and creativity of (LLM) output
AWS_BEDROCK_TEMPERATURE=
# The maximum tokens used for 1 itinerary-day generation
AWS_BEDROCK_TOKENS_PER_DAY=
# The minimum tokens used for itinerary generation
AWS_BEDROCK_MIN_TOKENS=

# A pair of credentials used to authenticate and
# sign programmatic requests made to AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# A pair of identifier used for the Amazon knowledge bases
# Retrieval-Augmented-Generation (RAG)
AWS_KNOWLEDGE_BASE_ID=
AWS_KNOWLEDGE_BASE_MODEL_ARN=
```

**Frontend** (`frontend/.env`)

```dotenv
# The backend API url
NEXT_PUBLIC_API_URL=
```

## Development

The following list commands that are often used in development.

- Some command read settings from the environment variables. Make sure've you set the required environment variables with their appropriate value.

- All commands are assumed to be run from the `<root>` project directory

### Workspace

- Clone the KelanaAI git repository to local folder.

  ```sh
  git clone https://github.com/IronGeek/kelana-ai.git
  ```

- Install `pre-commit`to git hooks

  ```sh
  pre-commit install
  ```

- Clean projects (remove all caches and virtual environments)

  ```sh
  make clean
  ```


### **Database**

- Create or migrate the KelanaAI database

  ```sh
  uv run --directory database --with "psycopg[binary]" migrate.py
  ```

### **Backend**

- Sync the backend envirnonment

  ```sh
   uv sync --directory backend
  ```

- Add dependencies to backend

  ```sh
  uv add --directory backend <package name>
  ```

- Remove dependencies from backend

  ```sh
  uv remove --directory backend <package name>
  ```

- Check outdated dependencies

  ```sh
  uv tree --directory backend --outdated --depth 1
  ```

- Run the backend API server in development mode.

  ```sh
  uv run --directory backend fastapi dev
  ```

### **Frontend**

- Run the frontand server in development mode.

  ```sh
  pnpm --dir frontend run dev
  ```

## Sessions

| Session                                                                | Title                                       | Documentation                          |
| ---------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| [Session 01](https://github.com/IronGeek/kelana-ai/commits/session-1)  | Building the First Feature of KelanaAI      | [README.md](docs/session-01/README.md) |
| [Session 02](https://github.com/IronGeek/kelana-ai/commits/session-2)  | Making KelanaAI Smarter                     | [README.md](docs/session-02/README.md) |
| [Session 03](https://github.com/IronGeek/kelana-ai/commits/session-3)  | Teaching KelanaAI to Communicate            | [README.md](docs/session-03/README.md) |
| [Session 04](https://github.com/IronGeek/kelana-ai/commits/session-4)  | Teaching KelanaAI to Remember               | [README.md](docs/session-04/README.md) |
| [Session 05](https://github.com/IronGeek/kelana-ai/commits/session-5)  | Teaching KelanaAI to Think with AI          | [README.md](docs/session-05/README.md) |
| [Session 06](https://github.com/IronGeek/kelana-ai/commits/session-6)  | Giving KelanaAI a Face                      | [README.md](docs/session-06/README.md) |
| [Session 07](https://github.com/IronGeek/kelana-ai/commits/session-7)  | Connecting KelanaAI's Brain and Face        | [README.md](docs/session-07/README.md) |
| [Session 08](https://github.com/IronGeek/kelana-ai/commits/session-8)  | Teaching KelanaAI to Know Its Users         | [README.md](docs/session-08/README.md) |
| [Session 09](https://github.com/IronGeek/kelana-ai/commits/session-9)  | Teaching KelanaAI to Read Knowledge         | [README.md](docs/session-09/README.md) |
| [Session 10](https://github.com/IronGeek/kelana-ai/commits/session-10) | Teaching KelanaAI to Remember Conversations | [README.md](docs/session-10/README.md) |

## License

Copyright (c) 2026 Jakka Prihatna. All rights reserved.

---

[^1]: The the latest version available the time of writing. KelanaAI may or may not work with lower version.
