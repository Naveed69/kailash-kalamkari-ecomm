import React from "react";
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Printer,
  CreditCard,
  User,
  Calendar,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

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

interface OrderDetailsAdminProps {
  order: Order;
  onClose: () => void;
  onPack: () => void;
  onShip: () => void;
  onDeliver: () => void;
}

const OrderDetailsAdmin: React.FC<OrderDetailsAdminProps> = ({ 
  order, 
  onClose, 
  onPack, 
  onShip,
  onDeliver
}) => {
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTheme = (status: string | undefined) => {
    switch (status) {
      case "pending": return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", icon: Clock };
      case "paid": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CreditCard };
      case "in_packing": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Package };
      case "packed": return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: PackageCheck };
      case "shipped": return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Truck };
      case "delivered": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 };
      case "cancelled": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: X };
      default: return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", icon: AlertCircle };
    }
  };

  const statusTheme = getStatusTheme(order.status);
  const StatusIcon = statusTheme.icon;

  const timelineSteps = [
    {
      icon: Clock,
      label: "Order Placed",
      description: "Your order has been received",
      date: formatDate(order.created_at),
      completed: true
    },
    {
      icon: CreditCard,
      label: "Payment Confirmed",
      description: "Payment successfully processed",
      date: order.status !== 'pending' ? formatDate(order.created_at) : null,
      completed: order.status !== 'pending'
    },
    {
      icon: Package,
      label: "Processing",
      description: "Order is being prepared",
      date: order.packed_at ? formatDate(order.packed_at) : null,
      completed: ['in_packing', 'packed', 'shipped'].includes(order.status || '')
    },
    {
      icon: PackageCheck,
      label: "Ready to Ship",
      description: "Order packed and ready",
      date: order.packed_at ? formatDate(order.packed_at) : null,
      completed: ['packed', 'shipped'].includes(order.status || '')
    },
    {
      icon: Truck,
      label: "Shipped",
      description: "Order is on the way",
      date: order.shipped_at ? formatDate(order.shipped_at) : null,
      completed: order.status === 'shipped'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-slate-100 rounded-full h-8 w-8 transition-all hover:scale-110 active:scale-95"
          >
            <X className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Order <span className="text-blue-600">#{order.id}</span>
            </h2>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusTheme.bg} ${statusTheme.text} border ${statusTheme.border} shadow-sm`}>
              <StatusIcon className="h-3.5 w-3.5" />
              <span className="capitalize">{(order.status || "").replace("_", " ")}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(order.created_at)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium transition-all hover:shadow-md"
          >
            <Printer className="h-3.5 w-3.5 mr-2" />
            Invoice
          </Button>
          
          {(order.status === "paid" || order.status === "in_packing") && (
            <Button 
              onClick={onPack} 
              size="sm"
              className="h-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-200/50 font-medium transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Package className="h-3.5 w-3.5 mr-2" />
              {order.status === "in_packing" ? "Resume Packing" : "Start Packing"}
            </Button>
          )}
          
          {order.status === "packed" && (
            <Button 
              onClick={onShip} 
              size="sm"
              className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200/50 font-medium transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Truck className="h-3.5 w-3.5 mr-2" />
              Ship Order
            </Button>
          )}

          {order.status === "shipped" && (
            <Button 
              onClick={onDeliver} 
              size="sm"
              className="h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200/50 font-medium transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
              Mark Delivered
            </Button>
          )}
        </div>
      </div>

      {/* Compact Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-12">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Items - More Compact */}
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    Order Items
                  </h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm uppercase tracking-wide">
                    {(order.items || []).length} {(order.items || []).length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {(order.items || []).map((item, index) => (
                  <div key={index} className="p-4 flex gap-4 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/20 transition-all duration-300 group/item">
                    <div className="relative h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden border-2 border-slate-200 flex-shrink-0 shadow-md group-hover/item:shadow-xl group-hover/item:scale-105 transition-all duration-300">
                      <img 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name}
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover/item:text-blue-600 transition-colors">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-gradient-to-r from-slate-100 to-slate-50 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 uppercase tracking-wide shadow-sm">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center items-end">
                      <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total</p>
                      <p className="font-bold text-slate-900 text-lg">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/30 border-t-2 border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  ₹{order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timeline - Compact */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Order Timeline</h3>
              </div>
              <div className="p-5">
                <div className="space-y-5">
                  {timelineSteps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div className={`w-0.5 h-full mt-1.5 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      
                      <div className="flex-1 pb-4">
                        <p className={`font-semibold text-sm ${
                          step.completed ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          step.completed ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                        {step.completed && step.date && (
                          <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Compact */}
          <div className="space-y-6">
            
            {/* Customer Details - Compact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Customer
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
                  {(order.customer_name || "Guest").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base leading-tight">{order.customer_name}</p>
                  <p className="text-xs text-slate-500 font-medium">Verified Customer</p>
                </div>
              </div>
              <Separator className="my-4 bg-slate-100" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Phone</p>
                    <p className="font-semibold text-slate-700">{order.customer_phone}</p>
                  </div>
                </div>
                {order.customer_email && (
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-slate-700 truncate text-sm">{order.customer_email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address - Compact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Delivery Address
              </h3>
              <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="text-sm text-slate-600 leading-relaxed font-medium">
                  {order.address_line1 ? (
                    <>
                      <p className="text-slate-900 font-bold mb-1">{order.customer_name}</p>
                      <p>{order.address_line1}</p>
                      {order.address_line2 && <p>{order.address_line2}</p>}
                      <p className="mt-1">{order.city}, {order.state}</p>
                      <p className="font-bold text-slate-900 mt-1.5">{order.pincode}</p>
                      {order.landmark && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                          <MapPin className="h-3 w-3" /> 
                          Near: {order.landmark}
                        </div>
                      )}
                    </>
                  ) : (
                    <p>{order.customer_address || "No address provided"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info - Compact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Payment Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Method</span>
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    Razorpay
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Payment ID</span>
                  <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 select-all">
                    {order.razorpay_payment_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5 font-bold text-xs">
                    PAID
                  </Badge>
                </div>
              </div>
            </div>

            {/* Shipping Info - Compact */}
            {(order.status === "shipped" || order.status === "delivered") && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-200 p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Truck className="h-24 w-24 text-white" />
                </div>
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Truck className="h-4 w-4 text-blue-200" />
                  Shipping Details
                </h3>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span className="text-blue-100">Carrier</span>
                    <span className="font-bold">{order.shipping_company}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span className="text-blue-100">Tracking ID</span>
                    <span className="font-mono font-medium bg-white/20 px-2 py-0.5 rounded text-xs">{order.tracking_id}</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full mt-2 bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-sm border-0 h-8"
                    onClick={() => window.open(`https://www.dtdc.in/tracking.asp?id=${order.tracking_id}`, '_blank')}
                  >
                    Track Shipment
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsAdmin;
