import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "./button"

// Define FilterState interface
export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  colors: string[]
  inStock: boolean
}

interface ProductFilterProps {
  filters: FilterState
  onFiltersChange: (newFilters: FilterState) => void
  availableCategories: string[]
  availableColors: string[]
  maxPrice: number;
  onClear?: () => void;
}

export const ProductFilter = ({
  filters,
  onFiltersChange,
  availableCategories,
  availableColors,
  maxPrice,
  onClear,
}: ProductFilterProps) => {

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color]
    onFiltersChange({ ...filters, colors: newColors })
  }

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: value })
  }

  const handleStockChange = (checked: boolean) => {
    onFiltersChange({ ...filters, inStock: checked })
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h3 className="text-lg font-semibold">Filters</h3>
         <Button variant="ghost" onClick={onClear} size="sm">Clear all</Button>
       </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "colors", "availability"]} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium">Categories</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-3">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Price</AccordionTrigger>
          <AccordionContent className="pt-6">
            <Slider
              min={0}
              max={maxPrice}
              step={100}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-3">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="colors">
          <AccordionTrigger className="text-base font-medium">Colors</AccordionTrigger>
          <AccordionContent className="flex flex-wrap gap-3 pt-3">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
                  filters.colors.includes(color)
                    ? "ring-2 ring-offset-2 ring-primary"
                    : "border-border"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
        
        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger className="text-base font-medium">Availability</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-3">
             <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={handleStockChange}
                />
                <Label htmlFor="in-stock" className="font-normal cursor-pointer">
                  In Stock
                </Label>
              </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
