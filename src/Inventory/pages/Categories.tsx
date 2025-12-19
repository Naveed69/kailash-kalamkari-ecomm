import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react"
import {
  getCategories,
  getSubCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  unlinkProductsFromCategory,
  unlinkProductsFromSubCategory,
  uploadImage,
} from "@/lib/adminApi"
import { seedCategories } from "@/lib/seedData"
import imageCompression from "browser-image-compression"

const Categories = () => {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Category dialog state
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({ name: "" })

  // SubCategory dialog state
  const [subCategoryDialog, setSubCategoryDialog] = useState(false)
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null)
  const defaultSubCategoryForm = { name: "", category_id: "", image_url: "" }
  const [subCategoryForm, setSubCategoryForm] = useState(defaultSubCategoryForm)
  const [subCategoryImageFile, setSubCategoryImageFile] = useState<File | null>(
    null
  )
  const [subCategoryImagePreview, setSubCategoryImagePreview] = useState<
    string | null
  >(null)
  const [subCategoryImageCompressing, setSubCategoryImageCompressing] =
    useState(false)

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "category" | "subcategory"
    id: number
  } | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: cats } = await getCategories()
    const { data: subCats } = await getSubCategories()
    if (cats) setCategories(cats)
    if (subCats) setSubCategories(subCats)
  }

  const handleSeedCategories = async () => {
    setLoading(true)
    const result = await seedCategories()
    setLoading(false)
    if (result.success) {
      toast({ title: "Success", description: result.message, duration: 5000 })
      fetchData()
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Category CRUD
  const openCategoryDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({ name: category.name })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: "" })
    }
    setCategoryDialog(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setLoading(true)
    const payload = {
      name: categoryForm.name.trim(),
    }

    const { error } = editingCategory
      ? await updateCategory(editingCategory.id, payload)
      : await createCategory(payload)

    setLoading(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    } else {
      toast({
        title: "Success",
        description: `Category ${
          editingCategory ? "updated" : "created"
        } successfully`,
        duration: 5000,
      })
      setCategoryDialog(false)
      fetchData()
    }
  }

  const confirmDeleteCategory = (id: number) => {
    setItemToDelete({ type: "category", id })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSubCategory = (id: number) => {
    setItemToDelete({ type: "subcategory", id })
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "category") {
      await handleDeleteCategory(itemToDelete.id)
    } else {
      await handleDeleteSubCategory(itemToDelete.id)
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleDeleteCategory = async (id: number) => {
    console.log("Deleting category:", id)
    setLoading(true)

    // 1. Unlink products from this category (and its subcategories)
    console.log("Unlinking products from category...")
    const { error: unlinkError } = await unlinkProductsFromCategory(id)
    if (unlinkError) {
      console.error("Unlink failed:", unlinkError)
      setLoading(false)
      toast({
        title: "Error",
        description: "Failed to unlink products: " + unlinkError.message,
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    // 2. Find all subcategories for this category
    const relatedSubCats = subCategories.filter((sc) => sc.category_id === id)
    console.log("Found related subcategories:", relatedSubCats.length)

    // 3. Delete all related subcategories first
    if (relatedSubCats.length > 0) {
      const deletePromises = relatedSubCats.map((sc) =>
        deleteSubCategory(sc.id)
      )
      const results = await Promise.all(deletePromises)

      // Check for errors in subcategory deletion
      const subCatError = results.find((r) => r.error)
      if (subCatError) {
        console.error("Subcategory delete failed:", subCatError)
        setLoading(false)
        toast({
          title: "Error",
          description:
            "Failed to delete subcategories: " + subCatError.error.message,
          variant: "destructive",
          duration: 5000,
        })
        return
      }
    }

    // 4. Now delete the category
    console.log("Deleting category record...")
    const { error } = await deleteCategory(id)
    setLoading(false)

    if (error) {
      console.error("Category delete failed:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    } else {
      console.log("Category deleted successfully")
      toast({
        title: "Success",
        description: "Category and subcategories deleted successfully",
        duration: 5000,
      })
      fetchData()
    }
  }

  // SubCategory CRUD
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const resetSubCategoryDialogState = () => {
    setEditingSubCategory(null)
    setSubCategoryForm(defaultSubCategoryForm)
    setSubCategoryImageFile(null)
    setSubCategoryImagePreview(null)
    setSubCategoryDialog(false)
  }

  const handleSubCategoryDialogToggle = (open: boolean) => {
    if (!open) {
      resetSubCategoryDialogState()
      return
    }
    setSubCategoryDialog(true)
  }

  const openSubCategoryDialog = (subCategory?: any) => {
    if (subCategory) {
      setEditingSubCategory(subCategory)
      setSubCategoryForm({
        name: subCategory.name ?? "",
        category_id: subCategory.category_id?.toString() ?? "",
        image_url: subCategory.image_url ?? "",
      })
      setSubCategoryImageFile(null)
      setSubCategoryImagePreview(subCategory.image_url ?? null)
    } else {
      setEditingSubCategory(null)
      setSubCategoryForm(defaultSubCategoryForm)
      setSubCategoryImageFile(null)
      setSubCategoryImagePreview(null)
    }
    setSubCategoryDialog(true)
  }

  const handleSubCategoryImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSubCategoryImageCompressing(true)
    try {
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.75,
      }
      const compressed = await imageCompression(file, options)
      setSubCategoryImageFile(compressed)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSubCategoryImagePreview(reader.result as string)
      }
      reader.readAsDataURL(compressed)
    } catch (error) {
      console.error("Failed to process subcategory image:", error)
      toast({
        title: "Image error",
        description: "Unable to process the selected image.",
        variant: "destructive",
      })
    } finally {
      setSubCategoryImageCompressing(false)
    }
  }

  const handleClearSubCategoryImage = () => {
    setSubCategoryImageFile(null)
    setSubCategoryImagePreview(null)
    setSubCategoryForm((prev) => ({ ...prev, image_url: "" }))
  }

  const handleSubCategoryImageBoxClick = () => {
    fileInputRef.current?.click()
  }

  const handleSaveSubCategory = async () => {
    if (!subCategoryForm.name.trim() || !subCategoryForm.category_id) {
      toast({
        title: "Validation Error",
        description: "Name and category are required",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setLoading(true)
    let imageUrl = subCategoryForm.image_url || null

    if (subCategoryImageFile) {
      const { url, error } = await uploadImage(subCategoryImageFile)
      if (error || !url) {
        setLoading(false)
        toast({
          title: "Upload failed",
          description: error?.message || "Unable to upload image",
          variant: "destructive",
          duration: 5000,
        })
        return
      }
      imageUrl = url
    }

    const payload = {
      name: subCategoryForm.name.trim(),
      category_id: parseInt(subCategoryForm.category_id),
      image_url: imageUrl,
    }

    const { error } = editingSubCategory
      ? await updateSubCategory(editingSubCategory.id, payload)
      : await createSubCategory(payload)

    setLoading(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    } else {
      toast({
        title: "Success",
        description: `Subcategory ${
          editingSubCategory ? "updated" : "created"
        } successfully`,
        duration: 5000,
      })
      resetSubCategoryDialogState()
      fetchData()
    }
  }

  const handleDeleteSubCategory = async (id: number) => {
    console.log("Deleting subcategory:", id)
    setLoading(true)

    // 1. Unlink products from this subcategory
    console.log("Unlinking products from subcategory...")
    const { error: unlinkError } = await unlinkProductsFromSubCategory(id)
    if (unlinkError) {
      console.error("Unlink failed:", unlinkError)
      setLoading(false)
      toast({
        title: "Error",
        description: "Failed to unlink products: " + unlinkError.message,
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    // 2. Delete the subcategory
    console.log("Deleting subcategory record...")
    const { error } = await deleteSubCategory(id)
    setLoading(false)

    if (error) {
      console.error("Subcategory delete failed:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    } else {
      console.log("Subcategory deleted successfully")
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
        duration: 5000,
      })
      fetchData()
    }
  }

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown"
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Category Management
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your product categories and subcategories
          </p>
        </div>
        <Button
          onClick={handleSeedCategories}
          variant="outline"
          disabled={loading}
          className="h-11 border-slate-200 hover:bg-white rounded-xl"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Seed Default Categories
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Categories Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Categories</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Main product categories
                </p>
              </div>
              <Button
                onClick={() => openCategoryDialog()}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="text-slate-700 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="w-[100px] text-slate-700 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-8 text-slate-400"
                    >
                      No categories found. Click "Seed Default Categories" to
                      get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      className="hover:bg-slate-50/50 border-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {cat.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCategoryDialog(cat)}
                            className="h-8 w-8 hover:bg-slate-100 rounded-lg"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteCategory(cat.id)}
                            className="h-8 w-8 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* SubCategories Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Subcategories
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Product subcategories
                </p>
              </div>
              <Button
                onClick={() => openSubCategoryDialog()}
                disabled={categories.length === 0}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 disabled:opacity-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="text-slate-700 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold">
                    Category
                  </TableHead>
                  <TableHead className="w-[100px] text-slate-700 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-slate-400"
                    >
                      No subcategories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subCategories.map((subCat) => (
                    <TableRow
                      key={subCat.id}
                      className="hover:bg-slate-50/50 border-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {subCat.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {getCategoryName(subCat.category_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openSubCategoryDialog(subCat)}
                            className="h-8 w-8 hover:bg-slate-100 rounded-lg"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteSubCategory(subCat.id)}
                            className="h-8 w-8 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="rounded-2xl shadow-2xl border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingCategory
                ? "Update the category details below."
                : "Create a new category for your products."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cat-name" className="text-slate-700 font-medium">
                Name *
              </Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="e.g., Sarees"
                className="mt-2 h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialog(false)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubCategory Dialog */}
      <Dialog
        open={subCategoryDialog}
        onOpenChange={handleSubCategoryDialogToggle}
      >
        <DialogContent className="rounded-2xl shadow-2xl border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingSubCategory ? "Edit Subcategory" : "Add New Subcategory"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingSubCategory
                ? "Update the subcategory details below."
                : "Create a new subcategory."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="subcat-name"
                className="text-slate-700 font-medium"
              >
                Name *
              </Label>
              <Input
                id="subcat-name"
                value={subCategoryForm.name}
                onChange={(e) =>
                  setSubCategoryForm({
                    ...subCategoryForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Silk Sarees"
                className="mt-2 h-11 rounded-xl border-slate-200"
              />
            </div>
            <div>
              <Label
                htmlFor="subcat-category"
                className="text-slate-700 font-medium"
              >
                Category *
              </Label>
              <select
                id="subcat-category"
                className="mt-2 flex h-11 w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={subCategoryForm.category_id}
                onChange={(e) =>
                  setSubCategoryForm({
                    ...subCategoryForm,
                    category_id: e.target.value,
                  })
                }
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-700 font-medium">
                Subcategory Image
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Used on the storefront subcategory tiles. Recommended size
                600x600px.
              </p>
              <div
                className="mt-3 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/40 hover:border-slate-300 transition cursor-pointer relative"
                onClick={handleSubCategoryImageBoxClick}
              >
                {subCategoryImagePreview ? (
                  <img
                    src={subCategoryImagePreview}
                    alt="Subcategory preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">
                        Click to upload
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                )}
                {subCategoryImageCompressing && (
                  <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleSubCategoryImageChange}
              />
              {(subCategoryImagePreview || subCategoryForm.image_url) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-slate-600 hover:text-slate-900"
                  onClick={handleClearSubCategoryImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove image
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetSubCategoryDialogState}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubCategory}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSubCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              {itemToDelete?.type === "category"
                ? "This will permanently delete the category and all its subcategories. Products will be unlinked but not deleted."
                : "This will permanently delete the subcategory. Products will be unlinked but not deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-200"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Categories
