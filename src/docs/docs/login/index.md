---
id: login-index
title: Index
---

# 🔐 Login Endpoint

This endpoint handles user login using a **custom JWT-based authentication system**.

---

## 📍 Endpoint

```http
POST /api/login
```

---

## 🧾 Request Body

```json
{
  "users_username": "johndoe",
  "users_password": "secret123"
}
```

- `users_username`: Required username (case-insensitive)
- `users_password`: Required password (can be plain text for test users)

---

## ✅ Response

Returns user info and sets a secure cookie named `app-session`.

```json
{
  "users_name": "John",
  "users_lastname": "Doe",
  "users_username": "johndoe",
  "users_email": "john@example.com",
  "role": "Admin"
}
```

Cookie:

- **Name**: `app-session`
- **Value**: Signed JWT token
- **Expires**: 24h
- **Secure**, **HttpOnly**

---

## ⚠️ Error Responses

- `400`: Missing fields
- `401`: Invalid credentials
- `403`: Active session already exists
- `404`: User not found
- `500`: Internal error

---

## 🔐 Security Details

- Password is verified using **bcrypt**.
- Fallback password comparison in plain-text for test accounts.
- Blocks login if the user already has an active `session_id`.
- JWT token includes:
  - `id`: user ID
  - `role`: user's role
  - `sessionId`: unique session UUID

---

## 🧭 Usage

This endpoint is used in the **custom login flow**, parallel to [`/api/auth/nextauth`](../auth/nextauth.md) used for Google login.

---

## 📦 Related

- [`/api/session`](../session/index.md): Session validation and status
- [`/api/auth`](../auth/index.md): Google OAuth via NextAuth
