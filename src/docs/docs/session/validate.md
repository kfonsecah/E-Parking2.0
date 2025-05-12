---
id: session-validate
title: Validate
---

# Validate

Documentation for `session/validate`.

This endpoint validates the current user session by checking either:

- A custom JWT cookie (`app-session`), or
- A NextAuth session token.

## 🔐 Authentication Methods

The endpoint attempts to authenticate using the following:

1. **Custom JWT** (`app-session` cookie): If present, it extracts the user ID and session ID from the token payload.
2. **NextAuth Token**: As a fallback, the token is extracted via `getToken()` using the secret `NEXTAUTH_SECRET`.

## ✅ Session Validation Logic

Once authentication is successful, the system:

- Fetches the user from the database using `users_id`.
- Verifies that the `session_id` from the token matches the one stored in the database.

If there is a mismatch or the token is invalid, the session is rejected.

## 🧪 Example Response

### Success

```json
{
  "ok": true,
  "origin": "JWT personalizado"
}
```

### Failure (invalid session)

```json
{
  "error": "Sesión inválida"
}
```

### Failure (missing/invalid token)

```json
{
  "error": "No autorizado (NextAuth)"
}
```

### Error

```json
{
  "error": "Error validando sesión"
}
```
