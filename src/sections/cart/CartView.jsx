import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import Iconify from 'src/components/iconify';
import CheckOutModal from 'src/components/modal/CheckOutModal';
import { db } from 'src/firebase/firebaseConfig';
import { fCurrency } from 'src/utils/format-number';

export default function CartView() {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [product, setProduct] = useState([]);
  const [scannedData, setScannedData] = useState('Not found');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = [];
        const dataRef = query(collection(db, 'data_products'));
        const dataSnap = await getDocs(dataRef);
        dataSnap.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setProduct(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const addToCart = (scannedBarcode) => {
    const matchingProduct = product.find((product) => product.barcodeData === scannedBarcode);

    if (matchingProduct) {
      const existingItem = cart.find((item) => item.id === matchingProduct.id);

      if (existingItem) {
        // If the item is already in the cart, update its stock, increase quantity, and update subtotal
        setCart((prevCart) =>
          prevCart.map(({ id, stock, quantity, price, ...rest }) =>
            id === existingItem.id
              ? {
                  ...rest,
                  stock: stock - 1,
                  quantity: quantity + 1,
                  subtotal: (quantity + 1) * price,
                }
              : { id, stock, quantity, price, ...rest }
          )
        );
      } else {
        // If the item is not in the cart, add it with quantity 1 and calculate subtotal
        setCart((prevCart) => [
          ...prevCart,
          {
            ...matchingProduct,
            stock: matchingProduct.stock - 1,
            quantity: 1,
            subtotal: matchingProduct.price,
          },
        ]);
      }
    } else {
      // Handle the case when the scanned barcode doesn't match any product
      alert('Product not found. Please try again.');
    }
  };

  const handleScan = async (err, result) => {
    if (result) {
      setScannedData(result.text);
      setOpen(false); // Close the scanner after a successful scan
      addToCart(result.text); // Add the scanned product to the cart
    } else {
      setScannedData('Not Found');
    }
  };

  const handleQuantityChange = (itemId, action) => {
    // Find the item in the cart based on itemId
    const updatedCart = cart.map((item) => {
      if (item.id === itemId) {
        // Update quantity based on the action (increase or decrease)
        if (action === 'increase' && item.stock > 0) {
          item.quantity = item.quantity + 1;
          item.stock = item.stock - 1;
        } else if (action === 'decrease') {
          item.quantity = Math.max(0, item.quantity - 1);
          item.stock = item.stock + 1;

          // Remove item from the cart if quantity becomes 0
          if (item.quantity === 0) {
            return null; // Returning null removes the item from the array
          }
        }

        // Update subtotal based on the new quantity
        item.subtotal = item.quantity * item.price;
      }
      return item;
    });

    // Filter out null values (items with quantity 0) and update the cart state
    const filteredCart = updatedCart.filter((item) => item !== null);
    setCart(filteredCart);
  };

  const handleDeleteItem = (itemId) => {
    // Filter out the item with the specified itemId from the cart
    const updatedCart = cart.filter((item) => item.id !== itemId);

    // Update the cart state with the modified array
    setCart(updatedCart);
  };

  console.log(cart);
  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">B & M Store</Typography>
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Barcode Scanner
        </Button>
      </Stack>
      <Grid container justifyContent="center">
        <Grid item md={10}>
          <div>
            <Dialog open={open} onClose={() => setOpen(false)}>
              <div className="scanner-container">
                <BarcodeScannerComponent width="100%" height="100%" onUpdate={handleScan} />
                {scannedData && (
                  <div>
                    <p>Scanned Data: {scannedData}</p>
                  </div>
                )}
              </div>
            </Dialog>
          </div>
          {cart.map((item) => (
            <Card key={item.id} style={{ borderRadius: '0.25rem', marginBottom: '1rem' }}>
              <CardContent style={{ padding: '1rem' }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item md={2}>
                    <CardMedia
                      component="img"
                      height="auto"
                      src={item.imageUrl}
                      alt={item.productName}
                      style={{ borderRadius: '0.25rem' }}
                    />
                  </Grid>
                  <Grid item md={3}>
                    <Typography variant="h6" fontWeight="normal" gutterBottom>
                      {item.productName}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    md={2}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => handleQuantityChange(item.id, 'decrease')}
                    >
                      <Iconify icon={'ic:outline-minus'} />
                    </IconButton>
                    <TextField
                      value={item.quantity} // Use value instead of defaultValue for controlled components
                      type="number"
                      size="small"
                      inputProps={{ min: 0 }}
                      // You can add readOnly to prevent manual input, or use onBlur to handle manual input
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleQuantityChange(item.id, 'increase')}
                    >
                      <Iconify icon={'ic:outline-add'} />
                    </IconButton>
                  </Grid>
                  <Grid item md={2} style={{ marginLeft: 'auto' }}>
                    <Typography variant="h5" gutterBottom>
                      ₱{fCurrency(item.subtotal)}
                    </Typography>
                    <Typography variant="subtitle1">({item.stock} stocks)</Typography>
                  </Grid>
                  <Grid item md={1} style={{ textAlign: 'end' }}>
                    <IconButton onClick={() => handleDeleteItem(item.id)} color="error">
                      <Iconify icon={'ic:outline-delete'} />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          {cart.length > 0 ? (
            <Card style={{ borderRadius: '0.25rem', marginBottom: '1rem' }}>
              <Button
                onClick={() => setModalOpen(true)}
                className="ms-3"
                color="warning"
                variant="contained"
                fullWidth
                size="large"
              >
                Checkout
              </Button>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1">Your cart is empty.</Typography>
              </CardContent>
            </Card>
          )}
          <CheckOutModal isOpen={modalOpen} onClose={() => setModalOpen(false)} items={cart} />
        </Grid>
      </Grid>
    </Container>
  );
}
