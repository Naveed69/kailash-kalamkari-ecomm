import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import BarcodeGenerator from "./components/BarcodeGenerator";
import AddProduct from "./components/AddProduct";
import "./Inventory.css";
import { useLocation } from "react-router-dom";

function Inventory() {
  const [allProducts, setAllProducts] = useState([
    {
      id: 1,
      name: "Kalamkari Saree",
      category: "Saree",
      price: 1200,
      quantity: 15,
    },
    {
      id: 2,
      name: "Printed Fabric",
      category: "Fabric",
      price: 250,
      quantity: 40,
    },
    {
      id: 3,
      name: "Cushion Covers",
      category: "Home Decor",
      price: 400,
      quantity: 5,
    },
    {
      id: 4,
      name: "Silk Dupatta",
      category: "Dupatta",
      price: 600,
      quantity: 20,
    },
    { id: 5, name: "Cotton Saree", category: "Saree", price: 800, quantity: 0 },
  ]);

  const location = useLocation();
  console.log("Current path:", location.pathname);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="products"
            element={
              <Products
                allProducts={allProducts}
                setAllProducts={setAllProducts}
              />
            }
          />
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
