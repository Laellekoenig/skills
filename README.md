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
- `hill-climb`: two judge subagents on different models score each version against the user's goal; keep what scores better and repeat until both are satisfied. Covers UI, motion, writing, names, prompts and code.
- `next-app-stack`: scaffold a full-stack Next.js + Bun app (Better Auth, Drizzle, Tailwind/shadcn, TanStack Query, better-result, Oxlint) with its conventions.
