import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CloudflareImage } from "@/components/images/CloudflareImage";



interface CategoryCardProps {
  name: string;
  image: string;
}

export const CategoryCard = ({ name, image }: CategoryCardProps) => {
  return (
    <Card className="group overflow-hidden border-hidden  transition-all duration-300 bg-card rounded-lg flex flex-col items-center">
      {/* Circular image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mt-4 overflow-hidden rounded-full">
        <CloudflareImage
          imageRef={image ?? null}
          variant="thumb"
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Description below image */}
      <CardContent className="p-4 text-center">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-[12px] md:text-[14px] text-muted-foreground line-clamp-1">
            {name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
