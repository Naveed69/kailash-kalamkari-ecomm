import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AddProduct from "./components/AddProduct";
import "./Inventory.css";
import InventoryHome from "./pages/inventory_Home";
import { Toaster } from "@/components/ui/toaster";
import Categories from "./pages/Categories";

function Inventory() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<InventoryHome />} />
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
