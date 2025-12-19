import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Heart, User, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useWishlist } from "@/contexts/WishlistContext"
import logo from "@/assets/Logo/kklogo.png"
import AboutUs from "@/pages/AboutUs"
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Package } from "lucide-react"

interface HeaderProps {
  cartCount?: number
  wishlistCount?: number
  onCartClick?: () => void
  onWishlistClick?: () => void
  onWhatsAppClick?: () => void
  setProductActive?: (active: boolean) => void
  setIsAboutUsActive?: (active: boolean) => void
}

export const Header = ({
  cartCount = 0,
  onCartClick = () => {},
  onWhatsAppClick = () => {},
  setProductActive = () => {},
  setIsAboutUsActive = () => {},
}: HeaderProps = {}) => {
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const wishlistCount = wishlist.length
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)



  const navItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Gallery", href: "/gallery" },
    { label: "About Us", href: "/about" },
  ]

  const handleNavigation = () => {
    // Admin login navigation
    navigate("/adminLogin")
  }
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  return (
    <header
      className="sticky top-0 w-full z-50  backdrop-blur"
      style={{ background: "#f0ece3ff" }}
    >
      {/* Main header */}
      <div className="container w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="w-32 h-16 cursor-pointer" // Increased width and height
              onClick={() => navigate("/")}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-[#d49217ff]  hover:text-[#E6B740] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Action buttons */}
            <div className="flex items-center text-white space-x-2">
              {/* Unified User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5 text-slate-500 hover:text-slate-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/login")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Login / Signup</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#d49217] hover:text-[#E6B740]"
                onClick={() => navigate("/wishlist")}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#d49217] hover:text-[#E6B740]"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden ">
                    <Menu className="h-5 w-5 text-[#d49217] hover:text-[#E6B740]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-sm">
                  <div className="space-y-4 mt-6">
                    {/* Mobile navigation */}
                    <nav className="flex  flex-col space-y-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="text-[#d49217] hover:text-[#E6B740] text-foreground transition-colors font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
