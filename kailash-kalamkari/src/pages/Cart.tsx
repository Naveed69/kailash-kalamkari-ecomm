import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleCheckout = () => {
    // In a real app, you would redirect to a checkout page
    toast({
      title: "Proceeding to checkout",
      description: "This would take you to the checkout page in a real app.",
    });
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //whatsapp message format

  const formatWhatsAppMessage = () => {
    if (!orderDetails.name || !orderDetails.phone || !orderDetails.address) {
      alert("Please fill in all required fields");
      return;
    }

    const orderItems = cart.items
      .map((item) => {
        if ("quantity" in item) {
          return `• ${item.name} - ₹${item.price} x ${item.quantity} = ₹${
            item.price * item.quantity
          }`;
        } else {
          return `• ${item.name} - ₹${item.price}`;
        }
      })
      .join("\n");

    const totalAmount = cart.items.reduce((sum, item) => {
      if ("quantity" in item) {
        return sum + item.price * item.quantity;
      }
      return sum + item.price;
    }, 0);

    return `🛍️ *New Order from Kailash Kalamkari*

📋 *Order Details:*
${orderItems}

💰 *Total Amount: ₹${totalAmount}*

👤 *Customer Details:*
Name: ${orderDetails.name}
Phone: ${orderDetails.phone}
Address: ${orderDetails.address}

Thank you for choosing Kailash Kalamkari! 🙏`;
  };

  //whatsapp message sending button
  const handlePlaceOrder = () => {
    const WHATSAPP_NUMBER = "+919951821516";
    const message = formatWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(
      "+",
      ""
    )}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    clearCart();
    setOrderDetails({ name: "", phone: "", address: "" });
  };
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer Details
            </h2>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={orderDetails.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={orderDetails.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Delivery Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={orderDetails.address}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Complete delivery address with pincode"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Place Order via WhatsApp
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Your order will be sent to our WhatsApp for confirmation and
              processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
