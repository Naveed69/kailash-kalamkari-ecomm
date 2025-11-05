import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { sampleProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/contexts/InventoryContext";
import { Heart, Shield, Sparkles, Truck } from "lucide-react";
import { Badge, Card, CardContent } from "@mui/material";
import { useMemo, useState } from "react";


const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [modalOpen, setModalOpen] = useState(false);
  const { categories } = useInventory();
  const products= categories.flatMap((cat) => cat.subCategories.flatMap((sub) => sub.products));
   const [selectedImage, setSelectedImage] = useState(0);
   
  let product = sampleProducts.find((p) => p.id === id);
  if(!product){
    product = products.find((p) => p.id === id);
  }

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  // this need to be changed in json data is added as multiple images for a product
  const productImages = [product.image, product.image, product.image];
  if (!product) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Go Back
        </Button>
      </div>
    );
  }

  const handleReplacePolicy = () => {
    setModalOpen(true);
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div >
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg shadow-lg mb-4 object-cover"
          />

           <div className="grid grid-cols-3 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted"
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {/* changes this below code to material type once material type is added in json data*/}
            <p className="text-muted-foreground">Material: <strong>{product.name.split(" ").splice(1).join(" ")}</strong></p>
            <p className="text-muted-foreground mb-6">{product.description}</p>
            

            <p className="text-2xl font-semibold mb-2">
              ₹{product.price.toLocaleString()}
            </p>

            {product.originalPrice && (
              <p className="text-sm line-through text-muted-foreground">
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}

            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => addToCart(product)}
                disabled={isInCart(product.id)}
                className="bg-[#D49217] hover:bg-[#cf972fff] w-full sm:w-auto md:w-64 lg:w-80 xl:w-96"
              >
                {isInCart(product.id) ? "In Cart" : "Add to Cart"}
              </Button>

              <Button
                variant={isInWishlist(product.id) ? "destructive" : "outline"}
                onClick={() =>
                  isInWishlist(product.id)
                    ? removeFromWishlist(product.id)
                    : addToWishlist(product)
                }
              >
                  <Heart className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="mt-6 underline"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
            {/* Features */}
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-[#D49217] mt-0.5" />
                    <div>
                      <p className="font-semibold">Free Shipping</p>
                      <p className="text-sm text-muted-foreground">
                        On orders above ₹2,000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#D49217] mt-0.5" />
                    <div>
                      <p className="font-semibold">Authenticity Guarantee</p>
                      <p className="text-sm text-muted-foreground">
                        100% genuine hand-painted Kalamkari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-[#D49217] mt-0.5" />
                    <div>
                      <p className="font-semibold">Handcrafted</p>
                      <p className="text-sm text-muted-foreground">
                        Each piece is unique and one-of-a-kind
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-[#D49217] mt-0.5" />
                    <div>
                      <p className="font-semibold">Replace/Return</p>
                      <p className="text-sm text-muted-foreground">
                        7 Days Replacement/Return<a onClick={handleReplacePolicy} className="text-blue-400 cursor-pointer"> Policy</a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Details */}
            <div className="mt-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Material</h3>
                <p className="text-muted-foreground">{product.material}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {/* {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))} */}
                  <li key={0}>{product.name.split(" ").splice(1).join(" ")}</li>
                  <li key={1}>Natural dyes</li>
                  <li key={2}>Traditional craftsmanship</li>
                </ul>
              </div>

                <div>
                  <h3 className="font-semibold mb-2">Care Instructions</h3>
                  <p className="text-muted-foreground">
                    Dry clean recommended. Hand wash with cold water if needed. Use mild detergent and avoid direct sunlight when drying.
                  </p>
                </div>

            </div>
          </div>
         
        </div>
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-3xl font-serif font-bold text-[#D49217] mb-8 mt-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                    {!relatedProduct.inStock && (
                      <Badge variant="destructive" className="absolute top-3 right-3 z-10">
                        Out of Stock
                      </Badge>
                    )}
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                          !relatedProduct.inStock ? 'opacity-60' : ''
                        }`}
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{relatedProduct.material}</p>
                      <h3 className="font-semibold mb-2 group-hover:text-[#D49217] transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-[#D49217] font-bold">
                        ₹{relatedProduct.price.toLocaleString("en-IN")}
                        {/* {relatedProduct.priceUnit && <span className="text-sm font-normal">{relatedProduct.priceUnit}</span>} */}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full"> 
            <h2 className="text-2xl font-bold mb-4">Replace/Return Policy</h2>
            <p className="mb-4">
              We offer a 7-day replacement and return policy on all our products. If you are not satisfied with your purchase, you can request a replacement or return within 7 days of receiving the product.
              </p>
              <p className="mb-4">
                To initiate a replacement or return, please contact our customer support team with your order details. The product must be in its original condition and packaging.
                </p>
                <Button variant="primary" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
