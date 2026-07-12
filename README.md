# iExpense — LIVE

Phone entries now flow into the real iFinance pipeline:

    iPhone (iExpense.html) → Export → OneDrive → Expense App/Inbox/
    → sync_expenses.py → Monthly Reports/<Month>_Expense_Report.xlsx
    → build_master_report.py → Master_Expense_Report.xlsx
    → build_dashboard.py → iFinance_Dashboard.html

## Daily use (~30 sec)
1. Open iExpense on your phone → category → amount → (store/payment optional) → **Save**
2. Once a day or whenever: **Export to OneDrive Inbox** → Save to Files → OneDrive → iFinance - Assist → Expense App → **Inbox**
3. On the laptop, run `python sync_expenses.py` in this folder — or just tell Claude "sync my expenses".

## Safety built in
- Every sync first backs up the affected monthly file, Master, and dashboard to `Backups/<timestamp>/`
- Duplicates are skipped automatically (same date + merchant + amount)
- Processed inbox files are archived to `Processed/`
- TOTAL formulas stay bounded (no double-count); monthly Dashboard tab uses SUMIF and is regenerated each sync
- `python sync_expenses.py --test` still writes only to Test_Data/ (sandbox mode kept)

## New month behavior
When the first entry of a new month arrives, the monthly file is created automatically
with the 4 income sources set to **$0** — income is confirmed monthly, not carried forward.
Tell Claude the month's income amounts and they'll be filled in.

## Notes
- Payment method is stored in column E of the Expenses tab; the master builder ignores it (kept for reference)
- Test_Data/ contains only the old sandbox trial — safe to delete anytime

## i-HealthApp (health-app.html)

A companion phone-first PWA for tracking workouts, weight, and water/nutrition/meds,
built the same way as iExpense: single static `health-app.html`, local storage first,
optional GitHub-backed cloud sync (own private repo, e.g. `iHealth-data`), and a
client-side Dashboard (weight trend, monthly workout minutes, workout type breakdown).

See `CLOUD_SYNC_SETUP.md` for the connect steps — same process, just point it at a
private repo for health data instead of expense data.
