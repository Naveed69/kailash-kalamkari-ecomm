import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters, FilterState } from "@/components/ProductFilters";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";
import { ReviewsSection } from "@/components/ReviewsSection";
import { OurJourneySection } from "@/components/OurJourneySection";
import { FeaturesProcessSection } from "@/components/FeaturesProcessSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MainCategories } from "@/components/ui/categoryFilter";
import { fashionProducts } from "@/data/products";
import {
  sampleProducts,
  categories,
  mainCategories,
  colors,
  maxPrice,
} from "@/data/products";
import kalamkariHero from "@/assets/kalamkari-hero.jpg";
import kalamkariProducts from "@/assets/kalamkari-products.jpg";
import { CatogaryCard } from "@/components/ui/categoryCard";
const Index = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name">(
    "name"
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [issubcategoryactiveCategory, setSubCategoryActiveCategory] =
    useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [isAboutUsActive, setIsAboutUsActive] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    mainCategories: [],
    selectedCategories: "",
    priceRange: [0, maxPrice],
    colors: [],
    inStock: false,
  });

  //navbar product click
  const [isProductActive, setProductActive] = useState(false);
  //crousel
  const sampleImages = [
    "https://picsum.photos/id/1015/800/400",
    "https://picsum.photos/id/1016/800/400",
    "https://picsum.photos/id/1018/800/400",
  ];
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % sampleImages.length);
  };

  const prevSlide = () => {
    setCurrent(
      (prev) => (prev - 1 + sampleImages.length) % sampleImages.length
    );
  };

  const categoryData = useMemo(() => {
    let cat = fashionProducts.find(
      (item) => item.category === filters.selectedCategories
    );
    if (cat) return cat.subCategories;
    return null;
  }, [filters.selectedCategories]);

  const subCategoryData = useMemo(() => {
    let cat = fashionProducts.find(
      (item) => item.category === filters.selectedCategories
    );
    if (cat)
      for (let i = 0; i < cat.subCategories.length; i++)
        if (cat.subCategories[i].name === activeSubcategory) {
          return cat.subCategories[i].products;
        }

    return null;
  }, [activeSubcategory]);

  const filteredProducts = useMemo(() => {
    let filtered = sampleProducts.filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      // Price filter
      const price = product.originalPrice || product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Color filter
      if (
        filters.colors.length > 0 &&
        !filters.colors.some((color) => product.colors.includes(color))
      ) {
        return false;
      }

      // Stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }

      return true;
    });

    // Sort products
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

  const handleAddToCart = (product: any) => {
    setCartItems((prev) => [...prev, product.id]);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistItems((prev) => {
      const isInWishlist = prev.includes(productId);
      const product = sampleProducts.find((p) => p.id === productId);

      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: `${product?.name} ${
          isInWishlist ? "removed from" : "added to"
        } your wishlist.`,
      });

      return isInWishlist
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.length}
        wishlistCount={wishlistItems.length}
        onCartClick={() =>
          toast({
            title: "Cart",
            description: "Cart functionality coming soon!",
          })
        }
        onWishlistClick={() =>
          toast({
            title: "Wishlist",
            description: "Wishlist functionality coming soon!",
          })
        }
        onWhatsAppClick={() => setIsWhatsAppOpen(true)}
        onSearchChange={setSearchQuery}
        setProductActive={setProductActive}
        setIsAboutUsActive={setIsAboutUsActive}
      />

      {/* Hero Section */}
      {!isProductActive && !isAboutUsActive ? (
        <section className="relative min-h-[40vh] md:min-h-[50vh] bg-gradient-to-r from-primary/10 to-accent/10 flex items-center">
          <div className="relative flex w-full overflow-hidden">
            {/* Images */}
            <img
              src={sampleImages[current]}
              alt="carousel"
              className="w-full h-[400px] object-cover transition-all duration-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            {/* Overlay content */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center">
              <div className="mx-auto px-6 max-w-2xl text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                  Authentic Kalamkari Art
                </h1>
                <p className="text-white text-muted-foreground text-sm md:text-base lg:text-lg mb-6">
                  Discover the timeless beauty of hand-painted Kalamkari
                  textiles. Traditional craftsmanship passed down through
                  generations since 1984.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() =>
                      document
                        .getElementById("products")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Shop Collection
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsWhatsAppOpen(true)}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>

            {/* Left Button */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
            >
              {"<"}
            </button>

            {/* Right Button */}
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
            >
              {">"}
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {sampleImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full ${
                    current === index ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <></>
      )}

      {/* Products Section */}
      {!isAboutUsActive && (
        <section id="products" className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Our Collection
              </h2>
              <p className="text-muted-foreground">
                Handcrafted with love, each piece tells a story of tradition and
                artistry.
              </p>
            </div>

            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <div className="w-80 flex-shrink-0 hidden lg:block">
                {/* <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                category={category}
                colors={colors}
                maxPrice={maxPrice}
                setActiveCategory={setActiveCategory}
              /> */}
                <MainCategories
                  filters={filters}
                  onFiltersChange={setFilters}
                  mainCategories={mainCategories}
                  setActiveCategory={setActiveCategory}
                  setSubCategoryActiveCategory={setSubCategoryActiveCategory}
                />
              </div>

              {/* Products Grid container*/}
              <div className="flex-1">
                {/* Sort and Results Info */}
                {!activeCategory && (
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {filteredProducts.length} products found
                      </span>
                      {searchQuery && (
                        <Badge variant="secondary">
                          Search: "{searchQuery}"
                        </Badge>
                      )}
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-sm border border-border rounded-md px-3 py-2 bg-background"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                )}

                {/* Categories */}
                {activeCategory && !issubcategoryactiveCategory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryData.map((categoryItem) => (
                      <span
                        key={categoryItem.name}
                        onClick={() => {
                          setActiveSubcategory(categoryItem.name);
                          setSubCategoryActiveCategory(true);
                        }}
                      >
                        <CatogaryCard
                          key={categoryItem.name}
                          category={filters.selectedCategories}
                          name={categoryItem.name}
                          image={categoryItem.subCategoriesImage}
                        />
                      </span>
                    ))}
                  </div>
                )}

                {/* on loadpage Products Grid */}
                {!activeCategory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlistItems.includes(product.id)}
                      />
                    ))}
                  </div>
                )}

                {/* products grid on sub category */}
                {issubcategoryactiveCategory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subCategoryData.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlistItems.includes(product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {!isProductActive && (
        <section id="about" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-in-left">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Heritage of Kalamkari Art
                </h2>
                <p className="text-muted-foreground mb-4">
                  Since 1984, Kailash Kalamkari has been preserving the ancient
                  art of hand-painted textiles. Our skilled artisans use
                  traditional techniques and natural dyes to create unique
                  pieces that celebrate Indian heritage.
                </p>
                <p className="text-muted-foreground mb-6">
                  Each piece is meticulously crafted using organic cotton and
                  natural dyes extracted from plants, making our products
                  eco-friendly and sustainable.
                </p>
                <Button onClick={() => setIsWhatsAppOpen(true)}>
                  Learn More About Our Process
                </Button>
              </div>
              <div className="relative animate-slide-in-right">
                <img
                  src={kalamkariProducts}
                  alt="Kalamkari craftsmanship"
                  className="rounded-lg shadow-lg w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Journey Section */}
      {!isProductActive && <OurJourneySection />}

      {/* Features & Process Section */}
      {/* <FeaturesProcessSection onWhatsAppClick={() => setIsWhatsAppOpen(true)} /> */}

      {/* Reviews Section */}
      {!isProductActive && !isAboutUsActive && <ReviewsSection />}

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Own a Piece of History?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of art lovers who have made kalamkari a part of their
            lives. Each purchase supports traditional artisans and preserves
            cultural heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-background text-foreground hover:bg-background/90"
            >
              Browse Collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsWhatsAppOpen(true)}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Contact Expert
            </Button>
          </div>
        </div>
      </section>

      {/* WhatsApp Popup */}
      <WhatsAppPopup
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onOpen={() => setIsWhatsAppOpen(true)}
      />
    </div>
  );
};

export default Index;
