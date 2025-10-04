import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiClipboard,
  FiFileText,
  FiPlusSquare,
  FiLogOut,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-header">
          <h2>Kailash Kalamkari</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/inventory">
                <FiGrid />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventory/products" activeclassname="active">
                <FiBox />
                <span>Products</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/inventory/barcode" activeclassname="active">
                <FiFileText />
                <span>Barcode Generator</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventory/add-product" activeclassname="active">
                <FiPlusSquare />
                <span>Add Product</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventory/orders" activeclassname="active">
                <FiClipboard />
                <span>Orders</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <NavLink to="/" className="logout">
        <FiLogOut />
        <span>LogOut</span>
      </NavLink>
    </div>
  );
};

export default Sidebar;
