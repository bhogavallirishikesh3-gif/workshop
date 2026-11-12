import React, { useState } from 'react';
import { OrderItem, PaymentStatus } from '../types.js';
import { VegNonVegIndicator } from './VegNonVegIndicator.js';
import { X, Trash2, Plus, Minus, ArrowRight, UtensilsCrossed, ShieldCheck, QrCode, Banknote, CreditCard } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  currency: string;
  tableNumber: string;
  taxRatePercent: number;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (orderDetails: {
    specialInstructions: string;
    customerName: string;
    customerPhone: string;
    paymentStatus: PaymentStatus;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  tableNumber,
  taxRatePercent,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  isSubmitting
}) => {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentOption, setPaymentOption] = useState<PaymentStatus>('unpaid');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const taxAmount = Number(((subtotal * taxRatePercent) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    await onSubmitOrder({
      specialInstructions: specialInstructions.trim(),
      customerName: customerName.trim() || 'Guest',
      customerPhone: customerPhone.trim(),
      paymentStatus: paymentOption
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Your Order</h2>
              <p className="text-xs text-slate-500 font-medium">Ordering for: <span className="text-slate-900 font-semibold">{tableNumber}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all items from your order?')) {
                    onClearCart();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <UtensilsCrossed className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Your order tray is empty</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Explore the menu and select your favorite starters, mains, and drinks to add to your table order.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
              {items.map((it, idx) => (
                <div key={`${it.menuItemId}-${idx}`} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <VegNonVegIndicator type={it.dietary} size="sm" />
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {it.name}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-600 tabular-nums">
                      {currency}{it.price.toFixed(2)} each
                    </div>
                    {it.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-0.5 mt-1 inline-block">
                        Note: {it.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          playActionBlip();
                          if (it.quantity > 1) {
                            onUpdateQuantity(idx, it.quantity - 1);
                          } else {
                            onRemoveItem(idx);
                          }
                        }}
                        className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        {it.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono text-slate-900 tabular-nums">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playActionBlip();
                          onUpdateQuantity(idx, it.quantity + 1);
                        }}
                        className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-14 text-right font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {currency}{(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Special Instructions */}
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Special Kitchen Requests
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Bring extra plates, serve desserts together..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Guest Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="For SMS receipt"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Payment mode choice */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Payment Preference
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('paid_counter')}
                      className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        paymentOption === 'paid_counter' || paymentOption === 'unpaid'
                          ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-semibold ring-1 ring-slate-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] leading-tight">Pay at Table / Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption('paid_upi')}
                      className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        paymentOption === 'paid_upi'
                          ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-semibold ring-1 ring-slate-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span className="text-[11px] leading-tight">Instant UPI / QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption('paid_card')}
                      className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        paymentOption === 'paid_card'
                          ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-semibold ring-1 ring-slate-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span className="text-[11px] leading-tight">Card on Checkout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price breakdown & Checkout CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-mono tabular-nums text-slate-900 font-medium">{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurant GST / Taxes ({taxRatePercent}%)</span>
                  <span className="font-mono tabular-nums text-slate-900 font-medium">{currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="font-mono tabular-nums text-base">{currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending to Kitchen...</span>
                  </span>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Orders sent directly to live kitchen display for {tableNumber}</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
