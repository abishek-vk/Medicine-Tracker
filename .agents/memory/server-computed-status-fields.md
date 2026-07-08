---
name: Server-computed status fields
description: Pattern for entities with a derived state (e.g. expiry status) that must be computed at read-time rather than stored in the DB.
---

When a resource has a status derived from a date/threshold comparison (e.g. medicine expiry: safe/near_expiry/expiring_soon/expired), do not persist the status or the "days remaining" value in the database — compute it on every read (list, get, create response, update response) against the current date.

**Why:** Storing it would require a cron/background job to keep it fresh and could drift stale between writes; computing it at read-time keeps a single source of truth (the date field) and is trivial given low data volumes.

**How to apply:** Add a small pure helper (e.g. `computeRemainingDays(dateStr, now)` + `computeStatus(remainingDays)`) and a `withComputedFields(row)` wrapper used by every route handler before serializing the response. Keep the OpenAPI response schema's derived fields (`status`, `remainingDays`) separate from the insert/update body schema so clients never send them.
