import { Card } from "@/components/ui/card";

interface SubcategoryCardProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export const SubcategoryCard = ({
  name,
  isActive,
  onClick,
}: SubcategoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer px-6 py-4 text-center transition-all border rounded-lg shadow-sm 
        ${
          isActive
            ? "bg-primary text-white"
            : "bg-card hover:shadow-md hover:bg-muted"
        }`}
    >
      <span className="font-medium">{name}</span>
    </Card>
  );
};
