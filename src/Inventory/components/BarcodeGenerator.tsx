import React, { useState, useRef } from "react";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import {
  Button,
  TextField,
  Paper,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import "../pages/Dashboard.css";

const BarcodeGenerator = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Saree");
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const barcodeValue = `${productName}-${price}-${category}`;
  const categories = ["Saree", "Fabric", "Home Decor", "Dupatta"];

  return (
    <div className="barcode-generator-container">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: "12px" }}>
        <Typography variant="h4" gutterBottom align="center">
          Barcode Generator
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="₹ Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category" // 👈 this fixes the strike-through issue
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Barcode will be visible here now */}
          <Grid item xs={12} align="center">
            <div
              ref={componentRef}
              className="barcode-print"
              style={{ padding: "20px" }}
            >
              {productName && price && category && (
                <>
                  <Typography variant="h6">{productName}</Typography>
                  <Typography variant="body1">Price: ₹{price} </Typography>
                  <Typography variant="body2">Category: {category}</Typography>
                  <Barcode value={barcodeValue} />
                </>
              )}
            </div>
          </Grid>

          <Grid item xs={12} align="center">
            <Button
              // variant="contained"
              onClick={handlePrint}
              sx={{ mt: 2 }}
              disabled={!productName || !price || !category}
              style={{ background: "#D49217", color: "white" }}
            >
              Print Barcode
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default BarcodeGenerator;
