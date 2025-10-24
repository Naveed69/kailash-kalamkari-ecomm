import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductCard, Product } from "@/components/ProductCard";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";
import { ReviewsSection } from "@/components/ReviewsSection";
import { OurJourneySection } from "@/components/OurJourneySection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MainCategories } from "@/components/ui/categoryFilter";

import carouselImage1 from "@/assets/carousel/KANCHIPURAM PATTU SAREES.png";
import carouselImage2 from "@/assets/carousel/KANCHIPURAM PATTU SAREES2.png";
import carouselImage3 from "@/assets/carousel/BANGALORE SILK SAREES.png";
import carouselImage4 from "@/assets/carousel/BANGALORE SILK SAREES2.png";
import { MobileNavbar } from "../components/ui/MobileNavbar";

import { useInventory } from "@/contexts/InventoryContext";
import { sampleProducts } from "@/data/products";
import kalamkariProducts from "@/assets/kalamkari-products.jpg";
import { CatogaryCard } from "@/components/ui/categoryCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Footer from "@/components/Footer";
import Heritage from "@/assets/Heritage/Heritage.jpeg";

// Define the shape of our fashion products from the data
interface FashionProductCategory {
  category: string;
  subCategories: Array<{
    name: string;
    subCategoriesImage: string;
    products: Product[];
  }>;
}

type Category = {
  id: string;
  name: string;
  image: string;
  subCategories: Array<{
    name: string;
    subCategoriesImage: string;
    products: Product[];
  }>;
};

type MainCategory = {
  id: string;
  name: string;
  image: string;
};

interface FilterState {
  categories: string[];
  mainCategories: string[];
  selectedCategories: string;
  priceRange: [number, number];
  colors: string[];
  inStock: boolean;
}

const Index = () => {
  const { categories } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cart, addToCart, isInCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlist();
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const mainCategories = categories.map((item) => item.category);
  // Function to render product cards
  const renderProductCards = (products: Product[]) => {
    return products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onAddToCart={handleAddToCart}
        onToggleWishlist={() => handleToggleWishlist(product.id)}
        isWishlisted={isInWishlist(product.id)}
        isInCart={isInCart(product.id)}
      />
    ));
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name">(
    "name"
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSubcategoryActive, setSubCategoryActive] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [isAboutUsActive, setIsAboutUsActive] = useState(true);
  const [isProductActive, setProductActive] = useState(true);
  const [current, setCurrent] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    mainCategories: [],
    selectedCategories: "",
    priceRange: [0, 10000],
    colors: [],
    inStock: false,
  });

  //crousel images
  const sampleImages = [
    carouselImage3,
    carouselImage4,
    carouselImage1,
    carouselImage2,
  ];

  
  // Handle cart and wishlist actions
  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleToggleWishlist = (productId: string) => {
    const product = sampleProducts.find((p) => p.id === productId);

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      toast({
        title: "Removed from wishlist",
        description: `${product?.name} removed from your wishlist.`,
      });
    } else if (product) {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} added to your wishlist.`,
      });
    }
  };

  // Carousel navigation
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % sampleImages.length);
  };

  const prevSlide = () => {
    setCurrent(
      (prev) => (prev - 1 + sampleImages.length) % sampleImages.length
    );
  };

  // Carousel auto transition

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sampleImages.length);
    }, 5000); // change every 3 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // Get category data
  const categoryData = useMemo(() => {
    if (!filters.selectedCategories) return null;
    const cat = categories.find(
      (item) => item.category === filters.selectedCategories
    ) as FashionProductCategory | undefined;
    return cat?.subCategories || null;
  }, [filters.selectedCategories]);

  // Get subcategory data
  const subCategoryData = useMemo(() => {
    if (!filters.selectedCategories || !activeSubcategory) return null;
    const cat = categories.find(
      (item) => item.category === filters.selectedCategories
    ) as FashionProductCategory | undefined;
    if (!cat) return null;

    const subCat = cat.subCategories.find(
      (sub) => sub.name === activeSubcategory
    );
    return subCat?.products || null;
  }, [filters.selectedCategories, activeSubcategory]);

const filteredProducts = useMemo(() => {
  // If no filters are applied and no search query, return all products
  const noFiltersApplied =
    filters.categories.length === 0 &&
    filters.colors.length === 0 &&
    !filters.inStock &&
    filters.priceRange[0] === 0 &&
    filters.priceRange[1] >= 10000 &&
    !searchQuery;

  if (noFiltersApplied) {
    return [...sampleProducts].sort((a, b) => {
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
  }

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
      !filters.categories.some((cat) =>
        typeof cat === "string"
          ? cat === product.category
          : cat.name === product.category
      )
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
      !filters.colors.some((color) => product.colors?.includes(color))
    ) {
      return false;
    }

    // Stock filter
    if (filters.inStock && !product.inStock) {
      return false;
    }

    return true;
  });

  // ✅ Apply sorting to the filtered list
  return filtered.sort((a, b) => {
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
}, [sampleProducts, searchQuery, filters, sortBy]);


  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cart.totalItems}
        wishlistCount={wishlist.length}
        onCartClick={() => navigate("/cart")}
        onWhatsAppClick={() => setIsWhatsAppOpen(true)}
        onSearchChange={setSearchQuery}
        setProductActive={setProductActive}
        setIsAboutUsActive={setIsAboutUsActive}
      />

      {/* Hero Section */}
      {isProductActive && isAboutUsActive && (
        <section className="relative min-h-[40vh] md:min-h-[20vh] bg-gradient-to-r from-primary/10 to-accent/10 flex items-center">
          <div className="relative flex w-full overflow-hidden">
            <div className="relative w-full h-[400px] overflow-hidden">
              {sampleImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`carousel-${index}`}
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

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
                    className="bg-[#D49217] hover:bg-[#cf972fff]"
                  >
                    Shop Collection
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-white"
                    size="lg"
                    onClick={() => setIsWhatsAppOpen(true)}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
            >
              {"<"}
            </button>

            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
            >
              {">"}
            </button>

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
      )}

      {/* Products Section */}
      {isProductActive && (
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

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              {/* Desktop View Side Bar */}
              <div className="w-80 flex-shrink-0 hidden lg:block">
                <MainCategories
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={[]}
                  mainCategories={mainCategories}
                  colors={[]}
                  maxPrice={10000}
                  setActiveCategory={setActiveCategory}
                  setSubCategoryActiveCategory={setSubCategoryActive}
                />
              </div>

              {/* Mobile View Nav Bar */}
              <div className="block lg:hidden w-full sticky top-[70px] z-40">
                <MobileNavbar
                  filters={filters}
                  onFiltersChange={setFilters}
                  mainCategories={mainCategories}
                  setActiveCategory={setActiveCategory}
                  setSubCategoryActiveCategory={setSubCategoryActive}
                />
              </div>
              {/* Products Grid */}
              <div className="flex-1">
                {/* Sort and Results Info */}
                {(!activeCategory || isSubcategoryActive) && (
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
                {activeCategory && !isSubcategoryActive && categoryData && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    {categoryData.map((categoryItem) => (
                      <div
                        key={categoryItem.name}
                        onClick={() => {
                          setActiveSubcategory(categoryItem.name);
                          setSubCategoryActive(true);
                        }}
                        className="cursor-pointer"
                      >
                        <CatogaryCard
                          category={filters.selectedCategories}
                          name={categoryItem.name}
                          image={categoryItem.subCategoriesImage}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Products Grid */}
                {!activeCategory && !isSubcategoryActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderProductCards(filteredProducts)}
                  </div>
                )}

                {/* Back to Categories Button */}
                {isSubcategoryActive && (
                  <div className="mb-6 ">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubCategoryActive(false);
                        setActiveSubcategory(null);
                      }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Back to Categories
                    </Button>
                    <h3 className="text-2xl font-semibold mb-4">
                      {activeSubcategory}
                    </h3>
                  </div>
                )}

                {/* Products in Subcategory */}
                {isSubcategoryActive && subCategoryData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subCategoryData.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={() =>
                          handleToggleWishlist(product.id)
                        }
                        isWishlisted={isInWishlist(product.id)}
                        isInCart={isInCart(product.id)}
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
      {isAboutUsActive && (
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
                <Button
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="bg-[#d49217ff] hover:bg-[#d49217ff]"
                >
                  Learn More About Our Process
                </Button>
              </div>
              <div className="relative animate-slide-in-right">
                <img
                  src={Heritage}
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
      {isAboutUsActive && <OurJourneySection />}

      {/* Reviews Section */}
      {isAboutUsActive && <ReviewsSection />}

      <Footer />

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
