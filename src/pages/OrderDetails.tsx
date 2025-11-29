import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, loading, id]);

  const fetchOrderDetails = async () => {
    setLoadingOrder(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
    } else {
      setOrder(data);
    }
    setLoadingOrder(false);
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
        <p className="text-slate-600 mb-6">We couldn't find the order you're looking for.</p>
        <Button onClick={() => navigate('/my-orders')}>Back to My Orders</Button>
      </div>
    );
  }

  // --- Logic & Helpers ---

  const steps = [
    { status: 'paid', label: 'Order Placed', date: order.created_at, icon: Package },
    { status: 'packed', label: 'Packed', date: order.packed_at, icon: Package },
    { status: 'shipped', label: 'Shipped', date: order.shipped_at, icon: Truck },
    { status: 'delivered', label: 'Delivered', date: order.delivered_at, icon: CheckCircle2 },
  ];

  const statusOrder: Record<string, number> = {
    'pending': 0,
    'paid': 1,
    'in_packing': 2,
    'packed': 3,
    'shipped': 4,
    'delivered': 5,
    'cancelled': -1
  };

  const currentStatusIndex = statusOrder[order.status] || 0;

  const isStepCompleted = (stepStatus: string) => {
    const stepIndex = statusOrder[stepStatus];
    return currentStatusIndex >= stepIndex;
  };

  const isStepCurrent = (stepStatus: string) => {
    // Special case for 'in_packing' which maps to 'packed' step visually but isn't complete
    if (order.status === 'in_packing' && stepStatus === 'packed') return true;
    return order.status === stepStatus;
  };

  const showTracking = ['packed', 'shipped', 'delivered'].includes(order.status) && order.tracking_id;

  const getStatusMessage = () => {
    if (order.status === 'delivered') {
      return "Your order has been delivered. Thank you for shopping with us!";
    }
    if (order.status === 'shipped') {
      return "Your parcel has been handed over to DTDC. Click below to track live shipment status.";
    }
    if (order.status === 'packed' || order.status === 'in_packing') {
      return "Your order is packed. Track your parcel using the DTDC tracking ID below.";
    }
    return "Your order has been placed. Tracking details will appear once your package is packed.";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/my-orders')} 
          className="mb-6 hover:bg-slate-200 -ml-2 text-slate-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order #{order.id}</h1>
            <p className="text-slate-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {/* Dynamic Status Badge */}
             <Badge className={`text-sm px-4 py-1.5 capitalize shadow-sm ${
                order.status === 'delivered' ? 'bg-green-600 hover:bg-green-700' :
                order.status === 'shipped' ? 'bg-blue-600 hover:bg-blue-700' :
                order.status === 'packed' ? 'bg-indigo-600 hover:bg-indigo-700' :
                'bg-amber-600 hover:bg-amber-700'
              }`}>
                {order.status.replace('_', ' ')}
              </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Simple Timeline - Matching Admin Design */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const completed = isStepCompleted(step.status);
                    
                    return (
                      <div key={step.status} className="flex gap-4">
                        {/* Icon/Dot with vertical line */}
                        <div className="relative flex flex-col items-center">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                            ${completed ? 'bg-green-500' : 'bg-gray-300'}
                          `}>
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-0.5 h-full mt-2 ${
                              completed ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <p className={`font-medium text-sm ${
                            completed ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          {completed && step.date && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(step.date).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 2. Tracking Section (Conditional) */}
            {showTracking && (
              <div className="space-y-4">
                {/* No API Alert */}
                {order.status === 'shipped' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start">
                    <div className="mt-0.5">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Live Tracking Not Available In-App</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your parcel is with <strong>{order.shipping_company || 'DTDC'}</strong>. 
                        Please use the AWB number below to track directly on their website.
                      </p>
                    </div>
                  </div>
                )}

                <Card className="border-blue-200 bg-blue-50/30 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Tracking Details</h3>
                        <p className="text-slate-600 text-sm mb-2">Shipped via <span className="font-semibold">{order.shipping_company || 'DTDC Express'}</span></p>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-blue-100 w-fit">
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">AWB</span>
                          <span className="font-mono font-medium text-slate-700">{order.tracking_id}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                        onClick={() => window.open(`https://www.google.com/search?q=${order.shipping_company || 'DTDC'}+tracking+${order.tracking_id}`, '_blank')}
                      >
                        Track Shipment
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {/* Customer Confirmation Button */}
                    {order.status === 'shipped' && (
                      <div className="mt-6 pt-6 border-t border-blue-200/50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                          <div>
                            <h4 className="font-semibold text-emerald-900">Have you received this order?</h4>
                            <p className="text-sm text-emerald-700">Help us close this order by confirming delivery.</p>
                          </div>
                          <Button 
                            onClick={handleCustomerConfirmation} 
                            disabled={markingDelivered}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm whitespace-nowrap w-full sm:w-auto"
                          >
                            {markingDelivered ? "Updating..." : "Yes, I Received My Order"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3. Items List */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-slate-500" />
                  Items in this Order
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 py-6">
                    <div className="h-24 w-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                       <img 
                         src={item.image} 
                         alt={item.name} 
                         className="h-full w-full object-cover"
                         onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                       />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg truncate pr-4">{item.name}</h3>
                          <p className="text-slate-500 text-sm mt-1">{item.category}</p>
                        </div>
                        <p className="font-bold text-slate-900 text-lg">₹{item.price?.toLocaleString()}</p>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN - Sidebar Info */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <CardTitle className="text-base font-semibold text-slate-800">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Item Total</span>
                  <span>₹{order.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg text-slate-900">
                  <span>Grand Total</span>
                  <span>₹{order.total_amount?.toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  <span>Paid via Razorpay</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="font-semibold text-slate-900 mb-1">{order.customer_name}</p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {order.customer_address}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="bg-slate-100 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-500 mb-2">Need help with this order?</p>
              <Button variant="outline" className="w-full bg-white hover:bg-slate-50 text-slate-700">
                Contact Support
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
