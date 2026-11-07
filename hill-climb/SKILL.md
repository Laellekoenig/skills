---
name: hill-climb
description: Improve something in rounds, with two judge subagents on different models scoring each version against a rubric taken from the user's words, and keep only the changes that score better. Works for UI and visual changes, animations, writing, names and copy, prompts and skills, plans, and code. Use when the user asks for two subagents or models to rate, judge or give feedback on your work, to "loop until they are satisfied", or to hill-climb on something.
---

# hill-climb

The judges stand in for the user. They don't replace the user: they miss what they can't see and lean towards their own taste. For a review that only looks for code bugs, use `review-loop`.

## Setup

- **Judges:** use the two models the user named. If they named none, use one Claude and one OpenAI model, the newest of each, and say which. If one is unavailable, say so and stop. Never swap in another model.
- **Rubric:** 3 to 5 criteria, taken from the user's words. Include what they said they fear, e.g. "cute, not a distraction that becomes annoying" gives *cute* and *not distracting* as two criteria.
- **Evidence:** what the judges look at must be the real result, not only the code that produces it:

  | Use case | Evidence |
  |---|---|
  | UI | screenshots of every changed state (desktop, phone, light and dark, long content, pages you navigate between), plus the URL |
  | Motion | frame strips of each animation, rendered from the real component |
  | Writing | the file, plus the original if this is a revision |
  | Names, copy, options | 3 to 5 candidates labelled A, B, C… in a different order for each judge |
  | Prompts, skills | outputs on the same fixed inputs |
  | Code | the diff command and the test command |

  If the repo forbids screenshots, render the result headlessly in the scratchpad. If you can't render it at all, tell the judges and the user that the judges are working only from the code.

## Each round

1. **Check it yourself first.** Build the evidence and look at it. Fix anything obviously broken. Run checks.
2. **Launch both judges in the same message,** so they run at the same time. Start fresh judges each round. Give them the goal and the evidence, but not your reasoning or which fixes you prefer:

   ```
   You are an independent judge. Do not modify files or git state, start servers,
   or create, edit or delete app content.
   Goal, in the user's words: <verbatim request>
   Context: <repo path, AGENTS.md, source files or assets you need to check claims yourself>
   Evidence: <absolute paths, URL, diff command, or candidates>
   Rubric: <criteria>
   <round 2+: Since last round:
    - R1-2 fixed: …
    - R1-3 declined: <objection>. Challenge this only with a concrete scenario.>
   First list what you looked at, and anything you could not open.
   Then reply in this format:
   SCORES: <criterion> x/10 for each criterion, then overall x/10
   SATISFIED: yes/no (yes means you would ship it as is. Don't say no over taste.)
   CONCERNS: numbered. For each: severity (blocker/major/minor/taste), where,
     the concrete scenario, a fix
   KEEP: up to 3 things that work and must not get worse
   <candidates: rank them, and say what the winner should borrow from the others>
   A score of 9 or more, or no concerns, needs one sentence on what you checked.
   ```

3. **Check every concern yourself,** against the code, the art or the text:
   - **Valid:** fix it.
   - **Wrong:** decline it and write your objection in the ledger. Judges in the next round can challenge it.
   - **Taste, or the judges disagree:** decide yourself, and list it in the report.
   - **Out of scope, or not a regression:** leave it, and tell the user.
4. **Keep only improvements.** Record each judge's overall score per round. A move of 1 point is noise. Revert a change and try a different fix if both judges' scores drop, or if a judge names it as a regression. With candidates, keep the winner, make variations of it, and judge again.

## Stop

- **Done:** both judges are satisfied and no blocker or major concern is left. Taste or minor concerns alone don't call for another round. Apply small polish without judging it again.
- **Plateau:** the overall score hasn't gone up for 2 rounds. Stop and tell the user where the judges disagree.
- **Round 5:** ask the user whether to continue, unless they said to loop until the judges are satisfied.
- **A judge fails or stalls** long after the other judge has finished: start a fresh one once. If a judge's reply shows it didn't open the evidence, start a fresh one once too. If either judge fails again, finish the round with one judge and say so.

## Report

- A table of scores for each round and each judge.
- What changed.
- Concerns you declined, with the reasons.
- Judgment calls you made.
- What you left for the user.
- What the judges could not see.
- Check status.

End by naming the one or two things the user should check by eye.
