---
id: cashier-open-sessions
title: Open Sessions
---

# 🟢 Get Open Cashier Session

The `/api/cashier/open-sessions` endpoint returns the current active (open) cashier session for the authenticated user, if any.

---

## 📍 Endpoint

```http
GET /api/cashier/open-sessions
```

---

## 🔐 Authentication

Requires a valid user session using JWT or NextAuth. Uses a shared `getUserIdFromRequest()` utility.

---

## 🔄 Behavior

1. Validates authentication and retrieves `userId`.
2. Searches for an **active session** (`session_is_closed: false`) assigned to that user.
3. Returns:
   - `session_id`
   - `session_cash_type`
   - `session_open_time`
4. If no open session exists, returns `null`.

---

## ✅ Success Response

```json
{
  "sessionId": "abc-123",
  "cashType": "Efectivo",
  "openTime": "2025-05-02T08:00:00.000Z"
}
```

If no open session:

```json
null
```

---

## ❌ Error Responses

- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Unexpected error

---

## 📝 Notes

- Used by the frontend to check whether a user already has an open cashier session before performing actions like opening a new one or registering transactions.

---

## 📦 Related

- [`/api/cashier/open`](./open.md): Opens a new cashier session
- [`/api/cashier/status`](./status.md): Shows full cashier status
