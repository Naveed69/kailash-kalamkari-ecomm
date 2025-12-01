import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiClipboard,
  FiPlusSquare,
  FiLogOut,
  FiTag,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    navigate("/");
  };
  
  const menuItems = [
    { to: "/inventory/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/inventory/products", icon: FiBox, label: "Products" },
    { to: "/inventory/add-product", icon: FiPlusSquare, label: "Add Product" },
    { to: "/inventory/categories", icon: FiTag, label: "Categories" },
    { to: "/inventory/orders", icon: FiClipboard, label: "Orders" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">KK</div>
            <div>
              <h2 className="brand-name">Kailash Kalamkari</h2>
              <p className="brand-subtitle">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
                  <item.icon className="nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
