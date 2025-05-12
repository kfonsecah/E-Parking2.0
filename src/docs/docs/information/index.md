---
id: information-index
title: Index
---

# 🏢 Information Module

The `information/index` endpoint manages general information about the parking facility, including name, location, number of spaces, and branding image.

---

## 📍 Endpoints

```http
GET /api/information
POST /api/information
```

---

## 🔍 GET — Retrieve Information

Returns static parking facility information, including a base64-encoded logo/image.

### ✅ Success Response

```json
{
  "info_id": 1,
  "info_name": "Park Xpress",
  "info_location": "Pérez Zeledón, Costa Rica",
  "info_spaces": 50,
  "info_version": 3,
  "info_owner": "Empresa XYZ",
  "info_owner_id_card": "1-1234-5678",
  "info_owner_phone": "8888-8888",
  "info_schedule": "Lunes a Domingo, 6am - 10pm",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUg..."
}
```

---

## 📝 POST — Create or Update Information

Accepts general parking configuration. Validates all fields and stores the uploaded image (as base64-encoded).

### 📦 Request Body

```json
{
  "info_name": "Park Xpress",
  "info_location": "Pérez Zeledón, Costa Rica",
  "info_spaces": 50,
  "info_version": 2,
  "imageBase64": "iVBORw0KGgoAAAANSUhEUg...",
  "info_owner": "Empresa XYZ",
  "info_owner_id_card": "1-1234-5678",
  "info_owner_phone": "8888-8888",
  "info_schedule": "Lunes a Domingo, 6am - 10pm"
}
```

---

## ⚠️ Error Responses

- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Database or logic failure

---

## 🧭 Usage

This module centralizes key information for display in dashboards, branding, and configuration references.

---

## 📦 Related

- [`/api/dashboard`](../dashboard/index.md): Dashboard overview and live data
