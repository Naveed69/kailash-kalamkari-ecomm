import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import BarcodeGenerator from "./components/BarcodeGenerator";
import AddProduct from "./components/AddProduct";
import "./Inventory.css";
import { useInventory } from "@/contexts/InventoryContext";

function Inventory() {
  const productsInventory = useInventory();
  const [allProducts, setAllProducts] = useState(
    productsInventory.categories || []
  );
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="/barcode" element={<BarcodeGenerator />} />
          <Route
            path="/add-product"
            element={
              <AddProduct
                allProducts={allProducts}
                setAllProducts={setAllProducts}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default Inventory;
