---
id: cashier-status
title: Status
---

# 📊 Cashier Status

The `/api/cashier/status` endpoint returns the real-time status of the currently active cashier session for the authenticated user, including totals and balance.

---

## 📍 Endpoint

```http
GET /api/cashier/status
```

---

## 🔐 Authentication

Requires a valid session via **NextAuth**.

---

## 🔄 Behavior

1. Verifies the authenticated user session.
2. Fetches the current day's open cashier session (UTC-6 timezone).
3. Computes:

   - Opening amount
   - Total `ingreso` transactions
   - Total `egreso` transactions
   - Current balance (`saldoActual`)

4. If no open session is found, returns zeroed values.

---

## ✅ Success Response (session active)

```json
{
  "hasActiveSession": true,
  "openingAmount": 5000.0,
  "totalIngresos": 2500.0,
  "totalEgresos": 1000.0,
  "saldoActual": 6500.0
}
```

## ✅ Success Response (no active session)

```json
{
  "hasActiveSession": false,
  "openingAmount": 0,
  "totalIngresos": 0,
  "totalEgresos": 0,
  "saldoActual": 0
}
```

---

## ❌ Error Responses

- `401 Unauthorized`: Missing or invalid user session
- `400 Bad Request`: Invalid user ID
- `500 Internal Server Error`: General failure during session lookup

---

## 📝 Notes

- Useful for dashboards or overviews during an active cashier shift.
- Timezone is automatically adjusted for **Costa Rica**.

---

## 📦 Related

- [`/api/cashier/open`](./open.md): Open a new cashier session
- [`/api/cashier/close`](./close.md): Close current cashier session
