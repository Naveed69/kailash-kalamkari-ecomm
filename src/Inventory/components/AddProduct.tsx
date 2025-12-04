import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X, ArrowLeft, AlertTriangle, Package } from "lucide-react";
import { getCategories, getSubCategories, uploadImage, checkDuplicateProduct, updateProductStock } from "@/lib/adminApi";
import { seedCategories } from "@/lib/seedData";
import { useInventory } from "@/contexts/InventoryContext";

import imageCompression from 'browser-image-compression';
import Barcode from 'react-barcode';
import { generateBarcode } from '@/lib/barcodeUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addProduct, updateProduct } = useInventory();
  
  // Check if we are in edit mode
  const editingProduct = location.state?.product;
  const isEditMode = !!editingProduct;
  
  // Track if we're in the initial edit mode population
  const isInitialPopulation = useRef(false);
  const targetSubCategoryId = useRef<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subCategory: "",
    colors: "",
    quantity: "1",
    inStock: true,
    isVisible: true,
  });

  // UI state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null);
  
  // Duplicate prevention state
  const [duplicateProduct, setDuplicateProduct] = useState<any | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateType, setDuplicateType] = useState<'name' | 'barcode' | null>(null);
  const [stockToAdd, setStockToAdd] = useState("");

  // Predefined color palette
  const colorPalette = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
    "#800000", "#008000", "#000080", "#808000", "#800080", "#008080",
    "#FFA500", "#FFC0CB", "#A52A2A", "#DDA0DD", "#F0E68C", "#E6E6FA",
    "#000000", "#FFFFFF", "#808080", "#C0C0C0", "#D2691E", "#F5F5DC"
  ];

  // Specifications state
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
  const [newSpec, setNewSpec] = useState({ key: "", value: "" });

  const addSpec = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setSpecifications([...specifications, { key: newSpec.key.trim(), value: newSpec.value.trim() }]);
      setNewSpec({ key: "", value: "" });
    }
  };

  const removeSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchData = async () => {
      let { data: cats } = await getCategories();
      
      // Auto-seed if no categories exist
      if (!cats || cats.length === 0) {
        console.log("No categories found. Auto-seeding...");
        await seedCategories();
        const { data: newCats } = await getCategories();
        cats = newCats;
      }

      const { data: subCats } = await getSubCategories();
      
      if (cats) {
        setCategories(cats);
      }
      if (subCats) setSubCategories(subCats);
    };
    fetchData();
  }, []);

  // Populate form if editing - runs when product loads AND when categories/subcategories load
  useEffect(() => {
    if (isEditMode && editingProduct && categories.length > 0 && subCategories.length > 0) {
      console.log("🔄 Populating edit form with:", editingProduct);
      isInitialPopulation.current = true;
      
      // Helper to get value from either camelCase or snake_case
      const getVal = (camel: string, snake: string) => {
        return editingProduct[camel] !==undefined ? editingProduct[camel] : editingProduct[snake];
      };

      const categoryId = getVal("category", "category_id");
      const subCategoryId = getVal("subCategory", "sub_category_id");
      const price = editingProduct.price;
      const originalPrice = getVal("originalPrice", "original_price");
      const quantity = getVal("quantity", "stock_quantity");
      const inStock = getVal("inStock", "in_stock");

      console.log("📂 Category ID:", categoryId, "Subcategory ID:", subCategoryId);

      // Store the target subcategory to be set later when options are ready
      if (subCategoryId) {
        targetSubCategoryId.current = subCategoryId.toString();
      }

      // Set everything EXCEPT subCategory
      setFormData(prev => ({
        ...prev,
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: price?.toString() || "",
        originalPrice: originalPrice?.toString() || "",
        category: categoryId?.toString() || "",
        subCategory: "", // Will be set by the effect below
        colors: "", 
        quantity: quantity?.toString() || "1",
        inStock: inStock ?? true,
      }));

      // Handle colors - they might be array, JSON string, or comma-separated string
      let colorsToSet: string[] = [];
      const rawColors = editingProduct.colors;
      
      console.log("🎨 Raw colors from DB:", rawColors, typeof rawColors);
      
      if (rawColors) {
        if (Array.isArray(rawColors)) {
          colorsToSet = rawColors;
        } else if (typeof rawColors === "string") {
          try {
            // Try parsing as JSON first
            const parsed = JSON.parse(rawColors);
            colorsToSet = Array.isArray(parsed) ? parsed : [rawColors];
          } catch {
            // If not JSON, treat as comma-separated
            colorsToSet = rawColors.split(",").map(c => c.trim()).filter(Boolean);
          }
        }
      }
      
      console.log("🎨 Setting colors:", colorsToSet);
      setSelectedColors(colorsToSet);

      // Handle specifications
      if (editingProduct.specifications) {
        try {
          const specs = typeof editingProduct.specifications === 'string' 
            ? JSON.parse(editingProduct.specifications) 
            : editingProduct.specifications;
            
          if (specs && typeof specs === 'object') {
            const specsArray = Object.entries(specs).map(([key, value]) => ({
              key,
              value: String(value)
            }));
            setSpecifications(specsArray);
          }
        } catch (e) {
          console.error("Error parsing specifications:", e);
        }
      }

      // Set barcode if editing
      if (editingProduct.barcode) {
        setGeneratedBarcode(editingProduct.barcode);
      }

      // Handle existing images
      const existingImages = [];
      if (editingProduct.images && Array.isArray(editingProduct.images)) {
        existingImages.push(...editingProduct.images);
      } else if (editingProduct.image) {
        existingImages.push(editingProduct.image);
      }
      
      if (existingImages.length > 0) {
        setImagePreviews(existingImages);
      }
      
      // Clear the flag after a short delay
      setTimeout(() => {
        isInitialPopulation.current = false;
      }, 500);
    }
  }, [isEditMode, editingProduct, categories, subCategories]);

  // Apply target subcategory when options are ready
  useEffect(() => {
    if (targetSubCategoryId.current && filteredSubCategories.length > 0) {
      const target = targetSubCategoryId.current;
      const exists = filteredSubCategories.find(s => s.id.toString() === target);
      
      if (exists) {
        console.log("🎯 Applying target subcategory:", target);
        setFormData(prev => ({ ...prev, subCategory: target }));
        targetSubCategoryId.current = null; // Clear it so we don't keep setting it
      }
    }
  }, [filteredSubCategories]);



  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const filtered = subCategories.filter(
        (sub) => sub.category_id === parseInt(formData.category)
      );
      setFilteredSubCategories(filtered);
      console.log("📋 Filtered subcategories:", filtered);
      
      // Only reset subcategory if it's not valid for the new category
      // BUT: Don't reset if we're in the initial edit mode population
      if (!isInitialPopulation.current && formData.subCategory && !filtered.find(s => s.id === parseInt(formData.subCategory))) {
        console.log("⚠️ Subcategory not in filtered list, clearing");
        setFormData(prev => ({ ...prev, subCategory: "" }));
      }
      
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.category, subCategories]);

  // Handle multiple image uploads with compression
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []) as File[];
    await processFiles(files);
  };

  // Process multiple files
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Check image limit (max 5)
    const remainingSlots = 5 - imageFiles.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: "You can upload a maximum of 5 images per product",
        variant: "destructive",
      });
      return;
    }

    // Limit files to remaining slots
    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast({
        title: "Image limit",
        description: `Only adding ${remainingSlots} image(s). Maximum is 5 images per product.`,
      });
    }

    setCompressing(true);
    const newPreviews: string[] = [];
    const newCompressedFiles: File[] = [];
    const newStats: string[] = [];

    for (const file of filesToProcess) {
      // Show preview immediately
      const reader = new FileReader();
      const previewPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const preview = await previewPromise;
      newPreviews.push(preview);

      // Compress with better settings
      try {
        const options = {
          maxSizeMB: 0.3, // Much smaller - 300KB max instead of 1MB
          maxWidthOrHeight: 1200, // Smaller max dimension
          useWebWorker: true,
          initialQuality: 0.7, // Start with 70% quality
        };

        const compressedFile = await imageCompression(file, options);
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
        const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(0);

        newStats.push(`${originalSize}MB → ${compressedSize}MB (-${savings}%)`);
        newCompressedFiles.push(compressedFile);
      } catch (error) {
        console.error("Compression failed:", error);
        newStats.push("Failed, using original");
        newCompressedFiles.push(file);
      }
    }

    setImageFiles(prev => [...prev, ...newCompressedFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setCompressionStats(prev => [...prev, ...newStats]);
    setCompressing(false);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    await processFiles(files);
  };

  // Handle box click
  const handleBoxClick = () => {
    document.getElementById('image')?.click();
  };

  // Remove single image
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setCompressionStats(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all images
  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setCompressionStats([]);
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Color picker functions
  const addColor = (color: string) => {
    if (!selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter(c => c !== color));
  };

  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Validate form
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) newErrors.name = "Product name is required";
  if (!formData.description.trim()) newErrors.description = "Description is required";
  if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required";
  if (!formData.category) newErrors.category = "Category is required";
  if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = "Valid quantity is required";
  
  // Mandatory image validation
  if (imagePreviews.length === 0) {
    newErrors.images = "At least one product image is required";
    toast({
      title: "Missing Product Image",
      description: "Please upload at least one image for the product",
      variant: "destructive",
    });
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];

      // 1. Keep existing images that haven't been removed
      // We need to know which previews correspond to existing URLs vs new files
      // For simplicity, we can check if the preview string starts with "http" (existing) or "data:" (new)
      // BUT, we also have imageFiles which are ONLY the new files.
      // So we need to reconstruct the final list of images.
      
      // Strategy:
      // - We have `imagePreviews` which shows everything currently in the UI.
      // - If a preview is a URL (starts with http), it's an existing image we want to keep.
      // - If it's a data URL, it corresponds to a file in `imageFiles` that needs uploading.
      
      // However, mapping `imageFiles` to specific previews is tricky if we deleted some in the middle.
      // A better approach for this form:
      // - Upload ALL new files in `imageFiles`.
      // - Combine their new URLs with the existing URLs found in `imagePreviews`.
      
      // Wait, `imageFiles` contains ALL files currently selected? 
      // No, `handleImageChange` appends to `imageFiles`. `removeImage` removes from `imageFiles`.
      // So `imageFiles` should accurately represent the NEW files to be uploaded.
      // But what about existing images that were pre-loaded? They are NOT in `imageFiles`.
      // They are only in `imagePreviews`.
      
      // So:
      // 1. Filter `imagePreviews` for strings starting with "http" -> these are existing images to keep.
      const existingUrls = imagePreviews.filter(url => url.startsWith("http"));
      
      // 2. Upload all files in `imageFiles`
      const newUploadPromises = imageFiles.map(file => uploadImage(file));
      const uploadResults = await Promise.all(newUploadPromises);
      
      // Check for errors
      const failedUploads = uploadResults.filter(r => r.error);
      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} images`);
      }
      
      const newUrls = uploadResults.map(r => r.url as string);
      
      // 3. Combine
      imageUrls = [...existingUrls, ...newUrls];

      // Generate unique barcode for new products
    let barcode = editingProduct?.barcode; // Keep existing barcode if updating
    if (!isEditMode) {
      barcode = generateBarcode();
      setGeneratedBarcode(barcode); // Store for display
    }

    // CHECK FOR DUPLICATES (only when creating new product)
    if (!isEditMode) {
      const duplicateCheck = await checkDuplicateProduct(
        formData.name.trim(),
        barcode
      );

      if (duplicateCheck.error) {
        throw new Error("Error checking for duplicates");
      }

      // If duplicate found, show dialog and stop submission
      if (duplicateCheck.data) {
        setDuplicateProduct(duplicateCheck.data);
        setDuplicateType(duplicateCheck.duplicateType || null);
        setShowDuplicateDialog(true);
        setLoading(false);
        return; // Stop here, don't create product
      }
    }

    // Convert specifications array to object
    const specsObject = specifications.reduce((acc, curr) => {
      if (curr.key.trim()) {
        acc[curr.key.trim()] = curr.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    // Extract material from specifications if present (case-insensitive)
    const materialSpec = specifications.find(s => s.key.trim().toLowerCase() === 'material');
    const materialValue = materialSpec ? materialSpec.value.trim() : null;

    // Prepare product data
    const productData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      category: parseInt(formData.category),
      subCategory: formData.subCategory ? parseInt(formData.subCategory) : null,
      colors: selectedColors, // Use the selectedColors array
      specifications: specsObject, // Add specifications
      quantity: parseInt(formData.quantity),
      inStock: formData.inStock,
      isVisible: formData.isVisible,
      image: imageUrls[0] || null, // Main image (first one)
      images: imageUrls, // All images
      barcode: barcode, // Add barcode to product data
      material: materialValue, // Add material from specifications
    };

      if (isEditMode) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Success!",
          description: "Product updated successfully",
          className: "bg-green-50 border-green-200",
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Success!",
          description: "Product created successfully",
          className: "bg-green-50 border-green-200",
        });
      }

      // Navigate back
      setTimeout(() => {
        navigate("/inventory/products");
      }, 1000);

    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle stock update from duplicate dialog
  const handleStockUpdate = async () => {
    if (!duplicateProduct || !stockToAdd || parseInt(stockToAdd) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity to add",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const quantity = parseInt(stockToAdd);
      const { data, error } = await updateProductStock(duplicateProduct.id, quantity);

      if (error) {
        throw new Error(error.message || "Failed to update stock");
      }

      const currentStock = duplicateProduct.stock_quantity || duplicateProduct.quantity || 0;
      const newStock = currentStock + quantity;

      toast({
        title: "Stock Updated!",
        description: `Stock increased from ${currentStock} to ${newStock} units`,
        className: "bg-green-50 border-green-200",
      });

      setShowDuplicateDialog(false);
      setDuplicateProduct(null);
      setStockToAdd("");
      
      // Navigate to products list
      setTimeout(() => {
        navigate("/inventory/products");
      }, 1000);
    } catch (error: any) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product from duplicate dialog
  const handleEditDuplicate = () => {
    setShowDuplicateDialog(false);
    navigate("/inventory/add-product", { state: { product: duplicateProduct } });
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 font-sans">
      <Button 
        variant="ghost" 
        className="mb-6 hover:bg-white rounded-xl h-11 px-4"
        onClick={() => navigate("/inventory/products")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-slate-500 mt-2">
              {isEditMode ? "Update the product details below" : "Fill in the details to add a new product to your inventory"}
            </p>
          </div>
          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`mt-2 h-11 rounded-xl border-slate-200 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-700 font-medium">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  className={`mt-2 h-11 rounded-xl border-slate-200 ${errors.quantity ? "border-red-500" : ""}`}
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`mt-2 rounded-xl border-slate-200 ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Pricing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-700 font-medium">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`mt-2 h-11 rounded-xl border-slate-200 ${errors.price ? "border-red-500" : ""}`}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-slate-700 font-medium">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00 (optional)"
                  value={formData.originalPrice}
                  onChange={(e) => handleChange("originalPrice", e.target.value)}
                  className="mt-2 h-11 rounded-xl border-slate-200"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className={`mt-2 h-11 rounded-xl border-slate-200 ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory" className="text-slate-700 font-medium">Sub Category</Label>
                <Select
                  value={formData.subCategory}
                  onValueChange={(value) => handleChange("subCategory", value)}
                  disabled={!formData.category || filteredSubCategories.length === 0}
                >
                  <SelectTrigger className="mt-2 h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder={!formData.category ? "Select category first" : "Select sub category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Colors */}
            {/* Product Colors - Modern Color Picker */}
            <div className="space-y-4">
              <Label className="text-slate-700 font-medium">Product Colors (Optional)</Label>
              
              {/* Selected Colors Display */}
              {selectedColors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Selected Colors ({selectedColors.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((color) => (
                      <div
                        key={color}
                        className="group relative flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow"
                        style={{ borderColor: color }}
                      >
                        <div
                          className="w-6 h-6 rounded-md border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono text-gray-600">{color}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="ml-1 p-1 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove color"
                        >
                          <X className="w-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Palette - Modern Swatches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Click to Select Colors</p>
                  {selectedColors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedColors([])}
                      className="text-xs text-red-600 hover:text-red-700 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-2.5 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  {colorPalette.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => isSelected ? removeColor(color) : addColor(color)}
                        className={`
                          relative w-10 h-10 rounded-lg cursor-pointer
                          transform transition-all duration-200 ease-out
                          ${isSelected 
                            ? 'scale-110 ring-3 ring-[#D49217] ring-offset-2 shadow-lg' 
                            : 'hover:scale-105 hover:shadow-md ring-1 ring-gray-300'
                          }
                        `}
                        style={{ backgroundColor: color }}
                        title={`${color}${isSelected ? ' (Selected)' : ' - Click to select'}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg 
                              className="w-5 h-5 drop-shadow-lg" 
                              fill="white" 
                              stroke="white"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 italic">💡 Tip: Click a color to add it, click again to remove it</p>
              </div>

              {/* Custom Color Input - Modern Design */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <p className="text-sm font-medium text-gray-700">Custom Color</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        id="custom-color"
                        type="text"
                        placeholder="#FF5733"
                        className="pl-10 font-mono uppercase placeholder:normal-case"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                              addColor(input.value.toUpperCase());
                              input.value = "";
                              toast({
                                title: "Color Added!",
                                description: `${input.value} has been added to your color selection`,
                              });
                            } else {
                              toast({
                                title: "Invalid Color",
                                description: "Please enter a valid hex color (e.g., #FF5733)",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Press Enter to add</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="relative group">
                      <input
                        id="color-picker"
                        type="color"
                        onChange={(e) => {
                          addColor(e.target.value.toUpperCase());
                          toast({
                            title: "Color Added!",
                            description: e.target.value.toUpperCase(),
                            className: "bg-green-50 border-green-200",
                          });
                        }}
                        className="w-20 h-11 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-[#D49217] transition-colors shadow-sm"
                      />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-[#D49217] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 text-center">Pick</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <Label className="text-slate-700 font-medium">Product Specifications (Optional)</Label>
              <p className="text-sm text-muted-foreground">Add details like Material, Origin, Craft, Dimensions, etc.</p>
              
              {/* Existing Specs */}
              {specifications.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{spec.key}</p>
                        <p className="text-sm font-medium text-slate-900 truncate">{spec.value}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Spec */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="spec-key" className="text-xs">Label (e.g. Material)</Label>
                  <Input
                    id="spec-key"
                    placeholder="Material"
                    value={newSpec.key}
                    onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="spec-value" className="text-xs">Value (e.g. Cotton Silk)</Label>
                  <Input
                    id="spec-value"
                    placeholder="Cotton Silk"
                    value={newSpec.value}
                    onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                    className="h-10"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpec();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addSpec}
                  disabled={!newSpec.key.trim() || !newSpec.value.trim()}
                  className="h-10 bg-slate-900 text-white hover:bg-slate-800"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Images (Multiple)</Label>
              {imagePreviews.length === 0 ? (
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-[#D49217] bg-[#D49217]/10 scale-105' 
                      : 'border-gray-300 hover:border-[#D49217] hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBoxClick}
                >
                  <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragging ? 'text-[#D49217]' : 'text-muted-foreground'}`} />
                  <div className="space-y-2">
                    <p className="text-[#D49217] font-medium">
                      {isDragging ? 'Drop images here' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WEBP (Multiple files supported)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Previews Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden bg-gray-50">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full z-10 shadow-md"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="aspect-square bg-white">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        {/* Individual Compression Stats */}
                        {compressionStats[index] && (
                          <div className="mt-1 text-center">
                            <p className="text-xs text-green-600 truncate">
                              {compressionStats[index]}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add More Button */}
                  {imageFiles.length < 5 && (
                    <div 
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#D49217] transition-colors"
                      onClick={handleBoxClick}
                    >
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-[#D49217]">
                        Add more images ({imageFiles.length}/5)
                      </p>
                    </div>
                  )}

                  {/* Max images message */}
                  {imageFiles.length >= 5 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Maximum of 5 images reached
                      </p>
                    </div>
                  )}

                  {/* Compressing Indicator */}
                  {compressing && (
                    <div className="text-center">
                      <Loader2 className="inline mr-2 h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-blue-500">Compressing images...</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Hidden file input - always present */}
              <Input
                id="image"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => handleChange("inStock", checked)}
              />
              <Label htmlFor="inStock" className="cursor-pointer">
                In Stock
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-slate-900/10"
                disabled={loading || compressing}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : compressing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Compressing Images...
                  </>
                ) : (
                  isEditMode ? "Update Product" : "Add Product"
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/inventory/products")}
                disabled={loading}
                className="h-12 px-8 rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Barcode Display Section - Shows after product creation */}
      {generatedBarcode && (
        <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <span className="text-2xl">✓</span> Product Barcode Generated
            </CardTitle>
            <CardDescription>
              Your product has been assigned a unique barcode. You can print this for inventory management.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-lg border-2 border-green-300 shadow-md">
              <Barcode value={generatedBarcode} />
            </div>
            <p className="text-sm text-gray-600">
              Barcode: <span className="font-mono font-bold text-green-700">{generatedBarcode}</span>
            </p>
            <Button
              variant="outline"
              onClick={() => {
                // Create a temporary canvas to download the barcode
                const svg = document.querySelector('svg');
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `barcode-${generatedBarcode}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                  };
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                }
              }}
            >
              Download Barcode
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Product Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Product Already Exists
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {duplicateType === 'name' && "A product with this name already exists."}
              {duplicateType === 'barcode' && "A product with this barcode already exists."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {duplicateProduct && (
            <div className="space-y-4 py-4">
              {/* Existing Product Details */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Existing Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{duplicateProduct.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Barcode:</span>
                      <p className="font-mono font-medium">{duplicateProduct.barcode || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Stock:</span>
                      <p className="font-bold text-lg text-[#D49217]">
                        {duplicateProduct.stock_quantity || duplicateProduct.quantity || 0} units
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium">₹{duplicateProduct.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="text-sm line-clamp-2">{duplicateProduct.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Update Form */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label htmlFor="stock-add" className="text-base font-semibold">
                  Quick Stock Update
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add more stock to this existing product instead of creating a duplicate.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="stock-add"
                      type="number"
                      min="1"
                      placeholder="Quantity to add"
                      value={stockToAdd}
                      onChange={(e) => setStockToAdd(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="flex items-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm text-muted-foreground">New Stock:</span>
                    <span className="ml-2 font-bold text-green-700 text-lg">
                      {(duplicateProduct.stock_quantity || duplicateProduct.quantity || 0) + 
                        (parseInt(stockToAdd) || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => {
              setShowDuplicateDialog(false);
              setDuplicateProduct(null);
              setStockToAdd("");
            }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleEditDuplicate}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Edit Product
            </Button>
            <AlertDialogAction
              onClick={handleStockUpdate}
              disabled={!stockToAdd || parseInt(stockToAdd) <= 0 || loading}
              className="bg-[#D49217] hover:bg-[#B87D15]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update Stock (+{stockToAdd || 0})</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddProduct;
