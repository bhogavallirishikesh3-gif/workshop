import React, { useState } from 'react';
import { Order, OrderStatus } from '../types.js';
import { VegNonVegIndicator } from './VegNonVegIndicator.js';
import { Clock, ChefHat, BellRing, CheckCircle, Volume2, VolumeX, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { playKitchenOrderChime, playActionBlip } from '../utils/audio.js';

interface AdminKDSProps {
  orders: Order[];
  currency: string;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AdminKDS: React.FC<AdminKDSProps> = ({
  orders,
  currency,
  onUpdateStatus,
  onRefresh,
  isRefreshing = false
}) => {
  const [filter, setFilter] = useState<'active' | 'pending' | 'preparing' | 'ready' | 'served' | 'all'>('active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingId(orderId);
    playActionBlip();
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const isUrgent = (createdAt: string, status: OrderStatus) => {
    if (status === 'served' || status === 'cancelled') return false;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs > 15 * 60 * 1000; // Over 15 mins
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') {
      return ['pending', 'preparing', 'ready'].includes(o.status);
    }
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const activeCount = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <div className="space-y-5">
      {/* KDS Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Live Kitchen Display (KDS)</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Live stream active" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ticket stream with order modifications and status controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Button */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playKitchenOrderChime();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              soundEnabled
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Audio notification alert for new incoming tickets"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          <button
            onClick={() => {
              playKitchenOrderChime();
            }}
            className="px-2.5 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Test Kitchen Bell"
          >
            Test Bell 🔔
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilter('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'active'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Active Kitchen ({activeCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            filter === 'pending'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          New / Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('preparing')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            filter === 'preparing'
              ? 'bg-sky-600 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Cooking ({preparingCount})
        </button>
        <button
          onClick={() => setFilter('ready')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            filter === 'ready'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Ready to Serve ({readyCount})
        </button>
        <button
          onClick={() => setFilter('served')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            filter === 'served'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Tickets
        </button>
      </div>

      {/* Ticket Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <ChefHat className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-slate-700">No tickets in this section</h3>
          <p className="text-xs text-slate-400">
            {filter === 'active' ? 'All orders have been prepared and served!' : 'No tickets match the selected status.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const urgent = isUrgent(order.createdAt, order.status);
            const isProcessing = processingId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border flex flex-col justify-between overflow-hidden transition-all shadow-xs ${
                  urgent
                    ? 'border-rose-400 ring-2 ring-rose-200/50'
                    : order.status === 'pending'
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : order.status === 'ready'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Ticket Top bar */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    order.status === 'pending'
                      ? 'bg-amber-50/80 border-amber-200'
                      : order.status === 'preparing'
                      ? 'bg-sky-50/80 border-sky-200'
                      : order.status === 'ready'
                      ? 'bg-emerald-50 border-emerald-200'
                      : order.status === 'cancelled'
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-xs border border-slate-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {order.tableNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {urgent && (
                      <span className="flex items-center gap-1 text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold text-[10px]">
                        <AlertTriangle className="w-3 h-3" />
                        Delayed
                      </span>
                    )}
                    <span className="text-slate-500 font-mono text-[11px]">
                      {getTimeElapsed(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Ticket Items List */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Guest: <strong className="text-slate-800">{order.customerName || 'Guest'}</strong></span>
                    <span className="capitalize text-[11px] text-slate-600">
                      {order.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 divide-y divide-slate-100 pt-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5">
                            <VegNonVegIndicator type={item.dietary} size="sm" />
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-500 tabular-nums">
                            {currency}{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {item.notes && (
                          <div className="mt-1 ml-5 px-2 py-0.5 bg-amber-100/80 border border-amber-300 rounded text-[11px] text-amber-900 font-semibold inline-block">
                            Mod: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold">Table Note:</span> {order.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Ticket Action Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Mark Ready to Serve</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'served')}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Delivered to Table</span>
                    </button>
                  )}

                  {order.status === 'served' && (
                    <span className="flex-1 py-2 text-center text-xs text-emerald-700 font-bold bg-emerald-50 rounded-xl">
                      ✓ Served to {order.tableNumber}
                    </span>
                  )}

                  {order.status === 'cancelled' && (
                    <span className="flex-1 py-2 text-center text-xs text-rose-700 font-bold bg-rose-50 rounded-xl">
                      ✕ Cancelled
                    </span>
                  )}

                  {order.status !== 'served' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (confirm(`Cancel order ${order.orderNumber}?`)) {
                          handleStatusChange(order.id, 'cancelled');
                        }
                      }}
                      disabled={isProcessing}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Cancel Order"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
