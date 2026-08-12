# Feedback catalog

Markdown sign-off files exported from the review site land here — one file per reviewer per review round, named `feedback-YYYY-MM-DD-<reviewer>.md`.

## Flow

1. Reviewer (or the facilitator during a walkthrough) votes and comments on metrics in the app — right-click any metric, or use the ⓘ button; each dashboard also has a composition question at the bottom.
2. **Feedback → Export .md** downloads the sign-off matrix: summary counts, per-dashboard composition verdicts, and a table of every metric vote + comment.
3. The file is emailed back (or committed directly) and added to this directory via PR.
4. Each file gets triaged into issues; changes ship as tagged releases with the in-app changelog noting what moved between review rounds.

Votes are per-metric: **Approve / Needs change / Question**. Metric names and definitions are locked to the client program documents; dashboard construction (which views merit their own dashboard) is the open dimension.
