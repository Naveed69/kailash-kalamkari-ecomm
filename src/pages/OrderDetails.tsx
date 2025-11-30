import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  ExternalLink,
  Copy,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// --- Types ---
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
  status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  shipping_company?: string;
  tracking_id?: string;
  packed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  payment_method?: string;
  razorpay_payment_id?: string;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?returnTo=/my-orders');
      return;
    }

    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, loading, id]);

  const fetchOrderDetails = async () => {
    setLoadingOrder(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Could not load order details.",
        variant: "destructive",
      });
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleCustomerConfirmation = async () => {
    if (!order) return;
    
    if (!window.confirm("Are you sure you received this order? This will mark it as Delivered.")) {
      return;
    }

    setMarkingDelivered(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: 'delivered', delivered_at: new Date().toISOString() });
      toast({
        title: "Thank You!",
        description: "Order marked as delivered.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarkingDelivered(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Tracking ID copied to clipboard",
    });
  };

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <Package className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <Button onClick={() => navigate('/my-orders')}>Back to My Orders</Button>
      </div>
    );
  }

  // --- Timeline Logic ---
  const timelineSteps = [
    { 
      id: 'placed', 
      label: 'Order Placed', 
      date: order.created_at,
      icon: Package,
      statusMatch: ['pending', 'paid', 'in_packing', 'packed', 'shipped', 'out_for_delivery', 'delivered']
    },
    { 
      id: 'processing', 
      label: 'Processing', 
      date: null, 
      icon: Clock,
      statusMatch: ['in_packing', 'packed', 'shipped', 'out_for_delivery', 'delivered']
    },
    { 
      id: 'packed', 
      label: 'Packed', 
      date: order.packed_at,
      icon: CheckCircle2,
      statusMatch: ['packed', 'shipped', 'out_for_delivery', 'delivered']
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description: order.shipping_company ? `Shipped via ${order.shipping_company}` : 'On its way to the courier',
      date: order.shipped_at,
      icon: Truck,
      statusMatch: ['shipped', 'out_for_delivery', 'delivered']
    }
  ];

  const getCurrentStepIndex = () => {
    if (order.status === 'cancelled') return -1;
    let index = 0;
    timelineSteps.forEach((step, i) => {
      if (step.statusMatch.includes(order.status)) {
        index = i;
      }
    });
    return index;
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order.status === 'cancelled';
  const showTracking = !isCancelled && (order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') && order.tracking_id;

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/my-orders')}
          className="mb-4 hover:bg-white hover:shadow-sm -ml-2 text-slate-600 h-9 px-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Orders
        </Button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">Order #{order.id}</h1>
              <Badge className={cn(
                "capitalize px-2.5 py-0.5 text-xs font-medium border shadow-none",
                order.status === 'paid' && "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
                order.status === 'in_packing' && "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
                order.status === 'packed' && "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
                order.status === 'shipped' && "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
                order.status === 'delivered' && "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
                order.status === 'cancelled' && "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
                order.status === 'pending' && "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100"
              )}>
                {order.status === 'in_packing' ? 'Processing' : order.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN - Timeline & Items */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. TRACKING TIMELINE */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isCancelled ? (
                  <div className="text-center py-6">
                    <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-base font-semibold text-red-700">Order Cancelled</h3>
                    <p className="text-sm text-slate-500 mt-1">This order was cancelled.</p>
                  </div>
                ) : (
                  <div className="relative pl-2">
                    {/* Vertical Line Background */}
                    <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-100" />

                    <div className="space-y-6 relative">
                      {timelineSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.id} className="flex gap-4 relative">
                            {/* Icon Bubble */}
                            <div className={cn(
                              "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 transition-all duration-300",
                              isCompleted
                                ? "bg-slate-900 border-slate-50 text-white shadow-sm"
                                : "bg-white border-slate-100 text-slate-300"
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className={cn("flex-1 pt-1", isCompleted ? "opacity-100" : "opacity-40")}>
                              <h4 className="font-semibold text-slate-900 text-sm">{step.label}</h4>
                              {step.description && <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>}
                              {isCompleted && step.date && (
                                <p className="text-xs font-medium text-slate-400 mt-0.5">
                                  {new Date(step.date).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracking Info Block - ONLY VISIBLE IF SHIPPED */}
                {showTracking && (
                  <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="text-xs font-medium text-blue-900 mb-1 uppercase tracking-wider">Tracking Details</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-700 font-medium">{order.shipping_company}</span>
                          <span className="text-slate-300">|</span>
                          <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-mono text-sm font-semibold">
                            {order.tracking_id}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-blue-100 text-blue-600" onClick={() => copyToClipboard(order.tracking_id!)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto h-9"
                        onClick={() => window.open(`https://www.dtdc.in/tracking.asp?id=${order.tracking_id}`, '_blank')}
                      >
                        Track Shipment <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. ORDER ITEMS */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-slate-500" />
                  Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <div className="h-20 w-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                       <img 
                         src={item.image} 
                         alt={item.name} 
                         className="h-full w-full object-cover"
                         onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                       />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-medium text-slate-900 text-base leading-tight truncate pr-2 hover:text-blue-600 transition-colors">{item.name}</h3>
                          <p className="font-semibold text-slate-900 whitespace-nowrap">₹{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-slate-500 text-xs">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-normal text-xs px-2">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Summary & Address */}
          <div className="space-y-6">

            {/* Payment Summary */}
            <Card className="border-slate-200 shadow-sm sticky top-6">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
                <CardTitle className="text-sm font-semibold text-slate-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{order.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-end">
                  <span className="font-bold text-base text-slate-900">Total</span>
                  <span className="font-bold text-lg text-slate-900">₹{order.total_amount.toLocaleString()}</span>
                </div>

                <div className="bg-slate-50 rounded p-2.5 flex items-center gap-2 border border-slate-100 mt-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">Payment ID</p>
                    <p className="text-[10px] text-slate-500 font-mono">{order.razorpay_payment_id || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Deliver To</p>
                    <p className="font-medium text-slate-900 text-sm">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Address</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {order.customer_address}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Contact</p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {order.customer_phone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Link */}
            <div className="text-center">
              <Button variant="link" className="text-slate-500 text-xs hover:text-slate-800">
                Need help with this order? Contact Support
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
