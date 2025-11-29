import { supabase } from "./supabaseClient";
import { fashionProducts } from "@/data/products";

export const seedDatabase = async () => {
  console.log("Starting seed process...");
  
  try {
    // 1. Clear existing data (optional, be careful!)
    // await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    // await supabase.from("sub_categories").delete().neq("id", 0);
    // await supabase.from("categories").delete().neq("id", 0);

    for (const cat of fashionProducts) {
      console.log(`Processing category: ${cat.name}`);
      
      // Insert Category
      const { data: categoryData, error: catError } = await supabase
        .from("categories")
        .insert({
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/ /g, "-").replace(/[()]/g, ""),
        })
        .select()
        .single();

      if (catError) {
        console.error(`Error inserting category ${cat.name}:`, catError);
        continue;
      }

      const categoryId = categoryData.id;

      for (const subCat of cat.subCategories) {
        console.log(`  Processing sub-category: ${subCat.name}`);

        // Insert Sub-Category
        const { data: subCatData, error: subCatError } = await supabase
          .from("sub_categories")
          .insert({
            name: subCat.name,
            slug: subCat.name.toLowerCase().replace(/ /g, "-").replace(/[()]/g, ""),
            category_id: categoryId,
          })
          .select()
          .single();

        if (subCatError) {
          console.error(`    Error inserting sub-category ${subCat.name}:`, subCatError);
          continue;
        }

        const subCategoryId = subCatData.id;

        // Insert Products
        const productsToInsert = subCat.products.map((p) => ({
          name: p.name,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice,
          image: p.image,
          category_id: categoryId,
          sub_category_id: subCategoryId,
          in_stock: p.inStock,
          colors: p.colors,
          // sizes: p.sizes, // Add if available in source
        }));

        const { error: prodError } = await supabase
          .from("products")
          .insert(productsToInsert);

        if (prodError) {
          console.error(`    Error inserting products for ${subCat.name}:`, prodError);
        } else {
          console.log(`    Inserted ${productsToInsert.length} products.`);
        }
      }
    }

    console.log("Seed process completed!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Seed process failed:", error);
    return { success: false, message: error.message };
  }
};
