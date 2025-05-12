---
id: reports-index
title: Index
---

# Reports – Index

Documentation for the `reports/index` endpoint.

## 📊 Purpose

This endpoint retrieves a report of all vehicles that exited the parking facility within a specified date range.

## 📥 Method

`GET`

## 📌 Query Parameters

| Parameter   | Type   | Required | Description                            |
| ----------- | ------ | -------- | -------------------------------------- |
| `startDate` | string | ✅ Yes   | Start date for the report (YYYY-MM-DD) |
| `endDate`   | string | ✅ Yes   | End date for the report (YYYY-MM-DD)   |

> Both parameters are required. The system will append `T23:59:59` to `endDate` to cover the full day.

## ✅ Success Response

- **Status Code:** `200 OK`
- **Response Body:**

```json
{
  "totalCountCars": 12,
  "totalIngress": 24000,
  "vehicles": [
    {
      "veh_id": 1,
      "veh_plate": "ABC123",
      "veh_owner": "John Doe",
      "veh_egress_date": "2025-05-02T16:25:00.000Z"
    }
  ]
}
```

## ❌ Error Responses

- **400 Bad Request:** If either `startDate` or `endDate` is missing.
- **500 Internal Server Error:** If a failure occurs during data retrieval.

## 🧠 Notes

- This report only includes vehicles with a `veh_status` of `"E"` (egressed).
- The `veh_tax` is summed to calculate the total income (`totalIngress`) for the report period.
- Results are sorted chronologically by egress date (`veh_egress_date`).
