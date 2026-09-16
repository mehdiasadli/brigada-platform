# Agent notes

Git workflow lives in `.cursor/rules/github-pr-workflow.mdc` and applies to every agent.

Frontend: shadcn via `@brigada/ui` (`.cursor/rules/frontend-shadcn.mdc`). Public Next pages are RSC with metadata (`.cursor/rules/frontend-next.mdc`).

Work on a feature branch off `main`. Do not commit to `main`. When opening a PR, use `gh pr create` and fill `.github/pull_request_template.md` (Summary + Test plan). Do not merge unless asked.
