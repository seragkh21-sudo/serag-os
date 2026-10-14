# Develop SERAG OS with another AI

Repository: https://github.com/seragkh21-sudo/serag-os

Live app: https://serag-os.vercel.app/

## Free development setup

GitHub Copilot Free can help edit this repository in a supported editor, such as VS Code. Install the official GitHub Copilot extension, sign into your own GitHub account, and select the Free plan. Repository instructions are in `.github/copilot-instructions.md`; other coding agents should read `AGENTS.md`.

Account activation is a separate personal sign-in step. These repository files do not activate a Copilot subscription or grant any AI access to your account. The Free plan has usage limits; this setup does not use paid automatic GitHub PR review or the paid cloud coding agent.

Official plans: https://github.com/features/copilot/plans

Clone the repository, open the folder in your editor, install Node 24, then run:

```sh
npm ci --ignore-scripts
npm test
```

The `Test web app` GitHub Actions workflow runs these tests for pull requests and pushes to main on a standard public-repository runner. It requires no external API key or production database credentials. It reports failures; it does not change branch protection settings.

## What to give the AI

Share the repository link and the precise feature you want. Ask it to read `AGENTS.md`, `SERAG_OS_PROJECT_BRIEF.md`, and the relevant documents first. Ask for a small PR, tests, and a clear explanation of limitations.

Do not share the Supabase service-role key, Vercel tokens, private user data, or account passwords. The code link is sufficient to start reviewing the project. Database changes and real deployment verification need separately authorized access to those services.

The existing app is vanilla JavaScript, not React. Preserve the unified English journey, task/goal links, owner isolation, and server-only admin access. Preview fixtures can verify UI behavior without exposing real accounts.

Public visibility allows an AI to read the repository. It does not itself establish an open-source license; no license choice is made by this setup.
