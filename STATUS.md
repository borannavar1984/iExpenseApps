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

## Round 8 (2026-07-11, flatten navigation, clearer labels)

Two small but real clarity fixes:

- **Navigation simplified to 3 flat tabs**: 💸 Expense / 💰 Income / 📊 Dashboard,
  replacing the old two-level setup (an "Entries" tab containing a separate
  Expense/Income toggle inside it). Tapping Expense or Income now directly
  switches the form into that mode — no more "Entries vs. Expense" naming
  confusion. Editing an entry from Dashboard → Monthly Detail now correctly
  lands on whichever tab (Expense or Income) matches that entry.
- **Header badge relabeled** from "this month" to "**This Month Total**" for
  clarity. Confirmed (not just relabeled) that it strictly matches the actual
  current calendar month and never bleeds in last month's data — if it reads
  $0, that means no expense has been logged with today's real date yet
  (income and past-month history intentionally don't count toward it).

## Round 9 (2026-07-11, design/UX polish pass)

You gave me full creative freedom to make the app look and feel better, with
instructions to test and iterate until it's genuinely good — not just call it
done. Here's what changed:

- **Category icons** — every category (Rent 🏠, Groceries 🛒, Salary 💼, etc.)
  now has an icon, shown above the label in the category grid and inline next
  to the category name everywhere else (Today's Entries, Monthly Detail
  tables, the Category Breakdown table). Makes scanning a long list much
  faster than reading text alone.
- **Tactile feel** — every button now presses down slightly when tapped
  (a small scale animation), inputs get a soft focus glow instead of just a
  color change, and Dashboard cards lift slightly on hover. Small things, but
  they're what make an app feel responsive instead of static.
- **Sticky header** — the title and "This Month Total" badge now stay pinned
  at the top while you scroll a long Dashboard page, so you never lose track
  of where you are.
- **Notch-safe layout** — added proper safe-area padding so the header and
  bottom toast don't collide with an iPhone's notch or home indicator bar.
- **Small finishing touches** — toasts now show a ✅/⚠️/ℹ️ icon so you can
  tell success from warning from info at a glance without reading the color;
  empty states ("Nothing logged today yet," etc.) got matching icons instead
  of bare text; Dashboard cards got icons (💰 Income, 💸 Expenses, 🏦 Net
  Savings, 🎯 Savings Rate) to match the category treatment.

All of this was done carefully to avoid touching any actual data or behavior
— pure visual/interaction polish. Verified by re-running the entire existing
test suite (95 checks across every prior round) with zero regressions, plus
manual visual review via screenshots in both light and dark mode across all
three tabs (Expense, Income, Dashboard) and the Today's Entries list.

Tested by updating the test suite to the new tab IDs and re-running
everything — 95 checks total, all still passing.

## Round 10 (2026-07-11, category spend chart on Monthly Detail)

You asked for a chart on the Monthly Detail page showing which categories
you're spending on that month, alongside the existing income/expense tables.
Added a vertical column (bar) chart, "Spend by Category — This Month," right
above those tables — one bar per category, tallest to shortest, so you can
see at a glance where the month's money went. Income doesn't appear in it,
just expenses, matching what you asked for.

While building it, I caught a real bug and fixed it before shipping: if the
chart library can't load (e.g. no internet, or a network that blocks the
chart CDN), the app was showing "No expenses to chart" — which is wrong and
misleading, since you might have plenty of expenses logged; it's the chart
that failed, not your data. Fixed so it now says the chart itself couldn't
load and points you to the table below for the same numbers, and only says
"No expenses" when a month is genuinely empty. Found the same mix-up in the
three Overview charts (bar/line/pie) and fixed it there too, so this is
consistent everywhere in the app now.

Tested with 11 new scripted-browser checks (chart appears with expenses
present, categories summed correctly, sorted highest-to-lowest, income
excluded, empty month shows the chart hidden with the right message, theme
toggle redraws it) plus 8 more checks specifically simulating "chart failed
to load" against real data, confirming the honest failure message shows
instead of a false "no expenses" claim — plus a re-run of every earlier
suite. 114 checks total, all passing.

## Round 11 (2026-07-11, mobile home-screen fixes)

You reported that on your phone (opened via the home-screen icon), the top
of the Expense/Income/Dashboard tab row was getting hidden behind the
header. Found the cause: the header used a somewhat fragile technique
(negative top margin) to slide its background up behind the iPhone's
notch/status bar, and that technique wasn't playing nicely with the header
being "sticky" (pinned while scrolling) — it was overlapping the row right
below it instead of stacking cleanly on top of it. Replaced it with a
simpler, sturdier approach: the page now reserves the right amount of space
for the notch up front, and the header just sticks just below it — no more
overlap, tested against a simulated notch/Dynamic-Island device to make
sure it can't regress silently.

Also added a proper **home-screen icon** — a white "$" on a blue gradient —
so adding iExpense to your phone's home screen now shows a real app icon
instead of a screenshot of whatever was on screen when you added it.

Tested with 9 new scripted-browser checks (header and tabs verified not to
overlap under both a simulated notch device and a plain non-notch device,
header content confirmed to clear the notch, the new icon file confirmed
reachable and linked correctly) plus a re-run of every earlier suite — 123
checks total, all passing.

## Round 12 (2026-07-11, removable store chips + Expense tab icon)

Two requests:

- **Store/Merchant quick-pick chips can now be removed.** Every chip under
  Store/Merchant (both your own history and the seeded Costco/Target/Walmart
  ones) now has a small red "×" on its corner — tap it and that chip is gone
  for good, so a one-off store (like a doctor's office you only visit once a
  year) doesn't clutter the quick-pick row forever. This only hides the
  chip; it never touches your actual logged entries or history — Dashboard
  and cloud sync are unaffected. If you ever use that store again in a new
  entry, its chip comes right back automatically, exactly like you asked
  ("whenever I add a new one, add it; if I don't want it, I can remove it").
- **Changed the Expense tab icon** from 💸 to 🧾 (a receipt) — reads more
  clearly as "expense/spending record" and stands apart from Income's 💰
  and Dashboard's 📊.

Also, about the home-screen icon from Round 11: you sent a screenshot
showing a plain black icon with just the letter "I" instead of the new $
icon. That's iOS being stubborn about caching the old icon-less state from
before the icon existed — simply removing and re-adding the shortcut isn't
always enough to force it to re-check. Also improved the icon setup itself
(added a properly-sized 180×180 version, which is what iOS prefers) to
maximize the odds it picks it up cleanly on the next add. To be sure you get
the new icon: remove the current iExpense icon from your home screen, then
in Safari go to Settings → Safari → Advanced → Website Data, find
"github.io," delete it (this clears the stuck cache), reload the app page,
and then Add to Home Screen again.

Tested with 9 new scripted-browser checks (every chip has a working remove
button, removing a chip doesn't accidentally select it into the Store
field, removed chips stay hidden after a reload, using a hidden store again
in a new entry brings its chip back, seeded default chips can be removed
too) plus a re-run of every earlier suite — 133 checks total, all passing.

## Round 13 (2026-07-11, Credit as the default payment method)

Small but handy tweak: since most of your expenses are Credit, the Payment
Method now starts pre-selected on **Credit** every time you open a new
Expense entry — no need to tap it every single time. If a particular
expense was Cash, just tap Cash before saving, same as before; the next new
entry goes right back to defaulting to Credit. Editing an existing entry
still shows whatever payment method it was actually saved with (Credit or
Cash), it's only brand-new entries that default to Credit.

Tested with 7 new scripted-browser checks (Credit pre-selected on first
load, saving without touching payment method records Credit, explicitly
picking Cash is respected and saved correctly, the form goes back to
defaulting to Credit after a Cash save rather than getting stuck, editing a
past Cash entry still shows Cash and isn't silently changed to Credit) plus
a re-run of every earlier suite — 140 checks total, all passing.

## Round 14 (2026-07-14, dev/test environment with a separate link)

You asked for a proper way to try out new changes before they go live —
without any chance of test data mixing with your real numbers. Here's what
this sets up:

- A **`develop` branch** in GitHub, a copy of `main` (production). Going
  forward, every new feature gets built and tested there first. Nothing
  reaches your live app until you're happy with it and it gets merged into
  `main`.
- A **separate dev link** — `https://borannavar1984.github.io/iExpenseApps/dev/`
  — that always reflects whatever is currently on the `develop` branch,
  updating automatically a minute or two after any change is pushed there.
  Your real app link stays exactly the same and is completely unaffected.
- **Your data is fully separated, automatically, with no setup on your
  part.** The dev link uses entirely different storage than the real app —
  different saved entries, different theme choice, different Cloud Sync
  connection — even though both links technically live on the same
  website. Nothing you do on the dev link can ever touch your real numbers,
  and nothing on the real app can leak into dev. The dev page also shows a
  small orange "DEV" badge next to the title so there's never any doubt
  which one you're looking at.
- If you want to see your real numbers while testing a new look on the dev
  link (so it feels realistic instead of empty), use **Backup** on your
  real app to download a snapshot, then **Restore from backup** on the dev
  link to load that snapshot in — it's a one-time copy, not a live
  connection, so nothing you do to it afterward touches your real data.

Tested with 13 new scripted-browser checks proving the isolation actually
holds — confirmed the dev link and the real app never share saved entries,
theme, or any other data even when opened in the very same browser at the
very same time — plus a re-run of the entire existing suite against the
real app to confirm it behaves exactly as before. 153 checks total, all
passing.

## Round 15 (2026-07-16, develop-first workflow + pull real data into dev)

Two related changes, both about how testing works from here on:

- **New workflow going forward:** every new feature now gets built and
  pushed to the `develop` branch first — never straight to your real app.
  You try it at the dev link, and only once you say you're happy does it get
  merged into `main` and go live. `develop` and `main` stay in lock-step
  otherwise; nothing drifts between rounds.
- **New "Dev Testing" section on the dev link only** — a button, "📥 Load
  production data (read-only)," that pulls a fresh copy of your real
  entries into the dev link so you're testing against real numbers instead
  of an empty app. It's genuinely one-way and safe: it only ever reads from
  your production data repo, never writes to it, and the access token you
  type in isn't saved anywhere — only the username/repo are remembered so
  you don't have to retype those each time. Each pull fully replaces
  whatever test data was already in dev with a fresh snapshot, so you're
  always testing against current real numbers. This section doesn't exist
  at all on your real app — only on the dev link.

Tested with 11 new scripted-browser checks (the button only appears on the
dev link, never on production; pulling data never calls GitHub's write
endpoint — confirmed by intercepting the network call; the token is wiped
from the form right after use and never stored; production's own data is
completely untouched by any of this; username/repo persist across reloads
so only the token needs retyping) plus a re-run of the entire existing
suite — 164 checks total, all passing.

## Round 16 (2026-07-16, dev cleanup + full formula audit)

Two things:

- **Cleaned up the dev link's UI.** Now that dev has its own real Cloud
  Sync connected to a separate `expense-data-dev` repo, the "Load
  production data (read-only)" button from Round 15 was redundant, so it's
  gone. "Backup" is also hidden on the dev link specifically (your real app
  still has it, untouched) since dev's data already lives safely in its
  own cloud copy.
- **You asked me to double-check every dashboard calculation was correct
  ("be the mathematician").** I wrote an independent calculator from
  scratch in Python — not reusing any of the app's own code — against your
  real 126-entry dataset, then compared every single number the app
  displays against it: the header's "This Month Total," every Overview
  card, the Monthly Comparison table, the Category Breakdown table, and
  every month's Monthly Detail cards. All matched exactly, no errors found.
  Separately, the "prod and dev totals looked different" issue you'd
  flagged turned out to be two leftover test entries stuck in the dev
  browser's local cache (from earlier connection troubleshooting), not a
  math bug — cleared those out directly.

Tested with 7 new scripted-browser checks (Backup hidden on dev only, the
removed button/section leave zero trace, dev's DEV badge and real Cloud
Sync stay untouched) plus a 33-check independent formula audit comparing
every displayed number against the from-scratch Python reference
calculation, plus a re-run of the entire existing suite — 193 checks
total, all passing.

## Round 17 (2026-07-16, Net Worth tracking)

You asked for a proper way to track your net worth — not just income and
expenses, but what you actually own and owe, updated month to month, with
growth projections for things like your 401k. Framed as "what would a
financial advisor track," this landed:

- **A new "Net Worth" tab**, right alongside Expense/Income/Dashboard, for
  logging accounts and assets across six categories: Cash & Bank,
  Retirement (401k/IRA), Investments (Stocks), Real Estate, Other Assets,
  and Liabilities/Debt (debts count against your total, not toward it).
  Each save is a dated snapshot rather than overwriting the last one — so
  logging "Fidelity 401k" again next month with an updated value
  automatically builds a month-over-month history. Quick-pick chips
  remember your accounts so re-logging one each month is just a tap +
  typing the new number.
- **A new Net Worth view in the Dashboard**: your total net worth (assets
  minus liabilities), a trend chart showing it grow (or shrink) over time,
  a breakdown by category, a full table of everything you're tracking
  (tap to edit, ✕ to delete), and — for any item where you set an annual
  growth rate (like 7% for a 401k) — a simple projection table showing
  what it'd be worth in 1, 5, and 10 years at that rate.
- **Syncs through the same Cloud Sync connection** as your expenses and
  income, as its own separate file in your data repo, so it carries across
  devices the same way. Built deliberately so a hiccup syncing net worth
  data can never block or undo your regular expense/income sync — they're
  independent, with net worth sync always the "best effort" one.

Found and fixed two real bugs while building this: a tie-breaking bug
where logging an update on the same day as a previous entry could show the
old value instead of the new one, and a bug where a net-worth-sync hiccup
could incorrectly cancel an otherwise-successful cloud connection — both
fixed before shipping.

Tested with 28 checks on the tab/form/edit/delete/chips behavior, 10 more
on the month-over-month trend and the cloud sync round-trip (confirmed via
intercepting the actual network calls), 4 confirming dev/prod data stays
isolated for net worth too, plus a re-run of the entire existing suite —
235 checks total, all passing.

## Round 18 (2026-07-16, Net Worth: US/India currency conversion + tab moved to last)

Two small adjustments you asked for after trying out Net Worth: some of
your assets are in the US, some in India, and you wanted the flexibility
to view your total either way — plus you wanted the Net Worth tab moved
out from the middle of the row to the end.

- **Every Net Worth item can now be logged in USD or INR.** When you add
  or edit an item, there's a currency chip (defaulting to $ USD) right
  above the value field, so each account keeps the currency it's actually
  held in.
- **The Dashboard's Net Worth view has a $/₹ toggle.** Pick USD and every
  total, chart, and table converts your INR holdings into dollars; pick
  INR and it converts everything the other way — using the actual
  day's market exchange rate, fetched fresh once a day and reused for the
  rest of that day. A status line under the toggle always shows exactly
  what rate is being used and as of when, so nothing is hidden.
- **Never fakes a rate.** If the day's exchange rate can't be fetched (no
  connection, API down), items in the "other" currency are clearly flagged
  with a ⚠️ instead of being silently left out or converted with a guessed
  number — same honesty standard as the rest of the app.
- **Net Worth is now the last tab**, after Dashboard, instead of sitting
  between Income and Dashboard.

Tested with 9 new checks on currency entry/selection/conversion in both
directions, 5 more confirming the honest fallback when the exchange rate
is unreachable (no fake numbers, no NaN), and a full re-run of the entire
existing suite (two older Net Worth tests updated to account for the new
daily rate fetch) — all green.

## Round 19 (2026-07-16, fix: currency conversion wasn't actually fetching a rate)

You tried the new USD/INR conversion on the dev link with real data and it
wasn't working. Found the cause: the exchange-rate service the app was
calling (Frankfurter) moved its API to a new address a while back — the
app was still pointed at the old one, which no longer answers requests.
Switched it over to the current address; nothing else about how it works
changed (same daily-fetch-and-cache behavior, same honest ⚠️ fallback if a
rate genuinely can't be fetched).

Re-tested all 4 Net Worth test files against the corrected endpoint — 52
checks, all passing. Please try it again on the dev link with the data
you added; it should now show real converted totals instead of the
"couldn't fetch today's exchange rate" message.

## Round 20 (2026-07-16, manual exchange rate + combined total)

You tried it again with real data and reported the dollar and rupee
amounts were still showing separately instead of one combined number, and
asked for a way to just type in today's rate yourself rather than relying
on a live fetch.

- **Added a "$1 = ₹___" field with a Set Rate button** right on the
  Dashboard's Net Worth view. Type in today's actual rate (like the 1 = 95
  you mentioned) and tap Set Rate — it's saved for the day and takes
  priority over whatever the live fetch would have used, so you're never
  stuck waiting on a network call that might not work on your connection.
- **This is also what fixes the "shown separately" problem**: without a
  usable rate, the app was correctly refusing to guess — but that meant
  your USD and INR holdings never combined into one total, which is what
  looked like "separate." With a rate in hand (live or typed in), assets in
  either currency now always combine into a single Total Net Worth number.
- The rate status line now says plainly whether the number in use came
  from the live fetch or was "set by you."

Tested with 6 new checks (honest ⚠️ when no rate exists yet, typing in a
rate combines both currencies into one total, the rate is labeled as
yours, it persists for the rest of the day across a reload, the field is
prefilled, and entering something invalid like 0 is rejected with a clear
message) plus a full re-run of the whole existing suite — all green.

## Round 21 (2026-07-16, lakh/crore notation for INR net worth)

You asked for large rupee amounts to read the way they actually do in
India — 3.5 crore, 10 lakh — instead of long strings of digits.

- **Every rupee amount in Net Worth now uses lakh/crore notation** once it
  crosses the threshold: ₹10,00,000 and up shows as "₹10 L", and
  ₹1,00,00,000 and up shows as "₹3.5 Cr". This applies everywhere a net
  worth value appears — the item list on the Net Worth tab, the Dashboard's
  summary cards, the accounts table, and the growth projections table.
- Dollar amounts are untouched — lakh/crore is specifically an Indian
  rupee convention, so USD always stays as a plain number.

Tested with 7 new checks (a 3.5 crore item and a 10 lakh item both format
correctly everywhere they appear, a small USD item stays untouched,
switching the Dashboard to view in USD drops the notation entirely) plus
a full re-run of the whole existing suite — all green.

## Round 22 (2026-07-16, fix: lakh/crore missing from the charts)

You reported the lakh/crore formatting still wasn't showing, even in a
private browser tab (which rules out a stuck cache). You were right —
Round 21 covered the cards and tables, but missed the Net Worth Trend
chart's numbers and both charts' tap/hover tooltips, which is exactly
where your screenshot showed a long raw number. Fixed: both the trend
chart's scale and the category breakdown chart's tooltip now use the same
lakh/crore formatting as everywhere else.

Tested with 4 new checks confirming the chart's actual axis and tooltip
formatting functions produce "₹3.5 Cr" for a large value (and plain
numbers when viewing in USD) plus a full re-run of the whole existing
suite — all green.

## Round 23 (2026-07-17, lakh/crore for USD too)

One more adjustment: you wanted large dollar totals to group the same
way once they get big, not just rupee ones. Lakh/crore notation now
applies to both currencies — a USD total of $383,947 now shows as
"$3.84 L," the same threshold rule (100,000+ / 1,00,00,000+) as INR.

Updated the two lakh/crore test files to expect this (they previously
checked that USD stayed as a plain number) plus a full re-run of the
whole existing suite — 245 checks total, all green.

## Round 24 (2026-07-17, hands-off exchange rate + growth projections for everything)

Three related asks:

- **The "$1 = ___" rate form is now hidden by default.** The app just
  auto-fetches the day's rate on its own and shows a plain "Using
  ₹90.00 = $1 (rate as of ...)" line — no form to see or fill in. A
  small **Edit** link next to it lets you override the rate yourself if
  you ever need to (say the live fetch is having trouble) — tap it and
  the form appears; otherwise it stays out of the way.
- **Growth Projections now covers every account and asset you've
  logged**, not just the ones where you typed in a growth rate. Anything
  without a rate is simply treated as 0%/yr instead of being left out
  of the table entirely — so your whole portfolio shows up, not a
  filtered subset.
- **New "Net Worth Growth Projection" chart** — instead of only seeing
  each item's individual projection, there's now one chart showing what
  your *total* net worth is projected to be at 1, 3, 5, 10, and 15
  years out, combining every account's own growth rate (debts are held
  flat, since there's no payoff-schedule concept to project them with).
  If something can't be converted to your display currency that day,
  the chart still shows what it can with an honest note about what's
  missing, rather than disappearing.

Tested with 13 new checks on the aggregate projection chart (hand-verified
compounding math across all 5 horizons, the flat liability subtraction,
tooltip formatting), 2 more confirming the honest partial-warning when a
currency can't convert, updates to two existing tests for the new
hide/reveal rate behavior and the "everything included, debts still
excluded" projection logic, plus a full re-run of the whole existing
suite — 271 checks total, all green.

## Round 25 (2026-07-17, review-report fixes: formatting, sort order, duplicate chips)

You ran a review pass against real data on the dev site and sent over a
detailed list. Fixed the concrete code bugs from it:

- **Comma formatting below the lakh/crore threshold.** Net worth amounts
  under ₹1,00,000 / $100,000 were showing as raw digit strings like
  "$25000.00" instead of "$25,000.00" — now they use the same
  thousands-separator formatting as every other number in the app.
- **Monthly Detail wasn't sorted.** The expense and income tables for a
  given month showed rows in whatever order they were saved, not by
  date. Both tables now sort chronologically.
- **Merchant chips split on capitalization.** "US MOBILE" and "US mobile"
  were showing up as two separate quick-pick chips instead of one — the
  chip list now merges them case-insensitively, keeping whichever
  casing you used most recently.
- **"Change This Month" now explains itself.** With only one month of
  net worth history, it showed a bare "—"; it now says "Not enough
  history yet."

Separately flagged for your input (not changed without checking first):
whether large USD amounts should really use lakh/crore notation (you
asked for that explicitly two rounds ago, so it's not being reverted
without your say-so), the "Other" vs "Others" category-label mismatch
between Income and Expense, a data typo ("Panera Bred"), a future-dated
net worth entry, and whether payment method should be required for every
expense. These touch real stored data or product behavior, not just
code, so they're waiting on your call rather than being changed silently.

Tested with 6 new checks covering all four fixes, updated comma-format
assertions across 6 existing Net Worth test files, plus a full re-run of
the whole existing suite — 293 checks total, all green.

## Round 26 (2026-07-17, USD back to standard comma grouping)

Confirmed your call on the one open question from the review: lakh/crore
notation is reverted for dollar amounts (it had briefly applied to both
currencies since Round 23). USD net worth values now always use standard
comma grouping — e.g. "$170,000.00" instead of "$1.7 L" — no matter how
large. Lakh/crore stays exactly where it belongs: rupee amounts only,
since it's specifically an Indian numbering convention.

Updated the two lakh/crore test files to match, plus a full re-run of the
whole existing suite — 294 checks total, all green.

## Round 27 (2026-07-17, Dashboard comma formatting + validation fixes)

Another review pass found a few more real gaps:

- **Dashboard USD amounts weren't getting the comma formatting** that Net
  Worth got a couple rounds ago — Overview and Monthly Detail were still
  showing "$28731.17" instead of "$28,731.17," so the exact same number
  read two different ways depending on which screen you were looking at.
  Fixed everywhere on both screens.
- **Future dates are now rejected everywhere**, not just Net Worth —
  expense, income, and net worth entries can no longer be dated
  tomorrow or later; you'll get a clear message instead.
- **Amounts with 3+ decimal places are now rejected** instead of being
  silently rounded — typing "10.999" used to quietly become "$11.00";
  now it tells you to keep it to 2 decimal places.
- **"Change This Month" no longer shows a bare dash** as its headline —
  it reads "N/A" now, with the "Not enough history yet" explanation
  still underneath.
- One item from the review didn't hold up: negative/zero amounts
  already showed a clear "Enter an amount" message when tested directly
  — added a test to lock that in, but no code was actually broken there.

Tested with 18 new checks covering all of the above, updated 4 existing
test files for the new formatting and a test fixture that now correctly
lands on the new future-date rule, plus a full re-run of the whole
existing suite — 312 checks total, all green.

## Round 28 (2026-07-19, 🚀 Net Worth goes live in production)

The big one: everything built on `develop` over the last several weeks —
Net Worth tracking end to end, multi-currency support, lakh/crore
formatting, and every fix from the last handful of review rounds — is
now live in production. Here's exactly what happened, in order:

1. **Reconciled expense/income data first.** You'd logged some entries
   directly in the real production app that the dev copy didn't have
   yet — a haircut, a groceries run, a salary entry, a phone plan
   purchase, two dinners out (8 entries in total). Pulled those into
   the dev data repo and confirmed dev matched production exactly
   before touching anything else.
2. **Synced data in both directions before the code went anywhere.**
   One entry ("Employer Payroll" income) existed only in the dev data
   repo — pushed that into production too, so both sides now agree on
   the same 135 expense/income entries. Also copied your real Net
   Worth data (17 accounts and assets you've already reviewed in dev)
   into a brand-new `networth.json` file in the production data repo,
   so the feature has real numbers the moment it's live — no empty
   dashboard, no test data anywhere.
3. **Merged `develop` into `main` as a real merge** (not a squash or a
   force-push) — checked first, in an isolated throwaway copy, that
   this wouldn't conflict with or delete the `dev/` preview folder that
   lives only on `main` (it doesn't touch anything `develop` doesn't
   already own, confirmed with a dry run before doing it for real).
4. **Tested twice, like you asked.** Once against the reconciled data
   using the *old* pre-merge production code (to confirm the data sync
   alone didn't break anything), and again against the *new* merged
   code with your real production data flowing through the same cloud
   sync path your phone actually uses — confirming Net Worth totals,
   currency conversion, growth projections, and every chart all come
   up correctly with zero errors.
5. Along the way, two of this session's own test fixtures had gone
   stale simply because real time had moved forward since they were
   written (a hardcoded "today" and a hardcoded "future" date that
   quietly stopped being in the future) — recalculated and fixed those
   so the test suite reflects reality, not a bug in the app itself.

Your production app now has: expense/income tracking (135 entries,
data-verified), the full Net Worth feature with your real 17 accounts,
USD/INR conversion, and every fix shipped across the last 11 rounds —
all confirmed working together against your actual data before anything
went live. Re-ran the entire test suite one final time after all of the
above — 313 checks total, all green.

Go ahead and open the real app — it should already show your Net Worth
tab with all your accounts, and Cloud Sync will pick up the reconciled
data automatically the next time it syncs.

## Round 29 (2026-07-19, category filter on the Dashboard)

Added a category filter to both Overview and Monthly Detail — a
dropdown, defaulting to "All Categories," that narrows every expense
figure, chart, and table down to just one category at a time. Pick
"Groceries" and Total Expenses, the Category Breakdown table, the
Spend by Category chart, and Monthly Detail's expense table all
recompute to show only Groceries — income stays shown in full
throughout, since income categories are separate from expense ones.
Pick a category on one screen and it stays applied when you switch to
the other, so you don't have to re-select it.

Tested with 14 new checks (filtering math on both screens, the
selection staying in sync between them in both directions, resetting
back to "All Categories" restores full totals) plus a full re-run of
the whole existing suite — 327 checks total, all green.

## Round 30 (2026-07-20, Remittance category, compact grid, Category Trend restructure)

Three changes, all shipped to `develop`:

1. **New "Remittance" expense category** (💱), for tracking money sent
   to India — logged the same way as any other expense, its own icon
   and its own slice in every category breakdown and chart.
2. **Smaller category buttons.** The category grid (now 13 buttons for
   expenses) was taking up too much screen space — shrunk the padding,
   icon size, and line height so more of the app is visible above the
   fold without scrolling.
3. **Reworked how the category filter behaves**, based on your
   feedback that filtering was affecting things it shouldn't (income
   showing up, totals changing everywhere). The filter dropdown moved
   from the top of Overview/Monthly Detail down to the very bottom of
   each page. All of the existing cards, charts, and tables above it
   — Total Income/Expenses, the monthly comparison table, the category
   breakdown, the spend-by-category chart — now always show full,
   unfiltered totals, exactly like before Round 29. Below the
   relocated filter on both pages sits a brand-new **Category Trend**
   chart: pick a category and see its expense total for every month as
   a line chart, or leave it on "All Categories" to see every
   category's expenses combined, month by month. The selection still
   stays in sync between Overview and Monthly Detail.

Tested with a rewritten filter test suite (17 checks, covering the new
"cards stay full, only the trend chart filters" behavior) plus a new
3-check test for the Remittance category and the smaller buttons,
updated one existing chart-count test to account for the new 4th
chart on Overview, and re-ran the full remaining suite — over 400
checks total, all green. Verified visually with screenshots of the
compact grid and the new bottom-of-page trend section.

## Round 31 (2026-07-20, Overview's Spend by Category becomes a multi-line trend)

Follow-up to Round 30's Category Filter/Trend restructure, based on
feedback that the trend chart's default view (a single summed line)
wasn't the most useful way to see it, and that the filter had ended up
too far down the page.

- **"Spend by Category" on Overview is now a line chart, not a pie.**
  With "All Categories" selected, every category gets its own line, so
  you can directly compare trends — e.g. see Travel's spend every
  month right alongside Groceries' and Remittance's, instead of only
  a single all-time snapshot. Picking one category still narrows it
  down to just that one line, as before. The old all-time pie chart is
  gone — this one chart now covers both jobs.
- **Filter moved back up.** The category filter and this chart now sit
  directly under "Net Savings Trend," above the Monthly Comparison and
  Category Breakdown tables — not all the way at the bottom of the
  page anymore.
- Monthly Detail's own Category Trend section (added last round)
  wasn't touched — it stays at the bottom, and "All Categories" there
  still shows one summed line, matching what it did before.

Updated the filter test suite to check the new multi-line behavior
(each category's own totals, not a combined sum) and re-ran the full
suite — over 400 checks, all green. Verified visually with screenshots
showing both the multi-line "All Categories" view and a filtered
single-category view, confirming the new position under Net Savings
Trend.

## Round 32 (2026-07-20, Net Worth split into US / India / Total tabs)

You asked for a way to see US assets and India assets separately,
rather than everything always converted into one currency — converting
your whole net worth into a single number hides the actual USD balance
of your US accounts and the actual INR balance of your India accounts
behind an exchange rate.

- **Net Worth entry form**: the "Currency" selector is now "Asset
  Region," with clearer buttons — "🇺🇸 US Asset ($)" / "🇮🇳 India Asset
  (₹)" — instead of a raw currency code. Nothing about your existing
  data changed; USD items are automatically your US assets and INR
  items are automatically your India assets, since those are the only
  two currencies this app has ever supported.
- **Dashboard → Net Worth now has 3 tabs**:
  - **US Assets** — only your USD-denominated accounts, shown purely
    in dollars, with no currency conversion involved at all.
  - **India Assets** — only your INR-denominated accounts, shown
    purely in rupees (lakh/crore formatting included), no conversion.
  - **Total** — exactly what you had before: your combined net worth
    with the option to view it in USD or INR, converting the other
    currency's items using the day's exchange rate. This stays the
    default tab, so nothing changes unless you tap into a region.
- All three tabs show the full picture — net worth cards, trend chart,
  category breakdown, growth projections, and the accounts table —
  computed independently for whichever tab you're on.

Verified the math end-to-end, not just visually: US total ($60,000)
plus India total (₹92.4L, which is $105,000 at the day's rate) equals
the Total tab's figure ($165,000), checked with an automated test
rather than eyeballed. Added 23 new checks for the region split and
re-ran the entire existing Net Worth suite (currency toggle, lakh/crore
formatting, manual FX rate entry, growth projections, FX fallback,
cloud sync) — all passed against the refactored code with no changes
needed beyond a couple of test selectors that referenced the old
button labels. Full regression suite — 450+ checks across 29 files —
all green. Verified visually with screenshots of the entry form and
all three dashboard tabs.

## Round 33 (2026-07-20, fix flag emoji rendering on Net Worth tabs)

Quick follow-up: the 🇺🇸/🇮🇳 flag emoji used on the new Net Worth region
tabs and entry-form labels don't render as flags on every device — on
systems without color-emoji flag support, they fall back to their
literal two-letter codes, so "🇺🇸 US Assets" was showing up as "US US
Assets" and "🇮🇳 India Assets" as "IN India Assets." Dropped the emoji
entirely: the dashboard tabs now just read "US Assets" / "IN Assets,"
and the entry form's region chips read "US Asset ($)" / "IN Asset
(₹)." Re-ran the full Net Worth test suite — all pass.

## Round 34 (2026-07-20, responsive layout for tablet/desktop)

You asked for the app to still be a web app, mobile-friendly as
before, but to look intentional on a desktop or laptop browser too —
today it's a single fixed 520px-wide column, so on a wide screen it
just floats as a narrow phone-width strip in a sea of blank space.

Added a CSS-only responsive pass — no restructuring of the HTML or the
JS logic, so this carries zero risk to how the app behaves:

- **Below 700px (phones)**: completely unchanged. Same single-column
  layout, same button sizes, same everything.
- **Tablet (≥700px)**: the app widens to 680px and the category grid
  goes from 3 to 4 columns per row.
- **Desktop (≥1024px)**: the app widens to 1100px and gets a framed
  look — a border, rounded corners, and a soft shadow — sitting on a
  slightly darker page background, so it reads as an intentional
  desktop layout instead of a stretched phone screen. The category
  grid goes to 6 columns, the summary cards spread across the extra
  width automatically, and on the Overview, Monthly Detail, and Net
  Worth dashboards the charts pair up two side-by-side instead of
  stacking one under the other — while the cards, filter dropdowns,
  and tables still span the full width so they don't get squeezed.

Verified nothing broke on mobile: every one of the 500+ checks across
29 test files runs at a narrow phone viewport and all still pass
unmodified, since the new rules only kick in above 700px. Verified the
desktop look visually with screenshots of Overview, Monthly Detail,
both Net Worth region tabs, and the expense entry form at 1440px wide,
alongside the same mobile screenshots to confirm they're pixel-
identical to before.

## Round 35 (2026-07-20, sync production data + promote today's releases to production)

Two things, as requested: reconcile the data between dev and production,
then promote everything shipped to `develop` today (Rounds 29-34) into
production.

**Data sync:**
- Production had 5 expense entries dev didn't have yet — all logged
  directly in the real app today (Starlink, gas, Ross clothing,
  groceries, US Mobile). Copied those into dev so both sides match.
- Found a genuine conflict in the net worth data: the same $15,000
  entry ("To Adil") had been logged separately in both places with
  different details — production had it as "Other Assets" at 4%
  growth, dev had it as "Cash & Bank" at 4.1% growth with a typo'd
  item name (double space). Flagged this rather than guessing, and
  you confirmed production's version was correct — dev's copy now
  matches production exactly, so this doesn't get double-counted
  anywhere.
- Both `entries.json` (139 entries) and `networth.json` (18 entries)
  now have identical ID sets on both sides, verified with an automated
  test that loads the reconciled dev data through the app itself and
  checks the totals — not just diffed the files.

**Promoted to production** (Rounds 29 through 34, all in one release):
category filter on the Dashboard, the Remittance category, the
compact category grid, the Category Filter/Trend restructure (moved
to the bottom, then back up under Net Savings Trend), the multi-line
Spend by Category trend chart, the Net Worth US/India/Total region
split, the flag-emoji label fix, and the new tablet/desktop responsive
layout.

Merged `develop` into `main` as a real merge (matching how the Net
Worth release went out before) — checked first, in an isolated
throwaway clone, that this wouldn't conflict with the `dev/` preview
folder that only exists on `main` (it doesn't, confirmed with a dry
run). The only real conflict was in `STATUS.md` itself, from rounds
being logged independently on each branch — resolved by keeping
`develop`'s full history, since it's the complete, correct one.

Tested twice against the real, reconciled production data before and
after pushing: connected through the actual Cloud Sync path (not a
local file), confirmed all 139 entries and 18 net worth entries load
correctly, no NaN or undefined anywhere, the Remittance category
shows up, and the US/India/Total region tabs all compute the right
numbers against your real accounts (US: $423,259 in assets, $1,500 in
liabilities; India: ₹2.75 Cr in assets, no liabilities). Also caught
and fixed one stale test fixture (a reference-values file that still
expected the old 135-entry dataset) before re-running the full
regression suite — every check passes against the reconciled data,
in both dev and now production.

## Round 36 (2026-07-24, reorder the top nav)

Small tweak: moved the Dashboard tab to the end of the top nav, so the
order is now Expense / Income / Net Worth / Dashboard instead of
Expense / Income / Dashboard / Net Worth.

## Round 37 (2026-07-24, warm rounded redesign inspired by a reference site)

You shared a screenshot of a site whose look you liked — warm palette,
pill-shaped buttons, rounded cards with soft shadows, a friendly
rounded typeface — and asked for something similar in both dark and
light mode, without losing any functionality.

Re-skinned the app through its existing theme-variable system, so both
modes picked it up automatically:
- Backgrounds shifted from cool blue/gray to a warm near-black (dark)
  and a soft cream (light), instead of the previous navy-tinted tones.
- The main action buttons (Save, Sync, Connect) now use a vibrant
  lime-green with dark text — the same kind of standout primary color
  the reference site uses for its main call-to-action — while selected
  tabs and pills use a deep forest green with white text.
- Cards, charts, tables, and entries got bigger rounded corners and a
  soft drop shadow, so they read as floating cards rather than flat
  bordered boxes.
- Every button (Save, Sync, tabs, category/store chips) is now fully
  pill-shaped, and each category icon sits inside a soft circular
  badge, echoing the reference's rounded icon badges.
- Added a rounded, friendly typeface (Poppins), with the same system
  font as a fallback if it ever can't load.

This only touches the visual layer — no HTML structure or JS logic
changed, so every feature works exactly as before. Full regression
suite (26 files, 500+ checks) re-run and all green; caught one visual
regression along the way (the new icon badges made the category grid
taller than the compact size from an earlier round) and fixed it
before shipping. Verified both themes visually with screenshots of the
entry form, dashboard, and Net Worth form.

## Round 38 (2026-07-24, promote today's releases to production + nightly data sync)

Promoted everything shipped to `develop` today into production:
- Moving the Dashboard tab to the end of the top nav (Round 36)
- The warm, rounded redesign — new palette, pill buttons, rounded
  cards with soft shadows, the Poppins typeface (Round 37)

Merged `develop` into `main` as a real merge, same safe process as
before — dry-run verified in an isolated clone first, only conflict
was the expected one in STATUS.md itself (resolved by keeping
`develop`'s full history). Tested against the real, current
production data (147 entries, 18 net worth entries — production had
grown since the last release) through the actual Cloud Sync path
before pushing: no NaN/undefined anywhere, Remittance category
present, and the Net Worth region tabs compute correctly against the
current real numbers (US: $421,947 assets / $1,500 liabilities;
India: ₹2.7 Cr assets, no liabilities). Also caught and fixed a stale
test fixture (reference values still expected the old 139-entry
dataset) before re-running the full suite — every check passes.

Also set up a **nightly data sync**: a scheduled routine now runs
every night at 12:00 AM Eastern (4:00 AM UTC) that pulls any new
production entries into the dev data repo automatically — additive
only, never deletes or overwrites anything already in dev, and stops
to ask rather than guess if it ever finds a genuine conflict (like the
"To Adil" duplicate from Round 35, which reappeared once and was
resolved the same way).

## Round 39 (2026-07-26, reorder entry form: Amount first)

You shared screenshots of another expense-tracker app (SpendCheck) and
liked how it puts the amount entry front and center, with everything
else compact underneath. Reordered the Expense/Income form to match:
Amount is now the first, hero field (auto-focused) at the top,
followed by Store/Merchant, Date, Payment Method, Note, and Category
at the bottom — instead of the previous Date → Category → Amount →
Store order.

Bonus: since typing a recognized store name already auto-fills its
category from history, by the time you scroll down to Category it's
often already correctly picked for you — so logging a repeat expense
can be as quick as Amount + Store + Save.

Pure reorder, same fields and save logic — full regression suite (15
files covering save/edit/validation) passed unmodified since none of
it depends on DOM order. Verified visually in both themes and in
Income mode, plus a full save-flow sanity check.

## Round 40 (2026-07-26, category picker: collapsed field + full-screen list)

Another screenshot, this time of the Category picker in that same
reference app — a clean full-screen list with an icon next to each
category and a checkmark on whichever one is currently selected.

Replaced the always-visible 13-button category grid with a single
collapsed field showing your current pick (icon + name), or "Select
category" if nothing's chosen yet. Tapping it opens a full-screen
picker matching the reference: icon + label rows, a checkmark on your
current selection, a back button to close. This frees up a large
chunk of vertical space on the entry form — you only see the full
category list when you actually need to pick one.

Nothing about how categories work changed under the hood — same
categories, same icons, same auto-suggest-from-store behavior. Updated
10 test files that used to click category buttons directly to open
the picker first instead, plus a couple that read the old grid's
selected-button styling to read the new field's label. Also caught an
unrelated stale test fixture along the way and refreshed it. Full
regression suite (26 files, 450+ checks) all green; verified visually
in both themes, including the checkmark showing correctly when
reopening the picker on an already-chosen category.

## Round 41 (2026-07-26, Excel report export)

The same SpendCheck screenshots also showed a one-tap "export everything
to Excel" feature, so you asked for the equivalent alongside the
existing JSON backup.

Added an **"Export Excel report (.xlsx)"** button in the Backup section.
One tap downloads a multi-sheet workbook: Monthly Summary (income,
expenses, net savings, savings rate per month), Category Breakdown
(each category's spend per month plus a total column), All Entries
(every expense/income line item), and — when you have net worth data —
Net Worth (Current) and Net Worth History sheets. Built client-side with
SheetJS, no server involved, same as the rest of the app.

One honest caveat: a lightweight client-side library like this can't
generate native embedded Excel charts the way a full desktop app can —
so instead of faking that, the export gives you clean, well-labeled
tabular data across all those sheets that you can pivot or chart
yourself in Excel in a couple of clicks. Said so plainly in a caption
under the button rather than overselling it.

Tested with 14 new checks (stubbing the SheetJS CDN, since it's blocked
in this sandbox the same way Chart.js is) confirming every sheet is
created with the right data — monthly totals, category totals, entry
fields, net worth values — and that the file downloads with a dated
filename, plus a full re-run of the existing regression suite (30+
files) — all green. Verified visually with a screenshot of the new
button's placement in the Backup section.

## Round 42 (2026-07-26, Add-button redesign + merchant autocomplete + new categories)

Another SpendCheck screenshot (the removable Store/Merchant chip row)
plus a voice note asking for three more changes, all in one go. Planned
each piece first, then built, tested, and regression-tested one module
at a time before touching the next:

- **Merchant/Store is now a type-ahead field, not a wall of buttons.**
  Type a couple of letters and matching past merchants filter in
  live — prefix match first ("cos" → Costco), falling back to a
  substring match — instead of always showing every quick-pick chip at
  once. Each suggestion still has a small × to hide it from future
  suggestions, same as before, and a brand-new merchant you type just
  saves as free text and shows up as a suggestion next time.
- **Entry form reordered** to Amount → Category → Merchant → Date →
  Payment Method → Note (optional, always last) — per your explicit
  ask, with Date and Payment Method keeping their relative order since
  you didn't call those out specifically.
- **The flat Expense/Income/Net Worth/Dashboard tab bar is gone.**
  Dashboard is now the app's permanent home screen (its Overview /
  Monthly Detail / Net Worth views are unchanged). A single floating
  "+" button — modeled directly on the reference app's own FAB — is
  always there on top of Dashboard. Tapping it opens a small picker:
  🧾 Add Expense, 💰 Add Income, 💎 Update Net Worth. Picking one shows
  the existing entry form full-screen; Save, Update, or the back arrow
  all return you to Dashboard, refreshed. Editing an entry from
  Dashboard's Monthly Detail table works exactly as before, just
  reached the same way. This also resolves your earlier open question
  about combining the Net Worth entry tab with Dashboard's Net Worth
  view — Dashboard is now the one place you look, the + button is the
  one place you log.
  - Since Cloud Sync setup and Backup (including last round's Excel
    export) aren't really part of "logging an expense," they moved
    from the entry form onto Dashboard itself, so they stay one tap
    away instead of getting buried behind the new + button.
- **6 categories added** that your reference app has and yours didn't:
  Home, Transport, Automotive, Education, Personal, Gifts & Donations.
  Categories you already had an equivalent for (Food & Drink≈Dining
  Out, Bills & Utilities≈Utilities/Phone, etc.) weren't duplicated
  under a new name, since renaming an existing category would silently
  reclassify your past entries under it.

Also confirmed, since you weren't seeing them: last round's Excel
export and the category-picker redesign from two rounds ago were both
already live on the dev link the whole time (verified via the
successful "Deploy dev preview" GitHub Actions run) — likely a
browser/CDN cache on your phone, same class of issue as the home-screen
icon caching problem from way back.

Tested with 3 new dedicated test files (18 checks for the new
categories, 19 for the merchant autocomplete, 25 for the full Add-button
flow — FAB, picker, all three destinations, cancel, back-arrow,
editing from Dashboard) plus a full migration of the existing ~35-file
regression suite from tab-clicks to the new navigation (the same
mechanical, one-file-at-a-time style as the category-picker migration
two rounds ago) — every file re-run and green, including catching and
fixing a couple of real gaps the redesign surfaced along the way (a
"scroll down" hint in the Sync Now toast that no longer made sense once
Cloud Sync moved to Dashboard, and a stale test file from several
rounds back that still referenced the old always-visible category
grid). Verified visually with screenshots of the new Dashboard home
screen, the Add picker, the reordered form with live merchant
suggestions, and the category picker showing all 6 new categories.

## Round 43 (2026-07-26, Net Worth category search, Dashboard tab reorder, a real Backup/Excel-export bug fix)

Three pieces of feedback from actually testing last round's release.

**A real bug, not a cache issue this time.** You reported still not
seeing the Excel export button on the dev link. Traced it down: a
Round 16 decision hides the *entire* Backup section on dev (since dev
has its own Cloud Sync, the old JSON Backup/Restore felt redundant
there) — but that section now also holds the brand-new Excel export
button, so hiding the whole thing meant there was no way to test Excel
export on dev at all, and it's not on production yet either. Fixed by
splitting the two: JSON Backup/Restore still hides on dev exactly as
before, but Excel export now always stays visible on both dev and
production.

**Net Worth's Category field** is now the same collapsed field +
full-screen picker as Expense/Income categories got two rounds ago —
plus a live search box at the top, so typing a couple of letters (e.g.
"ret") filters straight to "Retirement (401k/IRA)" instead of scanning
a button grid. Same prefix-then-substring search rule as the Merchant
autocomplete. Editing an existing item, tapping a quick-pick chip, and
saving all still preselect and carry the right category exactly as
before — only the picker's presentation changed.

**Dashboard sub-tabs reordered**: Monthly Detail is now the landing
view when Dashboard opens (it's the highest-traffic screen — checking
and adding this month's expenses), "Overview" is relabeled "Summary",
and the final order is Monthly Detail → Summary → Net Worth.

Tested with 2 new dedicated test files (12 checks for the Net Worth
picker — opens as a searchable list not a grid, prefix and substring
search both work, save/edit round-trip the right category — and 12
more for the tab reorder — correct order and labels, Monthly is the
landing view both on first load and after a reload, switching between
all three sub-tabs still works) plus migrating all 24 existing test
files that assumed the old grid or the old Overview-as-default behavior
(confirmed via grep, same mechanical one-file-at-a-time style as every
prior picker/nav rollout) — full suite re-run and green. Also did a
manual usability pass per your request: seeded a realistic 240-entry,
12-month, 8-account dataset directly into a local test session (never
touched any committed file or the real data repos) and clicked through
Dashboard, Summary, Net Worth, adding an expense with the merchant
autocomplete, and searching the new Net Worth category picker — all
correct and responsive at that scale, confirmed with screenshots.

## Round 44 (2026-07-26, Net Worth Item Name search, scoped by category)

One more Net Worth follow-up: the Item Name field still showed every
account/asset you've ever logged as a row of always-visible chip
buttons, the same clutter the Merchant field had before its own
autocomplete. Same fix applied here:

- **Item Name is now a live search field**, not a chip row. Focus it
  and your recent items show up; type a couple of letters and it
  filters live (prefix match first, then substring), same rule as the
  Merchant autocomplete. Each suggestion has a small × to hide it from
  future suggestions without touching any history.
- **Scoped to whichever category you picked.** Select "Cash & Bank"
  first, and only your bank items show up when you search Item Name —
  not your 401k, not your house, just your banks. Pick a different
  category and the list re-scopes automatically.
- **Category now comes first, Item Name second** — matching how you
  described wanting to work: pick the category, then search within it.
  Date moved to third; Asset Region, Current Value, and Growth Rate
  keep their existing order after that. Picking a suggested item still
  auto-fills its currency and growth rate from its latest entry, same
  as before.

Tested with a new 13-check test file (field order, the old chip row is
gone, category-scoped filtering both ways, prefix search, prefill
correctness, hide-a-suggestion persists across reload, a brand-new item
name still saves as free text) plus migrating the one existing test
that used the old chip buttons, and a full regression re-run — all
green. Verified visually with a screenshot showing "Cash & Bank" picked
and typing "w" correctly surfacing only "Wells Fargo Checking," not the
401k from a different category.

## Round 45 (2026-07-27, promote Rounds 39-44 to production + refresh dev from prod)

Everything approved on `develop` since the last production push is now
live on `main`: entry-form reorder (Amount first), the searchable
category picker for Expense/Income, Excel report export, the
Add-button/Dashboard-home redesign with merchant autocomplete and 6 new
categories, the Backup-section bug fix that was hiding the Excel export
button on `/dev/`, the Net Worth category picker, and the Net Worth
Item Name search scoped by category — plus the Dashboard tab reorder
(Monthly Detail lands first, "Overview" renamed "Summary", Net Worth
last).

Promoted with the same dry-run-first process as every prior release: a
throwaway clone merged `origin/develop` into `origin/main` first to
confirm there'd be no surprises (the only conflict, in STATUS.md, was
resolved the usual way — keep develop's fuller history), then the
identical merge was repeated for real and pushed to `main`. A `diff`
confirmed the dry-run and the real merge produced byte-identical
`index.html`.

Before pushing anything live, the merged build was loaded with a real
copy of production's actual data (148 entries, 26 net worth items —
restored through the app's own restore mechanism, not synthetic test
data) and checked end-to-end: all entries load, Dashboard lands on
Monthly Detail, Summary totals match the real numbers exactly, no
NaN/undefined anywhere, the new categories are present, Net Worth's US
region and category/item pickers work correctly against real accounts
(computed to a real net worth of $421,079), and the Excel export button
is visible. 12/12 checks passed before the merge went out.

Production's underlying financial data was never touched by this — the
promotion is a code-only change to the `iExpenseApps` repo, completely
separate from the `expense-data` data repo. Confirmed via `git status`
and `git log` on the data repo that nothing there moved.

Afterward, re-ran the production→dev sync so dev has everything prod
has: 0 entries and 0 net worth items missing from dev in either
direction, beyond the already-known, intentionally-untouched dev-only
extras from earlier rounds.

## Round 46 (2026-07-27, real native charts in the Excel export)

The Excel report export used to be raw data only — you'd have to build
your own charts in Excel by hand. Now the exported `.xlsx` opens
straight to a new "Charts" sheet with real, editable Excel chart
objects (not pictures) built right in:

- **Monthly Income vs Expenses** (bar) and **Net Savings Trend**
  (line), from the Monthly Summary sheet.
- **Category Breakdown** (bar), from the Category Breakdown sheet.
- **Net Worth by Category** (pie) and **Net Worth Trend** (line) — one
  pair per currency you actually use (e.g. one for USD, one for INR),
  rather than adding them together, since combining currencies without
  a live same-day exchange rate would misreport the total. This is the
  same reasoning the app's own Net Worth region tabs already use.

These are genuine Excel chart objects that reference the live cells in
the data sheets — edit a number in "Monthly Summary" and the chart
updates, the same as if you'd built it yourself with Excel's own
Insert > Chart.

Why this needed custom work: neither the free SheetJS build already
used for the export, nor ExcelJS, can write chart objects — that's a
documented gap in both, not something a settings flag turns on. Since
an `.xlsx` file is just a zip of XML parts, the fix builds the chart
XML by hand (the same DrawingML format real Excel writes) and splices
it into the workbook via JSZip after SheetJS builds the data sheets.
If JSZip ever fails to load, the export still falls back to the
previous plain, chartless file rather than breaking the button.

Verified two ways: openpyxl (an independent, real-world-tested Python
Excel library, not anything used to build the feature) opened the
generated file and correctly read back all 7 charts — right types,
right titles, right cell references, right data — and a full
regression pass covered a zero-data account, a single-currency
account, and JSZip failing to load, confirming a plain-but-valid file
still downloads in every case rather than an error. The existing
Round 41 Excel export test was updated for the new delivery path (a
real file download instead of always calling `XLSX.writeFile`
directly) and still passes. Ships to `develop` only — production
promotion is a separate step, same as every other round.

## Round 47 (2026-07-28, category pickers ranked by usage frequency)

The Expense and Net Worth category pickers used to list categories in
a fixed order, so a frequently-used category could sit below several
you rarely touch. Both pickers now rank categories by how often you've
actually logged them in the last 3 months — counted by number of
entries, not dollar amount, so a once-a-month Rent payment doesn't
outrank Groceries just because it's a bigger number. Ties break on
all-time count; anything with zero activity in either window keeps its
original relative position at the bottom rather than being shuffled
arbitrarily. Income categories are untouched — few enough, and regular
enough (mostly just Salary), that ranking wouldn't help.

Before building anything, the proposed order was computed from real
account data and shown for approval — top of the Expense list came out
Groceries, Shopping, Health, Subscriptions, Utilities/Phone, Gas,
Dining Out, with Rent (high dollar amount, only 3 times in 3 months)
correctly dropping out of the top spot. Net Worth's top came out Cash
& Bank, then Other Assets. Approved as shown, then implemented exactly
that way — the ranking is computed live from `entries`/`nwEntries` each
time a picker opens, not hardcoded to today's numbers, so it keeps
adapting as spending habits change.

Tested against real dev account data end-to-end: the rendered picker
order matches the approved table exactly, income categories are
provably untouched, the Net Worth picker's search box still filters
correctly on top of the new ranked order, and selecting/saving a
category still works. Full regression suite green. Ships to `develop`
and, per explicit approval this round, straight on to production —
promoted the same dry-run-then-real-merge way as every previous
release, verified against real production data before going live.

## Round 48 (2026-07-28, confirm dialogs + fully automatic sync, dev only)

Prompted by a real bug report: an income entry kept reappearing after
being deleted three times. Root cause was in how Cloud Sync merges —
`unionMerge` could only ever add entries, so it had no way to tell
"never existed on the other side" apart from "existed there, then got
deleted here." If the remote copy hadn't caught up to a delete yet for
any reason, the next merge (page load, reconnect, or the sync button)
would silently bring the deleted entry right back. Deleted ids are now
recorded locally and every merge excludes them permanently; if a merge
still finds a tombstoned id sitting on the remote copy, it pushes a
cleanup write so the remote side converges too, instead of the same
entry resurrecting indefinitely.

Two other changes requested together:

- **Delete and Update now ask for confirmation first** — "Delete this
  entry? This can't be undone." / "Update this entry?" — for both
  Expense/Income entries and Net Worth items. Brand-new entries still
  save with no prompt, since only changing or removing something
  already saved carries a "wait, are you sure" risk.
- **The manual "Sync Now" button is gone.** It turned out to be mostly
  redundant already — saving, updating, and deleting an entry has
  always pushed to the cloud automatically the moment it happens.
  What's new: a `visibilitychange` listener now also reconciles
  automatically when you switch back to the app, so changes made on
  another device while this tab was in the background show up without
  ever needing to tap anything.

Tested with two new dedicated test files: one exercising every confirm
dialog (Cancel keeps the entry/update, OK applies it, new entries never
prompt) and confirming auto-sync still fires with no manual step; the
other specifically reproducing the reported bug — delete an entry,
force the remote copy to still have it (simulating the exact failure
condition), reload, and confirm it no longer resurrects and the remote
copy gets cleaned up. Full regression suite green, including
retargeting one test that only verified the now-intentionally-removed
Sync Now button and regenerating a stale reference-data fixture in
another (production data had genuinely moved on since it was last
captured — unrelated to this change, just happened to be noticed here).
Shipped to `develop` only, per this round's explicit "implement that
in dev" ask — not promoted to production yet.

## Round 54 (2026-08-01, first-run onboarding: name + currency preferences)

The goal that kicked this off: the app has been a personal single-user
tool, but there's now interest in handing the same link to other people
to try. Everyone sharing the app needs their own name and currency
setup without touching anyone else's data or the shared code.

- **First launch on a truly empty phone** (no entries, no net worth, no
  cloud config) now shows a one-time welcome screen: enter your name,
  pick a **primary currency** (any of 12 — USD, INR, EUR, GBP, CAD,
  AUD, JPY, SGD, AED, CHF, CNY, MXN — USD is just the default, not
  privileged), and say whether you also want to track a **second
  currency**. Saying yes picks a second currency and unlocks the
  existing US/IN-style region split (region tabs, per-region asset
  totals, FX-converted combined total) for whatever pair you chose —
  saying no collapses Net Worth down to a single Total view with no
  region picker, no currency field on the entry form, and no FX rate
  UI at all, since there's nothing to convert.
- **Preferences persist locally only** (`iexpense_prefs_v1` key) and
  are never part of the cloud-sync payload — two people using their own
  linked cloud repos each keep their own name/currency, and existing
  entries/net-worth data are completely unaffected by a currency
  choice; it only changes how amounts are labeled and grouped on
  screen.
- **My own usage is untouched by construction, not by a special case**:
  anyone who already has entries, net worth data, or a cloud connection
  saved (i.e. every existing user, including me) gets silently
  migrated to `{primaryCurrency: "USD", secondaryCurrency: "INR"}` the
  first time this build runs — the exact pairing the app has always
  used — so the onboarding screen never appears and nothing on screen
  changes. Preferences are reachable anytime after via a new "Name &
  currency preferences" button under Backup, prefilled with your
  current choice, for anyone who wants to revisit it (including to add
  a name after being auto-migrated).
- Every hardcoded "USD"/"$"/"₹" assumption that mattered for this (the
  header month-total badge, the Net Worth entry form's region field,
  region-tab labels, the FX rate status line, the manual-rate labels,
  `nwConvert`/`getUsdInrRate`) now reads from the two prefs currencies
  instead — a non-US/India pair (tested with EUR/GBP) gets the same
  region-split behavior with generic labels instead of "US"/"IN".

Tested end-to-end: fresh single-currency install (name, primary-only,
confirms name is required, no region picker/tabs/FX UI anywhere,
correct symbol throughout, survives reload), fresh dual-currency
install (region tabs + labels correct, display-currency toggle works,
FX conversion and lakh/crore formatting still correct for the
secondary currency), a non-USD/INR pair to prove the currency choice
isn't hardcoded, the existing-user silent migration path (data present,
no prefs → USD+INR, no onboarding screen, greeting stays hidden until a
name is set), and reopening Preferences later to edit an existing
setup. Also ran a full realistic-scale pass by hand: ~27 dummy
expense/income entries across many categories for the current month
plus a couple of net worth assets added through the real UI for both a
single-currency and a dual-currency user, checking Monthly Detail,
Summary, and Net Worth dashboard totals all matched by hand-computed
expected sums before clearing the seeded data. Full regression suite
(40 test files, all pre-existing behavior) re-verified green after this
change — a few tests needed fixing along the way for reasons unrelated
to this feature (hardcoded "current month" dates that had rolled over
since being written, two retired scripts that predated the Round 40
category-picker redesign and were checking removed markup). Shipped to
`develop` only — production untouched until tried and confirmed.

## Round 55 (2026-08-01, net worth: never mutate history + sort/filter rework)

Real usage today surfaced a bug: tapping straight into a Net Worth item to
log this month's value used the "edit" flow, which overwrote that item's
last entry in place — silently erasing the previous month's data point and
producing a bogus month-over-month "change" figure. Traced and repaired 6
affected items in the live production data (each one's lost prior-month
value restored as its own entry, in both prod and dev), then fixed the
underlying behavior so this can't happen again:

- **Tapping an item never edits it anymore.** It opens the entry form
  pre-filled with that item's name, category, currency/region, and growth
  rate, plus its **last known value** so you can just retype the new
  number — but the date is always **today**, and saving always appends a
  brand-new entry with a fresh id. The previous entry is never touched.
  This applies whether you tap the item from the Net Worth tab's "Your
  Items" list or from a Dashboard region table row. The only thing this
  removes is the ability to silently rewrite a past month's value — which
  was the exact mechanism that caused today's real bug.
- **Sorted high to low, US then India.** The "Your Accounts & Assets"
  table (all three region views) now sorts by value descending; the
  combined Total view groups every primary-currency item before every
  secondary-currency item rather than interleaving by raw number, so it
  reads as "biggest US account first, then biggest India account" the way
  you'd expect even though the two currencies aren't directly comparable.
- **Category + item filters, with a history drill-down.** Each region view
  gets two new dropdowns above its items table — Category and Item (the
  Item list narrows to whatever the picked category contains). Picking a
  specific item reveals a new "History" table below listing every snapshot
  ever logged for it, oldest to newest, so a question like "how has my
  401k actually changed month to month" has a direct answer instead of
  requiring a mental diff of the combined view. Clearing the category
  filter clears the item filter too. This only narrows the detail table
  and history section — the summary cards, charts, and growth projections
  above still reflect the full unfiltered picture.

Tested end-to-end: tapping an item prefills today's date + last value +
growth rate and changes nothing on Cancel; saving an update appends a new
entry while the original is provably byte-for-byte unchanged; the same
holds from the Dashboard's row-tap path; sort order verified across a
mixed 3-US/2-India seed (both the cross-region grouping and the within-
region descending order); category filter narrows the table, item filter
reveals the History table with both the old and new value visible,
clearing the category filter hides history and restores the full list.
Full regression suite (41 files including the new one) green. Shipped to
`develop` only.

## Round 56 (2026-08-01, header hamburger menu for name + preferences)

Replaced the standalone dark/light toggle button in the header with a
"☰" menu button. Tapping it opens a small dropdown showing your name and
current currency setup (e.g. "USD + INR") at a glance, the appearance
toggle (now two Dark/Light buttons instead of one cycling icon), and a
link straight into the full "Name & currency preferences" screen. This
gives a direct, on-demand way to confirm what's currently set — no more
guessing whether preferences took effect, especially useful once other
people start using their own copies of the app. Tapping outside the menu
closes it; theme choice still persists exactly as before.

Tested end-to-end: old theme button confirmed gone, menu opens/closes
correctly, name and currency summary shown accurately, both theme buttons
switch the theme and reflect the current selection, tapping the backdrop
closes the menu, theme choice survives reload, and the preferences link
opens the existing Preferences screen pre-filled — including that the
menu immediately reflects a name edited from there. Three existing tests
that drove the old `#themeToggle` button directly were updated to use the
menu instead. Full regression suite (42 files) green. Shipped to
`develop` only.

## Round 57 (2026-08-04, backup/restore data-integrity + small polish)

Bug-hunt round on `develop`. Read the whole `index.html` end-to-end after
Round 56, found five issues, and fixed all of them in one round. The
three top ones are all in the JSON Backup/Restore flow and are the kind
of silent data-integrity bug the app is otherwise very careful about, so
they belonged together.

- **Restore no longer strips entry ids.** `restoreData` was building a
  fresh object per entry and never copying `e.id` over. `ensureIds()`
  then minted a brand-new id on the next `persist()`. If the backup came
  from a cloud-connected copy of the app, those entries already lived in
  the private `entries.json` on GitHub with their original ids, so the
  next Cloud Sync `unionMerge` couldn't dedupe them by id and would
  quietly push them up as duplicates — and the delete tombstones would
  no longer match either. Now the original `e.id` is preserved when the
  backup has one; legacy bare-array backups without ids still work as
  before and get their ids backfilled by `ensureIds`.
- **Backup now includes Net Worth history.** `backupData` was only
  serializing `entries`, silently dropping every `nwEntries` snapshot the
  user had ever logged. Round 55 went to specific trouble to make sure
  net worth history can never be lost through in-app editing — leaving
  it out of the on-device backup file was inconsistent with that
  guarantee. Backup payload is now `{ backup, source, entries, nwEntries }`,
  and `restoreData` dedupes NW entries strictly by id (nwEntries have
  had ids since day one). Legacy backups (bare array, or object without
  `nwEntries`) still restore cleanly.
- **Restore pushes to cloud immediately.** Even in the happy path,
  `restoreData` was leaving the two sides out of sync until the next
  save/delete happened to touch the cloud copy. When `cloudCfg` is
  connected and the restore actually added something, we now call
  `cloudSyncNow()` right away — same union-merge + retry path all the
  other sync mutations use.
- **Header menu closes after picking a theme.** The Round 56 hamburger
  menu's Dark/Light buttons flipped the theme but left the menu +
  backdrop open until you tapped outside. Both onclick handlers now call
  `closeHeaderMenu()` too, matching the "Name & currency preferences"
  link right below them.
- **Manual FX rate sanity band.** `saveManualFxRate` now rejects
  non-finite values and anything outside `0.0001 … 100000`, so a stray
  typo (missing decimal, extra zero, `1e12`) can't quietly turn a
  correct-looking net worth total into nonsense. Realistic pairs
  (USD/INR ~83, CAD/JPY ~120, USD/VND ~24000) all still accepted.

Tested end-to-end with a lightweight harness that stubs `document` /
`localStorage` / `Blob` / `FileReader`, extracts the exact `backupData`
and `restoreData` source from the shipped `index.html`, and walks
through: (1) backup payload contains both `entries` and `nwEntries`, (2)
restore preserves ids on both entries and NW snapshots, (3) re-restoring
the same file is a no-op (dedupes by id), (4) legacy bare-array backups
still restore, (5) `cloudSyncNow()` is called only when `cloudCfg` is
set and something was actually added. All pass. Manual FX guard verified
against a range of good and bad inputs. Node `--check` on the extracted
script block reports clean syntax. Shipped directly to `develop`.
