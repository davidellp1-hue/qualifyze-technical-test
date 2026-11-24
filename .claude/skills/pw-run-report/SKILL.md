---
name: pw-run-report
description: Run the SauceDemo Playwright tests, debug failures with traces, triage each failure (test/locator issue, flakiness, or product bug) and report results per browser. Use when the user asks to run tests (all, by test case ID, by folder, by browser), check stability, investigate a failing or flaky test, or open the HTML / Allure reports.
---

# Run, Debug and Report

Read `CLAUDE.md` first.

## Running
| Goal | Command |
|---|---|
| Everything, both browsers | `npm test` |
| By folder | `npm test -- src/features/login` |
| One test case | `npm test -- --grep "TC-CHK-001"` |
| One browser | `npm test -- --project=chromium` |
| Stability check | `npm test -- --grep "TC-CHK-001" --repeat-each=3` |
| Headed / UI mode / step debugger | `npm test -- --headed` / `npm test -- --ui` / `npm test -- --debug` (only when the user can interact) |
| HTML report | `npm run report` |
| Allure report | `npm run allure:report` (Allure 3, generates and serves the report; no Java needed). `allure-results/` keeps every previous run: run `npm run clean:reports` before the test run for a clean report. |
| Open a trace | `npx playwright show-trace test-results/<test-folder>/trace.zip` |

When running from Claude: use the `list` output; don't launch interactive modes (`--ui`, `--debug`, `show-report`) unless the user asks.

## Before calling a new or changed test done
1. Run it on both browsers (chromium, firefox).
2. Run it with `--repeat-each=3`: it must pass every time.
3. Make it fail once on purpose (e.g. a wrong expected value or another user), confirm it fails at the right step, then restore it: a check that cannot fail proves nothing.

## Triage of a failure
Open the error message, the failing `test.step` and the trace/screenshot, then classify:

| Class | Signs | Action |
|---|---|---|
| Test issue | Locator not found / strict-mode violation, wrong expected value, wrong step order | Fix the page object or data (`pw-page-object`, `pw-test-spec`). Verify the locator against the live DOM. |
| Flaky | Passes only on the retry (`retries: 1`) or fails on some repeats, with no functional reason | If the site was slow (time-outs on navigation), report it as environment. Otherwise fix the root cause with web-first assertions / proper scoping. Never add `waitForTimeout`, never increase retries to hide it. |
| Product bug | Real deviation from the test case (the site does not behave as the test case expects) | Don't change the test to pass. Stop and tell the user: test case, browser(s), step, expected vs actual, screenshot path. |
| Environment | Site down or slow (time-outs), network, browser not installed | Report it (check the site's response time, e.g. `curl -w "%{time_total}"`); re-run once, after `npm run install:browsers` if browsers are missing. |

Never mark a test as passing, skip it, or weaken an assertion to get a green run.

## Report format (English)
```
Run: <command> · <date>
| Test | chromium | firefox | Notes |
|---|---|---|---|
| [TC-CHK-001] End-to-end purchase ... | Pass | Flaky | Time-out on the first attempt, passed on retry (site slow) |
| [TC-LOGIN-002] Locked-out user cannot log in | Pass | Pass | |
Totals: N passed · N failed · N flaky
```
- Notes only for non-pass results.
- List new bugs and test issues found separately, with what was changed to fix test issues.
- Mention where the reports are: `playwright-report/`, `allure-results/`.
