import React from 'react';
import { SalesAnalytics } from '../types.js';
import { DollarSign, ShoppingBag, TrendingUp, ChefHat, RotateCcw, Award } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

interface AdminAnalyticsProps {
  analytics: SalesAnalytics | null;
  currency: string;
  onResetDemo: () => Promise<void>;
  isResetting?: boolean;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  analytics,
  currency,
  onResetDemo,
  isResetting = false
}) => {
  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading analytics data...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Today's Gross Sales",
      value: `${currency}${analytics.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
      subtext: 'Completed & active dine-in orders'
    },
    {
      label: 'Total Orders Placed',
      value: analytics.totalOrders.toString(),
      icon: <ShoppingBag className="w-4 h-4 text-sky-600" />,
      subtext: `${analytics.activeOrdersCount} in kitchen · ${analytics.completedOrdersCount} served`
    },
    {
      label: 'Average Order Value (AOV)',
      value: `${currency}${analytics.averageOrderValue.toFixed(2)}`,
      icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
      subtext: 'Per table ticket'
    },
    {
      label: 'Kitchen Throughput',
      value: `${analytics.completedOrdersCount} Served`,
      icon: <ChefHat className="w-4 h-4 text-amber-600" />,
      subtext: `${analytics.activeOrdersCount} currently active`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">Sales &amp; Kitchen Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily summary of restaurant revenue, top-selling items, and table orders
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset demo menu and sample orders back to initial defaults?')) {
              playActionBlip();
              onResetDemo();
            }
          }}
          disabled={isResetting}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{k.label}</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                {k.icon}
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {k.value}
            </div>
            <div className="text-[11px] text-slate-400">
              {k.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: Top Selling Items + Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Items */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top-Selling Menu Items</span>
            </h3>
            <span className="text-[11px] text-slate-400">By quantity sold</span>
          </div>

          {analytics.topSellingItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No sales data recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.topSellingItems.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-mono text-[11px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <span className="font-mono text-slate-600 font-medium">
                      {item.quantity} sold
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums w-16">
                      {currency}{item.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Revenue by Category
          </h3>

          <div className="space-y-3">
            {analytics.revenueByCategory.map((cat) => {
              const percent = analytics.totalRevenue > 0
                ? Math.round((cat.revenue / analytics.totalRevenue) * 100)
                : 0;

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.category}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {currency}{cat.revenue.toFixed(2)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Table Orders</h3>
          <span className="text-[11px] text-slate-400">Latest tickets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Ticket</th>
                <th className="py-2.5 px-3">Table</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {order.tableNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 line-clamp-1 max-w-xs">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {currency}{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'served'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'ready'
                          ? 'bg-emerald-500 text-white'
                          : order.status === 'preparing'
                          ? 'bg-sky-100 text-sky-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
