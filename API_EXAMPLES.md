# API Examples for Backend Implementation

Tento súbor obsahuje príklady API responses pre backend vývojárov.

## Authentication Endpoints

### POST /api/auth/login

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "user-123",
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Response (401 Unauthorized):**

```json
{
  "message": "Nesprávne prihlasovacie údaje",
  "statusCode": 401
}
```

### POST /api/auth/refresh

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### POST /api/auth/logout

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "message": "Úspešne odhlásený"
}
```

---

## Device Endpoints

### GET /api/devices

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters (optional):**

- `status`: operational | maintenance | offline
- `type`: string
- `location`: string
- `page`: number (default: 1)
- `pageSize`: number (default: 10)

**Response (200 OK):**

```json
[
  {
    "id": "cnc-001",
    "name": "CNC Mill",
    "type": "Machining",
    "location": "Shop Floor A",
    "status": "operational",
    "lastMaintenance": "2024-06-15",
    "nextMaintenance": "2024-09-15",
    "manualUrl": "https://example.com/manuals/cnc-001.pdf",
    "downtime": 10.5,
    "lastStatusChange": "2024-07-20T10:00:00Z"
  },
  {
    "id": "lathe-002",
    "name": "Industrial Lathe",
    "type": "Machining",
    "location": "Shop Floor A",
    "status": "maintenance",
    "lastMaintenance": "2024-07-20",
    "nextMaintenance": "2024-07-28",
    "manualUrl": "https://example.com/manuals/lathe-002.pdf",
    "downtime": 25.2,
    "lastStatusChange": "2024-07-22T08:30:00Z"
  }
]
```

### GET /api/devices/:id

**Response (200 OK):**

```json
{
  "id": "cnc-001",
  "name": "CNC Mill",
  "type": "Machining",
  "location": "Shop Floor A",
  "status": "operational",
  "lastMaintenance": "2024-06-15",
  "nextMaintenance": "2024-09-15",
  "manualUrl": "https://example.com/manuals/cnc-001.pdf",
  "downtime": 10.5,
  "lastStatusChange": "2024-07-20T10:00:00Z"
}
```

**Response (404 Not Found):**

```json
{
  "message": "Zariadenie nebolo nájdené",
  "statusCode": 404
}
```

### POST /api/devices

**Request:**

```json
{
  "name": "New CNC Machine",
  "type": "Machining",
  "location": "Shop Floor B",
  "status": "operational",
  "nextMaintenance": "2025-01-15",
  "manualUrl": "https://example.com/manuals/new-cnc.pdf"
}
```

**Response (201 Created):**

```json
{
  "id": "cnc-005",
  "name": "New CNC Machine",
  "type": "Machining",
  "location": "Shop Floor B",
  "status": "operational",
  "lastMaintenance": null,
  "nextMaintenance": "2025-01-15",
  "manualUrl": "https://example.com/manuals/new-cnc.pdf",
  "downtime": 0,
  "lastStatusChange": "2024-11-04T10:00:00Z"
}
```

### PUT /api/devices/:id

**Request:**

```json
{
  "name": "Updated CNC Mill",
  "type": "Machining",
  "location": "Shop Floor C",
  "nextMaintenance": "2024-10-15"
}
```

**Response (200 OK):**

```json
{
  "id": "cnc-001",
  "name": "Updated CNC Mill",
  "type": "Machining",
  "location": "Shop Floor C",
  "status": "operational",
  "lastMaintenance": "2024-06-15",
  "nextMaintenance": "2024-10-15",
  "manualUrl": "https://example.com/manuals/cnc-001.pdf",
  "downtime": 10.5,
  "lastStatusChange": "2024-07-20T10:00:00Z"
}
```

### PATCH /api/devices/:id/status

**Request:**

```json
{
  "status": "maintenance"
}
```

**Response (200 OK):**

```json
{
  "id": "cnc-001",
  "name": "CNC Mill",
  "type": "Machining",
  "location": "Shop Floor A",
  "status": "maintenance",
  "lastMaintenance": "2024-06-15",
  "nextMaintenance": "2024-09-15",
  "manualUrl": "https://example.com/manuals/cnc-001.pdf",
  "downtime": 10.5,
  "lastStatusChange": "2024-11-04T10:00:00Z"
}
```

### DELETE /api/devices/:id

**Response (200 OK):**

```json
{
  "message": "Zariadenie bolo úspešne odstránené"
}
```

---

## Spare Parts Endpoints

### GET /api/parts

**Response (200 OK):**

```json
[
  {
    "id": "sp-001",
    "name": "Spindle Bearing",
    "sku": "BRG-5021",
    "quantity": 15,
    "location": "Bin A-12"
  },
  {
    "id": "sp-002",
    "name": "Motor Coolant Pump",
    "sku": "PMP-C-34",
    "quantity": 4,
    "location": "Bin B-05"
  }
]
```

### GET /api/parts/:id

**Response (200 OK):**

```json
{
  "id": "sp-001",
  "name": "Spindle Bearing",
  "sku": "BRG-5021",
  "quantity": 15,
  "location": "Bin A-12"
}
```

### POST /api/parts

**Request:**

```json
{
  "name": "New Bearing",
  "sku": "BRG-6000",
  "quantity": 20,
  "location": "Bin C-05"
}
```

**Response (201 Created):**

```json
{
  "id": "sp-005",
  "name": "New Bearing",
  "sku": "BRG-6000",
  "quantity": 20,
  "location": "Bin C-05"
}
```

### PUT /api/parts/:id

**Request:**

```json
{
  "quantity": 25
}
```

**Response (200 OK):**

```json
{
  "id": "sp-001",
  "name": "Spindle Bearing",
  "sku": "BRG-5021",
  "quantity": 25,
  "location": "Bin A-12"
}
```

---

## Maintenance Logs Endpoints

### GET /api/maintenance-logs

**Query Parameters (optional):**

- `deviceId`: string
- `type`: scheduled | emergency
- `startDate`: ISO date string
- `endDate`: ISO date string
- `page`: number
- `pageSize`: number

**Response (200 OK):**

```json
[
  {
    "id": "log-001",
    "deviceId": "cnc-001",
    "deviceName": "CNC Mill",
    "date": "2024-06-15",
    "technician": "admin@example.com",
    "notes": "Replaced spindle bearing, checked coolant levels.",
    "type": "scheduled"
  },
  {
    "id": "log-002",
    "deviceId": "press-003",
    "deviceName": "Hydraulic Press",
    "date": "2024-05-10",
    "technician": "technician@example.com",
    "notes": "Annual fluid change and filter replacement.",
    "type": "scheduled"
  }
]
```

### GET /api/maintenance-logs/:id

**Response (200 OK):**

```json
{
  "id": "log-001",
  "deviceId": "cnc-001",
  "deviceName": "CNC Mill",
  "date": "2024-06-15",
  "technician": "admin@example.com",
  "notes": "Replaced spindle bearing, checked coolant levels.",
  "type": "scheduled"
}
```

### POST /api/maintenance-logs

**Request:**

```json
{
  "deviceId": "cnc-001",
  "deviceName": "CNC Mill",
  "date": "2024-11-04",
  "technician": "admin@example.com",
  "notes": "Regular maintenance check performed",
  "type": "scheduled"
}
```

**Response (201 Created):**

```json
{
  "id": "log-123",
  "deviceId": "cnc-001",
  "deviceName": "CNC Mill",
  "date": "2024-11-04",
  "technician": "admin@example.com",
  "notes": "Regular maintenance check performed",
  "type": "scheduled"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Validation error",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized - Invalid or expired token",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden - Insufficient permissions",
  "statusCode": 403
}
```

### 404 Not Found

```json
{
  "message": "Resource not found",
  "statusCode": 404
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Request Headers

Všetky chránené endpointy vyžadujú:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## CORS Configuration

Backend by mal povoliť:

```javascript
{
  origin: ['http://localhost:3000', 'https://your-production-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```
