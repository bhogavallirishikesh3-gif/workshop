import React, { useState } from 'react';
import { MenuItem, DietaryType } from '../types.js';
import { VegNonVegIndicator } from './VegNonVegIndicator.js';
import { Plus, Edit2, Trash2, Search, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

interface AdminMenuManagerProps {
  menuItems: MenuItem[];
  currency: string;
  onToggleStock: (id: string) => Promise<void>;
  onCreateItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  onUpdateItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const AdminMenuManager: React.FC<AdminMenuManagerProps> = ({
  menuItems,
  currency,
  onToggleStock,
  onCreateItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [dietary, setDietary] = useState<DietaryType>('veg');
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('12');
  const [calories, setCalories] = useState('500');
  const [image, setImage] = useState('/src/assets/images/hero_margherita_pizza_1794475990752.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetImages = [
    { label: 'Wood-Fired Pizza', url: '/src/assets/images/hero_margherita_pizza_1794475990752.jpg' },
    { label: 'Smash Burger', url: '/src/assets/images/food_gourmet_burger_1794475990605.jpg' },
    { label: 'Crispy Appetizer', url: '/src/assets/images/food_crispy_appetizer_1794475991473.jpg' },
    { label: 'Chocolate Lava', url: '/src/assets/images/food_molten_dessert_1794475991251.jpg' },
    { label: 'Craft Mocktail', url: '/src/assets/images/food_craft_beverage_1794475991823.jpg' }
  ];

  const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Main Course');
    setDietary('veg');
    setIsGlutenFree(false);
    setIsSpicy(false);
    setIsChefSpecial(false);
    setPrepTimeMinutes('12');
    setCalories('500');
    setImage('/src/assets/images/hero_margherita_pizza_1794475990752.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setDietary(item.dietary);
    setIsGlutenFree(!!item.isGlutenFree);
    setIsSpicy(!!item.isSpicy);
    setIsChefSpecial(!!item.isChefSpecial);
    setPrepTimeMinutes(item.prepTimeMinutes ? item.prepTimeMinutes.toString() : '12');
    setCalories(item.calories ? item.calories.toString() : '500');
    setImage(item.image);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setIsSubmitting(true);
    playActionBlip();

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      category: category.trim() || 'General',
      dietary,
      isGlutenFree,
      isSpicy,
      isChefSpecial,
      inStock: editingItem ? editingItem.inStock : true,
      image: image.trim() || presetImages[0].url,
      prepTimeMinutes: parseInt(prepTimeMinutes) || 10,
      calories: parseInt(calories) || 400
    };

    try {
      if (editingItem) {
        await onUpdateItem(editingItem.id, payload);
      } else {
        await onCreateItem(payload);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">Menu Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add items, update prices, modify dietary tags, and toggle instant stock availability
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items to edit or toggle..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Dietary</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3 text-center">Live Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          <span>{item.name}</span>
                          {item.isChefSpecial && (
                            <span title="Chef Special">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <VegNonVegIndicator type={item.dietary} showLabel size="sm" />
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {currency}{item.price.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        playActionBlip();
                        onToggleStock(item.id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                        item.inStock
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle availability"
                    >
                      {item.inStock ? '● In Stock' : '✕ Out of Stock'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.name}" from the menu?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wood-Fired Margherita Pizza"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Flavor notes, ingredients, preparation details..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="14.50"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Chef Specials">Chef Specials</option>
                  </select>
                </div>
              </div>

              {/* Dietary selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dietary Tag</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDietary('veg')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      dietary === 'veg' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <VegNonVegIndicator type="veg" size="sm" />
                    <span>Vegetarian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietary('non-veg')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      dietary === 'non-veg' ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <VegNonVegIndicator type="non-veg" size="sm" />
                    <span>Non-Veg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietary('vegan')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      dietary === 'vegan' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <VegNonVegIndicator type="vegan" size="sm" />
                    <span>Vegan</span>
                  </button>
                </div>
              </div>

              {/* Image selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dish Photography</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {presetImages.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className={`relative rounded-lg overflow-hidden h-14 border transition-all ${
                        image === p.url ? 'ring-2 ring-slate-900 border-transparent' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {image === p.url && (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or paste custom image URL"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChefSpecial}
                    onChange={(e) => setIsChefSpecial(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="font-semibold text-slate-800">Chef Special</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="font-semibold text-slate-800">Gluten-Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpicy}
                    onChange={(e) => setIsSpicy(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="font-semibold text-slate-800">Spicy</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
