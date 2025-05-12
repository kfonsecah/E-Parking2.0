---
id: session-status
title: Status
---

# Status

Documentation for `session/status`.

## Endpoint

**GET** `/api/session/status`

Verifies if the current user session is active and synchronized between the JWT and the database.

## Behavior

This endpoint performs the following:

- Retrieves the `app-session` cookie from the request.
- Verifies the JWT using the secret key.
- Fetches the user by `id` in the JWT payload.
- Compares the `session_id` stored in the token with the one in the database.
- Returns detailed session information including `lastActivity`.

## Response Example

```json
{
  "tokenSessionId": "31a1b0e6-xxxx-yyyy-zzzz-14fc17cc1555",
  "dbSessionId": "31a1b0e6-xxxx-yyyy-zzzz-14fc17cc1555",
  "userId": 2,
  "lastActivity": "2025-05-02T21:02:33.533Z"
}
```

## Errors

- If no cookie is present: `400 Bad Request`
- If JWT verification fails: `401 Unauthorized`
