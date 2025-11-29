import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Package, 
  Truck, 
  AlertTriangle, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  Box,
  User
} from "lucide-react";
import { getOrderStatistics } from "@/lib/adminApi";
import { supabase } from "@/lib/supabaseClient";
import "./Dashboard.css";

interface DashboardStats {
  total: number;
  todayCount: number;
  todayRevenue: number;
  pending: number;
  paid: number;
  inPacking: number;
  packed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface OrderPreview {
  id: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  quantity: number;
  image: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Stats
        const { data: statsData } = await getOrderStatistics();
        if (statsData) setStats(statsData);

        // 2. Fetch Recent Orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("id, customer_name, total_amount, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (ordersData) setRecentOrders(ordersData);

        // 3. Fetch Low Stock Products (quantity < 5)
        const { data: stockData } = await supabase
          .from("products")
          .select("id, name, quantity, images")
          .lt("quantity", 5)
          .order("quantity", { ascending: true })
          .limit(5);
        
        if (stockData) {
          setLowStockProducts(stockData.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            image: p.images?.[0] || ""
          })));
        }

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-blue-50 text-blue-700 border-blue-200";
      case "in_packing": return "bg-amber-50 text-amber-700 border-amber-200";
      case "packed": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "shipped": return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans space-y-10 fade-in pb-20">
      {/* Modern Header with Date Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {currentDate}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, Admin
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Here's what's happening in your store today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/inventory/orders")}
            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm h-11 px-6 text-base"
          >
            Manage Orders
          </Button>
          <Button
            onClick={() => navigate("/inventory/add-product")}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 gap-2 h-11 px-6 text-base transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Premium Bento Grid Stats - Refined Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card - Dark Theme (Kept as statement piece but refined) */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-32 w-32 text-white -mr-6 -mt-6" />
          </div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-slate-300">Total Revenue</p>
            </div>
            <h3 className="text-4xl font-bold tracking-tight">
              {stats ? formatCurrency(stats.todayRevenue) : "₹0"}
            </h3>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-medium bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from yesterday</span>
            </div>
          </div>
        </div>

        {/* New Orders Card - Clean White with Blue Accent */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <ShoppingBag className="h-32 w-32 text-blue-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">New Orders</p>
            </div>
            <h3 className="text-4xl font-bold tracking-tight text-slate-900">
              {stats ? stats.todayCount : 0}
            </h3>
            <div className="flex items-center gap-2 mt-4 text-blue-700 text-sm font-medium bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
              <Clock className="h-3 w-3" />
              <span>Updated just now</span>
            </div>
          </div>
        </div>

        {/* Action Required Card - Clean White with Amber Accent */}
        <div 
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-amber-200"
          onClick={() => navigate("/inventory/orders?status=paid")}
        >
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Package className="h-32 w-32 text-amber-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 animate-pulse-soft">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Pending Packing</p>
            </div>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
              {stats ? stats.paid + stats.inPacking : 0}
            </h3>
            <div className="flex items-center gap-2 mt-4 text-amber-700 text-sm font-medium bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
              <AlertTriangle className="h-3 w-3" />
              <span>Needs Attention</span>
            </div>
          </div>
        </div>

        {/* Ready to Ship Card - Clean White with Indigo Accent */}
        <div 
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-indigo-200"
          onClick={() => navigate("/inventory/orders?status=packed")}
        >
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Truck className="h-32 w-32 text-indigo-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Truck className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Ready to Ship</p>
            </div>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
              {stats ? stats.packed : 0}
            </h3>
            <div className="flex items-center gap-2 mt-4 text-indigo-700 text-sm font-medium bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100">
              <ArrowRight className="h-3 w-3" />
              <span>Dispatch Now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: "Add Product", icon: Plus, color: "text-slate-900", bg: "bg-slate-100", border: "hover:border-slate-300", action: () => navigate("/inventory/add-product") },
                { label: "View Customers", icon: User, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-200", action: () => navigate("/inventory/customers") },
                { label: "Sales Report", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-200", action: () => console.log("Sales Report") },
                { label: "Manage Orders", icon: Package, color: "text-amber-600", bg: "bg-amber-50", border: "hover:border-amber-200", action: () => navigate("/inventory/orders") },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${item.border}`}
                >
                  <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/inventory/orders")} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full px-4">
                View All Orders
              </Button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-slate-300" />
                  </div>
                  <p>No recent orders found</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-5 hover:bg-slate-50/80 transition-all flex items-center justify-between cursor-pointer group border-l-4 border-transparent hover:border-slate-900"
                    onClick={() => navigate("/inventory/orders")}
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm border border-slate-200">
                        #{order.id}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{order.customer_name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-bold text-slate-900 text-base">{formatCurrency(order.total_amount)}</span>
                      <Badge className={`${getStatusColor(order.status)} border-0 shadow-sm px-3 py-1 rounded-full capitalize`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-600 group-hover:bg-slate-200 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Order Pipeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              Order Pipeline
            </h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-100" />
              
              {[
                { label: "New Orders", count: stats?.paid || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", action: "paid" },
                { label: "In Packing", count: stats?.inPacking || 0, icon: Package, color: "text-amber-600", bg: "bg-amber-50", action: "in_packing" },
                { label: "Ready to Ship", count: stats?.packed || 0, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50", action: "packed" },
                { label: "Delivered", count: stats?.delivered || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", action: "delivered" },
              ].map((stage, idx) => (
                <div key={idx} className="relative flex items-center gap-5 group cursor-pointer" onClick={() => navigate(`/inventory/orders?status=${stage.action}`)}>
                  <div className={`h-12 w-12 rounded-2xl ${stage.bg} border-4 border-white shadow-sm flex items-center justify-center z-10 ${stage.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stage.label}</p>
                    <p className="text-xl font-bold text-slate-900">{stage.count}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-sm border border-amber-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertTriangle className="h-32 w-32 text-amber-900" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2 relative z-10">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low Stock Alerts
            </h3>
            <div className="space-y-4 relative z-10">
              {lowStockProducts.length === 0 ? (
                <div className="bg-white/60 p-6 rounded-2xl text-center border border-amber-100/50 backdrop-blur-sm">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-amber-900/60 font-medium">Inventory levels are healthy!</p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                      <img src={product.image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-red-600 font-bold bg-red-50 w-fit px-2 py-0.5 rounded-full mt-1">
                        Only {product.quantity} left
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-full" onClick={() => navigate(`/inventory/edit-product/${product.id}`)}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
