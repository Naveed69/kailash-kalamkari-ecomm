import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, Truck, MapPin, Phone, User, Download, ArrowLeft } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  barcode?: string;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  total_amount: number;
  items: OrderItem[];
  status: string;
  razorpay_payment_id?: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D49217]"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Banner */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 print:hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader className="bg-[#D49217] text-white print:bg-white print:text-black">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                <p className="text-sm opacity-90 mt-1">Placed on {formatDate(order.created_at)}</p>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700 print:bg-green-600">
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Payment Info */}
            {order.razorpay_payment_id && (
              <div className="bg-blue-50 rounded-lg p-4 print:bg-gray-50">
                <h3 className="font-semibold text-blue-900 mb-2">Payment Successful</h3>
                <p className="text-sm text-blue-700">
                  Payment ID: <span className="font-mono">{order.razorpay_payment_id}</span>
                </p>
              </div>
            )}

            <Separator />

            {/* Customer Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 pl-7">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
                {order.customer_email && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h3>
              <div className="pl-7 text-gray-700">
                <p>{order.address_line1}</p>
                {order.address_line2 && <p>{order.address_line2}</p>}
                <p>{order.city}, {order.state} - {order.pincode}</p>
                {order.landmark && <p className="text-sm text-gray-500 italic mt-1">Landmark: {order.landmark}</p>}
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.category && (
                        <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount Paid:</span>
                <span className="text-[#D49217]">₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Information - Critical for customers */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-900">📦 Track Your Order</h3>
              <p className="text-gray-600">Save these details to track your order anytime:</p>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-blue-600">#{order.id}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="text-2xl font-bold text-blue-600">{order.customer_phone}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 italic">
                💡 Use your <strong>Order ID</strong> and <strong>Phone Number</strong> to track your order status
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <Button
            onClick={() => navigate("/track-order")}
            className="flex-1 bg-[#D49217] hover:bg-[#B87D15]"
            size="lg"
          >
            <Truck className="mr-2 h-5 w-5" />
            Go to Order Tracking
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Print / Save
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Button>
        </div>

        {/* Help Info */}
        <Card className="bg-blue-50 border-blue-200 print:hidden">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-blue-900">
              Need help? Contact us at <span className="font-semibold">support@kailashkalamkari.com</span> or call us at <span className="font-semibold">+91-XXXXXXXXXX</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
