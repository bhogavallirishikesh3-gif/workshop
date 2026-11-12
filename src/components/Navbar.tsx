import React from 'react';
import { ChefHat, ShoppingBag, Lock, LogOut, UtensilsCrossed } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

export type ActiveTab = 'customer_menu' | 'customer_tracker' | 'admin_kds' | 'admin_menu' | 'admin_qr' | 'admin_analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  activeOrdersCount: number;
  restaurantName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onLogoutAdmin,
  activeOrdersCount,
  restaurantName
}) => {
  const isCustomerView = activeTab === 'customer_menu' || activeTab === 'customer_tracker';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line, no pill badges) */}
        <button
          onClick={() => {
            playActionBlip();
            onChangeTab(isAdminLoggedIn ? 'admin_kds' : 'customer_menu');
          }}
          className="flex items-center gap-2.5 text-left shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap block">
              {restaurantName || 'QuickBite QR'}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5">
              Digital Menu &amp; KDS
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              playActionBlip();
              onChangeTab('customer_menu');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'customer_menu'
                ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1 -mb-1'
                : 'hover:text-slate-900'
            }`}
          >
            Dine-In Menu
          </button>

          {isAdminLoggedIn ? (
            <>
              <button
                onClick={() => {
                  playActionBlip();
                  onChangeTab('admin_kds');
                }}
                className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin_kds'
                    ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1 -mb-1'
                    : 'hover:text-slate-900'
                }`}
              >
                <span>Live Kitchen (KDS)</span>
                {activeOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  playActionBlip();
                  onChangeTab('admin_menu');
                }}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'admin_menu'
                    ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1 -mb-1'
                    : 'hover:text-slate-900'
                }`}
              >
                Menu Editor
              </button>

              <button
                onClick={() => {
                  playActionBlip();
                  onChangeTab('admin_qr');
                }}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'admin_qr'
                    ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1 -mb-1'
                    : 'hover:text-slate-900'
                }`}
              >
                Table QRs
              </button>

              <button
                onClick={() => {
                  playActionBlip();
                  onChangeTab('admin_analytics');
                }}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'admin_analytics'
                    ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1 -mb-1'
                    : 'hover:text-slate-900'
                }`}
              >
                Sales &amp; Analytics
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Guest Mode · Scan table QR or select table
            </span>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              {isCustomerView ? (
                <button
                  onClick={() => {
                    playActionBlip();
                    onChangeTab('admin_kds');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Open KDS</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    playActionBlip();
                    onChangeTab('customer_menu');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Customer View</span>
                </button>
              )}

              <button
                onClick={() => {
                  playActionBlip();
                  onLogoutAdmin();
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Lock / Logout Staff"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playActionBlip();
                onOpenAdminLogin();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff / KDS</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Nav for Admin */}
      {isAdminLoggedIn && (
        <div className="md:hidden border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onChangeTab('customer_menu')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'customer_menu' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => onChangeTab('admin_kds')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin_kds' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
            }`}
          >
            KDS ({activeOrdersCount})
          </button>
          <button
            onClick={() => onChangeTab('admin_menu')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin_menu' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => onChangeTab('admin_qr')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin_qr' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
            }`}
          >
            QRs
          </button>
          <button
            onClick={() => onChangeTab('admin_analytics')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin_analytics' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Analytics
          </button>
        </div>
      )}
    </header>
  );
};
