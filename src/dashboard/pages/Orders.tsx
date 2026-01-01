import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/backend/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { 
  RefreshCw, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  Filter, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  MoreHorizontal, 
  ArrowRight,
  AlertCircle,
  XCircle,
  Bike,
  Eye,
  X
} from "lucide-react";
import { useToast } from "@/shared/ui/use-toast";
import { Separator } from "@/shared/ui/separator";
import PackingMode from "@/dashboard/components/PackingMode";

import { shipOrder, getOrderStatistics, deliverOrder, updateOrderStatus, cancelOrder } from "@/backend/orders";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  customer_address?: string;
  total_amount: number;
  status: "pending" | "paid" | "in_packing" | "packed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  razorpay_payment_id: string;
  shipping_company?: string;
  tracking_id?: string;
  packed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Packing mode state
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);
  
  // Shipping dialog state
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shippingCompany, setShippingCompany] = useState("DTDC");
  const [trackingId, setTrackingId] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  
  // Cancel dialog state
  const [cancelOrderData, setCancelOrderData] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Statistics
  const [stats, setStats] = useState<any>(null);

  const handleShipOrder = async () => {
    if (!shippingOrder) return;

    // Validation for non-manual shipping
    if (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a tracking ID for courier shipments.",
        variant: "destructive",
      });
      return;
    }

    setIsShipping(true);
    
    // For manual/instore, we might not have a tracking ID, so we use a placeholder or empty
    const finalTrackingId = (shippingCompany === "Manual" || shippingCompany === "InStore") 
      ? (trackingId || "MANUAL_DELIVERY") 
      : trackingId;

    const { data, error } = await shipOrder(shippingOrder.id, {
      shipping_company: shippingCompany,
      tracking_id: finalTrackingId
    });
    
    setIsShipping(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update shipping status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order Shipped!",
        description: `Order #${shippingOrder.id} marked as shipped via ${shippingCompany}`,
        className: "bg-green-50 border-green-200",
      });
      setShippingOrder(null);
      setTrackingId("");
      setShippingCompany("DTDC");
      fetchOrders();
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderData || !cancelReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please enter a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    setIsCancelling(true);
    const { error } = await cancelOrder(cancelOrderData.id, cancelReason);
    setIsCancelling(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order Cancelled",
        description: `Order #${cancelOrderData.id} has been cancelled.`,
        className: "bg-red-50 border-red-200",
      });
      setCancelOrderData(null);
      setCancelReason("");
      fetchOrders();
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    const { error } = await updateOrderStatus(orderId, newStatus);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Order #${orderId} moved to ${newStatus.replace('_', ' ')}`,
        className: "bg-blue-50 border-blue-200",
      });
      fetchOrders();
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await getOrderStatistics();
    if (data) {
      setStats(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-slate-100 text-slate-700 border-slate-200";
      case "paid": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_packing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "packed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "paid": return <Clock className="h-3.5 w-3.5" />;
      case "in_packing": return <Package className="h-3.5 w-3.5" />;
      case "packed": return <PackageCheck className="h-3.5 w-3.5" />;
      case "shipped": return <Truck className="h-3.5 w-3.5" />;
      case "delivered": return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "cancelled": return <XCircle className="h-3.5 w-3.5" />;
      default: return <Package className="h-3.5 w-3.5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_packing": return "Processing";
      case "paid": return "Order Placed";
      default: return status.replace('_', ' ');
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.id.toString().includes(searchQuery) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Manage and track all customer orders</p>
        </div>
        <Button 
          onClick={fetchOrders} 
          disabled={loading} 
          variant="outline" 
          className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh List
        </Button>
      </div>

      {/* Statistics Dashboard - Bento Style */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Orders</p>
              <p className="text-2xl font-bold text-slate-900">{stats.todayCount}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/60 flex items-center justify-center text-amber-600 backdrop-blur-sm">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Pending Action</p>
              <p className="text-2xl font-bold text-amber-900">{stats.paid + stats.inPacking}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-slate-900">₹{stats.todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-xl shadow-sm">
            {["all", "paid", "in_packing", "packed", "shipped", "cancelled"].map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2 capitalize transition-all"
              >
                {tab === 'in_packing' ? 'Processing' : tab === 'paid' ? 'New' : tab.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[100px] font-semibold text-slate-700 pl-6 py-4">Order ID</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Date</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Customer</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Items</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Amount</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 pr-6 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-medium text-slate-900">No orders found</p>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors group border-slate-50"
                  onClick={() => navigate(`/inventory/orders/${order.id}`)}
                >
                  <TableCell className="font-medium text-slate-900 pl-6 py-4">#{order.id}</TableCell>
                  <TableCell className="text-sm text-slate-500 py-4">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium text-slate-900">{order.customer_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{order.customer_phone}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden border border-slate-200">
                            <img 
                              className="h-full w-full object-cover"
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                            />
                          </div>
                        ))}
                      </div>
                      {order.items.length > 3 && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">+{order.items.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 py-4">₹{order.total_amount.toLocaleString()}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    {/* INLINE ACTIONS - VISIBLE ON HOVER */}
                    <div 
                      className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0"
                      onClick={(e) => e.stopPropagation()} // Prevent row click
                    >
                      {/* ORDER PLACED (Paid) */}
                      {order.status === 'paid' && (
                        <>
                          <Button 
                            size="sm" 
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => handleStatusUpdate(order.id, 'in_packing')}
                          >
                            Mark Processing
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelOrderData(order)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* PROCESSING (In Packing) */}
                      {order.status === 'in_packing' && (
                        <>
                          <Button 
                            size="sm" 
                            className="h-8 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            onClick={() => setPackingOrder(order)}
                          >
                            <Package className="mr-1.5 h-3.5 w-3.5" />
                            Mark Packed
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelOrderData(order)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* PACKED */}
                      {order.status === 'packed' && (
                        <>
                          <Button 
                            size="sm" 
                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            onClick={() => setShippingOrder(order)}
                          >
                            <Truck className="mr-1.5 h-3.5 w-3.5" />
                            Mark Shipped
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelOrderData(order)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* SHIPPED */}
                      {order.status === 'shipped' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => setShippingOrder(order)}
                          >
                            Edit Tracking
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setCancelOrderData(order)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* DELIVERED / CANCELLED */}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
                          onClick={() => navigate(`/inventory/orders/${order.id}`)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Shipping Dialog */}
      <Dialog open={!!shippingOrder} onOpenChange={(open) => !open && setShippingOrder(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Truck className="h-5 w-5 text-blue-600" />
              Ship Order #{shippingOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Select a shipping provider and enter tracking details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Shipping Provider</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DTDC">DTDC Express</SelectItem>
                  <SelectItem value="BlueDart">BlueDart</SelectItem>
                  <SelectItem value="Delhivery">Delhivery</SelectItem>
                  <SelectItem value="IndiaPost">India Post</SelectItem>
                  <SelectItem value="Manual">Manual Delivery (Local)</SelectItem>
                  <SelectItem value="InStore">In-Store Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shippingCompany !== "Manual" && shippingCompany !== "InStore" ? (
              <div className="space-y-2">
                <Label>Tracking ID / AWB</Label>
                <Input 
                  value={trackingId} 
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. D123456789"
                  className="font-mono uppercase rounded-xl h-11"
                />
                {trackingId && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg flex items-center gap-2 border border-blue-100">
                    <CheckCircle2 className="h-3 w-3" />
                    Preview: https://www.dtdc.in/tracking.asp?id={trackingId}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                <Bike className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">
                    {shippingCompany === "Manual" ? "Local Delivery Mode" : "Store Pickup Mode"}
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    No tracking ID required. The customer will be notified that their order is {shippingCompany === "Manual" ? "out for delivery" : "ready for pickup"}.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOrder(null)} className="rounded-lg h-11">Cancel</Button>
            <Button 
              onClick={handleShipOrder} 
              disabled={isShipping || (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId)} 
              className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 h-11 px-6"
            >
              {isShipping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Shipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancelOrderData} onOpenChange={(open) => !open && setCancelOrderData(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancel Order #{cancelOrderData?.id}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea 
                id="cancel-reason"
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation, Out of stock..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOrderData(null)} className="rounded-lg h-11">Keep Order</Button>
            <Button 
              onClick={handleCancelOrder} 
              disabled={isCancelling || !cancelReason.trim()} 
              variant="destructive"
              className="rounded-lg shadow-md shadow-red-200 h-11 px-6"
            >
              {isCancelling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Packing Mode Overlay */}
      {packingOrder && (
        <PackingMode
          order={packingOrder}
          onComplete={() => {
            setPackingOrder(null);
            fetchOrders();
            toast({
              title: "Packing Complete!",
              description: `Order #${packingOrder.id} is ready for shipping`,
              className: "bg-green-50 border-green-200",
            });
          }}
          onCancel={() => setPackingOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;
