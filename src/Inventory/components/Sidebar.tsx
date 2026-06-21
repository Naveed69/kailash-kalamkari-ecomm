import React, { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  FiGrid,
  FiBox,
  FiClipboard,
  FiPlusSquare,
  FiLogOut,
  FiTag,
  FiMessageSquare,
  FiStar,
  FiPercent,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"
import "./Sidebar.css"
import { useAuth } from "@/lib/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { TooltipProvider } from "@/components/ui/tooltip"

const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = TooltipPrimitive.Content
import { supabase } from "@/lib/supabaseClient"

interface BadgeCounts {
  pendingOrders: number
  lowStock: number
  pendingReviews: number
  newInquiries: number
  activeCoupons: number
}

const Sidebar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { toast } = useToast()

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true"
    } catch {
      return false
    }
  })

  const [badges, setBadges] = useState<BadgeCounts>({
    pendingOrders: 0,
    lowStock: 0,
    pendingReviews: 0,
    newInquiries: 0,
    activeCoupons: 0,
  })

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem("sidebar-collapsed", String(next)) } catch {}
      return next
    })
  }

  useEffect(() => {
    const fetchBadges = async () => {
      const results = await Promise.allSettled([
        // Pending orders (paid + in_packing)
        (supabase as any)
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["paid", "in_packing"]),
        // Low stock (< 5)
        (supabase as any)
          .from("products")
          .select("*", { count: "exact", head: true })
          .lt("stock_quantity", 5),
        // Pending reviews
        (supabase as any)
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", false),
        // New inquiries
        (supabase as any)
          .from("contact_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        // Active coupons
        (supabase as any)
          .from("coupons")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ])

      const getCount = (result: PromiseSettledResult<any>) =>
        result.status === "fulfilled" ? result.value?.count || 0 : 0

      setBadges({
        pendingOrders: getCount(results[0]),
        lowStock: getCount(results[1]),
        pendingReviews: getCount(results[2]),
        newInquiries: getCount(results[3]),
        activeCoupons: getCount(results[4]),
      })
    }

    fetchBadges()
    // Refresh badges every 60 seconds
    const interval = setInterval(fetchBadges, 60_000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem("isLoggedIn")
      navigate("/admin")
    } catch {
      toast({ title: "Error", description: "Could not log out. Please try again.", variant: "destructive" })
    }
  }

  const menuItems = [
    {
      section: "Overview",
      items: [
        { to: "/inventory/dashboard", icon: FiGrid, label: "Dashboard", badge: null, badgeColor: "" },
      ],
    },
    {
      section: "Catalog",
      items: [
        { to: "/inventory/products", icon: FiBox, label: "Products", badge: badges.lowStock > 0 ? badges.lowStock : null, badgeColor: "bg-orange-500" },
        { to: "/inventory/add-product", icon: FiPlusSquare, label: "Add Product", badge: null, badgeColor: "" },
        { to: "/inventory/categories", icon: FiTag, label: "Categories", badge: null, badgeColor: "" },
      ],
    },
    {
      section: "Sales",
      items: [
        { to: "/inventory/orders", icon: FiClipboard, label: "Orders", badge: badges.pendingOrders > 0 ? badges.pendingOrders : null, badgeColor: "bg-red-600" },
        { to: "/inventory/coupons", icon: FiPercent, label: "Coupons", badge: badges.activeCoupons > 0 ? badges.activeCoupons : null, badgeColor: "bg-amber-500" },
      ],
    },
    {
      section: "Engagement",
      items: [
        { to: "/inventory/reviews", icon: FiStar, label: "Reviews", badge: badges.pendingReviews > 0 ? badges.pendingReviews : null, badgeColor: "bg-amber-600" },
        { to: "/inventory/inquiries", icon: FiMessageSquare, label: "Inquiries", badge: badges.newInquiries > 0 ? badges.newInquiries : null, badgeColor: "bg-blue-600" },
      ],
    },
  ]

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">KK</div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="brand-name">Kailash Kalamkari</h2>
                <p className="brand-subtitle">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((section) => (
              <div key={section.section}>
                <div className="nav-section-label">{section.section}</div>
                <ul>
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.to}
                            className={({ isActive }) => (isActive ? "active" : "")}
                          >
                            {/* Icon with floating badge for collapsed mode */}
                            <span className="nav-icon-wrapper">
                              <item.icon className="nav-icon" style={{ margin: 0 }} />
                              {item.badge != null && item.badge > 0 && (
                                <span className={`nav-icon-floating-badge ${item.badgeColor}`}>
                                  {item.badge > 99 ? "99+" : item.badge}
                                </span>
                              )}
                            </span>

                            {/* Label + inline badge */}
                            <span className="nav-label flex items-center">
                              {item.label}
                              {item.badge != null && item.badge > 0 && (
                                <span className={`nav-badge ${item.badgeColor} ml-auto`}>
                                  {item.badge > 99 ? "99+" : item.badge}
                                </span>
                              )}
                            </span>
                          </NavLink>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.label}
                            {item.badge != null && item.badge > 0 && (
                              <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TooltipProvider>
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="sidebar-footer">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut className="logout-icon" />
                <span className="logout-text">Logout</span>
              </button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default Sidebar
