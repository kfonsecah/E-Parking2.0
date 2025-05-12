---
id: cashier-close
title: Close
---

# 💼 Close Cashier Session

This endpoint allows a cashier to **close an active session**, submit real cash counted, and register an audit record for discrepancies.

---

## 📍 Endpoint

```http
POST /api/cashier/close
```

---

## 🔐 Authentication

Requires a valid user session via JWT (`app-session`) or NextAuth token.

---

## 🧾 Request Body

```json
{
  "realAmount": 8500.0,
  "reason": "End of shift",
  "breakdown": {
    "coins": 500.0,
    "bills": 7000.0,
    "sinpe": 500.0,
    "transfer": 500.0
  }
}
```

| Field        | Type   | Required | Description                         |
| ------------ | ------ | -------- | ----------------------------------- |
| `realAmount` | number | ✅ Yes   | The total amount physically counted |
| `reason`     | string | ❌ No    | Reason for difference (if any)      |
| `breakdown`  | object | ❌ No    | Breakdown of received payment types |

---

## 🔄 Logic Overview

1. **Validate user session**
2. **Fetch active session**
3. **Calculate expected balance** based on:
   - Opening amount
   - Incomes (`ingreso`)
   - Expenses (`egreso`)
4. **Compute difference**
5. **Update session status** as closed
6. **Create audit record** including:
   - Real vs. expected balance
   - Reason and payment breakdown

---

## ✅ Success Response

```json
{
  "message": "Caja cerrada exitosamente",
  "data": {
    "session": { ... },
    "expectedBalance": 8500,
    "realBalance": 8500,
    "difference": 0
  },
  "timestamp": "2025-05-02T20:15:00.000Z"
}
```

---

## ❌ Error Responses

- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: No open session or invalid amount
- `500 Internal Server Error`: Unexpected failure

---

## 📦 Related

- [`/api/cashier/open`](./open.md): Opens a cashier session
- [`/api/cashier/status`](./status.md): Shows active cashier state
