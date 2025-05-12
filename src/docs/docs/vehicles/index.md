---
id: vehicles-index
title: Vehicles Index
---

# 📘 API Documentation: `vehicles/index`

## 📌 Descripción

Este endpoint permite **registrar un nuevo vehículo** o **consultar todos los vehículos actualmente parqueados** (estado `"P"`).

---

## ➕ POST `/api/vehicles`

### 🧾 Descripción

Registra un nuevo vehículo en el sistema, generando un número de referencia y asignando automáticamente la fecha/hora local de Costa Rica.

### 📥 Body (JSON)

```json
{
  "veh_plate": "XYZ123",
  "veh_owner": "María Torres",
  "veh_color": "Azul"
}
```

> ⚠️ `veh_color` es opcional.

### ✅ Respuesta Exitosa — `201 Created`

```json
{
  "veh_id": 15,
  "veh_plate": "XYZ123",
  "veh_reference": "REF0015",
  "veh_status": "P",
  "veh_owner": "María Torres",
  "veh_color": "Azul",
  "veh_ingress_date": "2025-05-02T18:45:00.000Z",
  "veh_tax": "250",
  "veh_version": 1
}
```

### ❌ Errores Comunes

- `400 Bad Request`: Falta la placa o el propietario.
- `500 Internal Server Error`: No se encontró el impuesto actual o hubo error al registrar.

---

## 📥 GET `/api/vehicles`

### 🧾 Descripción

Obtiene todos los vehículos con estado `"P"` (parqueados actualmente).

### ✅ Respuesta Exitosa — `200 OK`

```json
[
  {
    "veh_id": 10,
    "veh_plate": "ABC456",
    "veh_owner": "Carlos Soto",
    "veh_color": "Rojo",
    "veh_ingress_date": "2025-05-02T15:30:00.000Z",
    "veh_reference": "REF0010"
  }
]
```

### ❌ Errores Comunes

- `500 Internal Server Error`: Error al obtener los vehículos.

---

## 📎 Notas

- La hora de ingreso se almacena en UTC pero representa la hora local en Costa Rica.
- El impuesto actual se toma del último valor disponible en la tabla `ep_tax`.
