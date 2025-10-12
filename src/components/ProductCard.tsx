import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;   // Made optional since it's inferred from parent
  subCategory?: string; // Made optional
  description: string;
  colors: string[];
  inStock: boolean;
  rating?: number;
  dimensions?: string; // Added for home decor products
  material?: string;   // Added for home decor products
  quantity:number;
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
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 z-10">
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
            {product.category}
          </Badge>
          <h3 className="font-semibold text-card-foreground line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
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
          className="w-full"
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
