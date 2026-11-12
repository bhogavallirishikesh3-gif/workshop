import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, Order, OrderItem, OrderStatus, PaymentStatus, RestaurantInfo, SalesAnalytics } from './types.js';
import {
  fetchRestaurantInfo,
  fetchMenuItems,
  fetchOrders,
  fetchAnalytics,
  createOrder,
  updateOrderStatus,
  toggleMenuItemStock,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  resetDemoData
} from './services/api.js';
import { Navbar, ActiveTab } from './components/Navbar.js';
import { CustomerMenu } from './components/CustomerMenu.js';
import { ItemCustomizeModal } from './components/ItemCustomizeModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { OrderStatusTracker } from './components/OrderStatusTracker.js';
import { AdminKDS } from './components/AdminKDS.js';
import { AdminMenuManager } from './components/AdminMenuManager.js';
import { AdminQRGenerator } from './components/AdminQRGenerator.js';
import { AdminAnalytics } from './components/AdminAnalytics.js';
import { AdminLoginModal } from './components/AdminLoginModal.js';
import { playKitchenOrderChime, playActionBlip } from './utils/audio.js';
import { INITIAL_RESTAURANT_INFO, INITIAL_MENU_ITEMS } from './data/initialData.js';

export default function App() {
  // Restaurant Info
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(INITIAL_RESTAURANT_INFO);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);

  // Table selection from URL param or default
  const [tableNumber, setTableNumber] = useState<string>('Table 4');

  // Customer Cart & Order State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [activeCustomerOrder, setActiveCustomerOrder] = useState<Order | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Admin & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('customer_menu');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Parse Table from URL parameter (e.g. ?table=Table+4 or ?table=2)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tblParam = params.get('table');
      if (tblParam) {
        // If numeric like '4', format to 'Table 4'
        if (/^\d+$/.test(tblParam)) {
          setTableNumber(`Table ${tblParam}`);
        } else {
          setTableNumber(tblParam);
        }
      }

      // Check if user has an active order saved in localStorage
      const savedOrderId = localStorage.getItem('quickbite_last_order_id');
      if (savedOrderId) {
        // We will fetch and populate this order
      }
    }
  }, []);

  // Fetch initial data
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [info, menu, allOrders, anal] = await Promise.all([
        fetchRestaurantInfo().catch(() => INITIAL_RESTAURANT_INFO),
        fetchMenuItems().catch(() => INITIAL_MENU_ITEMS),
        fetchOrders().catch(() => []),
        fetchAnalytics().catch(() => null)
      ]);
      setRestaurantInfo(info);
      setMenuItems(menu);
      setOrders(allOrders);
      setAnalytics(anal);

      // Check if activeCustomerOrder needs update
      const lastId = localStorage.getItem('quickbite_last_order_id');
      if (lastId && allOrders.length > 0) {
        const found = allOrders.find((o) => o.id === lastId || o.orderNumber === lastId);
        if (found) {
          setActiveCustomerOrder(found);
        }
      }
    } catch (err) {
      console.warn('Data load warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Connect to Server-Sent Events (SSE) for Real-Time synchronization
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimer: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/orders/stream');

        eventSource.addEventListener('ORDER_CREATED', (e) => {
          try {
            const newOrder = JSON.parse(e.data) as Order;
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
            
            // Play kitchen chime bell for incoming tickets
            playKitchenOrderChime();

            // Refresh analytics
            fetchAnalytics().then(setAnalytics).catch(() => {});
          } catch (err) {
            console.error('SSE order created parse error:', err);
          }
        });

        eventSource.addEventListener('ORDER_UPDATED', (e) => {
          try {
            const updated = JSON.parse(e.data) as Order;
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            
            // If this is the current customer's order, update their tracker
            setActiveCustomerOrder((prev) => {
              if (prev && prev.id === updated.id) {
                if (updated.status === 'ready' || updated.status === 'served') {
                  playKitchenOrderChime();
                }
                return updated;
              }
              return prev;
            });

            fetchAnalytics().then(setAnalytics).catch(() => {});
          } catch (err) {
            console.error('SSE order update parse error:', err);
          }
        });

        eventSource.addEventListener('MENU_UPDATED', () => {
          fetchMenuItems().then(setMenuItems).catch(() => {});
        });

        eventSource.addEventListener('SYSTEM_RESET', () => {
          loadAllData();
        });

        eventSource.onerror = () => {
          eventSource?.close();
          // Reconnect in 4 seconds
          retryTimer = setTimeout(connectSSE, 4000);
        };
      } catch {
        retryTimer = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      eventSource?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [loadAllData]);

  // Cart operations
  const handleAddToCart = (orderItem: OrderItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (it) => it.menuItemId === orderItem.menuItemId && it.notes === orderItem.notes
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += orderItem.quantity;
        return updated;
      }
      return [...prev, orderItem];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Submit Order from Customer Phone
  const handleSubmitOrder = async (details: {
    specialInstructions: string;
    customerName: string;
    customerPhone: string;
    paymentStatus: PaymentStatus;
  }) => {
    if (cartItems.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const newOrder = await createOrder({
        tableNumber,
        items: cartItems,
        specialInstructions: details.specialInstructions,
        customerName: details.customerName,
        customerPhone: details.customerPhone,
        paymentStatus: details.paymentStatus
      });

      // Clear cart
      setCartItems([]);
      setIsCartOpen(false);

      // Save order for live tracking
      setActiveCustomerOrder(newOrder);
      if (typeof window !== 'undefined') {
        localStorage.setItem('quickbite_last_order_id', newOrder.id);
      }

      // Switch view to tracker
      setActiveTab('customer_tracker');
      playKitchenOrderChime();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Admin KDS Order Status update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    if (activeCustomerOrder?.id === orderId) {
      setActiveCustomerOrder(updated);
    }
    fetchAnalytics().then(setAnalytics).catch(() => {});
  };

  // Menu Management
  const handleToggleStock = async (id: string) => {
    const updated = await toggleMenuItemStock(id);
    setMenuItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const handleCreateMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const created = await createMenuItem(item);
    setMenuItems((prev) => [...prev, created]);
  };

  const handleUpdateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    const updated = await updateMenuItem(id, item);
    setMenuItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const handleDeleteMenuItem = async (id: string) => {
    await deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      await loadAllData();
      setActiveCustomerOrder(null);
      localStorage.removeItem('quickbite_last_order_id');
    } finally {
      setIsResetting(false);
    }
  };

  // Table selection from QR simulator or picker
  const handleSelectTable = (tbl: string) => {
    setTableNumber(tbl);
    // Update URL without full refresh
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('table', tbl);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleTestTableOrder = (tbl: string) => {
    handleSelectTable(tbl);
    setActiveTab('customer_menu');
  };

  const activeOrdersCount = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col selection:bg-amber-200">
      {/* Top 3-Zone Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdminLoggedIn(false);
          setActiveTab('customer_menu');
        }}
        activeOrdersCount={activeOrdersCount}
        restaurantName={restaurantInfo.name}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Customer Experience: Menu */}
        {activeTab === 'customer_menu' && (
          <CustomerMenu
            menuItems={menuItems}
            currency={restaurantInfo.currency}
            tableNumber={tableNumber}
            activeOrder={activeCustomerOrder}
            onSelectTable={handleSelectTable}
            availableTables={restaurantInfo.tables}
            cartItems={cartItems}
            onOpenItemModal={setSelectedItemForModal}
            onOpenCart={() => setIsCartOpen(true)}
            onViewActiveOrder={() => setActiveTab('customer_tracker')}
          />
        )}

        {/* Customer Experience: Live Order Status Tracker */}
        {activeTab === 'customer_tracker' && (
          <div className="py-6">
            {activeCustomerOrder ? (
              <OrderStatusTracker
                order={activeCustomerOrder}
                currency={restaurantInfo.currency}
                onOrderMore={() => setActiveTab('customer_menu')}
                onRefresh={loadAllData}
                isRefreshing={isRefreshing}
              />
            ) : (
              <div className="max-w-md mx-auto p-12 text-center text-slate-500 space-y-3">
                <p className="text-sm font-semibold text-slate-700">No active orders placed on this device</p>
                <p className="text-xs text-slate-400">
                  Scan your table QR code, browse our dishes, and place an order to track live preparation in the kitchen.
                </p>
                <button
                  onClick={() => setActiveTab('customer_menu')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Browse Menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Shopkeeper Dashboard: Live KDS */}
        {activeTab === 'admin_kds' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <AdminKDS
              orders={orders}
              currency={restaurantInfo.currency}
              onUpdateStatus={handleUpdateOrderStatus}
              onRefresh={loadAllData}
              isRefreshing={isRefreshing}
            />
          </div>
        )}

        {/* Shopkeeper Dashboard: Menu Management (CRUD) */}
        {activeTab === 'admin_menu' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <AdminMenuManager
              menuItems={menuItems}
              currency={restaurantInfo.currency}
              onToggleStock={handleToggleStock}
              onCreateItem={handleCreateMenuItem}
              onUpdateItem={handleUpdateMenuItem}
              onDeleteItem={handleDeleteMenuItem}
            />
          </div>
        )}

        {/* Shopkeeper Dashboard: QR Code Generator */}
        {activeTab === 'admin_qr' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <AdminQRGenerator
              restaurantInfo={restaurantInfo}
              onTestTableOrder={handleTestTableOrder}
            />
          </div>
        )}

        {/* Shopkeeper Dashboard: Sales & Analytics */}
        {activeTab === 'admin_analytics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <AdminAnalytics
              analytics={analytics}
              currency={restaurantInfo.currency}
              onResetDemo={handleResetDemo}
              isResetting={isResetting}
            />
          </div>
        )}
      </main>

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <ItemCustomizeModal
          item={selectedItemForModal}
          currency={restaurantInfo.currency}
          onClose={() => setSelectedItemForModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={restaurantInfo.currency}
        tableNumber={tableNumber}
        taxRatePercent={restaurantInfo.taxRatePercent}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveTab('admin_kds');
        }}
      />
    </div>
  );
}
