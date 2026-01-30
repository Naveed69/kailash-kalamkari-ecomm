import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard, Product } from "@/components/ProductCard";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";
import ReviewsSection from "@/components/ReviewsSection";
import { OurJourneySection } from "@/components/OurJourneySection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MainCategories } from "@/components/ui/categoryFilter";

import carouselImage1 from "@/assets/carousel/Video/video1.mp4";
import carouselImage2 from "@/assets/carousel/Video/video2.mp4";
import carouselImage3 from "@/assets/carousel/Video/video3.mp4";
import carouselImage4 from "@/assets/carousel/Video/video4.mp4";
import { MobileNavbar } from "../components/ui/MobileNavbar";

import { useInventory } from "@/contexts/InventoryContext";
// import { sampleProducts as defaultSampleProducts } from "@/data/products";
import { CategoryCard } from "@/components/ui/categoryCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Heritage from "@/assets/Heritage/Heritage.jpeg";
import Gallery from "./Gallery";

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

// Carousel slides static data
const carouselSlides = [
  {
    video: carouselImage3,
    title: "Bangalore Silk Sarees",
    description:
      "Luxurious silk sarees handwoven in Bangalore, perfect for grand occasions.",
    button: {
      text: "Explore Bangalore Silk",
      action: "products",
    },
  },
  {
    video: carouselImage4,
    title: "Traditional Silks",
    description:
      "Celebrate traditions with elegant silk sarees featuring timeless motifs.",
    button: {
      text: "Shop Traditional",
      action: "products",
    },
  },
  {
    video: carouselImage1,
    title: "Kanchipuram Pattu Sarees",
    description:
      "Authentic Kanchipuram silk sarees with intricate handwoven designs.",
    button: {
      text: "View Kanchipuram Collection",
      action: "products",
    },
  },
  {
    video: carouselImage2,
    title: "Modern Kanchipuram",
    description:
      "Discover modern interpretations of Kanchipuram sarees with contemporary flair.",
    button: {
      text: "See New Arrivals",
      action: "products",
    },
  },
];

const Index = () => {
  const { categories = [], products = [] } = useInventory() || {};
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cart = { totalItems: 0 }, addToCart, isInCart } = useCart() || {};
  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist() || {};
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  
  // If categories is array of objects with 'category' field, else fallback to []
  const mainCategories = useMemo(
    () =>
      Array.isArray(categories)
        ? categories.map((item: any) => item?.category ?? "")
        : [],
    [categories]
  );

  // Use dynamic products from inventory
  const sampleProducts = Array.isArray(products) ? products : [];

  // Function to render product cards
  const renderProductCards = useCallback(
    (products: Product[]) => {
      if (!Array.isArray(products)) return null;
      return products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onToggleWishlist={() => handleToggleWishlist(product.id)}
          isWishlisted={typeof isInWishlist === "function" && product.id ? isInWishlist(product.id) : false}
          isInCart={typeof isInCart === "function" && product.id ? isInCart(product.id) : false}
        />
      ));
    },
    [isInWishlist, isInCart]
  );

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

  const sampleImages = carouselSlides.map((slide) => slide.image);

  // Handle cart and wishlist actions
  const handleAddToCart = useCallback(
    (product: Product) => {
      if (typeof addToCart === "function") addToCart(product);
    },
    [addToCart]
  );

  const handleToggleWishlist = useCallback(
    (productId: string) => {
      if (!sampleProducts || !Array.isArray(sampleProducts)) return;
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

  // Carousel navigation
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % carouselSlides.length);
  }, []);
  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, []);

  // Carousel auto transition

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get category data
  const categoryData = useMemo(() => {
    if (!filters.selectedCategories || !Array.isArray(categories)) return null;
    const cat = categories.find(
      (item: any) => item?.category === filters.selectedCategories
    ) as FashionProductCategory | undefined;
    return Array.isArray(cat?.subCategories) ? cat.subCategories : null;
  }, [filters.selectedCategories, categories]);

  // Get subcategory data
  const subCategoryData = useMemo(() => {
    if (
      !filters.selectedCategories ||
      !activeSubcategory ||
      !Array.isArray(categories)
    )
      return null;
    const cat = categories.find(
      (item: any) => item?.category === filters.selectedCategories
    ) as FashionProductCategory | undefined;
    if (!cat || !Array.isArray(cat.subCategories)) return null;

    const subCat = cat.subCategories.find(
      (sub) => sub?.name === activeSubcategory
    );
    return Array.isArray(subCat?.products) ? subCat.products : null;
  }, [filters.selectedCategories, activeSubcategory, categories]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(sampleProducts)) return [];

    // If no filters are applied and no search query, return all products
    const noFiltersApplied =
      filters.categories.length === 0 &&
      filters.colors.length === 0 &&
      !filters.inStock &&
      filters.priceRange[0] === 0 &&
      filters.priceRange[1] >= 10000 &&
      !searchQuery;

    let sortedProducts = [...sampleProducts];

    if (noFiltersApplied) {
      sortedProducts.sort((a, b) => {
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
      return sortedProducts;
    }

    let filtered = sampleProducts.filter((product) => {
      if (
        searchQuery &&
        !product.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.some((cat) =>
          typeof cat === "string"
            ? cat === product.category
            : (cat as any)?.name === product.category
        )
      ) {
        return false;
      }
      // Price filter
      const price = product.originalPrice ?? product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
      // Color filter
      if (
        filters.colors.length > 0 &&
        !(Array.isArray(product.colors) &&
          filters.colors.some((color) => product.colors?.includes(color)))
      ) {
        return false;
      }
      // Stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }
      return true;
    });

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

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      {isProductActive && isAboutUsActive && (
        <section className="relative min-h-[40vh] md:min-h-[20vh] bg-gradient-to-r from-primary/10 to-accent/10 flex items-center">
          <div className="relative flex w-full overflow-hidden">
            {/* Carousel with Content */}
            <div className="relative w-full h-[400px] overflow-hidden">
              {carouselSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 
                    ${index === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                  `}
                  style={{ zIndex: index === current ? 2 : 1 }}
                >
                  <video
                  src={slide.video}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                  {/* Content overlay per slide */}
                  <div className="absolute top-0 left-0 w-full h-full flex items-center">
                    <div className="px-10 max-w-2xl text-left ml-0 mr-auto">
                      <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-white text-muted-foreground text-sm md:text-base lg:text-lg mb-6">
                        {slide.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {slide.button && (
                          <Button
                            size="lg"
                            onClick={() => {
                              if (
                                slide.button.action === "products" &&
                                typeof document !== "undefined"
                              ) {
                                const el = document.getElementById("products");
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth" });
                                }
                              }
                            }}
                            className="bg-[#D49217] hover:bg-[#cf972fff]"
                          >
                            {slide.button.text}
                          </Button>
                        )}
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
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
           
            {/* Carousel Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full ${current === index ? "bg-white" : "bg-gray-400"
                    }`}
                  aria-label={`Go to Slide ${index + 1}`}
                  type="button"
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
                  categories={[]} // Intentionally left as [], provide real one if needed
                  mainCategories={mainCategories}
                  colors={[]}
                  maxPrice={10000}
                  setActiveCategory={setActiveCategory}
                  setSubCategoryActiveCategory={setSubCategoryActive}
                />
              </div>

              {/* Mobile View Nav Bar */}
              <div className="block lg:hidden w-full sticky top-[90px] z-40">
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
                        {filteredProducts?.length ?? 0} products found
                      </span>
                      {searchQuery && (
                        <Badge variant="secondary">
                          Search: "{searchQuery}"
                        </Badge>
                      )}
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
                )}

                {/* Categories */}
                {activeCategory && !isSubcategoryActive && Array.isArray(categoryData) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    {categoryData.map((categoryItem: any) => (
                      <div
                        key={categoryItem.name}
                        onClick={() => {
                          setActiveSubcategory(categoryItem.name);
                          setSubCategoryActive(true);
                        }}
                        className="cursor-pointer"
                      >
                        <CategoryCard
                          name={categoryItem.name}
                          image={categoryItem.subCategoriesImage}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Products Grid */}
                {!activeCategory && !isSubcategoryActive && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {isSubcategoryActive && Array.isArray(subCategoryData) && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subCategoryData.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={() =>
                          handleToggleWishlist(product.id)
                        }
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
      {/* {isAboutUsActive && <OurJourneySection />} */}

      <Gallery isFromHome={true}/>

      {/* Reviews Section */}
      {isAboutUsActive && <ReviewsSection />}

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