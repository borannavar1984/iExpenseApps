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
