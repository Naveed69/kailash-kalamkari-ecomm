import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import AboutUs from "./pages/AboutUs";
import ProductsPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Wishlist from "./pages/Wishlist";
import Inventory from "./Inventory/Inventory";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetails from "./pages/ProductDetails";
import ScrollToTop from "./components/ScrollToTop";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { useCart } from "./contexts/CartContext";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const isInventoryRoute = location.pathname.startsWith("/inventory");

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
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/product/:id" element={<ProductDetails />} />

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
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
