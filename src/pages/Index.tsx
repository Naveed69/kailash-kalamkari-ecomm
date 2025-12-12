import { useState, useMemo, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ProductCard, Product } from "@/components/ProductCard"
import { WhatsAppPopup } from "@/components/WhatsAppPopup"
import ReviewsSection from "@/components/ReviewsSection"
import { OurJourneySection } from "@/components/OurJourneySection"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ProductFilter, FilterState } from "@/components/ui/ProductFilter"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

import carouselImage1 from "@/assets/carousel/KANCHIPURAM PATTU SAREES.png"
import carouselImage2 from "@/assets/carousel/KANCHIPURAM PATTU SAREES2.png"
import carouselImage3 from "@/assets/carousel/BANGALORE SILK SAREES.png"
import carouselImage4 from "@/assets/carousel/BANGALORE SILK SAREES2.png"
import { MobileNavbar } from "../components/ui/MobileNavbar"

import { useInventory } from "@/contexts/InventoryContext"
import { CategoryCard } from "@/components/ui/categoryCard"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import Heritage from "@/assets/Heritage/Heritage.jpeg"

// Define the shape of our fashion products from the data
interface FashionProductCategory {
  category: string
  subCategories: Array<{
    name: string
    subCategoriesImage: string
    products: Product[]
  }>
}

type Category = {
  id: string
  name: string
  image: string
  subCategories: Array<{
    name: string
    subCategoriesImage: string
    products: Product[]
  }>
}

type MainCategory = {
  id: string
  name: string
  image: string
}

const Index = () => {
  const { categories = [], products = [] } = useInventory() || {}
  const { toast } = useToast()
  const navigate = useNavigate()
  const { cart = { totalItems: 0 }, addToCart, isInCart } = useCart() || {}
  const {
    wishlist = [],
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist() || {}
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false)
  const [current, setCurrent] = useState(0)

  const carouselSlides = useMemo(
    () => [
      {
        image: carouselImage1,
        title: "Luxurious Kanchipuram Sarees",
        description:
          "Handwoven with pure silk and zari, our Kanchipuram sarees are a testament to timeless elegance.",
        button: {
          text: "Shop Now",
          action: "products",
        },
      },
      {
        image: carouselImage2,
        title: "Elegant Bangalore Silk",
        description:
          "Experience the rich texture and vibrant colors of our exclusive Bangalore silk collection.",
        button: {
          text: "Explore Collection",
          action: "products",
        },
      },
      {
        image: carouselImage3,
        title: "Traditional Kalamkari Art",
        description:
          "Discover the ancient art of Kalamkari in our exquisite collection of hand-painted sarees.",
        button: {
          text: "View Gallery",
          action: "gallery",
        },
      },
      {
        image: carouselImage4,
        title: "Premium Silk Sarees",
        description:
          "Indulge in the finest quality silk sarees, perfect for special occasions.",
        button: {
          text: "Shop Now",
          action: "products",
        },
      },
    ],
    []
  )

  const mainCategories = useMemo(
    () =>
      Array.isArray(categories)
        ? categories.map((item: any) => item?.category ?? "")
        : [],
    [categories]
  )

  const sampleProducts = Array.isArray(products) ? products : []

  const renderProductCards = useCallback(
    (products: Product[]) => {
      if (!Array.isArray(products)) return null
      return products.map((product) => (
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
      ))
    },
    [isInWishlist, isInCart]
  )

  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name">(
    "name"
  )
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isSubcategoryActive, setSubCategoryActive] = useState(false)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  )
  const [isAboutUsActive, setIsAboutUsActive] = useState(true)
  const [isProductActive, setProductActive] = useState(true)

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000000],
    colors: [],
    inStock: false,
  })

  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      if (p.categoryName) cats.add(p.categoryName)
    })
    return Array.from(cats)
  }, [products])

  const availableColors = useMemo(() => {
    const cols = new Set<string>()
    products.forEach((p) => {
      if (Array.isArray(p.colors)) {
        p.colors.forEach((c) => cols.add(c))
      }
    })
    return Array.from(cols)
  }, [products])

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000000],
      colors: [],
      inStock: false,
    })
  }

  const activeFilterCount =
    filters.categories.length +
    filters.colors.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000000 ? 1 : 0)

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (typeof addToCart === "function") addToCart(product)
    },
    [addToCart]
  )

  const handleToggleWishlist = useCallback(
    (productId: string) => {
      if (!sampleProducts || !Array.isArray(sampleProducts)) return
      const product = sampleProducts.find((p) => p.id === productId)

      if (typeof isInWishlist === "function" && isInWishlist(productId)) {
        if (typeof removeFromWishlist === "function") {
          removeFromWishlist(productId)
        }
      } else if (product) {
        if (typeof addToWishlist === "function") {
          addToWishlist(product)
        }
      }
    },
    [addToWishlist, removeFromWishlist, isInWishlist, sampleProducts]
  )

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % carouselSlides.length)
  }, [])
  const prevSlide = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    )
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const categoryData = useMemo(() => {
    if (!activeCategory || !Array.isArray(categories)) return null
    const cat = categories.find(
      (item: any) => item?.category === activeCategory
    ) as FashionProductCategory | undefined
    return Array.isArray(cat?.subCategories) ? cat.subCategories : null
  }, [activeCategory, categories])

  const subCategoryData = useMemo(() => {
    if (!activeCategory || !activeSubcategory || !Array.isArray(categories))
      return null
    const cat = categories.find(
      (item: any) => item?.category === activeCategory
    ) as FashionProductCategory | undefined
    if (!cat || !Array.isArray(cat.subCategories)) return null

    const subCat = cat.subCategories.find(
      (sub) => sub?.name === activeSubcategory
    )
    return Array.isArray(subCat?.products) ? subCat.products : null
  }, [activeCategory, activeSubcategory, categories])

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(sampleProducts)) return []

    const noFiltersApplied =
      filters.categories.length === 0 &&
      filters.colors.length === 0 &&
      !filters.inStock &&
      filters.priceRange[0] === 0 &&
      filters.priceRange[1] >= 1000000 &&
      !activeCategory &&
      !isSubcategoryActive

    const sortedProducts = [...sampleProducts]

    if (noFiltersApplied) {
      sortedProducts.sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price
          case "price-high":
            return b.price - a.name.localeCompare(b.name)
        }
      })
      return sortedProducts
    }

    let filtered = [...sampleProducts]

    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.categoryName as string)
      )
    }

    if (activeCategory && !isSubcategoryActive) {
      filtered = filtered.filter(
        (product) => product.category === categoryData?.name
      )
    }

    if (isSubcategoryActive && activeSubcategory) {
      filtered = filtered.filter(
        (product) => product.subCategory === activeSubcategory
      )
    }

    filtered = filtered.filter((product) => {
      const price = product.originalPrice ?? product.price
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    if (filters.colors.length > 0) {
      filtered = filtered.filter(
        (product) =>
          Array.isArray(product.colors) &&
          filters.colors.some((color) => product.colors?.includes(color))
      )
    }

    if (filters.inStock) {
      filtered = filtered.filter((product) => product.inStock)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.name.localeCompare(b.name)
      }
    })
    return filtered
  }, [
    sampleProducts,
    filters,
    sortBy,
    activeCategory,
    isSubcategoryActive,
    activeSubcategory,
    categoryData,
  ])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
                    ${
                      index === current
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }
                  `}
                  style={{ zIndex: index === current ? 2 : 1 }}
                >
                  <img
                    src={slide.image}
                    alt={`carousel-${index}`}
                    className="w-full h-full object-cover"
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
                                const el = document.getElementById("products")
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth" })
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
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-20"
              aria-label="Previous Slide"
              type="button"
            >
              {"<"}
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-20"
              aria-label="Next Slide"
              type="button"
            >
              {">"}
            </button>
            {/* Carousel Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full ${
                    current === index ? "bg-white" : "bg-gray-400"
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
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="relative w-full sm:w-fit"
                    >
                      <SlidersHorizontal className="h-5 w-5 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-primary">
                          {activeFilterCount}
                        </Badge>
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
              </div>

              {/* Mobile View Nav Bar */}
              <div className="block lg:hidden w-full sticky top-[70px] z-40">
                <MobileNavbar
                  filters={filters}
                  onFiltersChange={setFilters}
                  mainCategories={[]}
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
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          (e.target.value as
                            | "price-low"
                            | "price-high"
                            | "name") || "name"
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
                {activeCategory &&
                  !isSubcategoryActive &&
                  Array.isArray(categoryData) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                      {categoryData.map((categoryItem: any) => (
                        <div
                          key={categoryItem.name}
                          onClick={() => {
                            setActiveSubcategory(categoryItem.name)
                            setSubCategoryActive(true)
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
                        setSubCategoryActive(false)
                        setActiveSubcategory(null)
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
                  className="bg-[#D49217] hover:bg-[#cf972fff]"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Journey Section */}
      {isAboutUsActive && <OurJourneySection />}

      {/* Reviews Section */}
      {isAboutUsActive && <ReviewsSection />}

      {/* WhatsApp Popup */}
      <WhatsAppPopup
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onOpen={() => setIsWhatsAppOpen(true)}
      />
    </div>
  )
}

export default Index
