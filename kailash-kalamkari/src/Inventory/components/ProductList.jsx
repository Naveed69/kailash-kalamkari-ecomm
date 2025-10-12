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
  let paginatedProducts = [];
  {
    filteredProducts &&
      (paginatedProducts = filteredProducts.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      ));
  }

  const handlePagechange = (event, value) => {
    setPage(value);
  };

  const handleChange = (items) => {
    setItemsPerPage(items.target.value);
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Products</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddProductClick}
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>PRODUCT</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>CATEGORY</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>PRICE</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>QUANTITY</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => {
              const status = getStatus(product.quantity);
              return (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell className="status-cell">
                    <span
                      className={`status ${status
                        .replace(" ", "-")
                        .toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => handleDelete(product)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
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
