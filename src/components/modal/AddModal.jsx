import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Input,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import './barcode.css';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from 'src/firebase/firebaseConfig';
import { toast } from 'react-toastify';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const AddModal = ({ open, onClose }) => {
  const [barcodeData, setBarcodeData] = useState('Not Found');
  const [isScannerOpen, setIsScannerOpen] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: 0,
    quantity: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleScan = (err, result) => {
    if (result) {
      setBarcodeData(result.text);
      setIsScannerOpen(false); // Close the scanner after successful scan
    } else {
      setBarcodeData('Not Found');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
  };

  const handleAdd = async () => {
    try {
      // Upload the image to Firebase Storage
      if (uploadedImage) {
        const storageRef = ref(storage, 'images/' + uploadedImage.name);
        const uploadTask = uploadBytesResumable(storageRef, uploadedImage);

        uploadTask.on('state_changed',
          (snapshot) => {
            // Handle upload state changes if needed
          },
          (error) => {
            console.error('Error uploading image:', error);
          },
          async () => {
            // Upload completed successfully, get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Add product data to Firestore with the download URL
            const dataRef = collection(db, 'data_products');
            const newProduct = {
              barcodeData: barcodeData,
              description: formData.description,
              price: formData.price,
              productName: formData.productName,
              quantity: formData.quantity,
              imageUrl: downloadURL, // Save the download URL
            };
            const docRef = await addDoc(dataRef, newProduct);

            toast.success('Product data added', {
              position: 'top-right',
              autoClose: 3000, // Close the toast after 3 seconds
              hideProgressBar: false,
            });
            onClose();
          }
        );
      } else {
        // Handle the case when no image is selected
        console.error('No image selected.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Product</DialogTitle>
      <Divider />
      <DialogContent>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                required
                id="pname"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                label="Product Name"
                variant="outlined"
                fullWidth
              />
              <TextField
                margin="dense"
                required
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                label="Description"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                required
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                label="Price"
                variant="outlined"
                fullWidth
                type="number"
              />
              <TextField
                margin="dense"
                required
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
              />
            </Grid>
          </Grid>
          <Divider
            style={{
              height: '4px', // Set the height to make it thicker
              margin: '16px 0', // Add margin to the top and bottom
            }}
          />

          <Typography variant="h6">Images</Typography>

          <div>
            <Input
              accept="image/*" // Restrict to image files
              type="file"
              style={{ display: 'none' }}
              inputProps={{ 'aria-label': 'upload image' }}
              onChange={handleFileChange}
              id="fileInput"
            />
            {uploadedImage ? (
              <div>
                <Typography variant="body1">Selected Image:</Typography>
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Selected"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            ) : (
              <label htmlFor="fileInput">
                <Button variant="contained" component="span" color="inherit">
                  Upload Image
                </Button>
              </label>
            )}
          </div>
        </div>
        <Divider
          style={{
            height: '4px', // Set the height to make it thicker
            margin: '16px 0', // Add margin to the top and bottom
          }}
        />
        <Typography variant="h6">Scan Barcode: </Typography>
        <div className="scanner-container">
          {isScannerOpen ? (
            <BarcodeScannerComponent width="100%" height="100%" onUpdate={handleScan} />
          ) : null}
        </div>
        {barcodeData && <Typography variant="body1">Barcode Data: {barcodeData}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button onClick={handleAdd} color="primary" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddModal;
