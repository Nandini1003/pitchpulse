# PitchPulse — Deployment and Testing Report

## Test environment

- Frontend: Vercel
- Backend: Render (FastAPI)
- Database: Supabase
- AI integration: Gemini
- Test data: Supplied cold-call transcript dataset

## Functional testing

| Test case | Expected behaviour | Execution status |
|---|---|---|
| T001 — Successful next step | Preserve the actual agreement without inventing a meeting time | Executed — final record to verify |
| T002 — Callback | Preserve the 30-minute callback request | Executed — final record to verify |
| T004 — Wrong person | Allow early closure and accurately record the contact mismatch | Executed — final record to verify |
| T007 — Explicit refusal | Preserve refusal without creating a false positive outcome | Executed — final record to verify |
| T010 — Referral | Record referral to Mr. Suresh, not report acceptance | Executed — final record to verify |

## Deployment verification

- Render service successfully deployed.
- Backend `/health` returned `status: ok`.
- Supabase and Gemini credentials were reported as configured.
- Vercel frontend loaded successfully.
- New call creation was demonstrated.

## Remaining verification

- Confirm all five records remain available after browser refresh.
- Confirm saved stage notes are retrieved correctly.
- Test the deployed Gemini suggestion endpoint.
- Confirm the live application displays the final PitchPulse branding.

## Known limitation

The Gemini integration previously encountered an API quota-related error. Having a configured API key does not establish successful AI inference. Record the final deployed test result here before submission.

## Outcome integrity

T010 demonstrates why transcript evidence must take priority over an existing logged outcome: the supplied label indicates agreement to receive a report, but the dialogue supports a referral to another contact.