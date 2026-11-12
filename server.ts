import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MenuItem, Order, OrderStatus, PaymentStatus, RestaurantInfo, SalesAnalytics } from './src/types.js';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_RESTAURANT_INFO } from './src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database Store
let restaurantInfo: RestaurantInfo = { ...INITIAL_RESTAURANT_INFO };
let menuItems: MenuItem[] = JSON.parse(JSON.stringify(INITIAL_MENU_ITEMS));
let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let orderSequence = 104;

// SSE Client Connections for Real-Time Kitchen Display and Customer Updates
interface SSEClient {
  id: number;
  res: Response;
}
let sseClients: SSEClient[] = [];

const broadcastSSE = (eventType: string, data: unknown) => {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
};

// SSE Endpoint
app.get('/api/orders/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Date.now();
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to live KDS stream', timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Admin PIN Authentication (Default is 1234)
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.json({ success: true, token: 'session-admin-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN. Use default: 1234' });
  }
});

// Restaurant Info
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    ...restaurantInfo,
    serverTime: new Date().toISOString()
  });
});

// Menu Items Endpoints
app.get('/api/menu', (_req: Request, res: Response) => {
  res.json(menuItems);
});

app.post('/api/menu', (req: Request, res: Response) => {
  const newItem: MenuItem = {
    ...req.body,
    id: 'item-' + Date.now()
  };
  menuItems.push(newItem);
  broadcastSSE('MENU_UPDATED', { action: 'create', item: newItem });
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  menuItems[index] = { ...menuItems[index], ...req.body, id };
  broadcastSSE('MENU_UPDATED', { action: 'update', item: menuItems[index] });
  res.json(menuItems[index]);
});

app.delete('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const deleted = menuItems.splice(index, 1)[0];
  broadcastSSE('MENU_UPDATED', { action: 'delete', id });
  res.json({ success: true, deleted });
});

// Quick toggle stock status
app.patch('/api/menu/:id/toggle-stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = menuItems.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  item.inStock = !item.inStock;
  broadcastSSE('MENU_UPDATED', { action: 'stock_toggle', item });
  res.json(item);
});

// Orders Endpoints
app.get('/api/orders', (req: Request, res: Response) => {
  const { table, status } = req.query;
  let filtered = [...orders];
  if (table && typeof table === 'string') {
    filtered = filtered.filter((o) => o.tableNumber.toLowerCase() === table.toLowerCase());
  }
  if (status && typeof status === 'string') {
    filtered = filtered.filter((o) => o.status === status);
  }
  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filtered);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { tableNumber, items, specialInstructions, customerName, customerPhone, paymentStatus } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const taxAmount = Number(((subtotal * restaurantInfo.taxRatePercent) / 100).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  // Determine estimated preparation time based on items
  const maxPrep = items.reduce((max: number, item: { menuItemId: string }) => {
    const mi = menuItems.find((m) => m.id === item.menuItemId);
    return Math.max(max, mi?.prepTimeMinutes || 12);
  }, 10);

  const orderNum = `ORD-${orderSequence++}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: 'ord-' + Date.now(),
    orderNumber: orderNum,
    tableNumber: tableNumber || 'Table 1',
    items,
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount,
    totalAmount,
    status: 'pending',
    specialInstructions: specialInstructions || '',
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '',
    paymentStatus: paymentStatus || 'unpaid',
    createdAt: now,
    updatedAt: now,
    estimatedTimeMinutes: maxPrep
  };

  orders.unshift(newOrder);

  // Broadcast real-time order creation to KDS
  broadcastSSE('ORDER_CREATED', newOrder);

  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };

  const validStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  // If status is served and payment was unpaid, auto-mark paid if counter
  if (status === 'served' && order.paymentStatus === 'unpaid') {
    order.paymentStatus = 'paid_counter';
  }

  broadcastSSE('ORDER_UPDATED', order);
  res.json(order);
});

app.patch('/api/orders/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentStatus } = req.body as { paymentStatus: PaymentStatus };

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentStatus = paymentStatus;
  order.updatedAt = new Date().toISOString();

  broadcastSSE('ORDER_UPDATED', order);
  res.json(order);
});

// Analytics Endpoint
app.get('/api/analytics', (_req: Request, res: Response) => {
  const nonCancelled = orders.filter((o) => o.status !== 'cancelled');
  const totalOrders = nonCancelled.length;
  const totalRevenue = Number(nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2));
  const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;
  const activeOrdersCount = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'served').length;

  // Item counts
  const itemMap: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};
  nonCancelled.forEach((o) => {
    o.items.forEach((it) => {
      if (!itemMap[it.name]) {
        const mi = menuItems.find((m) => m.name === it.name);
        itemMap[it.name] = {
          name: it.name,
          quantity: 0,
          revenue: 0,
          category: mi?.category || 'General'
        };
      }
      itemMap[it.name].quantity += it.quantity;
      itemMap[it.name].revenue += it.price * it.quantity;
    });
  });

  const topSellingItems = Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((item) => ({ ...item, revenue: Number(item.revenue.toFixed(2)) }));

  // Revenue by category
  const categoryMap: Record<string, { revenue: number; count: number }> = {};
  nonCancelled.forEach((o) => {
    o.items.forEach((it) => {
      const mi = menuItems.find((m) => m.name === it.name);
      const cat = mi?.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { revenue: 0, count: 0 };
      }
      categoryMap[cat].revenue += it.price * it.quantity;
      categoryMap[cat].count += it.quantity;
    });
  });

  const revenueByCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    revenue: Number(data.revenue.toFixed(2)),
    count: data.count
  }));

  const analytics: SalesAnalytics = {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    activeOrdersCount,
    completedOrdersCount,
    topSellingItems,
    revenueByCategory,
    recentOrders: orders.slice(0, 10)
  };

  res.json(analytics);
});

// Reset Demo Data Endpoint
app.post('/api/reset', (_req: Request, res: Response) => {
  restaurantInfo = { ...INITIAL_RESTAURANT_INFO };
  menuItems = JSON.parse(JSON.stringify(INITIAL_MENU_ITEMS));
  orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  orderSequence = 104;
  broadcastSSE('SYSTEM_RESET', { timestamp: Date.now() });
  res.json({ success: true, message: 'Demo data reset successfully' });
});

// Mount Vite or Static Frontend
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
