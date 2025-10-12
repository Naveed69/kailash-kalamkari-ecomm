import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import StatsCard from "../components/StatsCard";
import RecentActivity from "../components/RecentActivity";
import { FiPlus } from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const recentActivityData = [
    {
      date: "2023-11-15 10:00 AM",
      activity: "Product Added",
      details: "New 'Silk Saree' added to inventory",
    },
    {
      date: "2023-11-15 09:30 AM",
      activity: "Order Processed",
      details: "Order #12345 for 'Cotton Kurta' completed",
    },
    {
      date: "2023-11-14 05:00 PM",
      activity: "Stock Alert",
      details: "Low stock alert for 'Printed Dupatta'",
    },
    {
      date: "2023-11-14 02:15 PM",
      activity: "Customer Registered",
      details: "New customer 'Priya Sharma' registered",
    },
    {
      date: "2023-11-14 11:45 AM",
      activity: "Report Generated",
      details: "Daily sales report generated",
    },
  ];

  const handleAddProductClick = () => {
    navigate("/inventory/add-product");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddProductClick}
          startIcon={<FiPlus />}
        >
          Add Product
        </Button>
      </div>
      <div className="stats-cards-container">
        <StatsCard
          title="Total Products"
          value="1,250"
          percentage="+10%"
          isPositive={true}
        />
        <StatsCard
          title="Orders Today"
          value="75"
          percentage="+5%"
          isPositive={true}
        />
        <StatsCard
          title="Low Stock Alerts"
          value="15"
          percentage="-2%"
          isPositive={false}
        />
      </div>
      <RecentActivity data={recentActivityData} />
    </div>
  );
};

export default Dashboard;
