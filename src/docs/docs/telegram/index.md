---
id: telegram-index
title: Index
---

# Index

Documentation for `telegram/index`.

This endpoint handles the **Telegram bot integration** in the Park Xpress System. It includes:

- Dynamic menus depending on user role (admin/dev).
- Inline callback handler (`handleInlineCallback`) for UI interaction.
- Session management using Maps to track chat state (`userSessions`, `userTelegramToDbId`).
- Multi-step user registration and login using national ID and password.
- Access to dashboard info like cash balances and roles.
- Real-time note submission.

### 👨‍💻 Authentication

Login flow:

1. User starts with `/start`.
2. Bot asks for national ID.
3. Bot validates and asks for password.
4. If valid, session is authenticated and access granted.

### 🧾 Notes

Authenticated users can write daily notes. These are stored in the database and linked to the user.

### 📦 Caja Info

Users can consult cash types and current balances from the Telegram interface.

### 🛡 Admin Actions

Admins can:

- Register users.
- View roles.
- Assign roles after registration.

---

> This bot is tightly coupled with the core user and cashier logic of the system and provides fast interactions through Telegram.
