import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface Category {
  id: string;
  name: string;
  image: string;
  subCategory: string;
  description: string;
}

interface CatogaryCardProps {
  category: Category;
}

export const CatogaryCard = ({ category, name, image }: CatogaryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 z-10">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-card-foreground line-clamp-2">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
