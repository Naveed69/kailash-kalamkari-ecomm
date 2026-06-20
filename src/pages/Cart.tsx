import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { CloudflareImage } from "@/components/images/CloudflareImage"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowRight,
  Lock,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/AuthContext"
import { useRequireLogin } from "@/hooks/useRequireLogin"
// import { EmailLoginModal } from "@/components/auth/EmailLoginModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { supabase } from "@/lib/supabaseClient"
import { getDbUserId } from "@/lib/userIdentity"
import {
  ensureSupabaseUser,
  withMissingColumnFallback,
} from "@/lib/supabaseUser"
import { getSavedAddresses, saveAddress, Address } from "@/lib/addressApi"

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

// Define types
type OrderDetails = {
  name: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  landmark: string
}


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { requireLogin } = useRequireLogin()
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  })
  
  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveNewAddress, setSaveNewAddress] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<{ [key: string]: string }>({})

  // Load addresses when user logs in
  useEffect(() => {
    if (user) {
      loadAddresses()
    }
  }, [user])

  const loadAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const addresses = await getSavedAddresses()
      setSavedAddresses(addresses)
      if (addresses.length > 0) {
        // Auto-select default address
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
        handleSelectSavedAddress(defaultAddr)
      }
    } catch (err) {
      console.error("Failed to load saved addresses:", err)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id)
    setOrderDetails({
      name: addr.name || "",
      phone: addr.phone || "",
      email: user?.email || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      landmark: addr.landmark || "",
    })
    setError({}) // Clear any previous errors
  }

  const handleClearSelectedAddress = () => {
    setSelectedAddressId(null)
    setOrderDetails({
      name: user?.user_metadata?.full_name || "",
      phone: user?.phoneNumber || "",
      email: user?.email || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // If user starts typing while a saved address is selected, clear selection
    if (selectedAddressId) {
      setSelectedAddressId(null)
    }

    const { name, value } = e.target

    setOrderDetails((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validation
    if (name === "phone") {
      const regex = /^\d{10}$/
      if (value && !regex.test(value.replace(/\s/g, ""))) {
        setError((prev) => ({
          ...prev,
          phone: "Please enter a valid 10-digit mobile number",
        }))
      } else {
        setError((prev) => ({ ...prev, phone: "" }))
      }
    }

    if (name === "pincode") {
      const regex = /^\d{6}$/
      if (value && !regex.test(value)) {
        setError((prev) => ({
          ...prev,
          pincode: "Pincode must be exactly 6 digits",
        }))
      } else {
        setError((prev) => ({ ...prev, pincode: "" }))
      }
    }

    if (name === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !regex.test(value)) {
        setError((prev) => ({ ...prev, email: "Invalid email address" }))
      } else {
        setError((prev) => ({ ...prev, email: "" }))
      }
    }
  }

  const handleStateChange = (value: string) => {
    setOrderDetails((prev) => ({ ...prev, state: value }))
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePlaceOrder = async () => {
    if (!requireLogin("checkout and pay", "/cart")) return

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
        description:
          "Please fill in all required fields (Name, Phone, Address Line 1, City, State, Pincode)",
        variant: "destructive",
      })
      return
    }

    // Normalize phone number
    let normalizedPhone = orderDetails.phone.trim().replace(/\s/g, '');
    if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('+')) {
      normalizedPhone = '+91' + normalizedPhone;
    }

    if (error.phone || error.pincode || error.email) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before placing order",
        variant: "destructive",
      })
      return
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      toast({
        title: "Payment is not configured",
        description: "Missing Razorpay key. Please contact support.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    const res = await loadRazorpay()

    if (!res) {
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Razorpay SDK failed to load. Are you online?",
        variant: "destructive",
      })
      return
    }

    const options = {
      key: razorpayKey,
      amount: cart.totalPrice * 100, // Amount in paise
      currency: "INR",
      name: "Kailash Kalamkari",
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI",
              instruments: [
                {
                  method: "upi",
                },
              ],
            },
            other: {
              name: "Other Payment Modes",
              instruments: [
                {
                  method: "card",
                },
                {
                  method: "netbanking",
                },
                {
                  method: "wallet",
                },
                {
                  method: "upi",
                },
              ],
            },
          },
          sequence: ["block.upi", "block.other"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
      description: "Order Payment",
      image: "/logo192.png",
      handler: async function (response: any) {
        try {
          // Fetch fresh product data with barcodes from database
          const cartItemIds = cart.items.map((item) => item.id)

          // Try to find products by ID (if numeric) OR by barcode/name if string
          let products: any[] = []

          // Separate numeric IDs from string IDs
          const numericIds = cartItemIds
            .filter((id) => !isNaN(Number(id)))
            .map((id) => Number(id))
          const stringIds = cartItemIds.filter((id) => isNaN(Number(id)))

          if (numericIds.length > 0) {
            const { data: numProducts, error: numError } = await supabase
              .from("products")
              .select("*")
              .in("id", numericIds)
            if (numError) throw numError
            if (numProducts) products = [...products, ...numProducts]
          }

          if (stringIds.length > 0) {
            const { data: strProducts, error: strError } = await supabase
              .from("products")
              .select("*")
              .in("barcode", stringIds) // Assuming string IDs are barcodes

            if (strError) throw strError
            if (strProducts) products = [...products, ...strProducts]
          }

          if (!products || products.length === 0) {
            throw new Error(
              "Failed to fetch product details. Please contact support."
            )
          }

          // Create fresh items array with current product data including barcodes
          const freshItems = cart.items.map((cartItem) => {
            // Match by converting both to strings for comparison
            const dbProduct = products.find(
              (p) =>
                String(p.id) === String(cartItem.id) ||
                p.barcode === cartItem.id
            )
            if (!dbProduct) {
              throw new Error(`Product ${cartItem.id} not found in database`)
            }

            // Check if sufficient stock available
            if (dbProduct.quantity < cartItem.quantity) {
              throw new Error(
                `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.quantity}, Requested: ${cartItem.quantity}`
              )
            }

            return {
              id: dbProduct.id,
              name: dbProduct.name,
              price: cartItem.price, // Use price from cart (user's snapshot)
              quantity: cartItem.quantity,
              image: dbProduct.image,
              category: dbProduct.category,
              barcode: dbProduct.barcode || dbProduct.id, // Use barcode or fallback to ID
            }
          })

          // Check if order already exists
          const { data: existingOrder, error: existingOrderError } =
            response.razorpay_order_id
              ? await supabase
                  .from("orders")
                  .select("id")
                  .eq("razorpay_order_id", response.razorpay_order_id)
                  .maybeSingle()
              : { data: null, error: null }

          if (existingOrderError) throw existingOrderError

          if (existingOrder) {
            // Order already exists, redirect to confirmation
            window.location.href = `/order-confirmation/${existingOrder.id}`
            return
          }

          // Create order with fresh item data
          const dbUserId = getDbUserId(user)
          if (!dbUserId) {
            throw new Error("Please sign in again before placing your order.")
          }

          // Ensure user exists in DB before creating order
          await ensureSupabaseUser(user, {
            name: orderDetails.name,
            email: orderDetails.email,
            phone: normalizedPhone
          });

          // Save new address if requested
          if (saveNewAddress && !selectedAddressId) {
            try {
              await saveAddress({
                id: Date.now().toString(),
                name: orderDetails.name,
                phone: normalizedPhone,
                addressLine1: orderDetails.addressLine1,
                addressLine2: orderDetails.addressLine2,
                city: orderDetails.city,
                state: orderDetails.state,
                pincode: orderDetails.pincode,
                landmark: orderDetails.landmark,
              })
            } catch (addrErr) {
              console.error("Failed to save new address:", addrErr)
            }
          }

          const orderPayload = {
            customer_name: orderDetails.name,
            customer_phone: normalizedPhone,
            customer_email: orderDetails.email || null,
            // New structured address fields
            address_line1: orderDetails.addressLine1,
            address_line2: orderDetails.addressLine2 || null,
            city: orderDetails.city,
            state: orderDetails.state,
            pincode: orderDetails.pincode,
            landmark: orderDetails.landmark || null,
            // Legacy fallback (concatenated address)
            customer_address: `${orderDetails.addressLine1}, ${orderDetails.addressLine2
              ? orderDetails.addressLine2 + ", "
              : ""
              }${orderDetails.city}, ${orderDetails.state} - ${orderDetails.pincode
              }${orderDetails.landmark
                ? " (Near: " + orderDetails.landmark + ")"
                : ""
              }`,
            total_amount: cart.totalPrice,
            items: freshItems, // Use fresh items with barcodes
            status: "paid",
            payment_method: "razorpay", // Fixes missing column error
            user_id: dbUserId, // Link order to user
            user_phone: user.phoneNumber || normalizedPhone,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:
              response.razorpay_order_id || response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature || null,
          }

          const { data: orderData, error: orderError } =
            await withMissingColumnFallback(orderPayload, (payload) =>
              supabase.from("orders").insert([payload]).select(),
            )

          if (orderError) throw orderError

          const createdOrder = orderData[0]

          // Deduct inventory for each item
          const inventoryUpdates = freshItems.map(async (item) => {
            const dbProduct = products.find((p) => p.id === item.id)
            if (!dbProduct) return

            const newQuantity = dbProduct.quantity - item.quantity

            const { error: updateError } = await supabase
              .from("products")
              .update({ quantity: newQuantity })
              .eq("id", item.id)

            if (updateError) {
              console.error(
                `Failed to update inventory for ${item.name}:`,
                updateError
              )
            }
          })

          await Promise.all(inventoryUpdates)

          clearCart()
          setOrderDetails({
            name: "",
            phone: "",
            email: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          })

          toast({
            title: "Order Placed Successfully!",
            description: `Order #${createdOrder.id} confirmed`,
            className: "bg-green-50 border-green-200",
          })

          // Redirect to order confirmation page
          setTimeout(() => {
            window.location.href = `/order-confirmation/${createdOrder.id}`
          }, 1000)
        } catch (err: any) {
          setIsProcessing(false)
          console.error("Order processing error:", err)
          toast({
            title: "Order Processing Failed",
            description:
              err.message ||
              "Payment successful but order processing failed. Please contact support with your payment ID.",
            variant: "destructive",
          })
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false)
          toast({
            title: "Payment Cancelled",
            description: "Your order was not placed. Your cart is still saved.",
            variant: "default",
          })
        },
      },
      prefill: {
        name: orderDetails.name,
        contact: normalizedPhone,
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
    }

    const paymentObject = new (window as any).Razorpay(options)
    paymentObject.on("payment.failed", function () {
      setIsProcessing(false)
      toast({
        title: "Payment failed",
        description: "Your order was not placed. Please try again.",
        variant: "destructive",
      })
    })
    paymentObject.open()
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground text-lg">
            Looks like you haven't added anything to your cart yet. Explore our
            collection of authentic Kalamkari products.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#D49217] hover:bg-[#b87d14] text-white px-8"
          >
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
            <p className="text-muted-foreground mt-1">
              {cart.totalItems} items in your cart
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-4 py-2 rounded-full shadow-sm border">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>100% Secure Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: Cart Items & Address */}
          <div className="lg:w-2/3 space-y-6">
            {/* Login Banner */}
            {!user && (
              <div className="bg-gradient-to-r from-[#D49217]/10 to-[#F2C94C]/10 border border-[#D49217]/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#D49217] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">
                    Sign in for a better experience
                  </h3>
                  <p className="text-slate-600">
                    Save your cart, track orders, and checkout faster.
                  </p>
	                </div>
	                <Button
	                  onClick={() => requireLogin("checkout and pay", "/cart")}
	                  className="bg-[#D49217] hover:bg-[#C28315] text-white whitespace-nowrap"
	                >
	                  Sign in
	                </Button>
              </div>
            )}

            {/* 1. Cart Items */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <CardTitle className="text-lg">Cart Items</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearCart()}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {cart.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-4 sm:p-6 flex gap-4 sm:gap-6 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Product Image - Clickable */}
                      <Link
                        to={`/product/${item.id}`}
                        className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border hover:border-[#D49217] transition-colors cursor-pointer"
                      >
                        <CloudflareImage
                          imageRef={item.image ?? null}
                          variant="thumb"
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <Link to={`/product/${item.id}`}>
                                <h3 className="font-semibold text-slate-900 line-clamp-2 hover:text-[#D49217] transition-colors cursor-pointer">
                                  {item.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.category}
                              </p>
                              {(item as any).selectedColor && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-slate-500 font-medium">
                                    Color:
                                  </span>
                                  <div
                                    className="w-6 h-6 rounded-full border-2 border-slate-200 shadow-sm ring-1 ring-slate-100"
                                    style={{
                                      backgroundColor: (item as any)
                                        .selectedColor,
                                    }}
                                    title={(item as any).selectedColor}
                                  />
                                </div>
                              )}
                            </div>
                            <p className="font-bold text-lg text-slate-900 whitespace-nowrap">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          {/* Quantity Control */}
                          <div className="flex items-center border rounded-md bg-white shadow-sm">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  Math.max(1, Number(item.quantity) - 1)
                                )
                              }
                              disabled={Number(item.quantity) <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-14 border-x h-8 flex items-center justify-center bg-white">
                              <Input
                                type="number"
                                min={1}
                                max={(item as any).maxStock ?? 100}
                                className="w-full text-center border-none h-8 p-0 focus-visible:ring-0 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                value={item.quantity}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value);
                                  const max = Number((item as any).maxStock ?? 100);
                                  if (isNaN(val) || val < 1) val = 1;
                                  if (val > max) {
                                    toast({
                                      title: "Stock Limit Reached",
                                      description: `Max quantity available is ${max}`,
                                      variant: "destructive"
                                    });
                                    val = max;
                                  }
                                  updateQuantity(item.cartItemId, val);
                                }}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.cartItemId, Number(item.quantity) + 1)
                              }
                              disabled={Number(item.quantity) >= ((item as any).maxStock !== undefined ? Number((item as any).maxStock) : 100)}
                              title={item.quantity >= ((item as any).maxStock ?? 100) ? `Max stock reached (${(item as any).maxStock})` : "Add one"}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Delivery Address */}
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-white border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <CardTitle className="text-lg">Delivery Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                
                {/* Saved Addresses Section */}
                {user && savedAddresses.length > 0 && (
                  <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Saved Addresses
                      </h3>
                      {selectedAddressId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleClearSelectedAddress}
                          className="text-[#D49217] hover:text-[#b87d14] hover:bg-amber-50 h-8"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add New Address
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedAddressId === addr.id 
                              ? "border-[#D49217] bg-amber-50/20 shadow-sm" 
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-3 right-3 text-[#D49217]">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-1.5">
                            <MapPin className={`w-4 h-4 ${selectedAddressId === addr.id ? 'text-[#D49217]' : 'text-slate-400'}`} />
                            <span className="font-semibold text-slate-900">{addr.name}</span>
                            {addr.isDefault && <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] h-5 px-1.5 ml-1">Default</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 pl-6">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-sm text-slate-500 mt-2 pl-6">
                            📞 {addr.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {selectedAddressId && (
                      <div className="flex items-center mt-6">
                        <Separator className="flex-1" />
                        <span className="px-4 text-xs text-slate-400 uppercase font-medium">Or</span>
                        <Separator className="flex-1" />
                      </div>
                    )}
                  </div>
                )}

                <form className={`space-y-6 ${selectedAddressId ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                  {/* Personal Info Group */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Contact Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={orderDetails.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={orderDetails.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        {error.phone && (
                          <p className="text-red-500 text-xs">{error.phone}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="email">Email Address (Optional)</Label>
                        <Input
                          id="email"
                          name="email"
                          value={orderDetails.email}
                          onChange={handleInputChange}
                          placeholder="For order updates"
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        {error.email && (
                          <p className="text-red-500 text-xs">{error.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Address Group */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Address
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressLine1">
                          Address Line 1 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="addressLine1"
                          name="addressLine1"
                          value={orderDetails.addressLine1}
                          onChange={handleInputChange}
                          placeholder="House No., Building, Street Area"
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressLine2">
                          Address Line 2 (Optional)
                        </Label>
                        <Input
                          id="addressLine2"
                          name="addressLine2"
                          value={orderDetails.addressLine2}
                          onChange={handleInputChange}
                          placeholder="Landmark, Apartment, etc."
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pincode">
                            Pincode <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={orderDetails.pincode}
                            onChange={handleInputChange}
                            placeholder="6 digits"
                            maxLength={6}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                          {error.pincode && (
                            <p className="text-red-500 text-xs">
                              {error.pincode}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">
                            City <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={orderDetails.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">
                            State <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={orderDetails.state}
                            onValueChange={handleStateChange}
                          >
                            <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white transition-colors">
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
                      </div>
                    </div>
                  </div>

                  {user && !selectedAddressId && (
                    <div className="flex items-center space-x-2 pt-2 border-t mt-6">
                      <input 
                        type="checkbox" 
                        id="save-address" 
                        className="rounded border-slate-300 text-[#D49217] focus:ring-[#D49217] w-4 h-4 cursor-pointer"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                      />
                      <Label htmlFor="save-address" className="cursor-pointer font-medium text-slate-700">
                        Save this address for future use
                      </Label>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.totalItems} items)
                    </span>
                    <span className="font-medium">
                      ₹{cart.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-muted-foreground">Included</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="font-bold text-xl text-[#D49217]">
                      ₹{cart.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex flex-col gap-4">
                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full h-12 text-lg font-semibold bg-[#D49217] hover:bg-[#b87d14] shadow-md hover:shadow-lg transition-all"
                    disabled={isProcessing || !!error.phone || !!error.pincode || !!error.email}
                  >
                    {isProcessing ? "Processing..." : user ? "Proceed to Pay" : "Login to Continue"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <div className="space-y-4 w-full">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Payment Method</p>
                      <div className="rounded-lg border border-[#D49217]/30 bg-[#D49217]/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#D49217]">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#D49217]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Online Payment
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Cards, UPI, Net Banking, and Wallets via Razorpay.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>Secured by Razorpay</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-full">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Secure</p>
                    <p className="text-xs text-muted-foreground">Payment</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Fast</p>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
