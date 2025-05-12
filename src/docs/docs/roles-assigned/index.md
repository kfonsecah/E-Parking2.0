---
id: roles-assigned-index
title: Index
---

# Index

Documentation for `roles-assigned/index`.

## Endpoint

**GET** `/api/roles-assigned`

Checks if a specific role ID is currently assigned to any user.

### Query Parameters

- `id` (required): The ID of the role to check assignment for.

### Responses

- ✅ `200 OK`:

  ```json
  {
    "assigned": true // or false
  }
  ```

- ❌ `400 Bad Request`: ID not provided
- ❌ `500 Internal Server Error`: Server error during lookup

### Example

```http
GET /api/roles-assigned?id=3
```

This endpoint returns whether the role with ID `3` is currently assigned to a user.
