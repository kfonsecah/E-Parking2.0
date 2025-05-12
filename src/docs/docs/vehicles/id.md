---
id: vehicles-id
title: Vehicles by ID
---

# 📘 API Documentation: `vehicles/[id]`

## 📌 Descripción

Este endpoint permite **consultar**, **actualizar datos de salida**, o **eliminar un vehículo** específico mediante su `veh_id`.

---

## 📥 GET `/api/vehicles/[id]`

### 🧾 Descripción

Obtiene los datos de un vehículo según su ID.

### ✅ Respuesta Exitosa — `200 OK`

```json
{
  "veh_id": 1,
  "veh_plate": "XYZ789",
  "veh_owner": "Luis Mora",
  "veh_color": "Negro",
  "veh_ingress_date": "2025-05-01T12:00:00.000Z",
  "veh_egress_date": null,
  "veh_status": "I",
  "veh_tax": "EXO",
  "veh_reference": "REF0001",
  "veh_version": 1
}
```

### ❌ Errores Comunes

- `400 Bad Request`: ID inválido.
- `404 Not Found`: Vehículo no existe.
- `500 Internal Server Error`: Error en la base de datos.

---

## 🗑️ DELETE `/api/vehicles/[id]`

### 🧾 Descripción

Elimina un vehículo de la base de datos si existe.

### ✅ Respuesta Exitosa — `200 OK`

```json
{ "message": "Vehículo eliminado exitosamente." }
```

### ❌ Errores Comunes

- `400 Bad Request`: ID inválido.
- `404 Not Found`: Vehículo no encontrado.
- `500 Internal Server Error`: Error al eliminar el vehículo.

---

## 🔁 POST `/api/vehicles/[id]`

### 🧾 Descripción

Actualiza los datos de salida (`veh_egress_date`, `veh_status`, `veh_tax`, `veh_version`) del vehículo especificado.

### 📥 Body (JSON)

```json
{
  "veh_exit_date": "2025-05-02T16:00:00.000Z",
  "veh_tax": "REG"
}
```

### ✅ Respuesta Exitosa — `200 OK`

```json
{
  "message": "Vehículo actualizado exitosamente.",
  "vehicle": {
    "veh_id": 1,
    "veh_egress_date": "2025-05-02T16:00:00.000Z",
    "veh_status": "E",
    "veh_tax": "REG",
    "veh_version": 2,
    ...
  }
}
```

### ❌ Errores Comunes

- `400 Bad Request`: ID inválido.
- `404 Not Found`: Vehículo no encontrado.
- `500 Internal Server Error`: Error al actualizar el vehículo.

---

## 📎 Notas

- El campo `veh_version` se incrementa automáticamente al actualizar.
- El `veh_status` se marca como `"E"` (egresado) al registrar la salida.
