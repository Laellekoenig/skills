# __APP_NAME__

__APP_DESCRIPTION__

## Principles

Simple systems, software that feels obvious. Do not keep complexity because it
exists or add machinery because it looks impressive. Find the real constraint,
then the smallest model that makes correct behavior unsurprising. Measure
twice, cut once; yagni.

- Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb.
- Write concisely: code, comments, docs, commits.
- If a rule here fights the task, say so and get sign-off before breaking it.

## Architecture

- `app/`: routes. Server components load data and pass it to client components.
- `server-actions/`: actions wrapped in `defineAction`. `app/api/`: route handlers wrapped in `defineRoute`, only for streaming, webhooks, long requests or external callers. Both check `access`, validate input with zod and return `Result`s. A string error reaches the user; `internalError(log, message)` is logged and shows only `message`.
- Clients call actions through TanStack Query with `unwrapActionResult`.
- `lib/server/` is server-only, `lib/client/` browser-only, `shared/` both.
- Env only through `shared/env.ts`. Logs only through `createLogger(scope)`. User-facing strings only in `messages/`.

## Design

Flat, rounded, high contrast. Tailwind and shadcn/ui; ask before adding custom
base components. No shadows, no raw colors: only the tokens in `app/globals.css`.

- Color: `background`/`foreground` for pages, `muted` for resting fills, `accent` when hovered, `border` for hairlines, `primary` for actions, links and focus. `success`, `warning`, `destructive` only for state.
- Radius: `rounded-full` interactive, `rounded-2xl` containers, `rounded-lg` nested items, `rounded-xl` single-line inputs.
- Spacing on a 4px grid: `gap-2` related items, `p-4` in cards, `gap-6` sections, `gap-10` page blocks.
- Type: titles `font-semibold tracking-tight`, body `text-base`, controls `text-sm font-medium`, secondary text `text-muted-foreground`.
- Buttons: use variants and sizes as they are; never override height, radius or color.
- Icons: Lucide, `size-4` by default.

## Code Style

- Errors through `better-result`. Where `try` is unavoidable, add `// oxlint-disable-next-line local/no-try` with the reason.
- No `any`.
- Comments say how code is used, not what each line does.
- Few tests, for behavior that matters and could break. No tautological tests.
- File order: constants and types, exported functions, then helpers with callers before callees. No section comments.
- Components in `components/` are PascalCase (except `components/ui/`); all other files kebab-case. `.tsx` only for JSX.

## Workflow

- `bun run verify` after changes (format, lint, typecheck, spell, test). `bun run build` after changing dependencies or `next.config.ts`.
- Single tests: `bun run test <path>`, never bare `bun test`. Tests need no database or network; mock with `test/mock-module.ts`.
- Add legitimate words to `cspell.json`.
- `DEV_LOGIN=true` makes `/login` sign in as `dev@example.com`; list it in `ADMIN_EMAILS` for admin access.
- After changing `db/schemas/`, run `bun run db:generate`. Never migrate a shared database without asking.
- Do not stage files unless told to.
