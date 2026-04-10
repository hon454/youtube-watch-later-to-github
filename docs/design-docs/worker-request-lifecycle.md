# Worker Request Lifecycle

## Routes

- `GET /healthz` returns a lightweight JSON health response.
- `POST /telegram/webhook` accepts Telegram updates.

## Webhook lifecycle

1. Validate the Telegram secret token header.
2. Parse the update and extract the active message payload.
3. Verify the allowed chat ID.
4. Extract the first URL from entities or message text.
5. Reject unsupported or non-YouTube links with a Telegram response message.
6. Return HTTP `200` quickly.
7. Continue GitHub and Telegram follow-up work in `ctx.waitUntil()`.

## Background work

The background task performs:

- YouTube oEmbed metadata lookup
- duplicate detection against GitHub Search
- issue creation with the `watch-later` label
- optional Project V2 item creation
- Telegram success, duplicate, or error messaging

## Reasoning

Telegram retries webhook delivery when it does not receive a successful response quickly. The Worker therefore acknowledges first and completes side effects asynchronously to reduce duplicate processing pressure.
