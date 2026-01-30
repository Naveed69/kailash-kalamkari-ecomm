import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import Barcode from "react-barcode";
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
import { useToast } from "@/components/ui/use-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products, deleteProduct, loading } = useInventory();
  const [product, setProduct] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (loading) return; // Wait for data to load

    const foundProduct = products.find((p) => String(p.id) === String(id));
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Only redirect if we are sure data is loaded and product is missing
      if (products.length > 0) {
        toast({
          title: "Product Not Found",
          description: "The product you're looking for doesn't exist",
          variant: "destructive",
        });
        navigate("/inventory/products");
      }
    }
  }, [id, products, navigate, toast, loading]);

  const handleDelete = async () => {
    if (product) {
      await deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been removed`,
        className: "bg-red-50 border-red-200",
      });
      navigate("/inventory/products");
    }
  };

  const handleEdit = () => {
    navigate("/inventory/add-product", { state: { product } });
  };

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <Package className="h-12 w-12 animate-bounce text-slate-400" />
          <p className="text-slate-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  const images = product.images || (product.image ? [product.image] : []);
  const currentImage = images[currentImageIndex] || "https://placehold.co/600x600?text=No+Image";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/inventory/products")}
          className="hover:bg-white rounded-xl h-11 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="h-11 border-slate-200 hover:bg-white rounded-xl"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-11 bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
            <div className="aspect-square bg-slate-50 flex items-center justify-center p-8">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                    currentImageIndex === index
                      ? "ring-2 ring-slate-900 scale-105"
                      : "ring-1 ring-slate-200 hover:ring-slate-300 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Barcode Card (if exists) */}
          {product.barcode && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-400" />
                Product Barcode
              </h3>
              <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <Barcode value={product.barcode} height={60} />
                </div>
                <p className="text-sm text-slate-500 font-mono font-medium">
                  {product.barcode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Title and Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {product.in_stock || product.inStock ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 px-3 py-1 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                  In Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                  Out of Stock
                </Badge>
              )}
              {product.category_name && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-full">
                  {product.category_name}
                </Badge>
              )}
              {product.sub_category_name && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 rounded-full">
                  {product.sub_category_name}
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-2">Price</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">
                  ₹{product.price?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-slate-400 line-through">
                      ₹{product.originalPrice?.toLocaleString()}
                    </span>
                    <Badge className="bg-red-600 hover:bg-red-600 text-white px-2.5 py-1 rounded-full">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Product Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Product Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-500">Stock Quantity</span>
                <span className="text-base font-bold text-slate-900">
                  {product.quantity || product.stock_quantity || 0} units
                </span>
              </div>
              
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-500 block mb-3">
                    Available Colors
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 border-slate-200 shadow-inner"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono font-medium text-slate-600">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.material && (
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-500">Material</span>
                  <span className="text-base font-semibold text-slate-900">{product.material}</span>
                </div>
              )}

              {product.dimensions && (
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-500">Dimensions</span>
                  <span className="text-base font-semibold text-slate-900">{product.dimensions}</span>
                </div>
              )}
              
              {/* Specifications Section */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Specifications</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium text-slate-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-base font-semibold text-slate-900">
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete "{product.name}"? This action cannot be undone and will remove the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-200"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetails;
