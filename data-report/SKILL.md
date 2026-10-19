---
name: data-report
description: Turn data (logs, benchmarks, timings, costs, eval results, usage stats, CSV/JSON) into a single self-contained HTML report that reads as plain, dense, and trustworthy rather than AI-generated. Black page, white text, one accent color, big-number stat rows, hairline tables with inline bars, minimal charts, and short, numeric, caveat-first writing. Use when asked to visualize, analyze, summarize, benchmark, audit, or "make a report/page/dashboard" from data, or when the user wants output that avoids typical AI dashboard clutter.
---

# data-report

Produce one `.html` file. No framework, no CDN, no build step. It opens offline and the data is inline.

The goal is a page that a careful analyst would write: the finding first, the numbers exact, the limits stated. Decoration is a cost. Every element has to carry information or be removed.

Start from `assets/template.html`. It holds the tokens, every component below, and a small renderer. Its content is placeholder; replace all of it.

## Workflow

1. **Load and check the data first.** Count records, find the date range, find missing or null values, and find what the numbers include that a reader might not expect (idle time, server lifetime, cached tokens, retries). You need this before you can write the lead.
2. **Decide the one finding.** If you cannot say it in a sentence with a number in it, keep analyzing.
3. **Pick sections from the list below.** Use only the ones the data supports. A short report is fine.
4. **Copy the template, embed the data as a `const DATA = {...}` block, and replace the content.** Delete unused components and unused CSS.
5. **Render and look at it** (browser, preview tool, or screenshot). Check it at about 1100px and about 400px wide. Fix overflow and truncation.
6. **Cross-check every number in the prose against the data.** Recompute totals. A table that does not sum to the headline is a bug.

## Page structure

Order, top to bottom. Skip any that do not apply.

1. `h1`. A plain noun phrase ("T3 Code tool timings") or the question the data answers ("Which model understands a large Rust codebase best?"). Never a slogan, never an emoji.
2. **Meta line**, muted, separated by ` · `: record count, how many were usable, date range, where the data came from. Example: `60,125 operation records · 45,066 timed · July 3–October 4, 2026 · Local machine`.
3. **Lead paragraph.** First sentence in bold is the finding. Next sentence is the caveat that prevents the obvious misreading.
4. **Actions** (`What to optimize`, `What to change`) as a numbered list, when the data implies actions. Order by size of effect, biggest first. End with the small items and say they are small.
5. **Stat row**, 3–4 tiles: big number, small muted label. Use it for headline totals, not for every number.
6. **Explorer** when the data has many groups: native selects (label above), a filter input, a one-line summary of what is shown, a bar list, then the full table. The default view hides noise, and the text says exactly what it hides and what it does not claim.
7. **Charts** only where shape matters (change over time, distribution). A ranked list is a bar list or table, not a chart.
8. **Scoreboard / comparison table** with inline bars in the score column.
9. **Limits of this result.** Always present. What was inferred, what the sample cannot show, what not to conclude.

Section headings are plain descriptions: `How fast it drained`, `Tokens and API value by model`, `Scoreboard`, `Mean score per criterion`, `Pricing and limits of this result`. No "Key Insights", no "Executive Summary", no "Deep Dive".

## Design rules

**Palette.** Background `#000`, text `#fff`, secondary text around `#b4b4b4`, tertiary around `#8a8a8a`, hairlines `#1f1f1f`. One accent for the primary series (light blue `#8fd0ff` in the template). A second accent (purple) only when a chart has two series. Dark is always the default (do not follow `prefers-color-scheme`). The template has an opt-in light theme via `<html class="light">`; use it only if the user asks.

**Color means something.** Use color to separate groups the reader already recognizes (vendor, model family, environment) and keep each group's color identical everywhere on the page. Never color by rank, never use a rainbow, never use gradients. A single-series bar list is one color.

**Type.** One system sans stack. `h1` about 34px, `h2` about 22px, body 16px, tables and captions 14px. Two weights: regular and about 650. Numbers use `font-variant-numeric: tabular-nums` and are right-aligned. Stat numbers are about 38px.

**Layout.** One column, max width about 1120px, generous vertical space between sections (about 56px above `h2`). No cards, no panels, no shadows, no rounded containers, no borders around sections, no sidebar, no sticky header. Separation comes from spacing and 1px hairlines.

**Tables.** Muted header row on a slightly lifted surface, hairline between rows, no zebra stripes, left-align text and right-align numbers, first column the name. Totals row in bold. Put an inline bar next to the score when ranking. Include the columns a skeptical reader would ask for next (n, median, p95, wrong/total, cost), not just the winner metric.

**Charts.** Inline SVG, hand-built (the template has a line chart). Faint horizontal gridlines only, no vertical gridlines, no chart border, no legend box, no title inside the SVG. Tick labels muted at 13px. Say what each line or color is in the **caption above the chart**, in words ("White: cumulative API value, left axis. Purple: sampled quota used, right axis."). Use step lines for sampled or quantized data. If you use two axes, name both in the caption and say the lines are observations. Start bar and area axes at zero.

**Controls.** Native `<select>` and `<input>` only, dark fill, 1px border, label above, 44px tall. No pills, toggles, tabs, or custom dropdowns. State lives in the controls; re-render from `DATA`.

**Never include:** emoji, icons, gradient text, glassmorphism, glow, animated counters, scroll animations, hero banners, badges like "NEW" or "AI-powered", donut/pie charts, radar charts, decorative sparklines, colored left borders on callouts, progress rings, tooltips that hide data the page should show, loading spinners, footers with "Generated by".

## Writing rules

The prose is half of what makes these reports good. Write it like a lab notebook, not a pitch.

**Lead with the result, then the caveat.** Bold the claim, plain-text the qualification.
- "**Start with broad searches, failed capture, and repeated test work.** The raw 98.9-hour total includes 53.4 hours of dev-server lifetime. It is not user waiting time."
- "**The proxy recorded 423.60 million tokens, worth $573.86 at standard API prices, over 29 hours 33 minutes of elapsed time.** This is a measured proxy subtotal, not an exact value for a full weekly allowance."

**Every claim carries its number.** "One home-directory search lasted 41.7 minutes; another lasted 9.2 minutes." Not "some searches were slow". Give the unit and the denominator: `0 of 38`, `516 timed calls`, `from 10 local samples each`.

**Bold lead-in, colon or period, evidence, instruction.** For action lists: `**Search scope:** one home-directory search lasted 41.7 minutes. Search the repository or a known directory.` Findings in bullets use a bold sentence as the lead: `**More tokens did not buy more quality.** Sonnet 5.5 used the most time (66 min) and output (286k tokens) and placed 2nd overall.`

**Imperative recommendations, short.** "Add a startup deadline." "Run focused tests before the full suite." "Use bounded readiness checks."

**State what a number is and is not.** Do this wherever a reader could over-read.
- "The focused view hides detected server/app lifetimes, explicit polling, and user-input waits. It does not claim to isolate CPU time."
- "The lines are observations, not a model of how OpenAI charges quota."
- "Judges did not know which model wrote which report."
- "This is a small target."

**Say what was inferred.** "This is inferred by subtracting the reported seven-day window from the next reset time. It is not a captured reset action." Distinguish measured, inferred, and assumed.

**Name the surprising and the null results.** "No model found everything." "Quota jumps from 9% to 17% across gaps in requests. The captures cannot resolve why." Admitting what the data cannot resolve is part of the report.

**Plain words, short sentences.** Prefer a period to a semicolon chain, a number to an adjective, and a verb to a noun phrase. Dates as `Oct 3, 6:07 PM` or `July 3–October 4, 2026`; say the timezone once ("All dates below are in Pacific time"). Say which parts are small and not worth doing.

**Banned phrasing:** "dive into", "delve", "unlock", "leverage", "seamless", "robust", "powerful", "comprehensive", "insights" as a heading, "it's worth noting", "in conclusion", "game-changing", "at a glance", rhetorical questions in body text, exclamation marks, em-dash-heavy rhythm, three-adjective lists, and any closing summary that repeats the lead.

**Numbers.** Thousands separators. Durations in the unit that gives 1–3 digits before the decimal (`72.0 ms`, `3.19 s`, `1.23 min`, `4.23 h`). Money to cents. Percentages to the precision the data supports. Never show more precision than the measurement has. Use `0.0 ms` honestly when the value is below resolution, and say so if it matters.

## Honesty checklist

Before finishing, confirm:
- The headline number states what it includes. If a total is inflated by something that is not the thing the reader cares about (idle time, background processes), the lead says so and the default view excludes it.
- Missing data is counted and shown (`13,842 missing durations`), not dropped silently.
- Any estimate, proxy, or inference is labeled as one.
- The comparison is fair: same prompt, same snapshot, same window. If not, say how it differs.
- Sample sizes sit next to every rate or median that comes from a small sample.
- The limits section names at least one thing the report cannot conclude.

## Output

Write the file to the working directory (or the path the user gives), named for the content, e.g. `tool-timings.html`. Open or screenshot it to verify before reporting. In the reply, give the path, the one-sentence finding, and any data issue you had to work around. Do not describe the page's styling back to the user.
