import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p>Welcome to the admin dashboard. Use the navigation to manage products.</p>
    </AdminLayout>
  );
}
