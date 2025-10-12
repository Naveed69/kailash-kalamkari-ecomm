
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const EditProductModal = ({ product, open, onClose, onSave }) => {
  const [editedProduct, setEditedProduct] = useState(null);

  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  if (!open || !editedProduct) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSave = () => {
    onSave(editedProduct);
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Product</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <TextField
          name="name"
          label="Product Name"
          value={editedProduct.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="category"
          label="Category"
          value={editedProduct.category}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="price"
          label="Price"
          value={editedProduct.price}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="quantity"
          label="Quantity"
          type="number"
          value={editedProduct.quantity}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditProductModal;
