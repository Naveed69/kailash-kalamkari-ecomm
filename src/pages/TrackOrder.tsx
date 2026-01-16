import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Box
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_company?: string;
  tracking_id?: string;
  packed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: any[];
  customer_name: string;
  customer_phone: string;
  address_line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const { toast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || !phone) {
      toast({
        title: "Missing Information",
        description: "Please enter both Order ID and Phone Number",
        variant: "destructive",
      });
      return;
    }

    const trimmedPhone = phone.trim().replace(/\s/g, '');
    if (!/^\d{10}$/.test(trimmedPhone) && !trimmedPhone.startsWith('+')) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOrder(null);

    try {
      let normalizedPhone = phone.trim().replace(/\s/g, '');
      if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('+')) {
        normalizedPhone = '+91' + normalizedPhone;
      }

      const cleanPhoneForSearch = normalizedPhone.replace(/\D/g, '').slice(-10);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .ilike("customer_phone", `%${cleanPhoneForSearch}%`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Order not found. Please check your details.");
        }
        throw error;
      }

      setOrder(data);
    } catch (error: any) {
      console.error("Error tracking order:", error);
      toast({
        title: "Order Not Found",
        description: "Could not find an order with these details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculate estimated delivery (3-5 days after shipping)
  const getEstimatedDelivery = () => {
    if (!order?.shipped_at) return "Pending Shipment";
    const shippedDate = new Date(order.shipped_at);
    const minDate = new Date(shippedDate);
    minDate.setDate(shippedDate.getDate() + 3);
    const maxDate = new Date(shippedDate);
    maxDate.setDate(shippedDate.getDate() + 5);

    return `${minDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${maxDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Track Your Order</h1>
          <p className="text-slate-600">Enter your Order ID and Phone Number to see the latest status.</p>
        </div>

        {/* Search Form */}
        <Card className="shadow-md border-t-4 border-t-amber-500">
          <CardContent className="pt-6">
            <form onSubmit={handleTrack} className="grid gap-6 md:grid-cols-[1fr_1fr_auto] items-end">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Order ID</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="e.g. 1234"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white w-full md:w-auto font-medium shadow-sm"
              >
                {loading ? "Searching..." : "Track Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Left Column: Timeline & Status */}
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-3 text-slate-900">
                        Order #{order.id}
                        <Badge className={
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-amber-100 text-amber-700 border-amber-200'
                        }>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 text-slate-500">
                        Placed on {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  {/* Vertical Timeline */}
                  <div className="relative space-y-8 pl-2">
                    {/* Connecting Line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />

                    {/* Step 1: Placed */}
                    <div className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 bg-white ${order.created_at ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-300'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Order Placed</p>
                        <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    {/* Step 2: Packed */}
                    <div className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 bg-white ${order.packed_at ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-300'}`}>
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`font-semibold ${order.packed_at ? 'text-slate-900' : 'text-slate-400'}`}>Packed</p>
                        {order.packed_at && <p className="text-sm text-slate-500">{formatDate(order.packed_at)}</p>}
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 bg-white ${order.shipped_at ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-300'}`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`font-semibold ${order.shipped_at ? 'text-slate-900' : 'text-slate-400'}`}>Handed to Courier ({order.shipping_company || 'DTDC'})</p>
                        {order.shipped_at && <p className="text-sm text-slate-500">{formatDate(order.shipped_at)}</p>}
                        {order.shipped_at && order.status !== 'delivered' && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">In Transit (Estimated)</p>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 bg-white ${order.delivered_at ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-300'}`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`font-semibold ${order.delivered_at ? 'text-slate-900' : 'text-slate-400'}`}>Delivered</p>
                        {order.delivered_at ? (
                          <p className="text-sm text-slate-500">{formatDate(order.delivered_at)}</p>
                        ) : (
                          order.shipped_at && (
                            <p className="text-sm text-slate-500">Expected: {getEstimatedDelivery()}</p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* No API Fallback Card - Only show if shipped but not delivered */}
              {order.status === 'shipped' && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 font-semibold">Live Tracking Not Available In-App</AlertTitle>
                  <AlertDescription className="text-blue-700 mt-1 text-sm">
                    Your parcel is with <strong>{order.shipping_company || 'DTDC'}</strong>.
                    Please use the AWB number below to track directly on their website.
                  </AlertDescription>
                </Alert>
              )}

              {/* Tracking Details Card */}
              {(order.shipping_company || order.tracking_id) && (
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="h-5 w-5 text-slate-500" />
                      Shipment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Courier</p>
                        <p className="font-semibold text-slate-900">{order.shipping_company || "DTDC"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">AWB / Tracking ID</p>
                        <p className="font-mono font-bold text-slate-900 text-lg">{order.tracking_id || "N/A"}</p>
                      </div>
                    </div>

                    {order.tracking_id && (
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                          onClick={() => window.open(`https://www.google.com/search?q=${order.shipping_company}+tracking+${order.tracking_id}`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Track on {order.shipping_company || "Courier"} Website
                        </Button>
                        <p className="text-xs text-center text-slate-500">
                          Note: Courier updates may take 24-48 hours to reflect.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Customer Confirmation Action */}
              {order.status === 'shipped' && (
                <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-emerald-900">Have you received this order?</h3>
                        <p className="text-sm text-emerald-700">Help us close this order by confirming delivery.</p>
                      </div>
                      <Button
                        onClick={handleCustomerConfirmation}
                        disabled={markingDelivered}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm whitespace-nowrap"
                      >
                        {markingDelivered ? "Updating..." : "Yes, I Received My Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Address & Summary */}
            <div className="space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">{order.customer_name}</div>
                      <div className="text-slate-600 mt-1 text-sm leading-relaxed">
                        {order.address_line1}<br />
                        {order.city}, {order.state}<br />
                        {order.pincode}
                      </div>
                      <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                        <Phone className="h-3 w-3" /> {order.customer_phone}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Items ({order.items.length})</span>
                    <span className="font-medium">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-slate-900 text-lg">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
                  <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 text-sm">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Report an Issue
                  </Button>
                </CardFooter>
              </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
