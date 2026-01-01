import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ProductCard } from "@/storefront/components/ProductCard";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Search, ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import { useInventory } from "@/shared/contexts/InventoryContext";
import { useCart } from "@/shared/contexts/CartContext";
import { useWishlist } from "@/shared/contexts/WishlistContext";
import { useToast } from "@/shared/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { ProductFilter, FilterState } from "@/shared/ui/ProductFilter";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products = [] } = useInventory();
  const initialSearchQuery = searchParams.get("query") || "";

  const { toast } = useToast();
  const { addToCart, isInCart } = useCart() || {};
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist() || {};

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name">(
    "name"
  );
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000000], // Assuming a max price for filtering
    colors: [],
    inStock: false,
  });

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    // Optionally clear filters when a new search query is applied from outside
    setFilters({
      categories: [],
      priceRange: [0, 1000000],
      colors: [],
      inStock: false,
    });
  }, [initialSearchQuery]);

  // Extract unique categories and colors
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const availableColors = useMemo(() => {
    const cols = new Set<string>();
    products.forEach(p => {
      if (Array.isArray(p.colors)) {
        p.colors.forEach(c => cols.add(c));
      }
    });
    return Array.from(cols);
  }, [products]);


  const handleAddToCart = useCallback(
    (product: Product) => {
      if (typeof addToCart === "function") addToCart(product);
    },
    [addToCart]
  );

  const handleToggleWishlist = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);

      if (typeof isInWishlist === "function" && isInWishlist(productId)) {
        if (typeof removeFromWishlist === "function") removeFromWishlist(productId);
        toast?.({
          title: "Removed from wishlist",
          description: `${product?.name ?? "Item"} removed from your wishlist.`,
        });
      } else if (product) {
        if (typeof addToWishlist === "function") addToWishlist(product);
        toast?.({
          title: "Added to wishlist",
          description: `${product.name} added to your wishlist.`,
        });
      }
    },
    [addToWishlist, removeFromWishlist, isInWishlist, products, toast]
  );


  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    const filtered = products.filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !(
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.subCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.material?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.categoryName as string)) return false;
      }

      // Price filter
      const price = product.originalPrice ?? product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Color filter
      if (filters.colors.length > 0) {
        if (!Array.isArray(product.colors) || 
            !filters.colors.some(color => product.colors?.includes(color))) {
          return false;
        }
      }

      // Stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [products, searchQuery, sortBy, filters]);

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000000],
      colors: [],
      inStock: false,
    });
  };
  
  const activeFilterCount = 
    filters.categories.length + 
    filters.colors.length + 
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000000 ? 1 : 0);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${searchQuery}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Search Results</h1>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative mb-8 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full focus:outline-none focus:ring-2 focus:ring-[#cf972fff]"
          />
        </div>
        <Button type="submit" className="bg-[#D49217] hover:bg-[#C28315]">
            Search
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="relative"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-primary">{activeFilterCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-xs">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <ProductFilter
                filters={filters}
                onFiltersChange={setFilters}
                availableCategories={availableCategories}
                availableColors={availableColors}
                maxPrice={1000000}
                onClear={clearFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center mb-6">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.categories.map(cat => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  categories: prev.categories.filter(c => c !== cat) 
                }))}
              />
            </Badge>
          ))}
          {filters.colors.map(color => (
            <Badge key={color} variant="secondary" className="gap-1">
              {color}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  colors: prev.colors.filter(c => c !== color) 
                }))}
              />
            </Badge>
          ))}
          {filters.inStock && (
            <Badge variant="secondary" className="gap-1">
              In Stock Only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, inStock: false }))}
              />
            </Badge>
          )}
          { (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000000) && (
            <Badge variant="secondary" className="gap-1">
              Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 1000000] }))}
              />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-7"
          >
            Clear All
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length ?? 0} products found
          </span>
        </div>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              (e.target.value as "price-low" | "price-high" | "name") ||
              "name"
            )
          }
          className="text-sm border border-border rounded-md px-3 py-2 bg-background"
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {renderProductCards(filteredProducts)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No products found for "{searchQuery}".</p>
          <Button onClick={() => navigate('/products')} className="mt-4 bg-[#D49217] hover:bg-[#C28315]">
            View All Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;