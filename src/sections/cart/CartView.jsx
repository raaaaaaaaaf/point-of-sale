import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { toast } from 'react-toastify';
import Iconify from 'src/components/iconify';
import Barcode from 'src/components/modal/Barcode';
import { AddtoCartContext } from 'src/context/AddtoCartContext';
import { AuthContext } from 'src/context/AuthContext';
import { db } from 'src/firebase/firebaseConfig';
import { fCurrency } from 'src/utils/format-number';

export default function CartView() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [product, setProduct] = useState([]);
  const [scannedData, setScannedData] = useState('Not found');

  const { currentUser } = useContext(AuthContext);

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
              ? { ...rest, stock: stock - 1, quantity: quantity + 1, subtotal: (quantity + 1) * price }
              : { id, stock, quantity, price, ...rest }
          )
        );
      } else {
        // If the item is not in the cart, add it with quantity 1 and calculate subtotal
        setCart((prevCart) => [
          ...prevCart,
          { ...matchingProduct, stock: matchingProduct.stock - 1, quantity: 1, subtotal: matchingProduct.price },
        ]);
      }
    } else {
      // Handle the case when the scanned barcode doesn't match any product
      alert('Product not found. Please try again.');
    }
  };
  

  const handleAddToCart = async () => {
    try {
      if (cart.length === 0) {
        console.warn('Cart is empty');
        return;
      }

      const orderRef = collection(db, 'data_sales');

      // Create an array to store items in the order
      const orderItems = cart.map((product) => ({
        productName: product.productName,
        quantity: product.quantity,
        price: product.price,
        subtotal: product.quantity * product.price,
      }));

      const order = {
        uid: currentUser.uid,
        items: orderItems,
        totalPrice: orderItems.reduce((total, item) => total + item.subtotal, 0),
        timeStamp: serverTimestamp(),
      };

      await addDoc(orderRef, order);

      toast.success('Product data added', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
      });
    } catch (err) {
      console.error(err);
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
    const updatedCart = cart.map(item => {
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
    const filteredCart = updatedCart.filter(item => item !== null);
    setCart(filteredCart);
  };
  
  
  const handleDeleteItem = (itemId) => {
    // Filter out the item with the specified itemId from the cart
    const updatedCart = cart.filter(item => item.id !== itemId);
  
    // Update the cart state with the modified array
    setCart(updatedCart);
  };
  
  
  console.log(cart);
  return (
    <Container style={{ padding: '20px 0' }}>
      <Grid container justifyContent="center">
        <Grid item md={10}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="textPrimary">
              Shopping Cart
            </Typography>
            <div>
              <Button
                onClick={() => setOpen(true)}
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="eva:plus-fill" />}
              >
                Barcode Scanner
              </Button>
            </div>
          </div>
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
                onClick={handleAddToCart}
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
        </Grid>
      </Grid>
    </Container>
  );
}
