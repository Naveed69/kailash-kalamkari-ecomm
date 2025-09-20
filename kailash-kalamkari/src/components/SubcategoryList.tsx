import { SubcategoryCard } from "./SubcategoryCard";

interface SubcategoryListProps {
  subcategories: string[];
  activeSubcategory: string | null;
  onSelect: (subcategory: string) => void;
}

export const SubcategoryList = ({
  subcategories,
  activeSubcategory,
  onSelect,
}: SubcategoryListProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
      {subcategories.map((sub) => (
        <SubcategoryCard
          key={sub}
          name={sub}
          isActive={activeSubcategory === sub}
          onClick={() => onSelect(sub)}
        />
      ))}

      {/* Reset option */}
      <SubcategoryCard
        name="All"
        isActive={activeSubcategory === "" || activeSubcategory === null}
        onClick={() => onSelect("")}
      />
    </div>
  );
};
