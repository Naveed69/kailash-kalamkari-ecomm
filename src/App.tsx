import { useState } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import Index from "./pages/Index"
import Cart from "./pages/Cart"
import AboutUs from "./pages/AboutUs"
import ProductsPage from "./pages/ProductPage"
import NotFound from "./pages/NotFound"
import { CartProvider } from "./contexts/CartContext"
import { WishlistProvider } from "./contexts/WishlistContext"
import { InventoryProvider } from "./contexts/InventoryContext"
import Wishlist from "./pages/Wishlist"
import Inventory from "./Inventory/Inventory"
import AdminLogin from "./pages/AdminLogin"
import ProtectedRoute from "./components/ProtectedRoute"
import ProductDetails from "./pages/ProductDetails"
import ScrollToTop from "./components/ScrollToTop"
import { Header } from "./components/Header"
import Footer from "./components/Footer"
import { useCart } from "./contexts/CartContext"
import { useLocation } from "react-router-dom"
import PrivacyPolicyPage from "./components/PrivacyPolicyPage"
import TermsAndConditionsPage from "./components/TermsAndConditionsPage"
import Gallery from "./pages/Gallery"
import DevAdminButton from "./components/DevAdminButton"
import TrackOrder from "./pages/TrackOrder"
import OrderConfirmation from "./pages/OrderConfirmation"
import SearchPage from "./pages/SearchPage"
import { AuthProvider } from "./lib/AuthContext"
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import LoginPage from "./pages/Login"
import MyOrdersPage from "./pages/MyOrders"
import OrderDetails from "./pages/OrderDetails"
import ProfilePage from "./pages/Profile"
import { ProtectedWishlistRoute } from "./components/ProtectedWishlistRoute"
import EmailLinkLogin from "./components/auth/EmailLinkLogin";
import EmailLinkFinish from "./components/auth/EmailLinkFinish";
import ForgotPassword from "./components/auth/ForgotPassword";

const queryClient = new QueryClient()

const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart } = useCart()
  const isInventoryRoute = location.pathname.startsWith("/inventory")

  return (
    <>
      <ScrollToTop />
      {!isInventoryRoute && (
        <Header
          cartCount={cart?.totalItems ?? 0}
          onCartClick={() => navigate("/cart")}
        />
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/wishlist"
          element={
            <ProtectedWishlistRoute>
              <Wishlist />
            </ProtectedWishlistRoute>
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/email-link" element={<EmailLinkLogin />} />
        <Route path="/login/finish" element={<EmailLinkFinish />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/order/:id" element={<OrderDetails />} />

        <Route
          path="/inventory/*"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isInventoryRoute && <Footer />}
      <DevAdminButton />
    </>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <InventoryProvider>
                <WishlistProvider>
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppContent />
                  </BrowserRouter>
                </WishlistProvider>
              </InventoryProvider>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
