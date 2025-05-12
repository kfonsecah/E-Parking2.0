---
id: cashier-open
title: Open
---

# 🟢 Open Cashier Session

The `/api/cashier/open` endpoint allows authenticated users to open a new cashier session, specifying the initial amount and type.

---

## 📍 Endpoint

```http
POST /api/cashier/open
```

---

## 🔐 Authentication

Requires an active session using NextAuth.

---

## 🧾 Request Body

```json
{
  "cashType": "Efectivo",
  "openAmount": 5000
}
```

| Field        | Type   | Required | Description                                  |
| ------------ | ------ | -------- | -------------------------------------------- |
| `cashType`   | string | ✅ Yes   | Type of cash register (e.g. Efectivo, SINPE) |
| `openAmount` | number | ✅ Yes   | Initial amount for the session               |

---

## ⚙️ Business Logic

1. **Validates Authentication** via NextAuth.
2. **Ensures no open sessions exist** for the same user on the current day.
3. **Creates new cashier session** in the `ep_cashier_session` table.
4. Sets:
   - `session_open_amount`
   - `session_cash_type`
   - `session_open_time` (Costa Rica time, UTC-6)
   - `session_is_closed = false`

---

## ✅ Success Response

```json
{
  "message": "Caja abierta exitosamente",
  "data": {
    "session_id": "...",
    "session_open_amount": 5000,
    ...
  },
  "timestamp": "2025-05-02T14:00:00.000Z"
}
```

---

## ❌ Error Responses

- `401 Unauthorized`: No session found
- `400 Bad Request`: Missing required fields or session already open
- `500 Internal Server Error`: Unexpected failure

---

## 📝 Notes

- A future implementation may log the action into a `cashier_logs` table.
- Only **one session per day** is allowed per user.

---

## 📦 Related

- [`/api/cashier/close`](./close.md): Closes the current session
- [`/api/cashier/history`](./history.md): Lists all sessions of the day
