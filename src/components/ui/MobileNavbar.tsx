import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Menu, Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MobileNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Navbar categories (example) - these should ideally come from a central place or context
  const navCategories = ["Sarees", "Dupattas", "Fabrics", "Home Decor"];

  return (
    <>
      {/*  Navigation Bar for Categories */}
      <div className="w-full bg-white border-t left-0 border-gray-200 z-40 block lg:hidden">
        <div className="flex overflow-x-auto">
          {navCategories.map((category) => (
            <button
              key={category}
              onClick={() => {
                navigate(`/products?category=${category}`);
              }}
              className={`flex-1 min-w-0 py-3 px-2 text-xs font-medium transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-50`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Add padding to account for fixed bottom nav */}
      <div className="pb-16 block md:hidden"></div>
    </>
  );
};
