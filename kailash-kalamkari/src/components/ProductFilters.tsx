import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { Radio, RadioGroup } from "@/components/ui/Radio";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  colors: string[];
  maxPrice: number;
  setActiveCategory?: (active: string | null) => void;
}

export const ProductFilters = ({
  filters,
  onFiltersChange,
  categories,
  colors,
  maxPrice,
  setActiveCategory,
}: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, maxPrice],
      colors: [],
      inStock: false,
    });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.colors.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  useEffect(() => {
    if (activeFilterCount > 0) {
      setActiveCategory("category"); // safely update state when activeFilterCount changes
    } else {
      setActiveCategory(null); // safely update state when activeFilterCount changes
    }
  }, [activeFilterCount]);

  return (
    <Card className="sticky top-4 top-[90px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Hide" : "Show"}
          </Button>
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full mt-2"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          {/* Categories */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Categories</Label>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter("categories", [
                          ...filters.categories,
                          category,
                        ]);
                      } else {
                        updateFilter(
                          "categories",
                          filters.categories.filter((c) => c !== category)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Price Range: ₹{filters.priceRange[0].toLocaleString()} - ₹
              {filters.priceRange[1].toLocaleString()}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) =>
                updateFilter("priceRange", value as [number, number])
              }
              max={maxPrice}
              min={0}
              step={500}
              className="w-full"
            />
          </div>

          {/* Colors */}
          {/* <div>
            <Label className="text-sm font-medium mb-3 block">Colors</Label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                    filters.colors.includes(color)
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (filters.colors.includes(color)) {
                      updateFilter('colors', filters.colors.filter(c => c !== color));
                    } else {
                      updateFilter('colors', [...filters.colors, color]);
                    }
                  }}
                  title={color}
                />
              ))}
            </div>
          </div> */}

          {/* In Stock */}
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => updateFilter("inStock", checked)}
            />
            <Label
              htmlFor="inStock"
              className="text-sm font-normal cursor-pointer"
            >
              In Stock Only
            </Label>
          </div> */}
        </CardContent>
      )}
    </Card>
  );
};
