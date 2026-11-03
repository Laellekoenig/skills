# skills

Personal agent skills. Each top-level directory is one skill (`<name>/SKILL.md`).

## Install on a device

```sh
git clone <remote-url> ~/code/skills
ln -s ~/code/skills/<name> ~/.claude/skills/<name>
```

## Skills

- `data-report`: turn data into a plain, dense, self-contained HTML report.
- `review-loop`: have a read-only reviewer subagent (user-chosen model) review your changes, triage its findings, fix, and repeat until clean.
- `ui-review-loop`: Claude and OpenAI subagents review a UI change on the running app; apply valid feedback and repeat.
- `next-app-stack`: scaffold a full-stack Next.js + Bun app (Better Auth, Drizzle, Tailwind/shadcn, TanStack Query, better-result, Oxlint) with its conventions.
