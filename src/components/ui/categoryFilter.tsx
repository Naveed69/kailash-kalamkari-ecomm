import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

export const MainCategories = ({
  filters,
  onFiltersChange,
  categories,
  mainCategories,
  colors,
  maxPrice,
  setActiveCategory,
  setSubCategoryActiveCategory,
}) => {
  const clearFilters = () => {
    // Reset all filter states
    const resetFilters = {
      categories: [],
      mainCategories: [],
      selectedCategories: "",
      priceRange: [0, maxPrice],
      colors: [],
      inStock: false,
    };

    // Update the filters in the parent component
    onFiltersChange(resetFilters);

    // Reset any active category states
    if (setActiveCategory) setActiveCategory(null);
    if (setSubCategoryActiveCategory) setSubCategoryActiveCategory(null);

    // Force a re-render by resetting the isOpen state
    setIsOpen(true);
  };
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Fixed: Only count mainCategories as active if it has a value
  const activeFilterCount =
    filters.categories.length +
    filters.colors.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0) +
    (filters.selectedCategories && filters.selectedCategories !== "" ? 1 : 0);

  return (
    <Card className="sticky top-4 top-[90px] shadow-md border-gray-200 hidden md:block              ">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5 text-[#cf972fff]" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[#cf972fff] ">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Only show Clear All button when there are active filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full mt-3 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Main Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block text-gray-700">
            Main Categories
          </Label>
          <div className="space-y-2">
            {mainCategories.length > 0 ? (
              mainCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer group p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="mainCategory"
                    value={category}
                    checked={filters.selectedCategories === category}
                    onChange={() => {
                      updateFilter("selectedCategories", category);
                      setActiveCategory(true);
                      setSubCategoryActiveCategory(false);
                    }}
                    className="h-4 w-4 accent-[#cf972fff] border-2 border-[#cf972fff] focus:outline-none rounded-full bg-white"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">
                    {category}
                  </span>
                </label>
              ))
            ) : (
              <div>No Categories Available right now</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
