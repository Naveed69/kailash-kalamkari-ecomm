import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Package, 
  ArrowUpDown,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { supabase } from "@/lib/supabaseClient";

const ProductList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products: contextProducts, deleteProduct } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState<number | null>(null);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = contextProducts.filter((product) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category_name?.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [contextProducts, searchQuery, sortBy]);

  const handleEdit = (product: any) => {
    navigate("/inventory/add-product", { state: { product } });
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been removed`,
        className: "bg-red-50 border-red-200",
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleVisibilityToggle = async (product: any, isVisible: boolean) => {
    setTogglingVisibility(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_visible: isVisible })
        .eq("id", product.id);

      if (error) throw error;

      toast({
        title: isVisible ? "Product Visible" : "Product Hidden",
        description: `${product.name} is now ${isVisible ? 'visible' : 'hidden'} on the store`,
        className: isVisible ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200",
      });

      // Refresh product list
      window.location.reload(); 
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update product visibility",
        variant: "destructive",
      });
    } finally {
      setTogglingVisibility(null);
    }
  };

  const lowStockCount = contextProducts.filter(p => (p.quantity || 0) < 5).length;
  const totalValue = contextProducts.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your inventory, prices, and stock levels.
          </p>
        </div>
        <Button
          onClick={() => navigate("/inventory/add-product")}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 h-11 px-6 text-base transition-all hover:scale-105 active:scale-95 gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-900">{contextProducts.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-slate-900">{lowStockCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Inventory Value</p>
            <h3 className="text-2xl font-bold text-slate-900">₹{totalValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products by name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-slate-200 focus-visible:ring-slate-900 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-200">
            <Filter className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[100px] pl-6">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[100px]">Visible</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Package className="h-12 w-12 mb-4 text-slate-200" />
                    <p className="text-lg font-medium text-slate-900">No products found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProducts.map((product) => {
                const isVisible = product.is_visible !== false; // Default to true if undefined
                return (
                <TableRow 
                  key={product.id} 
                  className={`group hover:bg-slate-50/50 border-slate-50 transition-colors ${!isVisible ? 'opacity-50' : ''}`}
                >
                  <TableCell className="pl-6 py-4" onClick={() => navigate(`/inventory/products/${product.id}`)}>
                    <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                      <img
                        src={product.image || product.images?.[0] || "https://placehold.co/400x400?text=No+Image"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/inventory/products/${product.id}`)}>
                    <div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{product.description}</p>
                          {!isVisible && (
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[10px] px-1.5 py-0">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/inventory/products/${product.id}`)}>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium">
                      {product.category_name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/inventory/products/${product.id}`)}>
                    <div className="font-bold text-slate-900">₹{product.price?.toLocaleString()}</div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-xs text-slate-400 line-through">₹{product.originalPrice?.toLocaleString()}</div>
                    )}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/inventory/products/${product.id}`)}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${(product.quantity || 0) > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className={`font-medium ${(product.quantity || 0) > 5 ? 'text-slate-700' : 'text-amber-700'}`}>
                        {product.quantity || 0} Units
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={isVisible}
                        onCheckedChange={(checked) => handleVisibilityToggle(product, checked)}
                        disabled={togglingVisibility === product.id}
                        className="data-[state=checked]:bg-green-600"
                      />
                      {isVisible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div 
                      className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

export default ProductList;
