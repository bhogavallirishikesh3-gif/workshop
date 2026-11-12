import React, { useState, useMemo } from 'react';
import { MenuItem, Order, OrderItem } from '../types.js';
import { VegNonVegIndicator } from './VegNonVegIndicator.js';
import { Search, Plus, Sparkles, Clock, ShoppingBag, Eye, X, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

interface CustomerMenuProps {
  menuItems: MenuItem[];
  currency: string;
  tableNumber: string;
  activeOrder: Order | null;
  onSelectTable: (table: string) => void;
  availableTables: string[];
  cartItems: OrderItem[];
  onOpenItemModal: (item: MenuItem) => void;
  onOpenCart: () => void;
  onViewActiveOrder: () => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  menuItems,
  currency,
  tableNumber,
  activeOrder,
  onSelectTable,
  availableTables,
  cartItems,
  onOpenItemModal,
  onOpenCart,
  onViewActiveOrder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isChangingTable, setIsChangingTable] = useState<boolean>(false);

  // Derive categories
  const categories = useMemo(() => {
    const cats = ['All', 'Chef Specials'];
    menuItems.forEach((item) => {
      if (!cats.includes(item.category)) {
        cats.push(item.category);
      }
    });
    return cats;
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory === 'Chef Specials') {
        if (!item.isChefSpecial) return false;
      } else if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter === 'veg' && item.dietary !== 'veg' && item.dietary !== 'vegan') {
        return false;
      }
      if (dietaryFilter === 'non-veg' && item.dietary !== 'non-veg') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesCategory;
      }

      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="pb-28">
      {/* Table & Active Order Notice Header Strip */}
      <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Ordering at:</span>
            <button
              onClick={() => setIsChangingTable(true)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              <span>{tableNumber}</span>
              <span className="text-[10px] text-slate-400 font-normal underline">Change</span>
            </button>
          </div>

          {activeOrder && activeOrder.status !== 'served' && activeOrder.status !== 'cancelled' && (
            <button
              onClick={onViewActiveOrder}
              className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/40 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Track Order {activeOrder.orderNumber}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Change Modal */}
      {isChangingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Select Your Table</h3>
              <button
                onClick={() => setIsChangingTable(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Pick the table number stamped on your QR code standee or select Counter for takeaway:
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {availableTables.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    playActionBlip();
                    onSelectTable(t);
                    setIsChangingTable(false);
                  }}
                  className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                    t === tableNumber
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search & Dietary Filters Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pizza, burger, pasta, mocktails..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary Toggle Control */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => {
                setDietaryFilter('all');
                playActionBlip();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dietaryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => {
                setDietaryFilter('veg');
                playActionBlip();
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'veg'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold ring-1 ring-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <VegNonVegIndicator type="veg" size="sm" />
              <span>Veg Only</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDietaryFilter('non-veg');
                playActionBlip();
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'non-veg'
                  ? 'bg-white text-rose-800 shadow-xs font-semibold ring-1 ring-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <VegNonVegIndicator type="non-veg" size="sm" />
              <span>Non-Veg</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block whitespace-nowrap">
            Showing {filteredItems.length} items
          </div>
        </div>

        {/* Horizontal Category Nav */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border-b border-slate-200">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  playActionBlip();
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat === 'Chef Specials' && <Sparkles className="w-3 h-3 inline mr-1 text-amber-300" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <p className="text-base font-semibold text-slate-700">No dishes found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or dietary filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setDietaryFilter('all');
              }}
              className="mt-3 text-xs text-slate-900 underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => {
              const cartQuantity = cartItems
                .filter((ci) => ci.menuItemId === item.id)
                .reduce((s, ci) => s + ci.quantity, 0);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col ${
                    item.inStock
                      ? 'border-slate-200/90 hover:shadow-md hover:border-slate-300'
                      : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  {/* Image container */}
                  <div
                    className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer"
                    onClick={() => item.inStock && onOpenItemModal(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        item.inStock ? 'hover:scale-105' : 'grayscale-[40%]'
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    
                    {/* Dietary badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs flex items-center">
                      <VegNonVegIndicator type={item.dietary} size="md" />
                    </div>

                    {item.isChefSpecial && (
                      <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Special</span>
                      </div>
                    )}

                    {!item.inStock && (
                      <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          onClick={() => item.inStock && onOpenItemModal(item)}
                          className={`text-sm sm:text-base font-bold text-slate-900 leading-snug cursor-pointer hover:text-amber-800 transition-colors ${
                            !item.inStock ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                          {currency}{item.price.toFixed(2)}
                        </span>
                        {item.prepTimeMinutes && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{item.prepTimeMinutes}m</span>
                          </div>
                        )}
                      </div>

                      {item.inStock ? (
                        <div className="flex items-center gap-2">
                          {cartQuantity > 0 && (
                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                              {cartQuantity} in tray
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              playActionBlip();
                              onOpenItemModal(item);
                            }}
                            className="h-9 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Summary Button (Priced Sticky Bar) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-40 max-w-xl mx-auto animate-slide-up">
          <button
            onClick={onOpenCart}
            className="w-full bg-slate-950 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between hover:bg-slate-900 transition-transform active:scale-[0.99] border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                {totalCartCount}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">View Table Order</div>
                <div className="text-[11px] text-slate-400">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} for {tableNumber}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-amber-300 tabular-nums">
                {currency}{totalCartPrice.toFixed(2)}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
