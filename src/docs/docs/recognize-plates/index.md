---
id: recognize-plates-index
title: Index
---

# Index

Documentation for `recognize-plates/index`.

## 🔍 Overview

This endpoint allows the system to recognize license plates from uploaded images. It accepts an image file via `multipart/form-data`, then forwards the request to a Python-based ALPR (Automatic License Plate Recognition) service.

## 🧠 AI Integration

The recognition is powered by a custom AI model developed by the Park Xpress team using **Python**. The implementation uses **Fast-ALPR**, an open-source project that enables efficient and accurate license plate detection.

> 📍 Python API is deployed on [Railway](https://railway.app/) at:  
> `https://alpr-api-production.up.railway.app/recognize`

## 📥 Request

**POST** `/api/recognize-plates/recognize-plate`

- Accepts a `multipart/form-data` payload with a single field named `"image"`.

### Example Form Data

| Field   | Type   | Description                         |
| ------- | ------ | ----------------------------------- |
| `image` | `File` | An image containing a license plate |

## ✅ Response

Returns a JSON object with recognition results.

### Example

```json
{
  "plate": "ABC123",
  "confidence": 0.92
}
```

## 🔒 Errors

- `400`: No image provided
- `500`: Communication error with the Python service or recognition failure

## 🤖 Credits

This feature is powered by:

- [Fast-ALPR](https://github.com/openalpr/openalpr) as a base recognition engine
- A Python microservice developed by the **Park Xpress team**
