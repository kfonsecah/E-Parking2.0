---
id: vehicles-exits
title: Vehicles Exits
---

# 📘 API Documentation: `vehicles/exits`

## 📌 Descripción

Este endpoint permite **obtener la lista de vehículos que han salido** del parqueo **en el día actual** (según hora de Costa Rica).

---

## 📥 GET `/api/vehicles/exits`

### 🧾 Descripción

Devuelve todos los vehículos con estado `E` (egresados) cuya fecha de salida (`veh_egress_date`) esté dentro del día actual.

La hora se calcula con base en la zona horaria de **Costa Rica** (`UTC-6`).

### ✅ Respuesta Exitosa — `200 OK`

```json
[
  {
    "veh_id": 12,
    "veh_plate": "ABC123",
    "veh_owner": "Carlos Soto",
    "veh_color": "Rojo",
    "veh_egress_date": "2025-05-02T14:32:00.000Z",
    "veh_reference": "REF0012"
  },
  ...
]
```

### ❌ Errores Comunes

- `500 Internal Server Error`: Error al consultar la base de datos.

---

## 🔄 Lógica de Consulta

- Se utiliza la hora UTC y se ajusta a `UTC-6` para obtener la fecha actual en Costa Rica.
- Se filtra por:
  - `veh_status` = `"E"`
  - `veh_egress_date` entre `00:00:00` y `23:59:59` del día actual.

---

## 🔐 Seguridad

Actualmente no se requiere autenticación para este endpoint. Se recomienda protegerlo si contiene datos sensibles en producción.
