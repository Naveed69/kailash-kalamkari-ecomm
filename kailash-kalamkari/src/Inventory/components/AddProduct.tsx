import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ConfirmationDialog from "./ConfirmationDialog";
import BarcodeScannerDialog from "./BarcodeScannerDialog";
import "../pages/Dashboard.css";

const AddProduct = ({ allProducts, setAllProducts }) => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Saree");
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);

  const categories = ["Saree", "Fabric", "Home Decor", "Dupatta"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !price) {
      alert("Please fill in all fields.");
      return;
    }

    const productExists = allProducts.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );

    if (productExists) {
      setExistingProduct(productExists);
      setOpen(true);
    } else {
      addNewProduct();
    }
  };

  const addNewProduct = () => {
    const newProduct = {
      id: allProducts.length + 1,
      name: productName,
      price: parseFloat(price),
      category: category,
      quantity: parseInt(quantity),
    };
    setAllProducts([...allProducts, newProduct]);
    resetForm();
    alert("Product added successfully!");
  };

  const handleUpdateProduct = () => {
    const updatedProducts = allProducts.map((p) =>
      p.id === existingProduct.id
        ? {
            ...p,
            quantity: p.quantity + parseInt(quantity),
            price: parseFloat(price),
          }
        : p
    );
    setAllProducts(updatedProducts);
    resetForm();
    setOpen(false);
    alert("Product updated successfully!");
  };

  const handleClose = () => {
    setOpen(false);
  };

  const resetForm = () => {
    setProductName("");
    setPrice("");
    setCategory("Saree");
    setQuantity(1);
  };

  const handleScan = (barcodeData) => {
    const parts = barcodeData.split("-");
    if (parts.length === 3) {
      setProductName(parts[0]);
      setPrice(parts[1]);
      setCategory(parts[2]);
    } else {
      alert("Invalid barcode format. Expected: ProductName-Price-Category");
    }
  };

  return (
    <div className="add-product-container">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: "12px" }}>
        <Typography variant="h4" gutterBottom align="center">
          Add New Product
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                type="number"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              align="center"
              sx={{ display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button type="submit" variant="contained">
                Add Product
              </Button>
              <Tooltip title="Scan Barcode">
                <IconButton
                  onClick={() => setBarcodeDialogOpen(true)}
                  color="primary"
                >
                  <QrCodeScannerIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleUpdateProduct}
        title="Product Exists"
        message={`Product "${productName}" already exists. Do you want to update the quantity and price?`}
      />
      <BarcodeScannerDialog
        open={barcodeDialogOpen}
        onClose={() => setBarcodeDialogOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
};

export default AddProduct;
