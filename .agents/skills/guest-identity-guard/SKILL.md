# Guest Identity Guard — Splitwise

This app has no accounts. This file exists to stop that principle from eroding one convenient feature at a time.

## Hard rules

- **Never add email/password authentication.** Not even as an "optional" upgrade path. Not Supabase Auth, not NextAuth, not a custom implementation.
- **Never add OAuth providers** (Google/Apple/Facebook sign-in), even if a task description implies a "login" screen. Flag it back instead of building it.
- **Never collect a phone number or email as a required field.** A display name is the only required identity input when joining a group.
- **Never store more personal data than a name.** No avatars pulled from third-party services, no contact lookups, no device contact list access.

## How identity actually works

1. A person enters a join code and a name.
2. The server creates (or reuses, if the same device already joined this group) a `participants` row with a fresh `session_token`.
3. The `session_token` is written to the browser via `localStorage`, keyed by `group_id`. This is the device's proof of "I am this participant in this group."
4. On return visits, the app checks `localStorage` for a token matching the group in the URL. If found, the person is recognized automatically with no re-entry needed.
5. If `localStorage` is cleared or the person switches devices, they re-enter the join code and their name. If the name matches an existing participant in that group, offer "is this you?" rather than silently creating a duplicate participant.
6. Provide a "copy join link" action (a URL containing the group's join code) so the group creator can share one link instead of dictating a code, this is the recovery anchor if local storage is lost, matching the pattern validated in the flow research.

## What this enables and what it doesn't

This gives a "feels accountless" experience while still letting the app recognize a returning person on the same device. It does not give cross-device sync for a single identity, and it should not try to. If someone wants to check their balance from a second device, they re-enter the code. That's an acceptable, honest tradeoff for a free, no-signup tool, don't build workarounds that quietly reintroduce account-like behavior (magic email links, phone verification, etc.) to solve it.
