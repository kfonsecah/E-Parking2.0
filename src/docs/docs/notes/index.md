---
id: notes-index
title: Index
---

# 📝 Notes Endpoint

The `notes/index` endpoint retrieves **daily notes** written by users. These can include important annotations about cashier operations or observations made throughout the day.

---

## 📍 Endpoint

```http
GET /api/notes
```

---

## 🕒 Timezone

This endpoint is based on **Costa Rica local time (UTC-6)**. Only notes from **today** are returned.

---

## ✅ Response Example

```json
{
  "ok": true,
  "notas": [
    {
      "id": 3,
      "contenido": "Caja cerrada con ₡5000 de diferencia.",
      "fecha": "2025-05-02T14:15:00.000Z",
      "usuario": "Ana González"
    }
  ]
}
```

- `id`: Note ID
- `contenido`: Text content of the note
- `fecha`: Timestamp when the note was created
- `usuario`: Author name

---

## ⚠️ Error Responses

- `500 Internal Server Error`: Database issues or invalid processing

---

## 🧭 Usage

Used in cashier dashboards or audit logs to display contextual information or events of the day.

---

## 📦 Related

- [`/api/telegram`](../telegram/index.md): Note creation by Telegram Bot
