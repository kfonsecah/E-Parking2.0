---
id: cashier-transaction
title: Transaction
---

# 💵 Register Transaction

The `/api/cashier/transaction` endpoint registers a payment and, if needed, a corresponding change (vuelto) for an active cashier session.

---

## 📍 Endpoint

```http
POST /api/cashier/transaction
```

---

## 🔐 Authentication

Requires user authentication via NextAuth (`getServerSession()`).

---

## 🧾 Request Body

```json
{
  "cashType": "Efectivo",
  "paymentMethod": "efectivo",
  "totalToPay": 2000,
  "totalReceived": 5000
}
```

| Field           | Type   | Required | Description                               |
| --------------- | ------ | -------- | ----------------------------------------- |
| `cashType`      | string | ✅ Yes   | Type of cashier session (e.g. "Efectivo") |
| `paymentMethod` | string | ✅ Yes   | Payment method used by customer           |
| `totalToPay`    | number | ✅ Yes   | Amount due                                |
| `totalReceived` | number | ✅ Yes   | Amount received from customer             |

---

## 🔄 Behavior

1. Validates the authenticated user and checks for an open session of the given `cashType`.
2. Registers an `ingreso` transaction with the amount to pay.
3. If `totalReceived > totalToPay`, registers a second `egreso` transaction to record the change given back.
4. Timestamps are stored in **Costa Rica timezone (UTC-6)**.

---

## ✅ Success Response

```json
{
  "message": "Movimientos registrados exitosamente",
  "insertados": 2,
  "movimientos": [
    {
      "transaction_session_id": 7,
      "transaction_amount": 2000,
      "transaction_type": "ingreso",
      "transaction_pay_method": "efectivo",
      "transaction_description": "Pago recibido",
      "transaction_created_at": "2025-05-02T14:00:00.000Z"
    },
    {
      "transaction_session_id": 7,
      "transaction_amount": 3000,
      "transaction_type": "egreso",
      "transaction_pay_method": "efectivo",
      "transaction_description": "Vuelto entregado",
      "transaction_created_at": "2025-05-02T14:00:00.000Z"
    }
  ]
}
```

---

## ❌ Error Responses

- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Missing fields or invalid amounts
- `500 Internal Server Error`: Database or logic error

---

## 📝 Notes

- Transactions are inserted using `createMany()` for performance.
- If the session is not open or doesn't match the `cashType`, the request fails.

---

## 📦 Related

- [`/api/cashier/status`](./status.md): Retrieves cashier summary
- [`/api/cashier/open`](./open.md): Opens a cashier session
