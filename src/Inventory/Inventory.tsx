// Inventory.tsx
import React, { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom";
import SidebarComp from "./components/Sidebar.tsx";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AddProduct from "./components/AddProduct";
import "./Inventory.css";
import { Toaster } from "@/components/ui/toaster";
import Categories from "./pages/Categories";
import { useAdminAuth } from "@/contexts/AdminAuthContext.tsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Inventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, loading, admin } = useAdminAuth();

  // Debug logging (only in development)
  if (import.meta.env.DEV) {
    console.log('Inventory component state:', {
      isAdmin,
      loading,
      adminEmail: admin?.email,
      currentPath: location.pathname
    });
  }

  // Redirect to admin login if not logged in
  useEffect(() => {
    if (!loading && !admin) {
      console.log('No user detected, redirecting to admin login...');
      navigate('/admin', { replace: true, state: { from: location.pathname } });
    }
  }, [loading, admin, navigate, location.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#D49217]" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Verifying Admin Access
            </p>
            <p className="text-sm text-gray-500">
              Checking your permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not admin after loading, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-5V5a3 3 0 00-6 0v3m12 0V5a3 3 0 00-6 0v3"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard.
            Please contact the system administrator if you believe this is an error.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#D49217] hover:bg-[#cf972ffa] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D49217]"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app min-h-screen bg-gray-50">
      <SidebarComp />
      <main className="main-content">
        <div className={cn(
          "p-4 md:p-6",
          location.pathname.includes('/dashboard') ? 'max-w-7xl mx-auto' : ''
        )}>
          <Routes>
            {/* Redirect /inventory to /inventory/dashboard */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            {/* Protected Dashboard Route */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Products Routes */}
            <Route
              path="products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />

            {/* Protected Orders Routes */}
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Add Product Route */}
            <Route
              path="add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />

            {/* Protected Categories Route */}
            <Route
              path="categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for admin-only 404 */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      404 - Page Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                      The page you're looking for doesn't exist in the admin dashboard.
                    </p>
                    <button
                      onClick={() => navigate('/inventory/dashboard')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#D49217] hover:bg-[#cf972ffa]"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default Inventory;