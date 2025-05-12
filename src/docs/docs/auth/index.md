---
id: auth-index
title: Authentication Overview
---

# 🔐 Authentication Module

This section documents the authentication system of **Park Xpress System**, which includes:

- 🌐 NextAuth integration with Google login
- 🔐 Custom JWT session validation
- 🚪 Secure session logout and management

---

## 📚 Included Endpoints

| Endpoint             | Description                                |
| -------------------- | ------------------------------------------ |
| `/api/auth/nextauth` | Handles login via Google using NextAuth    |
| `/api/auth/signout`  | Logs out the user and clears session state |

---

## 🔍 Technologies Used

- [NextAuth.js](https://next-auth.js.org/)
- [Prisma ORM](https://www.prisma.io/)
- [UUID](https://www.npmjs.com/package/uuid)
- [JWT](https://jwt.io/)
- PostgreSQL

---

## 🧠 Session Strategy

- Each user can have **only one active session**.
- Sessions are stored via a `session_id` (UUID) and a `session_last_activity` timestamp.
- Tokens and cookies are validated on every API access.

---

You can explore each endpoint in detail from the sidebar 👉
