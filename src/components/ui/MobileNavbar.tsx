import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Menu, Search, ShoppingCart } from "lucide-react";

export const MobileNavbar = ({
  filters,
  onFiltersChange,
  mainCategories,
  setActiveCategory,
  setSubCategoryActiveCategory,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      selectedCategories: "",
      priceRange: [0, 10000000],
      colors: [],
      inStock: false,
    });
    setActiveCategory(false);
  };

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.colors.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 ? 1 : 0) +
    (filters.selectedCategories && filters.selectedCategories !== "" ? 1 : 0);

  // Navbar categories
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
                updateFilter("selectedCategories", category);
                setActiveCategory(true);
                setSubCategoryActiveCategory(false);
              }}
              className={`flex-1 min-w-0 py-3 px-2 text-xs font-medium transition-colors whitespace-nowrap ${
                filters.selectedCategories === category
                  ? "bg-blue-50 text-blue-700 border-t-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
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