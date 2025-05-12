---
id: auth-nextauth
title: NextAuth Login Integration
---

# 🔐 NextAuth Login with Google

This page documents the authentication flow using **NextAuth.js** with a Google provider, integrated with Prisma and PostgreSQL.

---

## 🌐 Endpoint

```
/api/auth/[...nextauth]
```

Supports both `GET` and `POST` requests.

---

## ✅ Provider: Google

Users can log in using a Google account. If the user exists in the database, a session is created.

---

## ⚙️ Session Control Logic

1. **User Lookup**: Validates email from Google profile against the `ep_users` table.
2. **Active Session Check**:
   - If the user already has a `session_id`, the login is rejected with `SessionAlreadyActive`.
3. **Session Creation**:
   - A new `session_id` is created via UUID and assigned to the user.
   - The last activity timestamp (`session_last_activity`) is updated.
4. **User Role**: Role is attached via the `ep_users.roles.role.rol_name` field.

---

## 🔄 JWT Callback

Adds the following fields to the token:

- `name`
- `email`
- `role`
- `id`
- `sessionId`

---

## 🧠 Session Callback

Adds the same fields from JWT into `session.user` object, making them accessible in the frontend.

---

## 📄 Pages Configured

- `/auth`: Custom login page
- `/auth` (error): Redirects here on auth errors

---

## 🔐 Security

- Uses `NEXTAUTH_SECRET` for signing.
- Rejects logins for emails not registered in the database.

---

## 📝 Notes

- This login method works in parallel with a custom JWT-based login using `/api/auth/validate`.
- When a session is active, no additional login is permitted until logout.

---
