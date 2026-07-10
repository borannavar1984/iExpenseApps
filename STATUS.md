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

## The big question you raised: cross-device sync + privacy + "anyone can use this"
This needs your decision before I build it — see chat for the write-up of options,
trade-offs, and my recommendation. Short version: phone-only `localStorage` is why your
laptop doesn't see phone entries; fixing that means picking where the shared data lives.
