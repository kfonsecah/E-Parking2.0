---
id: tax-index
title: Index
---

# Index

Documentation for `tax/index`.

## Endpoints

### `GET /api/tax`

Returns the current tax configuration. If the configuration doesn't exist, returns a 404 error.

- **Response**:

```json
{
  "tax_id": 1,
  "tax_price": 0.5,
  "tax_version": 3
}
```

### `POST /api/tax`

Creates or updates the tax price.

- **Body**:

```json
{
  "tax_price": 0.5
}
```

- **Behavior**:

  - If a tax record already exists, the price will be updated and the version will increment by 1.
  - If no tax record exists, a new one will be created with `tax_id: 1` and version 1.

- **Responses**:
  - `200 OK` with the updated/created tax object.
  - `400 Bad Request` if the input price is invalid.
  - `500 Internal Server Error` on unexpected failure.

---

### 💡 Notes

- Only a single tax configuration is maintained in the system (`tax_id = 1`).
- The `tax_version` is incremented on every update.
