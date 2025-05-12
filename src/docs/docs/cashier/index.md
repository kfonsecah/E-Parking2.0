---
id: cashier-index
title: Index
---

# 💼 Cashier Module Overview

This section documents the **Cashier module**, responsible for managing cashier sessions and all monetary transactions in Park Xpress.

---

## 🔧 Endpoints Included

| Path                                               | Description                            |
| -------------------------------------------------- | -------------------------------------- |
| [`/api/cashier/open`](./open.md)                   | Open a new cashier session             |
| [`/api/cashier/close`](./close.md)                 | Close the current cashier session      |
| [`/api/cashier/history`](./history.md)             | Get today's cashier session history    |
| [`/api/cashier/open-sessions`](./open-sessions.md) | Fetch currently open session           |
| [`/api/cashier/status`](./status.md)               | Get cashier session summary            |
| [`/api/cashier/transaction`](./transaction.md)     | Register transaction(s) within session |

---

## 📌 Features

- Prevents multiple sessions per user per day.
- Supports multiple cash types (e.g., Efectivo, SINPE).
- Audits discrepancies between expected and actual cash at closing.
- Enables real-time session tracking and summaries.

---

## 🧩 Related Modules

- [`/api/session`](../session/index.md): Handles session validation
- [`/api/auth`](../auth/index.md): Login/authentication logic

---

## 🧭 Usage

This module is used by **cashiers** to:

- Open and close their daily session.
- Register income and expenses.
- Track discrepancies and maintain audit compliance.
