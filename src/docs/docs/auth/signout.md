---
id: auth-signout
title: Signout
---

# 🚪 Signout Endpoint

This endpoint is responsible for logging out users and clearing their session state from the database and cookies.

---

## 📍 Endpoint

```http
POST /api/auth/signout
```

---

## 🔐 Authentication

This endpoint supports **two types of tokens**:

1. 🔑 JWT stored in the `app-session` cookie (custom auth)
2. 🔁 Fallback to **NextAuth token** using `getToken`

---

## 🔄 Behavior

1. **Token Validation**:

   - Tries to read and verify the `app-session` JWT.
   - If not found, falls back to NextAuth’s token via `getToken()`.

2. **User Lookup**:

   - Extracts `userId` from the token payload.
   - Returns `401` if unauthorized, or `400` if ID is missing.

3. **Session Cleanup**:

   - Clears the `session_id` and `session_last_activity` from the `ep_users` table.

4. **Cookie Deletion**:
   - Deletes the `app-session` cookie by setting its value to empty and `maxAge: 0`.

---

## ✅ Success Response

```json
{ "ok": true }
```

## ❌ Error Responses

- `401 Unauthorized`: Token not valid or missing
- `400 Bad Request`: User ID not found
- `500 Internal Server Error`: Server error during logout

---

## 📦 Related

- [`/api/session/validate`](../session/validate.md): Verifies session validity
- [`/api/auth/nextauth`](./nextauth.md): Login via Google/NextAuth
