import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import SidebarComp from "./components/Sidebar.tsx";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AddProduct from "./pages/AddProduct";
import "./styles/dashboard.css";
import { Toaster } from "@/shared/ui/toaster";
import Categories from "./pages/Categories";

function Inventory() {
  return (
    <div className="app">
      <SidebarComp />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="categories" element={<Categories />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default Inventory;
