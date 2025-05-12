---
id: cashier-history
title: History
---

# 📚 Cashier Session History

The `/api/cashier/history` endpoint returns all cashier sessions for the logged-in user for the current day and specified `cashType`.

---

## 📍 Endpoint

```http
GET /api/cashier/history?cashType=Efectivo
```

---

## 🔐 Authentication

Requires the user to be authenticated using NextAuth session.

---

## 🧾 Query Parameters

| Parameter  | Type   | Required | Description                                    |
| ---------- | ------ | -------- | ---------------------------------------------- |
| `cashType` | string | ✅ Yes   | Type of cashier session (e.g. Efectivo, SINPE) |

---

## 📅 Session Filtering

- Only sessions **for today (Costa Rica timezone)** are returned.
- Includes both **open and closed** sessions.
- Sessions are ordered by `session_open_time` ascending.

---

## ✅ Success Response

```json
{
  "message": "Sesiones encontradas",
  "sessions": [
    {
      "sessionId": "abc-123",
      "openingAmount": 5000.0,
      "closingAmount": 8500.0,
      "isClosed": true,
      "openTime": "2025-05-02T08:30:00.000Z",
      "closeTime": "2025-05-02T17:00:00.000Z"
    }
  ]
}
```

---

## ❌ Error Responses

- `401 Unauthorized`: No valid session detected
- `400 Bad Request`: Missing or invalid `cashType`
- `500 Internal Server Error`: On unexpected failure

---

## 📝 Notes

- This endpoint is useful for historical reports and session validation.
- Time calculations are adjusted for **Costa Rica (UTC-6)**.

---

## 📦 Related

- [`/api/cashier/close`](./close.md): Close active session
- [`/api/cashier/open`](./open.md): Open new session
