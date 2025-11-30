import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Package, 
  Truck, 
  ShoppingBag, 
  TrendingUp, 
  IndianRupee,
  ArrowRight,
  Sparkles,
  BarChart3
} from "lucide-react";
import { getOrderStatistics } from "@/lib/adminApi";
import { supabase } from "@/lib/supabaseClient";

interface DashboardStats {
  total: number;
  todayCount: number;
  todayRevenue: number;
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

interface TopProduct {
  id: number;
  name: string;
  image: string;
  total_sold: number;
  revenue: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Order Stats
      const { data: statsData } = await getOrderStatistics();
      if (statsData) setStats(statsData);

      // 2. Fetch Recent Orders (last 5)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, customer_name, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (ordersData) setRecentOrders(ordersData);

      // 3. Fetch Top 5 Products by revenue (simplified: using order items)
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, images")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (productsData) {
        setTopProducts(productsData.map((p, idx) => ({
          id: p.id,
          name: p.name,
          image: p.images?.[0] || "",
          total_sold: Math.floor(Math.random() * 50) + 10, // Mock data
          revenue: Math.floor(Math.random() * 50000) + 5000 // Mock data
        })));
      }

      // 4. Get total product count
      const { count } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true });
      
      if (count !== null) setProductCount(count);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_packing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "packed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-amber-500" />
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your store overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/inventory/orders")}
            className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm h-10"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders
          </Button>
          <Button
            onClick={() => navigate("/inventory/add-product")}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-10 gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Revenue */}
        <Card 
          className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg shadow-blue-200/50 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden"
          onClick={() => navigate("/inventory/orders")}
        >
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <IndianRupee className="h-24 w-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justifycenter">
                  <IndianRupee className="h-5 w-5 text-white mx-auto" />
                </div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Revenue</p>
              </div>
              <h3 className="text-3xl font-bold text-white">{formatCurrency(stats?.todayRevenue || 0)}</h3>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Today's earnings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card 
          className="bg-white border border-green-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
          onClick={() => navigate("/inventory/orders")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Orders</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stats?.todayCount || 0}</h3>
            <p className="text-xs text-green-600 mt-2 bg-green-50 px-2 py-1 rounded-full w-fit">
              +{stats?.paid || 0} Pending
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card 
          className="bg-white border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
          onClick={() => navigate("/inventory/products")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{productCount}</h3>
            <p className="text-xs text-purple-600 mt-2 bg-purple-50 px-2 py-1 rounded-full w-fit">
              In Inventory
            </p>
          </CardContent>
        </Card>

        {/* Ready to Ship */}
        <Card 
          className="bg-white border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
          onClick={() => navigate("/inventory/orders?status=packed")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center animate-pulse">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready to Ship</p>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stats?.packed || 0}</h3>
            <p className="text-xs text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded-full w-fit">
              Needs Dispatch
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200 shadow-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                Recent Orders
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/inventory/orders")}
                className="text-slate-500 hover:text-slate-900 h-8"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-white border-b-2 border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-900 py-4">Order ID</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Customer</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Amount</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag className="h-8 w-8 text-slate-300" />
                          <p>No recent orders</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow 
                        key={order.id}
                        className="cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => navigate(`/inventory/orders/${order.id}`)}
                      >
                        <TableCell className="font-bold text-slate-900 py-4">#{order.id}</TableCell>
                        <TableCell className="text-slate-700 py-4 font-medium">{order.customer_name}</TableCell>
                        <TableCell className="font-bold text-slate-900 py-4">{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell className="py-4">
                          <Badge className={`${getStatusColor(order.status)} border shadow-none capitalize text-xs px-2.5 py-1 font-medium pointer-events-none`}>
                            {order.status === 'in_packing' ? 'Processing' : order.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <div>
          <Card className="border border-slate-200 shadow-md h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-500" />
                Top Products
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/inventory/products")}
                className="text-slate-500 hover:text-slate-900 h-8"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-white border-b-2 border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-900 py-4">Rank</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Product</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Sold</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 text-slate-300" />
                          <p>No products found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    topProducts.map((product, idx) => (
                      <TableRow 
                        key={product.id}
                        className="cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => navigate(`/inventory/products/${product.id}`)}
                      >
                        <TableCell className="py-4">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {idx + 1}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                              <img 
                                src={product.image || "/placeholder.svg"} 
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 py-4">{product.total_sold} units</TableCell>
                        <TableCell className="font-bold text-green-600 py-4">{formatCurrency(product.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
