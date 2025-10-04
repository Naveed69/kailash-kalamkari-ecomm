
import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  DialogContentText,
} from '@mui/material';

const BarcodeScannerDialog = ({ open, onClose, onScan }) => {
  const [barcodeData, setBarcodeData] = useState('');

  const handleScan = () => {
    onScan(barcodeData);
    setBarcodeData('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Scan Barcode</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb: 2}}>
          Paste the barcode data in the field below. The expected format is "ProductName-Price-Category".
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Barcode Data"
          type="text"
          fullWidth
          variant="outlined"
          value={barcodeData}
          onChange={(e) => setBarcodeData(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && barcodeData && handleScan()}
        />
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 20px'}}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleScan} disabled={!barcodeData} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScannerDialog;
