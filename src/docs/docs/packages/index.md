---
id: packages-index
title: Index
---

# 📦 Packages — Index

This endpoint provides access to all package records and allows creation of new ones.

---

## 📍 Endpoints

### ➕ Create Package

```http
POST /api/packages
```

### 📥 Retrieve All Packages

```http
GET /api/packages
```

---

## ➕ POST — Create Package

### 📥 Request Body

```json
{
  "packageName": "Monthly Plan",
  "packagePrice": 25000
}
```

- `packageName`: Name of the package (required)
- `packagePrice`: Price in colones (required, number)

### ✅ Response

```json
{
  "pack_id": 3,
  "pack_name": "Monthly Plan",
  "pack_price": 25000,
  "pack_version": 1
}
```

### ❌ Error Responses

- `400`: Missing name or price
- `500`: Error inserting into the database

---

## 📥 GET — Retrieve All Packages

Returns a list of available parking packages.

### ✅ Response

```json
[
  {
    "pack_id": 1,
    "pack_name": "Daily",
    "pack_price": 1000,
    "pack_version": 1
  },
  ...
]
```

### ❌ Error Responses

- `500`: Internal server error

---

## 🧭 Usage

This endpoint is typically used by administrators to view or manage available subscription packages for users in the parking system.

---

## 📦 Related

- [`/api/packages/{id}`](./id.md): Update or delete a package
