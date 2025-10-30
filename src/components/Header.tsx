import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart, Search, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWishlist } from "@/contexts/WishlistContext";
import logo from "@/assets/Logo/kklogo.png";
import AboutUs from "@/pages/AboutUs";

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onWhatsAppClick?: () => void;
  onSearchChange?: (query: string) => void;
  setProductActive?: (active: boolean) => void;
  setIsAboutUsActive?: (active: boolean) => void;
}

export const Header = ({
  cartCount = 0,
  onCartClick = () => {},
  onWhatsAppClick = () => {},
  onSearchChange = () => {},
  setProductActive = () => {},
  setIsAboutUsActive = () => {},
}: HeaderProps = {}) => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const wishlistCount = wishlist.length;
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const navItems = [
    { label: "Home", href: "#" },
    { label: "Products", href: "products" },
    { label: "About Us", href: "about" },
  ];

  const handleNavigation = () => {
    // JWT token based verification is required here for better security
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/inventory");
    } else navigate("/adminLogin");
  };

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
              className="w-32 h-16" // Increased width and height
              onClick={() => navigate("/")}
            />
            
            {/* <Badge
              variant="secondary"
              className="ml-2"
              style={{ background: "#bdbdbdff" }}
            >
              Est. 1984
            </Badge> */}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.label === "Products") {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setProductActive(true);
                      setIsAboutUsActive(false);
                      navigate("/")
                    }}
                    className="text-[#d49217] hover:text-[#E6B740] transition-colors font-medium"
                  >
                    {item.label}
                  </a>
                );
              }

              if (item.label === "Home") {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setProductActive(true);
                      setIsAboutUsActive(true);
                      navigate("/")
                    }}
                    className="text-[#d49217] hover:text-[#E6B740] transition-colors font-medium"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setProductActive(false);
                    setIsAboutUsActive(true);
                    navigate("/")
                  }}
                  className="text-[#d49217ff]  hover:text-[#E6B740] transition-colors font-medium"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full sm:w-64 max-w-xs focus:outline-none focus:ring-2 focus:ring-[#cf972fff]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center text-white space-x-2">
              <Button variant="ghost" size="icon" onClick={handleNavigation}>
                <User className="h-5 w-5 text-[#d49217] hover:text-[#E6B740]" />
              </Button>

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
                    {/* Mobile search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 
                                  w-40 sm:w-48 md:w-56 lg:w-64
                                  border border-[#D4A017]
                                  focus:border-[#D4A017]
                                  focus:ring-transparent
                                  focus:ring-offset-0
                                  focus-visible:ring-0
                                  focus-visible:ring-offset-0
                                  outline-none"
                      />
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex  flex-col space-y-4">
                      {navItems.map((item) => {
                        if (item.label === "Products") {
                          return (
                            <a
                              key={item.label}
                              onClick={() => {
                                setProductActive(true);
                                setIsAboutUsActive(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className="text-[#d49217] hover:text-[#E6B740] text-foreground hover:text-primary transition-colors font-medium"
                            >
                              {item.label}
                            </a>
                          );
                        }

                        if (item.label === "Home") {
                          return (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={() => {
                                setProductActive(true);
                                setIsAboutUsActive(true);
                              }}
                              className="text-[#d49217] hover:text-[#E6B740] text-foreground transition-colors font-medium"
                            >
                              {item.label}
                            </a>
                          );
                        }

                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            className="text-[#d49217] hover:text-[#E6B740] text-foreground transition-colors font-medium"
                            onClick={() => {
                              setProductActive(false);
                              setIsAboutUsActive(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {item.label}
                          </a>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
