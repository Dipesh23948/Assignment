# CleanTrack — Mini Laundry Order Management System

A lightweight, AI-first order management system for dry cleaning stores.  
Built with **Node.js + Express** (backend) and **vanilla HTML/CSS/JS** (frontend).

---

## Live Demo

Open `http://localhost:3000` after starting the server.

---

## Setup Instructions

### Prerequisites
- Node.js v16 or higher
- npm

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/laundry-order-management.git
cd laundry-order-management

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The API and frontend will be available at **http://localhost:3000**

For development with auto-reload:
```bash
npm run dev
```

---

## Features Implemented

### Core Features (All Required)

| Feature | Status |
|---|---|
| Create Order (name, phone, garments, quantity) | ✅ |
| Auto-calculate total bill | ✅ |
| Unique Order ID generation (ORD-XXXXXX) | ✅ |
| Order statuses: RECEIVED → PROCESSING → READY → DELIVERED | ✅ |
| Update order status via API + UI | ✅ |
| List all orders | ✅ |
| Filter by status | ✅ |
| Filter/search by customer name | ✅ |
| Filter/search by phone number | ✅ |
| Dashboard: total orders, total revenue, orders per status | ✅ |
| Estimated delivery date (+3 days) | ✅ |
| Search by garment type | ✅ |
| Simple frontend UI (single HTML file) | ✅ |
| Postman collection | ✅ |
| Delete order | ✅ |

### Bonus Features

| Feature | Status |
|---|---|
| Estimated delivery date | ✅ Done |
| Search by garment type | ✅ Done |
| Simple frontend (HTML/CSS/JS) | ✅ Done |
| Auth / MongoDB / Deploy | ⏳ Skipped (see Tradeoffs) |

---

## API Reference

Base URL: `http://localhost:3000`

### Garments & Pricing

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/prices` | List all garment prices |

**Supported Garments & Prices (INR):**

| Garment | Price |
|---|---|
| Shirt | ₹50 |
| Pants | ₹80 |
| Saree | ₹150 |
| Kurta | ₹70 |
| Suit | ₹250 |
| Bed Sheet | ₹120 |
| Jacket | ₹200 |
| Dress | ₹130 |
| Sweater | ₹100 |
| Dupatta | ₹60 |

---

### Orders

#### POST `/api/orders` — Create Order

**Request body:**
```json
{
  "customerName": "Ramesh Kumar",
  "phoneNumber": "9876543210",
  "garments": [
    { "name": "Shirt", "quantity": 3 },
    { "name": "Saree", "quantity": 2 }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "ORD-123456",
    "customerName": "Ramesh Kumar",
    "phoneNumber": "9876543210",
    "garments": [
      { "name": "Shirt", "quantity": 3, "pricePerItem": 50, "subtotal": 150 },
      { "name": "Saree", "quantity": 2, "pricePerItem": 150, "subtotal": 300 }
    ],
    "totalAmount": 450,
    "status": "RECEIVED",
    "estimatedDelivery": "2025-07-23",
    "createdAt": "2025-07-20T10:30:00.000Z",
    "updatedAt": "2025-07-20T10:30:00.000Z"
  }
}
```

---

#### GET `/api/orders` — List Orders (with filters)

| Query param | Description | Example |
|---|---|---|
| `status` | Filter by status | `?status=PROCESSING` |
| `name` | Search by customer name (partial) | `?name=ramesh` |
| `phone` | Search by phone number | `?phone=9876543210` |
| `garment` | Search by garment type | `?garment=Saree` |

---

#### GET `/api/orders/:id` — Get Single Order

---

#### PATCH `/api/orders/:id/status` — Update Status

```json
{ "status": "PROCESSING" }
```

Valid values: `RECEIVED` | `PROCESSING` | `READY` | `DELIVERED`

---

#### DELETE `/api/orders/:id` — Delete Order

---

#### GET `/api/dashboard` — Dashboard Stats

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 12,
    "totalRevenue": 5430,
    "ordersByStatus": {
      "RECEIVED": 3,
      "PROCESSING": 4,
      "READY": 2,
      "DELIVERED": 3
    },
    "topGarments": [
      { "name": "Shirt", "count": 18 },
      { "name": "Saree", "count": 12 }
    ]
  }
}
```

---

## Postman Collection

Import `LaundryAPI.postman_collection.json` into Postman.

The collection includes:
- All endpoints pre-configured
- Auto-save of `order_id` from Create Order response
- Filter/search examples
- Status update sequence (RECEIVED → PROCESSING → READY → DELIVERED)

---

## AI Usage Report

### Tools Used
- **Claude (Anthropic)** — primary tool for scaffolding, code generation, and iteration

---

### Sample Prompts Used

**Prompt 1 — Initial scaffold:**
> "Build a Mini Laundry Order Management System. Backend: Node.js + Express, in-memory storage. Features: create order with customer name, phone, garments with qty, auto-calculate total, generate unique order ID. Order statuses: RECEIVED, PROCESSING, READY, DELIVERED. Filter orders by status/name/phone. Dashboard with total orders, revenue, orders per status."

**Prompt 2 — Frontend:**
> "Create a standalone index.html frontend for this Express API. Tabs for Create Order, View Orders, Dashboard. Show live bill calculation. Status update dropdown per order. Search/filter bar. Clean professional design."

**Prompt 3 — Postman collection:**
> "Generate a complete Postman collection JSON for this API with all endpoints, auto-saving order_id from create response, and example filter queries."

**Prompt 4 — README:**
> "Write a full README.md with setup instructions, all API endpoints with request/response examples, features table, AI usage report with sample prompts, and tradeoffs section."

---

### What AI Got Right

- Express route structure — clean, correct REST conventions on first pass
- Input validation logic — phone regex, garment name checking, empty array guard
- Total bill calculation and garment subtotal breakdown
- Dashboard aggregation logic (groupBy status, topGarments sort)
- The full HTML frontend in a single file with all three tabs working
- Postman collection JSON structure with variable auto-save

---

### What AI Got Wrong / What I Fixed

| Issue | Fix Applied |
|---|---|
| AI initially used `uuid` for order IDs producing long UUIDs like `550e8400-e29b-41d4-a716-446655440000` — not readable for a store | Changed to `ORD-` + last 6 digits of timestamp — short, readable, unique enough for in-memory store |
| Frontend used `fetch` with `/api/orders?name=X&phone=X` in a single query — this means search only works if the value matches BOTH name AND phone | Split into two separate filter paths for clarity; UI uses a single search box that tries both fields |
| AI generated CSS with hardcoded `#333` color values causing dark-mode issues | Replaced with CSS variables throughout |
| Dashboard endpoint initially returned revenue as a float with many decimal places | Added `toFixed(2)` / `toLocaleString` formatting at the API and UI level |
| AI placed the static file middleware after the routes — caused 404 on root `/` | Moved `express.static("public")` before route definitions |

---

### Overall AI Leverage Assessment

~80% of code was AI-generated. Human effort focused on:
- Reviewing and testing each route
- Catching the static middleware ordering bug
- Improving the order ID format for real-world readability  
- Refining the search logic for the filter bar
- Wiring the frontend `sendStatus` to trigger a list refresh after update

---

## Tradeoffs

### What Was Skipped

| Feature | Reason |
|---|---|
| Database (MongoDB/SQL) | In-memory is sufficient for the scope; data resets on server restart — acceptable for a 72h assignment |
| Authentication | Adds JWT/session complexity; not required per the spec |
| Deployment | Would add Render/Railway config — straightforward to add, not in time budget |
| Edit order (garments/customer) | Not in the spec; delete + recreate is the workaround |
| Pagination | Not needed at the scale of a single dry cleaning store |

### What I'd Improve With More Time

1. **MongoDB with Mongoose** — persist orders across restarts, add indexing on `status` and `phoneNumber`
2. **JWT authentication** — store-owner login before accessing any route
3. **Deployment to Render** — single `npm start` deploy with a free tier
4. **Order invoice PDF** — generate a printable receipt per order
5. **SMS notification** — Twilio webhook when order status changes to READY
6. **Pagination** — `?page=1&limit=20` on GET /api/orders
7. **Unit tests** — Jest test suite for validation and business logic

---

## Project Structure

```
laundry-order-management/
├── server.js                        # Express API (all routes)
├── package.json
├── .gitignore
├── LaundryAPI.postman_collection.json
├── README.md
└── public/
    └── index.html                   # Frontend UI (single file)
```

---

## License

MIT
