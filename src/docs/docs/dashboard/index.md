---
id: dashboard-index
title: Index
---

# 📊 Dashboard Overview

The `dashboard/index` endpoint provides a consolidated summary of key parking and cashier data for the currently authenticated user.

---

## 📍 Endpoint

```http
GET /api/dashboard
```

---

## 🔐 Authentication

User must be authenticated via **NextAuth**.

---

## 🧾 Data Returned

The dashboard aggregates real-time values for:

### 🚗 Parking Statistics

| Field             | Description                                 |
| ----------------- | ------------------------------------------- |
| `availableSpaces` | Current available spaces                    |
| `totalSpaces`     | Total configured parking spaces             |
| `parkedCars`      | Cars currently parked                       |
| `egressedCars`    | Vehicles that have exited the lot           |
| `onExitCars`      | Vehicles that exited in the last 15 minutes |

### 💵 Cashier Statistics

| Field           | Description                                   |
| --------------- | --------------------------------------------- |
| `openingAmount` | Total opening amount from all active sessions |
| `totalIngresos` | Total income transactions                     |
| `totalEgresos`  | Total expense transactions                    |
| `saldoActual`   | Calculated cash balance                       |

---

## ✅ Success Response

```json
{
  "availableSpaces": 27,
  "totalSpaces": 50,
  "parkedCars": 23,
  "egressedCars": 15,
  "onExitCars": 2,
  "openingAmount": 5000.0,
  "totalIngresos": 2500.0,
  "totalEgresos": 500.0,
  "saldoActual": 7000.0
}
```

---

## ❌ Error Responses

- `401 Unauthorized`: No active session
- `400 Bad Request`: Invalid user ID
- `500 Internal Server Error`: Failed to query dashboard data

---

## 📝 Notes

- Timezone is localized to **Costa Rica** (UTC-6).
- Useful for dashboards and control panels.

---

## 📦 Related

- [`/api/information`](../information/index.md): Parking capacity
- [`/api/cashier`](../cashier/index.md): Cashier operations
