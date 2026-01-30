import { useState, useMemo, useCallback } from "react";
import { ProductCard, Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { ProductFilter, FilterState } from "@/components/ui/ProductFilter";
import { Input } from "@/components/ui/input";

const ProductsPage = () => {
  const { products = [], loading, error } = useInventory();
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart() || {};
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist() || {};

  const sampleProducts = Array.isArray(products) ? products : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name">("name");
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000000],
    colors: [],
    inStock: false,
  });

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    sampleProducts.forEach(p => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return Array.from(cats);
  }, [sampleProducts]);

  const availableColors = useMemo(() => {
    const cols = new Set<string>();
    sampleProducts.forEach(p => {
      if (Array.isArray(p.colors)) {
        p.colors.forEach(c => cols.add(c));
      }
    });
    return Array.from(cols);
  }, [sampleProducts]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (typeof addToCart === "function") addToCart(product);
    },
    [addToCart]
  );

  const handleToggleWishlist = useCallback(
    (productId: string) => {
      const product = sampleProducts.find((p) => p.id === productId);

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
    [addToWishlist, removeFromWishlist, isInWishlist, sampleProducts, toast]
  );

  const filteredProducts = useMemo(() => {
    let filtered = [...sampleProducts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.categoryName?.toLowerCase().includes(query) ||
          product.subCategory?.toLowerCase().includes(query) ||
          product.material?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.categoryName as string));
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = p.originalPrice ?? p.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(p => Array.isArray(p.colors) && filters.colors.some(color => p.colors?.includes(color)));
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

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
  }, [sampleProducts, searchQuery, filters, sortBy]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Products</h1>
          <p className="text-muted-foreground">
            Discover our handcrafted collection of traditional textiles
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-red-500">Error loading products: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {!loading && (
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Filter Toggle Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative w-full sm:w-fit"
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

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-fit"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
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
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {sampleProducts.length} products
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={() => handleToggleWishlist(product.id)}
                isWishlisted={
                  typeof isInWishlist === "function" && product.id
                    ? isInWishlist(product.id)
                    : false
                }
                isInCart={
                  typeof isInCart === "function" && product.id
                    ? isInCart(product.id)
                    : false
                }
              />
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No products found matching your criteria</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;