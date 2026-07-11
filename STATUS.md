# iExpense — Status

Plain-English log of what's been done and what's next. No brief was handed off with
this repo, so I (Claude) scoped the work myself after you chose "improve the phone
app only" — this repo stays the front-end (`index.html`); the Python sync/report
pipeline still lives on your laptop and is untouched.

## Current round of work (2026-07-10)

Gaps I found in the existing app and am fixing:
1. **Can't edit a saved entry** — only delete-and-redo. Adding tap-to-edit.
2. **No at-a-glance totals** — adding "this month" spend total next to the pending badge.
3. **No safety backup** — if the phone browser ever clears storage, everything not yet
   exported is gone. Adding a "Backup all data" download + "Restore from backup" so you
   have a copy independent of the OneDrive export flow.
4. **No duplicate warning** — README says the sync script skips duplicates (same date +
   merchant + amount), but the phone app itself doesn't warn you before you log the same
   thing twice. Adding a save-time check.

Nothing here touches the export format (`exp_*.json` payload), so `sync_expenses.py`
keeps working unchanged.

## How to try it on your phone
Once pushed, open the app link as usual — it's the same URL, just an updated `index.html`.
Nothing to reinstall. Try: tap an existing entry to edit it, check the new month total
next to "pending," and try the new Backup button (Entries list → bottom).

## Done
- **Edit entries**: tap any entry in the list to load it back into the form; the button
  becomes "Update Expense" (with a "Cancel edit" option) instead of only being able to
  delete and re-enter.
- **This month total**: a second badge next to "pending" now shows the running total for
  the current calendar month.
- **Backup / Restore**: "Backup all data (.json)" downloads everything currently on the
  phone (independent of the OneDrive export). "Restore from backup" reads a backup file
  back in, skipping anything already present so you can't double-import.
- **Duplicate warning**: saving a new entry that matches an existing one on date +
  category + amount + store now asks "Save anyway?" before adding it, so accidental
  double-entries get caught before they ever reach the sync pipeline.

Tested end-to-end with a scripted browser (save, edit, cancel-edit, delete, duplicate
prompt, backup, restore-with-dedupe, delete-while-editing) — all 16 checks passed.
The export JSON format sent to the OneDrive Inbox is unchanged, so `sync_expenses.py`
needs no changes.

## Round 2 (2026-07-10, real usage feedback)

You tried it on your phone and sent detailed feedback. Fixed the concrete stuff:
- **Removed the "LIVE — exports sync to..." banner** at the top — noise, not needed.
- **Added an "Others" category** so there's always a fallback if nothing else fits.
- **Auto-category from store**: type a merchant you've used before (e.g. "Costco") and
  the app fills in the category it last used for that store automatically — you only
  need to tap a category manually for a new merchant or to override it.
- **Store chips seeded with Costco/Target/Walmart** so you have quick-picks even before
  any usage history builds up; your real history still takes priority once it exists.
- **Payment method simplified to just Credit / Cash**, dropping the bank-specific chips.

Tested with 9 new scripted-browser checks (banner gone, Others present, payment options,
seeded chips, auto-category on type, auto-category doesn't override a manual pick,
auto-category on chip tap) plus a re-run of all 16 checks from round 1 — all pass.

## Round 3 (2026-07-10, cross-device sync)

You picked the approach: your own private GitHub repo becomes the shared data store, no
server, no cost. Here's what's built and what's left.

**Built and tested (22 scripted-browser checks, mocked GitHub API):**
- A new **Cloud Sync** section on the Entries tab: paste your GitHub username, the private
  data repo name, and a personal access token, then tap "Connect & Sync" once.
- On connect, the app merges whatever's on this phone with whatever's already in the cloud
  repo (so connecting a second device never loses data from either side) and pushes the
  result to `entries.json` in that private repo.
- Every Save / Edit / Delete after that reads the latest cloud copy first, applies your
  change, and writes it back — so two devices editing minutes apart merge instead of one
  overwriting the other. If GitHub reports a conflict (rare — near-simultaneous edits from
  two devices), the app automatically re-fetches and retries; you never see an error for
  that.
- If the phone is offline, changes still save locally as always; reconnecting later (or a
  manual "Sync Now" tap) reconciles them into the cloud copy.
- A new **Dashboard tab** next to Entries: pick a month, see the total and a per-category
  breakdown — computed entirely in the browser from the same data, no separate build step,
  no Python.
- "Disconnect" turns cloud sync off and goes back to phone-only storage, no data lost
  locally.

**What's left before this goes live:**
1. **You create the private data repo** (I can't — my GitHub access here isn't allowed to
   create new repos). One-time, ~1 minute: go to github.com/new, name it
   `iExpense-data`, set it to **Private**, check "Add a README," create it. Tell me once
   it exists.
2. **You generate one access token**, scoped to only that repo — see
   `CLOUD_SYNC_SETUP.md` in this repo for the exact steps.
3. Once both exist, open the app, go to Cloud Sync, fill in your GitHub username,
   `iExpense-data`, and the token, tap "Connect & Sync" — that's the one-time setup, after
   which phone and laptop will always agree.

**On privacy:** the app code stays in this repo, which is public — but it's just code,
zero financial data in it. Your actual numbers only ever live in the private data repo,
readable only with your token. This also means anyone else could reuse this same public
app with their own private data repo and their own token — no shared server, no way for
one user's data to reach another.

**Not built (and not recommended yet):** a single hosted version where anyone signs up
with a login and everyone's data lives on one server. That's a much bigger, costlier build
(real auth, hosting, ongoing security work) and isn't needed to get you — or anyone who
copies this repo — a fully working personal tracker today.

## Round 4 (2026-07-11, cloud sync live + cleanup)

Cloud Sync is confirmed working end-to-end against your real private repo
(`borannavar1984/expense-data`) — verified directly by reading your actual
synced expense entries back out of GitHub, not just a "Connected" message.

Since cloud sync now covers the "get my data off this one phone" need, the old
manual flow it replaces is gone:
- Removed the **Export to OneDrive Inbox** and **Copy as text (fallback)** buttons.
- Removed the "pending" counter badge and the "sent"/dimmed styling on entries —
  both only existed to track which entries had been through that export step,
  so they became dead weight once the button was gone.
- `Save Expense` still works exactly the same; entries no longer carry an
  `exported` flag at all (backup/restore and cloud sync updated to match).

Tested with 10 new scripted-browser checks (buttons gone, no leftover "sent"
labels or dimming, save still works, month total still correct, backups no
longer include the old field) plus a re-run of the round 2 and round 3 suites
(9 + 22 checks) — 41 total, all passing.

## Round 5 (2026-07-11, layout tweak)

Moved **Sync Now** up next to **Save Expense** as a side-by-side pair, instead
of it being buried further down in the Cloud Sync section (which now only has
"Disconnect"). Tapping Sync Now before connecting shows a reminder instead of
silently doing nothing.

Along the way, found and fixed a small CSS bug: the green button style used by
Sync Now had its own top-margin meant for stacking vertically, which threw off
alignment once placed next to Save Expense in a row — fixed so buttons in a
side-by-side row always line up regardless of which color/style they use.

Tested with 8 new scripted-browser checks (buttons visually aligned in the same
row, exactly one Sync Now button on the page, disconnected tap shows a helpful
message, save still works, a real sync through the top button lands in the
mocked cloud repo) plus a re-run of every earlier suite — 49 checks total,
all passing.

## Round 6 (2026-07-11, income tracking + full dashboard + light/dark mode)

You sent your old Excel-based iFinance dashboard and asked for the equivalent,
sourced live from the synced data instead of Excel. Three things landed:

**Income tracking (new).** The app was expense-only before — there was no way
to log income, so "Net Savings" and "Savings Rate" weren't possible. Added an
Expense/Income toggle right on the entry form:
- Switching to Income swaps the category list (Salary, Dividends, Bonus,
  Interest, Gift, Other), hides Payment Method (not relevant for income), and
  relabels "Store / Merchant" to "Source."
- Income entries show in the list with a 💰 icon and a green "+$amount" —
  visually distinct from expenses at a glance.
- The "this month" badge in the header still means expenses only, so it keeps
  answering "how much am I spending," not a mix of both.
- Everything else — duplicate detection, auto-category-from-store, cloud sync,
  backup/restore — was extended to handle both types correctly.

**Dashboard, rebuilt to match your old report.** It's now two sub-views:
- **Overview** — Total Income / Total Expenses / Net Savings / Savings Rate
  cards across everything you've ever logged, a bar chart (income vs. expenses
  by month), a line chart (net savings trend), a pie chart (spend by
  category), a month-by-month comparison table, and a category-breakdown table
  with every month as its own column — all computed live from your synced
  data, not a static export.
- **Monthly Detail** — pick a month (dropdown defaults to the most recent
  month with data, and always includes the real current month even if it's
  empty) and see that month's income and expense line items in full, same
  shape as your old "Monthly Reports" tab.

**Light / dark mode.** A toggle next to the header badge switches the whole
app, not just the dashboard, between themes; your choice is remembered across
visits. Charts recolor correctly when you switch.

**One honest limitation:** this Dashboard uses Chart.js, loaded from a public
CDN (cdnjs) — if you're ever fully offline, the cards and tables still work
perfectly, but the three charts just won't render until you're back online.
Nothing else in the app needs internet except Cloud Sync, which already
required it.

Tested with 35 new scripted-browser checks (income toggle swaps categories/
hides payment/relabels Source, income entry saves and displays correctly,
"this month" badge stays expense-only, editing an income entry restores income
mode, all four Overview cards compute correctly from mixed income+expense
data, all three charts receive the correct data — verified via a local stub
since this sandbox's network blocks the real CDN, monthly detail defaults to
the current month, income/expense tables show the right rows, theme toggle
switches and persists across reload, backup round-trips the income type field)
plus a re-run of every earlier suite — 84 checks total, all passing.

## Round 7 (2026-07-11, actually move history off the home page)

Caught a gap from Round 6: I'd built the rich Dashboard, but never actually
removed the old flat entry list from the home page — so it was still growing
unbounded exactly like you flagged. Fixed properly this time:

- The **Entries** page now only shows **Today's Entries** — a short, bounded
  list that never grows no matter how much history piles up.
- All history — including everything already synced — lives in
  **Dashboard → Monthly Detail**, which already showed month-by-month
  Income/Expense tables, but they were read-only. They're not anymore: tap any
  row to jump straight into the edit form (auto-switches to the Entries tab
  with that entry loaded), or tap the ✕ to delete it right from the table.
- One small rough edge: the ✕ delete button sits at the far right of these
  tables and needs a horizontal scroll to reach on narrow phones — it works
  (tested), just not visible without scrolling. Can tighten the layout later
  if it's annoying in practice.

Tested with 11 new scripted-browser checks (home page shows only today's
entry and excludes older history, section is correctly labeled, historical
entries show up in the right month under Monthly Detail, tapping a row jumps
to the Entries tab with the right entry loaded for editing, saving an edit
from there actually updates the record, deleting from the table removes it)
plus a re-run of every still-relevant earlier suite — 84 checks, all passing.
(The original round-1 test file was retired — it checked a "pending" badge
that round 4 already removed, so it was already stale before this round.)
