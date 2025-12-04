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
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D49217]"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 print:py-0 print:bg-white font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Success Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Order Confirmed!</h1>
          <p className="text-slate-600 max-w-sm mx-auto">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700 mt-2">
            <span>Order #{order.id}</span>
            <span className="text-slate-300">|</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </div>

        {/* Order Summary Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-500" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Items */}
            <div className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden border border-slate-200 flex-shrink-0">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 text-sm truncate">{item.name}</h4>
                    {item.category && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="bg-slate-50/50 border-t border-slate-100 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Total Amount</span>
                <span className="text-lg font-bold text-[#D49217]">₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex gap-4">
            <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">Delivery Address</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {order.address_line1}
                {order.address_line2 && <>, {order.address_line2}</>}
                <br />
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-2 print:hidden">
          <Button
            onClick={() => navigate(`/order/${order.id}`)}
            className="w-full bg-[#D49217] hover:bg-[#B87D15] text-white h-11 font-medium shadow-sm"
          >
            View Order Details & Track
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Save Receipt
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
