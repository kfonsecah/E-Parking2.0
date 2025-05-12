---
id: packages-id
title: Id
---

# 📦 Packages — ID Operations

This endpoint supports **updating** and **deleting** individual parking packages by their unique `id`.

---

## 📍 Endpoints

### 🔧 Update a Package

```http
PATCH /api/packages/{id}
```

### ❌ Delete a Package

```http
DELETE /api/packages/{id}
```

---

## 🔧 PATCH — Update Package

### 📥 Request Body

```json
{
  "pack_name": "Monthly Plan",
  "pack_price": 25000
}
```

- `pack_name`: New package name (required)
- `pack_price`: New price (required, number)

### ✅ Response

```json
{
  "pack_id": 3,
  "pack_name": "Monthly Plan",
  "pack_price": 25000,
  "pack_version": 2
}
```

### ❌ Error Responses

- `400`: Missing fields
- `404`: Package not found
- `500`: Internal server error

---

## ❌ DELETE — Remove Package

No body required. Deletes the specified package.

### ✅ Response

```json
{ "message": "Paquete eliminado" }
```

### ❌ Error Responses

- `404`: Package not found
- `500`: Deletion error

---

## 🧭 Usage

These endpoints are used in the package administration panel of the system to manage custom subscription or access plans.

---

## 📦 Related

- [`/api/packages`](./index.md): Retrieve all packages
