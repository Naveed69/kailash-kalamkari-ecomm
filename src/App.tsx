import { useState } from "react"
import { Toaster } from "@/shared/ui/toaster"
import { Toaster as Sonner } from "@/shared/ui/sonner"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import Index from "./storefront/pages/Index"
import Cart from "./storefront/pages/Cart"
import AboutUs from "./storefront/pages/AboutUs"
import ProductsPage from "./storefront/pages/ProductPage"
import NotFound from "./storefront/pages/NotFound"
import { CartProvider } from "@/shared/contexts/CartContext"
import { WishlistProvider } from "@/shared/contexts/WishlistContext"
import { InventoryProvider } from "@/shared/contexts/InventoryContext"
import Wishlist from "./storefront/pages/Wishlist"
import DashboardLayout from "./dashboard/DashboardLayout"
import AdminLogin from "./dashboard/pages/Login"
import ProtectedRoute from "@/shared/components/ProtectedRoute"
import ProductDetails from "./storefront/pages/ProductDetails"
import ScrollToTop from "@/shared/components/ScrollToTop"
import { Header } from "./storefront/components/Header"
import Footer from "./storefront/components/Footer"
import { useCart } from "@/shared/contexts/CartContext"
import PrivacyPolicyPage from "./storefront/components/PrivacyPolicyPage"
import TermsAndConditionsPage from "./storefront/components/TermsAndConditionsPage"
import Gallery from "./storefront/pages/Gallery"
import DevAdminButton from "./storefront/components/DevAdminButton"
import TrackOrder from "./storefront/pages/TrackOrder"
import OrderConfirmation from "./storefront/pages/OrderConfirmation"
import SearchPage from "./storefront/pages/SearchPage"
import { AuthProvider } from "@/shared/contexts/AuthContext"
import LoginPage from "./storefront/pages/Login"
import MyOrdersPage from "./storefront/pages/MyOrders"
import OrderDetails from "./storefront/pages/OrderDetails"
import ProfilePage from "./storefront/pages/Profile"
import { ProtectedWishlistRoute } from "@/shared/components/ProtectedWishlistRoute"

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
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/order/:id" element={<OrderDetails />} />

        <Route
          path="/inventory/*"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
              <DashboardLayout />
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
          <CartProvider>
            <InventoryProvider>
              <WishlistProvider>
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <AppContent />
                </BrowserRouter>
              </WishlistProvider>
            </InventoryProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
