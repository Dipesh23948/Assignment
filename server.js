const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ─── In-Memory Store ────────────────────────────────────────────────
let orders = [];

// ─── Pricing Config ─────────────────────────────────────────────────
const PRICES = {
  Shirt: 50,
  Pants: 80,
  Saree: 150,
  Kurta: 70,
  Suit: 250,
  "Bed Sheet": 120,
  Jacket: 200,
  Dress: 130,
  Sweater: 100,
  Dupatta: 60,
};

const VALID_STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

// ─── Helpers ────────────────────────────────────────────────────────
function calcEstimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
}

function generateOrderId() {
  return "ORD-" + Date.now().toString().slice(-6);
}

// ─── Routes ─────────────────────────────────────────────────────────

// GET /api/prices — list all garment prices
app.get("/api/prices", (req, res) => {
  res.json({ success: true, data: PRICES });
});

// POST /api/orders — create a new order
app.post("/api/orders", (req, res) => {
  const { customerName, phoneNumber, garments } = req.body;

  if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
    return res.status(400).json({ success: false, message: "customerName is required" });
  }
  if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, message: "phoneNumber must be a 10-digit number" });
  }
  if (!garments || !Array.isArray(garments) || garments.length === 0) {
    return res.status(400).json({ success: false, message: "garments array is required and must not be empty" });
  }

  const processedGarments = [];
  for (const item of garments) {
    const { name, quantity } = item;
    if (!name || !PRICES[name]) {
      return res.status(400).json({ success: false, message: `Unknown garment: "${name}". Valid: ${Object.keys(PRICES).join(", ")}` });
    }
    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: `Quantity for "${name}" must be >= 1` });
    }
    processedGarments.push({ name, quantity: qty, pricePerItem: PRICES[name], subtotal: PRICES[name] * qty });
  }

  const totalAmount = processedGarments.reduce((sum, g) => sum + g.subtotal, 0);

  const order = {
    id: generateOrderId(),
    customerName: customerName.trim(),
    phoneNumber,
    garments: processedGarments,
    totalAmount,
    status: "RECEIVED",
    estimatedDelivery: calcEstimatedDelivery(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);
  return res.status(201).json({ success: true, data: order });
});

// GET /api/orders — list all orders with optional filters
app.get("/api/orders", (req, res) => {
  const { status, name, phone, garment } = req.query;
  let result = [...orders];

  if (status) {
    if (!VALID_STATUSES.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid: ${VALID_STATUSES.join(", ")}` });
    }
    result = result.filter((o) => o.status === status.toUpperCase());
  }
  if (name) {
    result = result.filter((o) => o.customerName.toLowerCase().includes(name.toLowerCase()));
  }
  if (phone) {
    result = result.filter((o) => o.phoneNumber.includes(phone));
  }
  if (garment) {
    result = result.filter((o) => o.garments.some((g) => g.name.toLowerCase().includes(garment.toLowerCase())));
  }

  res.json({ success: true, count: result.length, data: result });
});

// GET /api/orders/:id — get a single order
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/status — update order status
app.patch("/api/orders/:id/status", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
    return res.status(400).json({ success: false, message: `Invalid status. Valid: ${VALID_STATUSES.join(", ")}` });
  }

  order.status = status.toUpperCase();
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, data: order });
});

// DELETE /api/orders/:id — delete an order
app.delete("/api/orders/:id", (req, res) => {
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Order not found" });
  orders.splice(idx, 1);
  res.json({ success: true, message: "Order deleted" });
});

// GET /api/dashboard — summary stats
app.get("/api/dashboard", (req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const ordersByStatus = VALID_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const garmentCounts = {};
  orders.forEach((o) =>
    o.garments.forEach((g) => {
      garmentCounts[g.name] = (garmentCounts[g.name] || 0) + g.quantity;
    })
  );

  const topGarments = Object.entries(garmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      topGarments,
    },
  });
});

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Laundry Order Management API running at http://localhost:${PORT}`);
  console.log(`Frontend UI available at http://localhost:${PORT}`);
});
