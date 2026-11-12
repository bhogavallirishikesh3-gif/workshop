import { MenuItem, Order, OrderStatus, PaymentStatus, RestaurantInfo, SalesAnalytics } from '../types.js';

export async function fetchRestaurantInfo(): Promise<RestaurantInfo> {
  const res = await fetch('/api/info');
  if (!res.ok) throw new Error('Failed to fetch restaurant info');
  return res.json();
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const res = await fetch('/api/menu');
  if (!res.ok) throw new Error('Failed to fetch menu items');
  return res.json();
}

export async function createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const res = await fetch('/api/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to create menu item');
  return res.json();
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to update menu item');
  return res.json();
}

export async function deleteMenuItem(id: string): Promise<void> {
  const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete menu item');
}

export async function toggleMenuItemStock(id: string): Promise<MenuItem> {
  const res = await fetch(`/api/menu/${id}/toggle-stock`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to toggle item stock');
  return res.json();
}

export async function fetchOrders(table?: string, status?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (table) params.append('table', table);
  if (status) params.append('status', status);
  const res = await fetch(`/api/orders?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function createOrder(orderData: {
  tableNumber: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    dietary: 'veg' | 'non-veg' | 'vegan';
  }>;
  specialInstructions?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: PaymentStatus;
}): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to place order');
  }
  return res.json();
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function updateOrderPayment(id: string, paymentStatus: PaymentStatus): Promise<Order> {
  const res = await fetch(`/api/orders/${id}/payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus })
  });
  if (!res.ok) throw new Error('Failed to update order payment');
  return res.json();
}

export async function fetchAnalytics(): Promise<SalesAnalytics> {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  return res.ok;
}

export async function resetDemoData(): Promise<void> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
}
