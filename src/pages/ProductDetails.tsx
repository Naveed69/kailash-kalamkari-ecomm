import React, { useState, useMemo, useEffect } from "react";
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

// --- Components ---

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Contexts
  const { addToCart, isInCart, updateQuantity, getItemQuantity, removeFromCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { products = [] } = useInventory();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Find Product
  const product = products.find((p) => p.id === id);

  // Derived State
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  // Image Gallery Logic (Handling single image vs array)
  // In a real app, product.images would be an array. 
  // Here we simulate a gallery if only one image exists, or use the array if it exists.
  const galleryImages = useMemo(() => {
    if (!product) return [];
    // @ts-ignore - checking if images array exists in future data model
    if (product.images && Array.isArray(product.images)) return product.images;
    // Fallback: Repeat image to simulate gallery for UI demo (remove slice in production if real data)
    return [product.image, product.image, product.image, product.image].slice(0, 4);
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
    handleAddToCart();
    navigate("/cart");
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
              <img 
                src={galleryImages[selectedImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
              />
              
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
                              onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm md:hidden"
                            >
                              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                            </button>                          </div>
              
                          {/* Thumbnail Strip */}
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {galleryImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={`
                                  relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                                  ${selectedImageIndex === idx ? "border-[#D49217] ring-2 ring-[#D49217]/20" : "border-transparent hover:border-slate-300"}
                                `}
                              >
                                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
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
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                className="hidden md:flex rounded-full h-10 w-10 border-slate-200 hover:bg-slate-50 hover:border-[#D49217]"
                              >
                                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                              </Button>
                            </div>
              
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
                            {relatedProducts.map((related) => (
                              <Link key={related.id} to={`/product/${related.id}`} className="group">
                                <Card className="border-none shadow-none bg-transparent">
                                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                                    <img 
                                      src={related.image} 
                                      alt={related.name}
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
                            ))}
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
