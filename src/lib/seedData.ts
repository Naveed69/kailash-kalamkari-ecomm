import { supabase } from "./supabaseClient";

export const seedCategories = async () => {
  
  const categories = [
    { name: "Sarees" },
    { name: "Dupattas" },
    { name: "Fabrics" },
    { name: "Home Decor" },
  ];

  const subCategories = {
    "Sarees": [
      { name: "Kalamkari" },
      { name: "Kanchipuram" },
      { name: "Bangalore Silk" },
      { name: "Chennori Silk" },
      { name: "Tussar Silk" },
      { name: "Pure Crape Silk" },
    ],
    "Dupattas": [
      { name: "Silk" },
      { name: "Cotton" },
    ],
    "Fabrics": [
      { name: "Cotton" },
      { name: "Silk" },
    ],
    "Home Decor": [
      { name: "Wall Art" },
      { name: "Table Runners" },
    ],
  };

  try {
    // 1. Check if categories exist
    const { data: existingCats, error: checkError } = await supabase
      .from("categories")
      .select("id, name");

    if (checkError) throw checkError;

    if (existingCats && existingCats.length > 0) {
      console.log("Categories already exist:", existingCats);
      return { success: true, message: "Categories already exist" };
    }

    console.log("No categories found. Seeding...");

    // 2. Insert Categories
    const { data: insertedCats, error: insertError } = await supabase
      .from("categories")
      .insert(categories)
      .select();

    if (insertError) throw insertError;

    console.log("Inserted categories:", insertedCats);

    // 3. Insert Subcategories
    const subCatInserts = [];
    
    for (const cat of insertedCats) {
      const subs = subCategories[cat.name];
      if (subs) {
        subs.forEach(sub => {
          subCatInserts.push({
            ...sub,
            category_id: cat.id
          });
        });
      }
    }

    if (subCatInserts.length > 0) {
      const { data: insertedSubs, error: subError } = await supabase
        .from("sub_categories") // Changed table name from "subCategories" to "sub_categories"
        .insert(subCatInserts)
        .select();

      if (subError) throw subError;
      console.log("Inserted subcategories:", insertedSubs);
    }

    return { success: true, message: "Seeding completed successfully" };

  } catch (error: any) {
    console.error("Seeding failed:", error);
    return { success: false, message: error.message };
  }
};
