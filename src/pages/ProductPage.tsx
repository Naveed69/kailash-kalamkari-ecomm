import { useState, useMemo, useCallback } from "react";
import { ProductCard, Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  inStock: boolean;
}

const ProductsPage = () => {
  const { products = [], loading, error } = useInventory() || {};
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart() || {};
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist() || {};

  // Use real products from database
  const sampleProducts = Array.isArray(products) ? products : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name">("name");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 10000],
    colors: [],
    inStock: false,
  });

  // Extract unique categories and colors
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    sampleProducts.forEach(p => {
      if (p.category) cats.add(p.category);
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
    let filtered = sampleProducts.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false;
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
  }, [sampleProducts, searchQuery, filters, sortBy]);

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleColor = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 10000],
      colors: [],
      inStock: false,
    });
    setSearchQuery("");
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.colors.length + 
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0);

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
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-primary">{activeFilterCount}</Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    onClick={() => toggleCategory(cat)}
                  />
                </Badge>
              ))}
              {filters.colors.map(color => (
                <Badge key={color} variant="secondary" className="gap-1">
                  {color}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleColor(color)}
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

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-6 border border-border rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {availableCategories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="space-y-2">
                  {availableColors.map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={() => toggleColor(color)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Min Price</label>
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [Number(e.target.value), prev.priceRange[1]]
                      }))}
                      className="w-full px-3 py-2 border border-border rounded bg-background"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Max Price</label>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], Number(e.target.value)]
                      }))}
                      className="w-full px-3 py-2 border border-border rounded bg-background"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-semibold mb-3">Availability</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      inStock: e.target.checked 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

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
            <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default ProductsPage;