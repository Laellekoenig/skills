---
name: ui-review-loop
description: Claude and OpenAI subagents review a UI change on the running app; apply valid feedback and repeat. Use when the user asks for Claude and OpenAI (or Codex) feedback on a UI or UX change, or to "loop until happy" on one.
---

# ui-review-loop

Covers look and behavior. For code review, use `review-loop`.

## Setup

- **Reviewers:** one Claude, one OpenAI. Use the named models, else each provider's first listed, and say which. Provider unavailable: say so and stop.
- **App:** run this checkout's dev server with sample data. Confirm the URL serves this checkout, not another on the same port.

## Each round

1. Screenshot every touched state: desktop, phone, relevant themes. Fix what is plainly broken. Run checks.

2. Spawn two fresh reviewers in parallel with this brief. Change nothing until both report.

   ```
   Review a UI change. Do not modify files or git state, start servers, or create,
   edit or delete app content. Otherwise use the app freely in your own browser tab;
   close it when done.
   Repo: <path>. Its agent instructions describe the developer's taste.
   Goal, in the user's words: <request>
   App: <url>. Visit: <routes>
   Screenshots: <absolute paths>
   Change: <scope command>
   Report visual, layout, usability and behavior problems, including <states that
   matter, e.g. narrow widths, long content, keyboard, dark mode>.
   Prefer removing or merging over adding. Skip nitpicks and code style.
   <round 2+: Already handled, do not repeat without new evidence: <ledger>>
   For each finding: id, severity, path:line, problem, how to reproduce, fix.
   If none, reply "No findings".
   ```

3. Merge duplicates and confirm each finding yourself:
   - **Valid:** fix.
   - **Rejected:** note why. Reject additions when something simpler works.
   - **Out of scope:** leave; tell the user.
   - **Judgment call:** decide; list in the report.

4. Check fixes in the browser, run checks, update the ledger (`R1-2 fixed: …`, `R1-3 rejected: <reason>`).

## Stop

Run another round only if this one changed layout or behavior. Apply small polish without re-review. Stop after 5 rounds.

Report: final screenshots, rounds, models, changes, rejections with reasons, judgment calls, out-of-scope problems, check status.
