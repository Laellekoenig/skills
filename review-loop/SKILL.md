---
name: review-loop
description: Have a read-only reviewer subagent, on a model the user picks, review your code changes. Triage each finding, ask the user when unsure, fix the valid ones, and repeat until no valid findings remain. Use when the user asks to have a subagent or another model review your work, or to "review until clean".
---

# review-loop

## Setup

- **Model:** use the model the user named. If none was named, ask. If it is unavailable, say so and stop. Never substitute.
- **Scope:** the command that shows the change, e.g. `git diff HEAD`, `git diff main...HEAD`, or `gh pr diff <n>`.

## Each round

1. **Spawn a fresh reviewer** with the user's model and read-only tools (e.g. Claude Code `Agent` with `subagent_type: Explore` and `model` set; Codex or `delegate_task` with a read-only sandbox). Wait for its result. Brief:

   ```
   Review a code change. READ-ONLY: do not modify any file or git state.
   Repo: <path>
   Goal of the change: <user's request>
   See the change with: <scope command>
   Report bugs, unmet requirements, security issues, regressions, and missing
   tests in the changed code. Skip style preferences.
   <round 2+: Already handled, do not repeat without new evidence: <ledger>>
   For each finding: id, severity (high/medium/low), path:line, problem,
   failure scenario, suggested fix. If none, reply "No findings".
   ```

   Give the goal, not your opinion of the code.

2. **Check `git status`** is unchanged. If the reviewer changed anything, tell the user.

3. **Triage every finding** against the code yourself:
   - **Valid:** you confirmed it. Fix it.
   - **Invalid:** you can show why it is wrong. Note the reason.
   - **Unsure, or a judgment call** (behavior, scope, design trade-off): ask the user. Batch these questions once per round.

4. **Fix the valid findings**, run the tests, and add every finding to the ledger (`R1-2 fixed: …`, `R1-3 rejected: <reason>`, `R1-4 user: leave`).

## Stop

Stop when a round has no valid findings. A round that fixed something always gets another round. After 5 rounds, ask the user whether to continue.

Report to the user: rounds run, what was fixed, what was rejected and why, and test status.
