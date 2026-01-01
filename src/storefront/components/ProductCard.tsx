import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/shared/contexts/InventoryContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string; // Made optional since it's inferred from parent
  categoryName?: string;
  subCategory?: string; // Made optional
  description: string;
  colors: string[];
  selectedColor?: string;
  inStock: boolean;
  rating?: number;
  dimensions?: string; // Added for home decor products
  material?: string; // Added for home decor products
  quantity: number;
  specifications?: Record<string, string>; // Added for dynamic product details
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  isInCart: boolean;
}

export const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isInCart = false,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <Card
      className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
     
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform hover:cursor-pointer duration-300 group-hover:scale-105"
           onClick={() => navigate(`/product/${product.id}`)}
        />
        <div className="absolute top-3 right-3 z-10" >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => onToggleWishlist(product.id)}
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
        {product.originalPrice && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )}
            % OFF
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {product.categoryName}
          </Badge>
          <h3 className="font-semibold text-card-foreground line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#8a5b05ff]">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-[#D49217] hover:bg-[#cf972fff]"
          // style={{color:"#cf972fff"}}
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          variant={isInCart ? "outline" : "default"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {!product.inStock
            ? "Out of Stock"
            : isInCart
            ? "Added to Cart"
            : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};
