import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

import { supabase } from "@/lib/supabaseClient";

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [error, setError] = useState<{ [key: string]: string }>({});
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setOrderDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validation
    if (name === "phone") {
      const regex = /^[6-9]\d{9}$/;
      if (value && !regex.test(value)) {
        setError((prev) => ({ ...prev, phone: "Invalid 10 digit mobile number" }));
      } else {
        setError((prev) => ({ ...prev, phone: "" }));
      }
    }
    
    if (name === "pincode") {
      const regex = /^\d{6}$/;
      if (value && !regex.test(value)) {
        setError((prev) => ({ ...prev, pincode: "Pincode must be exactly 6 digits" }));
      } else {
        setError((prev) => ({ ...prev, pincode: "" }));
      }
    }
    
    if (name === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !regex.test(value)) {
        setError((prev) => ({ ...prev, email: "Invalid email address" }));
      } else {
        setError((prev) => ({ ...prev, email: "" }));
      }
    }
  };
  
  const handleStateChange = (value: string) => {
    setOrderDetails((prev) => ({ ...prev, state: value }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place your order",
        variant: "destructive",
      });
      navigate('/login?returnTo=/cart');
      return;
    }

    // Validation
    if (
      !orderDetails.name ||
      !orderDetails.phone ||
      !orderDetails.addressLine1 ||
      !orderDetails.city ||
      !orderDetails.state ||
      !orderDetails.pincode
    ) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Phone, Address Line 1, City, State, Pincode)",
        variant: "destructive",
      });
      return;
    }
    
    if (error.phone || error.pincode || error.email) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before placing order",
        variant: "destructive",
      });
      return;
    }

    const res = await loadRazorpay();

    if (!res) {
      toast({
        title: "Error",
        description: "Razorpay SDK failed to load. Are you online?",
        variant: "destructive",
      });
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: cart.totalPrice * 100, // Amount in paise
      currency: "INR",
      name: "Kailash Kalamkari",
      description: "Order Payment",
      image: "/placeholder.svg", // Replace with actual logo if available
      handler: async function (response: any) {
        try {
          // Fetch fresh product data with barcodes from database
          // ERROR FIX: The database expects integer IDs for the 'id' column, but cart might have string IDs.
          // However, the user's error shows they are using string IDs like "saree-bs-bw-007".
          // If the 'id' column is integer, we cannot query it with strings.
          // We need to check if these are actually 'barcodes' or if the ID column is text.
          // Based on the schema check, ID is number. So "saree-bs-bw-007" must be a barcode or another field.
          
          const cartItemIds = cart.items.map(item => item.id);
          
          // Try to find products by ID (if numeric) OR by barcode/name if string
          let products: any[] = [];
          
          // Separate numeric IDs from string IDs
          const numericIds = cartItemIds.filter(id => !isNaN(Number(id))).map(id => Number(id));
          const stringIds = cartItemIds.filter(id => isNaN(Number(id)));

          if (numericIds.length > 0) {
            const { data: numProducts, error: numError } = await supabase
              .from('products')
              .select('*')
              .in('id', numericIds);
            if (numError) throw numError;
            if (numProducts) products = [...products, ...numProducts];
          }

          if (stringIds.length > 0) {
             // If we have string IDs, they might be barcodes or names, NOT the primary key 'id'
             // The user's error "invalid input syntax for type bigint: "saree-bs-bw-007"" confirms 'id' is bigint.
             // So we should search these string IDs in the 'barcode' column instead.
             const { data: strProducts, error: strError } = await supabase
              .from('products')
              .select('*')
              .in('barcode', stringIds); // Assuming string IDs are barcodes
             
             if (strError) throw strError;
             if (strProducts) products = [...products, ...strProducts];
          }

          if (!products || products.length === 0) {
            throw new Error("Failed to fetch product details. Please contact support.");
          }

          // Create fresh items array with current product data including barcodes
          const freshItems = cart.items.map(cartItem => {
            // Match by converting both to strings for comparison
            const dbProduct = products.find(p => String(p.id) === String(cartItem.id) || p.barcode === cartItem.id);
            if (!dbProduct) {
              throw new Error(`Product ${cartItem.id} not found in database`);
            }

            // Check if sufficient stock available
            if (dbProduct.quantity < cartItem.quantity) {
              throw new Error(`Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.quantity}, Requested: ${cartItem.quantity}`);
            }

            return {
              id: dbProduct.id,
              name: dbProduct.name,
              price: cartItem.price, // Use price from cart (user's snapshot)
              quantity: cartItem.quantity,
              image: dbProduct.image,
              category: dbProduct.category,
              barcode: dbProduct.barcode || dbProduct.id, // Use barcode or fallback to ID
            };
          });

          // Create order with fresh item data
          const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
            customer_name: orderDetails.name,
            customer_phone: orderDetails.phone,
            customer_email: orderDetails.email || null,
            // New structured address fields
            address_line1: orderDetails.addressLine1,
            address_line2: orderDetails.addressLine2 || null,
            city: orderDetails.city,
            state: orderDetails.state,
            pincode: orderDetails.pincode,
            landmark: orderDetails.landmark || null,
            // Legacy fallback (concatenated address)
            customer_address: `${orderDetails.addressLine1}, ${orderDetails.addressLine2 ? orderDetails.addressLine2 + ', ' : ''}${orderDetails.city}, ${orderDetails.state} - ${orderDetails.pincode}${orderDetails.landmark ? ' (Near: ' + orderDetails.landmark + ')' : ''}`,
            total_amount: cart.totalPrice,
            items: freshItems, // Use fresh items with barcodes
            status: 'paid',
            user_id: user.id, // Link order to user
            user_phone: user.phone || orderDetails.phone,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          }]).select();

          if (orderError) throw orderError;

          const createdOrder = orderData[0];

          // Deduct inventory for each item
          const inventoryUpdates = freshItems.map(async (item) => {
            const dbProduct = products.find(p => p.id === item.id);
            if (!dbProduct) return;

            const newQuantity = dbProduct.quantity - item.quantity;
            
            const { error: updateError } = await supabase
              .from('products')
              .update({ quantity: newQuantity })
              .eq('id', item.id);

            if (updateError) {
              console.error(`Failed to update inventory for ${item.name}:`, updateError);
            }
          });

          await Promise.all(inventoryUpdates);

          clearCart();
          setOrderDetails({ 
            name: "", 
            phone: "", 
            email: "",
            addressLine1: "", 
            addressLine2: "", 
            city: "", 
            state: "", 
            pincode: "", 
            landmark: "" 
          });

          toast({
            title: "Order Placed Successfully!",
            description: `Order #${createdOrder.id} confirmed`,
            className: "bg-green-50 border-green-200",
          });

          // Redirect to order confirmation page
          setTimeout(() => {
            window.location.href = `/order-confirmation/${createdOrder.id}`;
          }, 1000);

        } catch (err: any) {
          console.error("Order processing error:", err);
          toast({
            title: "Order Processing Failed",
            description: err.message || "Payment successful but order processing failed. Please contact support with your payment ID.",
            variant: "destructive",
          });
        }
      },
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment Cancelled",
            description: "Your order was not placed. Your cart is still saved.",
            variant: "default",
          });
        }
      },
      prefill: {
        name: orderDetails.name,
        contact: orderDetails.phone,
        email: orderDetails.email,
      },
      notes: {
        address_line1: orderDetails.addressLine1,
        address_line2: orderDetails.addressLine2,
        city: orderDetails.city,
        state: orderDetails.state,
        pincode: orderDetails.pincode,
        landmark: orderDetails.landmark,
      },
      theme: {
        color: "#D49217", // Amber-600 matches the button
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="w-24 h-24 mx-auto mb-6 text-muted-foreground">
            <ShoppingCart className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cart Items */}
        <div className="md:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <Button
              variant="ghost"
              onClick={() => clearCart()}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
              >
                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-16 text-center border-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-bold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}

        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            {/* {cart} */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between flex-col">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{cart.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground text-center">
              or{" "}
              <Link to="/" className="text-primary hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
          {/* Customer Details Form */}
          <div className="bg-white p-6 rounded-lg border mt-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Customer & Delivery Details
            </h2>

            <form className="space-y-5">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="required">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={orderDetails.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={orderDetails.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="98765 43210"
                      maxLength={10}
                      className="mt-1"
                    />
                    {error.phone && <p className="text-red-500 text-xs mt-1">{error.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email">
                      Email (Optional)
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={orderDetails.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="mt-1"
                    />
                    {error.email && <p className="text-red-500 text-xs mt-1">{error.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Delivery Address</h3>
                
                <div>
                  <Label htmlFor="addressLine1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={orderDetails.addressLine1}
                    onChange={handleInputChange}
                    required
                    placeholder="House No., Building Name, Street"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">
                    Address Line 2 (Optional)
                  </Label>
                  <Input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={orderDetails.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, Suite, Floor (Optional)"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={orderDetails.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Select value={orderDetails.state} onValueChange={handleStateChange} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pincode">
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={orderDetails.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="123456"
                      maxLength={6}
                      className="mt-1"
                    />
                    {error.pincode && <p className="text-red-500 text-xs mt-1">{error.pincode}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="landmark">
                    Landmark (Optional)
                  </Label>
                  <Input
                    type="text"
                    id="landmark"
                    name="landmark"
                    value={orderDetails.landmark}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark for easy identification"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg font-semibold mt-6"
                disabled={!!error.phone || !!error.pincode || !!error.email}
              >
                Place Order & Pay ₹{cart.totalPrice.toLocaleString()}
              </Button>
            </form>

            <p className="text-xs text-gray-500 mt-3 text-center">
              🔒 Secure payment via Razorpay • Your data is encrypted and safe
            </p>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              or{" "}
              <Link to="/" className="text-primary hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
