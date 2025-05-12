---
id: users-id
title: Id
---

# Id

Documentation for `users/id`.

Este endpoint permite **actualizar** o **eliminar** un usuario específico en la base de datos, utilizando el parámetro `id` proveniente de la URL. Es parte del módulo de administración de usuarios.

## PATCH `/api/users/[id]`

Actualiza la información de un usuario específico.

### Parámetros esperados (JSON body):

- `users_name`: string — Nombre del usuario.
- `users_lastname`: string — Apellido del usuario.
- `users_id_card`: string — Cédula.
- `users_email`: string — Correo electrónico.
- `users_username`: string — Nombre de usuario.
- `users_password`: string — Contraseña (puede cambiarse).
- `users_version`: number — Versión del registro (opcional).

Si la contraseña enviada es diferente a la actual, se actualizará y será cifrada con bcrypt.

### Respuestas:

- `200 OK`: Usuario actualizado.
- `404 Not Found`: Usuario no existe.
- `500 Internal Server Error`: Error inesperado.

## DELETE `/api/users/[id]`

Elimina un usuario y sus roles asociados.

### Respuestas:

- `200 OK`: Usuario eliminado correctamente.
- `500 Internal Server Error`: Error inesperado al intentar eliminar.

> ⚠️ Asegúrate de que el `id` provisto sea válido y que el usuario exista antes de realizar esta operación destructiva.
