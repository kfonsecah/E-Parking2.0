---
id: users-assign-role
title: Assign Role
---

# Assign Role

Documentation for `users/assign-role`.

## Endpoint

`PATCH /api/users/[id]/assign-role`

This endpoint assigns a role to a user by their `userId`.

### 🔐 Permissions

Only accessible to authenticated users with sufficient privileges (recommended to limit to admins).

## 🔸 Request

**Params (in path):**

- `id`: The ID of the user to assign the role to (numeric).

**Body (JSON):**

```json
{
  "rol_id": 1
}
```

### 📌 Validation Rules:

- `rol_id` is required and must be a valid number.
- `id` (from URL params) must be numeric.

## ✅ Successful Response

**Status:** `201 Created`

```json
{
  "message": "Rol asignado correctamente",
  "data": {
    "rol_user_users_id": 7,
    "rol_user_rol_id": 1
  }
}
```

## ⚠️ Already Assigned

**Status:** `200 OK`

```json
{
  "message": "El usuario ya tiene asignado ese rol"
}
```

## ❌ Errors

**Status:** `400 Bad Request`

```json
{
  "error": "Debe enviar un rol_id válido y un userId numérico"
}
```

**Status:** `500 Internal Server Error`

```json
{
  "error": "Error al asignar rol",
  "detail": "..."
}
```
