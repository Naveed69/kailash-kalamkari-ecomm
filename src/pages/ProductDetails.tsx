import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Minus,
  Plus,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CloudflareImage } from "@/components/images/CloudflareImage";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { isCloudflareId, resolveImageSrc } from "@/lib/cloudflareImages";
import { useRequireLogin } from "@/hooks/useRequireLogin";

// --- Components ---

const isProductDetailsDebugEnabled = () => {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("productDebug");
    if (param === "1") {
      window.localStorage.setItem("productDebug", "1");
      return true;
    }
    if (param === "0") {
      window.localStorage.removeItem("productDebug");
      return false;
    }
    return window.localStorage.getItem("productDebug") === "1";
  } catch {
    return false;
  }
};

const logProductDetailsDebug = (message: string, meta?: unknown) => {
  if (!isProductDetailsDebugEnabled()) return;
  console.info(`[ProductDetails] ${message}`, meta);
};

const logProductDetailsTable = (
  message: string,
  rows: Record<string, unknown>[],
) => {
  if (!isProductDetailsDebugEnabled()) return;
  console.info(`[ProductDetails] ${message}`);
  console.table(rows);
};

const classifyProductImageRef = (ref: string | null | undefined) => {
  const trimmed = (ref ?? "").trim();
  if (!trimmed) return "empty";
  if (isCloudflareId(trimmed)) return "cloudflare-id";
  if (trimmed.startsWith("https://imagedelivery.net/")) {
    return "cloudflare-delivery-url";
  }
  if (trimmed.includes("supabase.co/storage")) return "supabase-storage-url";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return "external-url";
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return "local-or-preview";
  }
  return "unknown";
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requireLogin } = useRequireLogin();
  
  // Contexts
  const { addToCart, isInCart, updateQuantity, getItemQuantity, removeFromCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { products = [] } = useInventory();
  const visibleProducts = useMemo(
    () =>
      Array.isArray(products)
        ? products.filter((product) => product.isVisible !== false)
        : [],
    [products],
  );

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shouldMountZoom, setShouldMountZoom] = useState(false);
  const [fullImageRef, setFullImageRef] = useState<string | null>(null);
  const [cachedFullImageRefs, setCachedFullImageRefs] = useState<string[]>([]);
  const [zoomMagnifier, setZoomMagnifier] = useState({
    visible: false,
    x: 50,
    y: 50,
  });
  // If true: keeps the full image mounted after first open (prevents any re-download but can use more memory).
  // If false: unmounts full image when modal is closed (better for low-end devices; browser cache still helps).
  const keepZoomFullImageMounted = true;

  // Find Product
  const product = visibleProducts.find((p) => p.id === id);

  useEffect(() => {
    logProductDetailsDebug("product lookup", {
      routeId: id,
      totalProducts: products.length,
      visibleProducts: visibleProducts.length,
      found: Boolean(product),
      product: product
        ? {
            id: product.id,
            name: product.name,
            category: product.category,
            inStock: product.inStock,
            image: product.image,
            imageSourceType: classifyProductImageRef(product.image),
            imagesCount: Array.isArray(product.images) ? product.images.length : 0,
            images: Array.isArray(product.images)
              ? product.images.map((ref, index) => ({
                  index,
                  ref,
                  sourceType: classifyProductImageRef(ref),
                }))
              : product.images,
          }
        : null,
    });
  }, [id, product, products.length, visibleProducts.length]);

  // Derived State
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return visibleProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, visibleProducts]);

  // Image Gallery Logic (migration-safe)
  // - If product.images exists, use it
  // - Else use [product.image]
  // - De-dupe to avoid duplicate requests/decodes
  const galleryImageRefs = useMemo(() => {
    if (!product) return [] as string[];

    const fromImages = Array.isArray(product.images) ? product.images : [];

    const base = (fromImages.length > 0 ? fromImages : [product.image]).filter(
      (v): v is string => typeof v === "string" && v.trim().length > 0,
    );

    const seen = new Set<string>();
    const out: string[] = [];
    for (const ref of base) {
      const trimmed = ref.trim();
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      out.push(trimmed);
    }
    return out;
  }, [product]);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setSelectedImageIndex(0);
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [id, product]);

  // Handlers
  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "inc") {
      if (quantity < 5) setQuantity((prev) => prev + 1);
      else toast({ title: "Max limit reached", description: "You can only buy up to 5 units of this item." });
    } else {
      if (quantity > 1) setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!requireLogin("add this item to your cart", `/product/${product.id}`)) {
      return;
    }
    
    const cartItemId = `${product.id}-${selectedColor || (product.colors && product.colors[0])}`;
    const inCart = isInCart(cartItemId);
    
    // If already in cart, update the quantity
    if (inCart) {
      const currentQuantity = getItemQuantity(cartItemId);
      updateQuantity(cartItemId, currentQuantity + quantity);
      
      toast({
        title: "Cart Updated!",
        description: "Product quantity has been updated",
        className: "bg-green-50 border-green-200",
      });
      return;
    }

    // Add new item with selected color and quantity
    const productWithColor = {
      ...product,
      selectedColor: selectedColor || (product.colors && product.colors[0])
    };
    
    addToCart(productWithColor as any, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!requireLogin("buy this item", `/product/${product.id}`)) return;
    handleAddToCart();
    navigate("/cart");
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (!requireLogin("save this item to your wishlist", `/product/${product.id}`)) {
      return;
    }
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const checkDelivery = () => {
    if (pincode.length !== 6) {
      toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit pincode.", variant: "destructive" });
      return;
    }
    setIsCheckingPincode(true);
    // Simulate API call
    setTimeout(() => {
      const date = new Date();
      date.setDate(date.getDate() + 5); // 5 days delivery
      setDeliveryDate(date.toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' }));
      setIsCheckingPincode(false);
      toast({ title: "Delivery Available", description: `Estimated delivery by ${date.toLocaleDateString()}`, className: "bg-green-50 border-green-200" });
    }, 1000);
  };

  const activeImageRef = useMemo(() => {
    if (!product) return null;
    return galleryImageRefs[selectedImageIndex] ?? product.image ?? null;
  }, [product, galleryImageRefs, selectedImageIndex]);

  const zoomMagnifierImage = useMemo(
    () => (fullImageRef ? resolveImageSrc(fullImageRef, "full") : null),
    [fullImageRef],
  );

  const openZoom = useCallback(() => {
    if (!activeImageRef) return;
    setShouldMountZoom(true);
    setFullImageRef((prev) => (prev === activeImageRef ? prev : activeImageRef));
    setCachedFullImageRefs((prev) =>
      prev.includes(activeImageRef) ? prev : [...prev, activeImageRef],
    );
    setZoomMagnifier({ visible: false, x: 50, y: 50 });
    setZoomOpen(true);
  }, [activeImageRef]);

  const handleZoomMagnifierMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = Math.min(
        100,
        Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
      );
      const y = Math.min(
        100,
        Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
      );
      setZoomMagnifier({ visible: true, x, y });
    },
    [],
  );

  const handleZoomMagnifierLeave = useCallback(() => {
    setZoomMagnifier((current) => ({ ...current, visible: false }));
  }, []);

  useEffect(() => {
    if (!product) return;
    logProductDetailsDebug("image refs", {
      productId: product.id,
      selectedImageIndex,
      activeImageRef,
      galleryImageRefs,
      resolved: {
        thumb: activeImageRef ? resolveImageSrc(activeImageRef, "thumb") : null,
        medium: activeImageRef ? resolveImageSrc(activeImageRef, "medium") : null,
        full: activeImageRef ? resolveImageSrc(activeImageRef, "full") : null,
      },
    });
    logProductDetailsTable(
      "gallery image audit",
      galleryImageRefs.map((ref, index) => ({
        index,
        selected: index === selectedImageIndex,
        sourceType: classifyProductImageRef(ref),
        imageRef: ref,
        thumbUrl: resolveImageSrc(ref, "thumb"),
        mediumUrl: resolveImageSrc(ref, "medium"),
        fullUrl: resolveImageSrc(ref, "full"),
      })),
    );
  }, [activeImageRef, galleryImageRefs, product, selectedImageIndex]);

  // When zoom is open, allow switching the zoomed image as the user changes thumbnails.
  // When zoom is closed, do not change the full image ref (prevents accidental full loads).
  useEffect(() => {
    if (!zoomOpen) return;
    if (!activeImageRef) return;
    setFullImageRef((prev) => (prev === activeImageRef ? prev : activeImageRef));
    setCachedFullImageRefs((prev) =>
      prev.includes(activeImageRef) ? prev : [...prev, activeImageRef],
    );
  }, [zoomOpen, activeImageRef]);

  useEffect(() => {
    if (!product) return;
    logProductDetailsDebug("zoom state", {
      productId: product.id,
      zoomOpen,
      shouldMountZoom,
      fullImageRef,
      cachedFullImageRefs,
      resolvedFullImage: fullImageRef
        ? resolveImageSrc(fullImageRef, "full")
        : null,
    });
  }, [cachedFullImageRefs, fullImageRef, product, shouldMountZoom, zoomOpen]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you are looking for might have been removed or is unavailable.</p>
        <Button onClick={() => navigate("/")} className="bg-[#D49217] hover:bg-[#b87d14]">
          Back to Home
        </Button>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 md:pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#D49217]">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-[#D49217]">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Image Gallery */}
          <div className="md:col-span-6 lg:col-span-7 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] md:aspect-square lg:aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
              <CloudflareImage
                imageRef={activeImageRef}
                variant="medium"
                alt={product.name}
                width={1000}
                height={1250}
                loading="eager"
                debugName={`product:${product.id}:main:${selectedImageIndex}`}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                onClick={openZoom}
              />

              {/* Zoom Modal (full loads only after click/tap) */}
              {shouldMountZoom && (
                <Dialog
                  open={zoomOpen}
                  onOpenChange={(open) => {
                    setZoomOpen(open);
                    if (!open && !keepZoomFullImageMounted) {
                      setShouldMountZoom(false);
                    }
                    if (!open) {
                      setZoomMagnifier((current) => ({
                        ...current,
                        visible: false,
                      }));
                    }
                  }}
                >
                  <DialogContent
                    forceMount
                    className="max-w-6xl w-[95vw] p-0 bg-black border-black/20"
                  >
                    <DialogTitle className="sr-only">
                      Zoomed view of {product.name}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Move over the product image to inspect the full-resolution Cloudflare image.
                    </DialogDescription>
                    <div
                      className="relative w-full h-[82vh] bg-black cursor-crosshair overflow-hidden"
                      onMouseMove={handleZoomMagnifierMove}
                      onMouseLeave={handleZoomMagnifierLeave}
                    >
                      {cachedFullImageRefs.map((ref) => (
                        <CloudflareImage
                          key={ref}
                          imageRef={ref}
                          variant="full"
                          context="zoom"
                          alt={product.name}
                          width={2000}
                          height={2500}
                          loading="eager"
                          decoding="async"
                          debugName={`product:${product.id}:zoom:${cachedFullImageRefs.indexOf(ref)}`}
                          className="absolute inset-0 w-full h-full object-contain select-none"
                          hidden={!zoomOpen || ref !== fullImageRef}
                          unmountOnHide={!keepZoomFullImageMounted}
                        />
                      ))}
                      {zoomMagnifier.visible && zoomMagnifierImage && (
                        <>
                          <div
                            className="pointer-events-none absolute z-10 hidden h-28 w-24 -translate-x-1/2 -translate-y-1/2 border border-white/80 bg-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.38),inset_0_0_0_1px_rgba(255,255,255,0.55)] backdrop-blur-[1px] md:block md:h-44 md:w-36"
                            style={{
                              left: `${zoomMagnifier.x}%`,
                              top: `${zoomMagnifier.y}%`,
                            }}
                          />
                          <div
                            className="pointer-events-none absolute right-4 top-1/2 z-20 hidden h-[min(680px,82vh)] w-[min(460px,42vw)] -translate-y-1/2 overflow-hidden rounded-lg border border-white/80 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.52),inset_0_0_0_1px_rgba(255,255,255,0.55)] md:block"
                            style={{
                              backgroundImage: `url("${zoomMagnifierImage}")`,
                              backgroundPosition: `${zoomMagnifier.x}% ${zoomMagnifier.y}%`,
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "320% auto",
                            }}
                          >
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Image Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!product.inStock && (
                  <Badge variant="destructive" className="px-3 py-1 text-sm font-medium shadow-sm">
                    Out of Stock
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm font-medium shadow-sm">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>

                            {/* Wishlist Button (Mobile Overlay) */}
                            <button 
                              onClick={handleToggleWishlist}
                              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm md:hidden"
                            >
                              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                            </button>                          </div>
              
                          {/* Thumbnail Strip */}
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {galleryImageRefs.map((imgRef, idx) => (
                              <button
                                key={imgRef}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={`
                                  relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                                  ${selectedImageIndex === idx ? "border-[#D49217] ring-2 ring-[#D49217]/20" : "border-transparent hover:border-slate-300"}
                                `}
                              >
                                <CloudflareImage
                                  imageRef={imgRef}
                                  variant="thumb"
                                  alt={`View ${idx + 1}`}
                                  width={400}
                                  height={500}
                                  debugName={`product:${product.id}:thumb:${idx}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
              
                        {/* RIGHT COLUMN: Product Info */}
                        <div className="md:col-span-6 lg:col-span-5 space-y-6 md:sticky md:top-24 h-fit">
                          
                          {/* Header Info */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h2 className="text-sm font-semibold text-[#D49217] tracking-wide uppercase mb-1">
                                  {product.category || "Kalamkari"}
                                </h2>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                                  {product.name}
                                </h1>
                              </div>
                                                          {/* Wishlist Button (Desktop) */}
                                                          <div className="flex items-center gap-2">
                                                            <Button
                                                              variant="outline"
                                                              size="icon"
                                                              onClick={handleToggleWishlist}
                                                              className="hidden md:flex rounded-full h-10 w-10 border-slate-200 hover:bg-slate-50 hover:border-[#D49217]"
                                                            >
                                                              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                                                            </Button>
                                                            <Button
                                                              variant="outline"
                                                              size="icon"
                                                              onClick={() => {
                                                                navigator.clipboard.writeText(window.location.href);
                                                                toast({
                                                                  title: "Link Copied!",
                                                                  description: "Product link copied to clipboard.",
                                                                  className: "bg-green-50 border-green-200",
                                                                });
                                                              }}
                                                              className="hidden md:flex rounded-full h-10 w-10 border-slate-200 hover:bg-slate-50 hover:border-[#D49217]"
                                                            >
                                                              <Share2 className="h-5 w-5 text-slate-600" />
                                                            </Button>
                                                          </div>                            </div>
              
                            {/* Rating Placeholder */}
                            <button
                              className="flex items-center gap-2"
                              onClick={() => {
                                const el = document.getElementById("reviews");
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth" });
                                }
                              }}
                            >
                              <div className="flex items-center bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs font-bold">
                                4.5 <Star className="h-3 w-3 ml-0.5 fill-current" />
                              </div>
                              <span className="text-sm text-muted-foreground border-l pl-2 ml-1">128 Ratings</span>
                            </button>
                          </div>
              
                          <Separator />
              
                          {/* Price Block */}
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-3">
                              <span className="text-3xl font-bold text-slate-900">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                              {product.originalPrice && (
                                <>
                                  <span className="text-lg text-muted-foreground line-through">
                                    ₹{product.originalPrice.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-lg font-semibold text-red-500">
                                    ({discountPercentage}% OFF)
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-green-600 font-medium">inclusive of all taxes</p>
                          </div>
              
                          {/* Color Selection */}
                          {product.colors && product.colors.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <span className="text-sm font-medium text-slate-900">
                                Select Color: <span className="text-muted-foreground font-normal capitalize">{selectedColor}</span>
                              </span>
                              <div className="flex flex-wrap gap-3">
                                {product.colors.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`
                                      group relative w-10 h-10 rounded-full flex items-center justify-center transition-all
                                      ${selectedColor === color ? "ring-2 ring-[#D49217] ring-offset-2" : "hover:ring-1 hover:ring-slate-300 hover:ring-offset-1"}
                                    `}
                                    title={color}
                                  >
                                    <span 
                                      className="w-full h-full rounded-full border border-slate-200 shadow-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                    {selectedColor === color && (
                                      <span className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
              
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700">Quantity:</span>
                            <div className="flex items-center border border-slate-300 rounded-md">
                              <button 
                                onClick={() => handleQuantityChange("dec")}
                                className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                disabled={quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange("inc")}
                                className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                disabled={quantity >= 5}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
              
                          {/* Action Buttons (Desktop) */}
                          <div className="hidden md:flex gap-3 pt-2">
                            <Button 
                              onClick={handleAddToCart}
                              disabled={!product.inStock}
                              variant="outline"
                              className="flex-1 h-12 text-base font-semibold border-[#D49217] text-[#D49217] hover:bg-[#D49217]/5"
                            >
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              {isInCart(`${product.id}-${selectedColor || (product.colors && product.colors[0])}`) ? "Update Cart" : "Add to Cart"}
                            </Button>
                            <Button 
                              onClick={handleBuyNow}
                              disabled={!product.inStock}
                              className="flex-1 h-12 text-base font-semibold bg-[#D49217] hover:bg-[#b87d14] text-white shadow-md hover:shadow-lg transition-all"
                            >
                              Buy Now
                            </Button>
                          </div>
              
                          {/* Delivery & Trust Info */}
                          <Card className="bg-slate-50 border-slate-200 shadow-sm">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center gap-3 text-sm text-slate-700">
                                <Truck className="h-5 w-5 text-[#D49217]" />
                                <div>
                                  <span className="font-semibold block text-slate-900">Free Pan-India Delivery</span>
                                  <span className="text-xs text-muted-foreground">We deliver to every pincode in India.</span>
                                </div>
                              </div>
                              <Separator />
                              <div className="flex items-center gap-3 text-sm text-slate-700">
                                <ShieldCheck className="h-5 w-5 text-[#D49217]" />
                                <div>
                                  <span className="font-semibold block text-slate-900">100% Authentic Kalamkari</span>
                                  <span className="text-xs text-muted-foreground">Hand-painted by master artisans of Srikalahasti.</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
              
                          {/* Handmade Disclaimer */}
                          <div className="bg-[#D49217]/5 border border-[#D49217]/20 rounded-lg p-4 text-sm text-[#8a5b05]">
                            <p className="font-semibold mb-1 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Handmade with Love
                            </p>
                            <p className="opacity-90 leading-relaxed">
                              This product is hand-painted using natural dyes. Slight irregularities in motifs, texture, and color are a hallmark of handcrafted products and add to their unique charm.
                            </p>
                          </div>
              
                          {/* Product Details Accordion */}
                          <Accordion type="single" collapsible className="w-full" defaultValue="description">
                            <AccordionItem value="description">
                              <AccordionTrigger className="text-base font-semibold">Product Description</AccordionTrigger>
                              <AccordionContent className="text-muted-foreground leading-relaxed">
                                {product.description}
                                <ul className="mt-4 space-y-2 list-disc list-inside">
                                  <li>Handcrafted by skilled artisans</li>
                                  <li>Premium quality {product.material || "Material"}</li>
                                  <li>Sustainable and eco-friendly dyes</li>
                                  <li>Perfect for special occasions</li>
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="specifications">
                              <AccordionTrigger className="text-base font-semibold">Product Details</AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                  <div className="text-muted-foreground">Material</div>
                                  <div className="font-medium">
                                    {product.material || "N/A"}
                                  </div>
                                  
                                  <div className="text-muted-foreground">Craft</div>
                                  <div className="font-medium">Srikalahasti Kalamkari</div>
                                  
                                  <div className="text-muted-foreground">Origin</div>
                                  <div className="font-medium">Andhra Pradesh, India</div>
              
                                  {/* Dynamic Specifications */}
                                  {product.specifications && Object.entries(product.specifications).length > 0 ? (
                                    Object.entries(product.specifications)
                                    .filter(([key]) => key.toLowerCase() !== 'material') // Exclude Material as it's shown above
                                    .map(([key, value]) => (
                                    <React.Fragment key={key}>
                                      <div className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                      <div className="font-medium">{value}</div>
                                    </React.Fragment>
                                  ))
                                  ) : (
                                    // Fallback content if no dynamic specifications
                                    <>
                                      <div className="text-muted-foreground">Pattern</div>
                                      <div className="font-medium">Hand-Painted Motifs</div>
                                      <div className="text-muted-foreground">Occasion</div>
                                      <div className="font-medium">Festive / Traditional</div>
                                    </>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="care">
                              <AccordionTrigger className="text-base font-semibold">Care Instructions</AccordionTrigger>
                              <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• <strong>Dry Clean Only:</strong> To maintain the vibrancy of natural dyes.</p>
                                <p>• <strong>Storage:</strong> Wrap in a muslin cloth and store in a dry place.</p>
                                <p>• <strong>Ironing:</strong> Iron on low heat on the reverse side.</p>
                                <p>• Avoid direct sunlight for long durations to prevent fading.</p>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
              
                        </div>
                      </div>
              
                      {/* Related Products Section */}
                      {relatedProducts.length > 0 && (
                        <div className="mt-16 md:mt-24">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Similar Products</h2>
                            <Link to="/products" className="text-[#D49217] font-medium hover:underline flex items-center gap-1">
                              View All <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map((related) => {
                              const relatedImageRef =
                                related.images?.[0] ?? related.image ?? null;
                              return (
                                <Link key={related.id} to={`/product/${related.id}`} className="group">
                                  <Card className="border-none shadow-none bg-transparent">
                                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                                      <CloudflareImage
                                        imageRef={relatedImageRef}
                                        variant="thumb"
                                        alt={related.name}
                                        width={400}
                                        height={500}
                                        debugName={`related:${related.id}:thumb`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    {!related.inStock && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/50 rounded">Out of Stock</span>
                                      </div>
                                    )}
                                    </div>
                                    <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-[#D49217] transition-colors">
                                      {related.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-1">{related.category}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">₹{related.price.toLocaleString("en-IN")}</span>
                                      {related.originalPrice && (
                                        <span className="text-xs text-muted-foreground line-through">₹{related.originalPrice.toLocaleString("en-IN")}</span>
                                      )}
                                    </div>
                                  </Card>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
              
                      {/* Reviews Section */}
                      <div id="reviews" className="mt-16 md:mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Ratings & Reviews</h2>
                        {/* Dummy reviews */}
                        <div className="space-y-6">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs font-bold">
                                  4 <Star className="h-3 w-3 ml-0.5 fill-current" />
                                </div>
                                <h3 className="font-semibold">Great Product!</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">"This is a great product. I would recommend it to anyone."</p>
                              <div className="text-xs text-muted-foreground mt-2">
                                <span>- John Doe, 2 days ago</span>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs font-bold">
                                  5 <Star className="h-3 w-3 ml-0.5 fill-current" />
                                </div>
                                <h3 className="font-semibold">Amazing!</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">"I love this product. It's exactly what I was looking for."</p>
                              <div className="text-xs text-muted-foreground mt-2">
                                <span>- Jane Smith, 1 week ago</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
              
                    {/* STICKY MOBILE BOTTOM BAR */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:hidden z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                      <div className="flex gap-3">
                        <Button 
                          variant="outline"
                          onClick={handleAddToCart}
                          disabled={!product.inStock}
                          className="flex-1 h-12 font-semibold border-slate-300 text-slate-700"
                        >
                          {isInCart(`${product.id}-${selectedColor || (product.colors && product.colors[0])}`) ? "Update Cart" : "Add to Cart"}
                        </Button>
                        <Button 
                          onClick={handleBuyNow}
                          disabled={!product.inStock}
                          className="flex-1 h-12 font-semibold bg-[#D49217] hover:bg-[#b87d14] text-white"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
              
                  </div>
                );
              };
              
              export default ProductDetails;
