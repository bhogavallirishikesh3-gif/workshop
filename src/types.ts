export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: DietaryType;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  inStock: boolean;
  image: string;
  prepTimeMinutes?: number;
  calories?: number;
  isChefSpecial?: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  dietary: DietaryType;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid_counter' | 'paid_upi' | 'paid_card';

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  specialInstructions?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  estimatedTimeMinutes: number;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  currency: string;
  taxRatePercent: number;
  tables: string[];
}

export interface SalesAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
  topSellingItems: {
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    count: number;
  }[];
  recentOrders: Order[];
}
