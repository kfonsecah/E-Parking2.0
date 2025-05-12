---
id: roles-index
title: Index
---

# Index

Documentation for `roles/index`.

## 📄 Endpoint

**GET** `/api/roles`

## 🔍 Description

Retrieves all user roles available in the system along with the users assigned to each role.

This endpoint uses Prisma to fetch all roles from the database and includes the associated users in the response.

## ✅ Response

- `200 OK`: Returns an array of role objects, each including related users.
- `500 Internal Server Error`: If an error occurs during data retrieval.

## 🧪 Example Response

```json
[
  {
    "rol_id": 1,
    "rol_name": "Admin",
    "users": [
      {
        "users_id": 101,
        "users_name": "John",
        "users_lastname": "Doe",
        ...
      }
    ]
  },
  ...
]
```

## ⚠️ Errors

- `500`: Database query failure or server error.
