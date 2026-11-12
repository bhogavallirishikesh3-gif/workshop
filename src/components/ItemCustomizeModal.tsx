import React, { useState } from 'react';
import { MenuItem, OrderItem } from '../types.js';
import { VegNonVegIndicator } from './VegNonVegIndicator.js';
import { X, Plus, Minus, Clock, Flame, Sparkles } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

interface ItemCustomizeModalProps {
  item: MenuItem | null;
  currency: string;
  onClose: () => void;
  onAddToCart: (orderItem: OrderItem) => void;
}

export const ItemCustomizeModal: React.FC<ItemCustomizeModalProps> = ({
  item,
  currency,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const quickNotes = [
    'Extra spicy 🌶️',
    'Mild / Less spice',
    'No onions',
    'Sauce on the side',
    'Well done / crispy',
    'Cut into halves'
  ];

  const handleAddQuickNote = (preset: string) => {
    if (notes.includes(preset)) return;
    setNotes((prev) => (prev ? `${prev}, ${preset}` : preset));
    playActionBlip();
  };

  const handleConfirm = () => {
    playActionBlip();
    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      notes: notes.trim(),
      dietary: item.dietary
    });
    onClose();
  };

  const totalPrice = Number((item.price * quantity).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Media */}
        <div className="relative h-56 w-full bg-slate-100 overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/70 text-white flex items-center justify-center backdrop-blur-md hover:bg-slate-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {item.isChefSpecial && (
            <div className="absolute top-4 left-4 bg-amber-500/95 text-slate-950 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chef's Special</span>
            </div>
          )}

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <VegNonVegIndicator type={item.dietary} showLabel />
              {item.isGlutenFree && (
                <span className="text-[11px] text-emerald-200">· Gluten-Free</span>
              )}
              {item.isSpicy && (
                <span className="text-[11px] text-amber-200">· Spicy</span>
              )}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Scrollable details & Customization */}
        <div className="p-5 overflow-y-auto space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
            {item.prepTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>~{item.prepTimeMinutes} mins prep</span>
              </span>
            )}
            {item.calories && (
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.calories} kcal</span>
              </span>
            )}
          </div>

          {/* Quick notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Chef Instructions &amp; Dietary Notes
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {quickNotes.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddQuickNote(preset)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra spicy, dressing on side, allergy alerts..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-slate-800"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-slate-900">Quantity</span>
            <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => Math.max(1, q - 1));
                  playActionBlip();
                }}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:bg-slate-50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold font-mono tabular-nums text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => Math.min(20, q + 1));
                  playActionBlip();
                }}
                className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer sticky CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <div className="shrink-0">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Total</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {currency}{totalPrice.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md"
          >
            <span>Add to Order</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{currency}{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
