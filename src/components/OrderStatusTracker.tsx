import React from 'react';
import { Order, OrderStatus } from '../types.js';
import { VegNonVegIndicator } from './VegNonVegIndicator.js';
import { CheckCircle2, Clock, ChefHat, BellRing, Utensils, ArrowLeft, RefreshCw } from 'lucide-react';

interface OrderStatusTrackerProps {
  order: Order;
  currency: string;
  onOrderMore: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order,
  currency,
  onOrderMore,
  onRefresh,
  isRefreshing = false
}) => {
  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'pending',
      label: 'Order Placed',
      desc: 'Ticket sent to kitchen',
      icon: <Clock className="w-5 h-5" />
    },
    {
      key: 'preparing',
      label: 'Preparing in Kitchen',
      desc: 'Chef is crafting your dishes',
      icon: <ChefHat className="w-5 h-5" />
    },
    {
      key: 'ready',
      label: 'Ready to Serve',
      desc: 'Plated hot & on its way to table',
      icon: <BellRing className="w-5 h-5" />
    },
    {
      key: 'served',
      label: 'Served & Complete',
      desc: 'Bon appétit! Enjoy your meal',
      icon: <Utensils className="w-5 h-5" />
    }
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'served':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                {order.orderNumber}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {order.tableNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
          </button>
        </div>

        {/* Status Highlight */}
        {isCancelled ? (
          <div className="py-6 text-center space-y-2">
            <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full">
              Order Cancelled
            </span>
            <p className="text-xs text-slate-500">Please speak to restaurant staff if this was an error.</p>
          </div>
        ) : (
          <div className="py-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Kitchen Progress</span>
              <span className="text-emerald-700 font-semibold font-mono tabular-nums">
                ~{order.estimatedTimeMinutes} mins target
              </span>
            </div>

            {/* Stepper */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {steps.map((st, i) => {
                const isPassed = i < currentIndex;
                const isCurrent = i === currentIndex;
                const isFuture = i > currentIndex;

                return (
                  <div key={st.key} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : isCurrent
                          ? 'bg-slate-900 text-white ring-4 ring-slate-100 animate-pulse'
                          : 'bg-white border-2 border-slate-300 text-transparent'
                      }`}
                    >
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? 'text-slate-900 font-bold'
                              : isPassed
                              ? 'text-emerald-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-slate-900 text-white font-medium px-2 py-0.2 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live sync note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Connected to Kitchen Display Live Feed</span>
          </span>
          <span className="font-mono tabular-nums">
            Total: {currency}{order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Itemized Order Receipt Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Items in this Ticket
        </h3>

        <div className="space-y-2.5 divide-y divide-slate-100">
          {order.items.map((it, idx) => (
            <div key={idx} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2">
                <VegNonVegIndicator type={it.dietary} size="sm" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {it.quantity}x {it.name}
                  </span>
                  {it.notes && (
                    <p className="text-[11px] text-amber-700 italic mt-0.5">
                      "{it.notes}"
                    </p>
                  )}
                </div>
              </div>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {currency}{(it.price * it.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900">
            <span className="font-semibold">Kitchen instructions:</span> {order.specialInstructions}
          </div>
        )}

        {/* Payment Summary */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{currency}{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-mono tabular-nums">{currency}{order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Grand Total</span>
            <span className="font-mono tabular-nums">{currency}{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span>Payment Mode:</span>
            <span className="capitalize font-medium text-slate-700">
              {order.paymentStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOrderMore}
          className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Order More for {order.tableNumber}</span>
        </button>
      </div>
    </div>
  );
};
