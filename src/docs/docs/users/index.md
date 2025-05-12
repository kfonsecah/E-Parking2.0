---
id: users-index
title: Users Index
---

# 📘 API Documentation: `users/index`

## 📌 Descripción

Este endpoint permite **registrar nuevos usuarios** y **consultar la lista de usuarios existentes** en el sistema.

---

## ➕ POST `/api/users`

### 🧾 Descripción

Registra un nuevo usuario en la base de datos. Valida duplicados y encripta la contraseña antes de guardarla.

### 📥 Body (JSON)

```json
{
  "users_name": "Juan",
  "users_lastname": "Pérez",
  "users_id_card": "123456789",
  "users_version": 1,
  "users_username": "juanp",
  "users_password": "1234segura",
  "users_email": "juan@example.com"
}
```

> ⚠️ **Nota**: No incluir `users_id` en la solicitud. Es autogenerado.

### ✅ Respuesta Exitosa — `201 Created`

```json
{
  "users_id": 5,
  "users_name": "Juan",
  "users_lastname": "Pérez",
  "users_id_card": "123456789",
  "users_version": 1,
  "users_username": "juanp",
  "users_password": "<contraseña_hash>",
  "users_email": "juan@example.com"
}
```

### ❌ Errores Comunes

- `400 Bad Request`: Faltan campos requeridos o se envió `users_id`.
- `409 Conflict`: Ya existe un usuario con ese correo, cédula o nombre de usuario.
- `500 Internal Server Error`: Error al crear el usuario.

---

## 📥 GET `/api/users`

### 🧾 Descripción

Devuelve la lista de todos los usuarios registrados, incluyendo sus roles asociados.

### ✅ Respuesta Exitosa — `200 OK`

```json
[
  {
    "users_id": 1,
    "users_name": "Ana",
    "users_lastname": "Gómez",
    "users_email": "ana@example.com",
    "users_id_card": "109120928",
    "users_username": "anag",
    "users_password": "<contraseña_hash>",
    "users_version": 1,
    "roles": [
      {
        "role": {
          "rol_id": 2,
          "rol_name": "Cajero"
        }
      }
    ]
  }
]
```

### ❌ Errores Comunes

- `500 Internal Server Error`: Error al consultar los usuarios.

---

## 🔒 Seguridad

- Asegúrate de **no exponer el campo `users_password`** directamente en interfaces de usuario.
- Considera filtrar los campos sensibles en futuras versiones de la API para mayor seguridad.
