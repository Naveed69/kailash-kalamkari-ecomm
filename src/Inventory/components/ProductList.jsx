import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  InputBase,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import EditProductModal from "./EditProductModal";
import ConfirmationDialog from "./ConfirmationDialog";
import "./ProductList.css";
import { useInventory } from "../../contexts/InventoryContext";

const ProductList = () => {
  const { categories } = useInventory();
  console.log("this is products context data", categories);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    console.log("all product updated");
    let tempProducts = [];

    for (let i = 0; i < categories.length; i++)
      for (let j = 0; j < categories[i].subCategories.length; j++) {
        tempProducts.push(...categories[i].subCategories[j].products);
      }

    if (selectedCategory !== "All Categories") {
      tempProducts = tempProducts.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      tempProducts = tempProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(tempProducts);
    setPage(1);
  }, [selectedCategory, searchTerm, categories]);

  const getStatus = (quantity) => {
    if (quantity === 0) {
      return "Out of Stock";
    } else if (quantity <= 10) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSave = (updatedProductData) => {
    updateProduct(updatedProductData.id, updatedProductData);
    handleCloseModal();
  };

  const handleDelete = (product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = () => {
    console.log(deletingProduct);
    deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  const handleAddProductClick = () => {
    navigate("/inventory/add-product");
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  //pagination items per page code below
  const paginatedProducts = useMemo(() => {
  return filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
}, [filteredProducts, page, itemsPerPage]);


  const handlePagechange = (event, value) => {
    setPage(value);
  };

  const handleChange = (items) => {
    setItemsPerPage(Number(items.target.value));
    setPage(1);
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Products</h1>
        <Button
          variant="contained"
          onClick={handleAddProductClick}
          style={{ background: "#D49217" }}
        >
          + Add Product
        </Button>
      </div>
      <div className="product-list-controls">
        <div className="search-bar">
          <Search />
          <InputBase
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <MenuItem value="All Categories">All Categories</MenuItem>
          <MenuItem value="Sarees">Saree</MenuItem>
          <MenuItem value="Fabric">Fabric</MenuItem>
          <MenuItem value="Home Decor">Home Decor</MenuItem>
          <MenuItem value="Dupatta">Dupatta</MenuItem>
        </Select>
      </div>

      <Grid container spacing={2}>
        {paginatedProducts.map((product) => {
          const status = getStatus(product.quantity);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: 350, // fixed height
                  display: "flex",
                  flexDirection: "column",
                  width: "100%", // force card to full width of grid item
                  boxSizing: "border-box",
                }}
              >
                {/* Compact Image */}
                <CardMedia
                  component="img"
                  image={product.image || "/placeholder.png"}
                  alt={product.name}
                  sx={{
                    height: 100,
                    objectFit: "contain",
                    p: 1,
                  }}
                />

                {/* Product Info */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Category: {product.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Price: ₹{product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Quantity: {product.quantity}
                  </Typography>

                  {/* Status Chip */}
                  <Chip
                    label={status}
                    color={
                      status.toLowerCase() === "in stock"
                        ? "success"
                        : status.toLowerCase() === "low stock"
                        ? "warning"
                        : "error"
                    }
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>

                {/* Action Buttons */}
                <CardContent sx={{ display: "flex", gap: 1, pt: 0 }}>
                  <Button
                    // color="primary"
                    onClick={() => handleEdit(product)}
                    fullWidth
                    size="small"
                    style={{ background: "#D49217", color: "white" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDelete(product)}
                    fullWidth
                    size="small"
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {paginatedProducts.length <= 0 && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <div>No Products Found</div>
        </div>
      )}
      <div className="product-list-footer">
        <span>
          Showing {paginatedProducts.length} of {filteredProducts.length}{" "}
          results
        </span>
        <Pagination
          count={Math.ceil(filteredProducts.length / itemsPerPage)}
          page={page}
          onChange={handlePagechange}
        />
        <div>
          Items per page
          <select value={itemsPerPage} onChange={handleChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <EditProductModal
        product={editingProduct}
        open={!!editingProduct}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
      <ConfirmationDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete \"${deletingProduct?.name}\"?`}
      />
    </div>
  );
};

export default ProductList;
