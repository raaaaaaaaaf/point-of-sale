import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify';
import CheckOutModal from 'src/components/modal/CheckOutModal';
import { db } from 'src/firebase/firebaseConfig';
import { fCurrency } from 'src/utils/format-number';
import useScanDetection from 'use-scan-detection';

export default function CartView() {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [products, setProduct] = useState([]);
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

  // const addToCart = (scannedBarcode) => {
  //   const matchingProduct = product.find((product) => product.barcodeData === scannedBarcode);

  //   if (matchingProduct) {
  //     const existingItem = cart.find((item) => item.id === matchingProduct.id);

  //     if (existingItem) {
  //       // If the item is already in the cart, update its stock, increase quantity, and update subtotal
  //       setCart((prevCart) =>
  //         prevCart.map(({ id, stock, quantity, price, ...rest }) =>
  //           id === existingItem.id
  //             ? {
  //                 ...rest,
  //                 stock: stock - 1,
  //                 quantity: quantity + 1,
  //                 subtotal: (quantity + 1) * price,
  //               }
  //             : { id, stock, quantity, price, ...rest }
  //         )
  //       );
  //     } else {
  //       // If the item is not in the cart, add it with quantity 1 and calculate subtotal
  //       setCart((prevCart) => [
  //         ...prevCart,
  //         {
  //           ...matchingProduct,
  //           stock: matchingProduct.stock - 1,
  //           quantity: 1,
  //           subtotal: matchingProduct.price,
  //         },
  //       ]);
  //     }
  //   } else {
  //     // Handle the case when the scanned barcode doesn't match any product
  //     alert('Product not found. Please try again.');
  //   }
  // };
  const addToCart = (scannedBarcode) => {
    const matchingProduct = products.find((product) => product.barcodeData === scannedBarcode);
  
    if (matchingProduct) {
      const { id, stock, price, ...rest } = matchingProduct;
      const numericPrice = parseFloat(price); // Convert price from string to number
      const numericStock = parseInt(stock, 10); // Convert stock from string to number
  
      const existingItemIndex = cart.findIndex((item) => item.id === id);
  
      if (existingItemIndex !== -1) {
        // If the item is already in the cart, update its stock, increase quantity, and update subtotal
        setCart((prevCart) => {
          const updatedCart = [...prevCart];
          const existingItem = updatedCart[existingItemIndex];
  
          // Check if the updated quantity will exceed the available stock
          if (existingItem.quantity + 1 <= numericStock) {
            updatedCart[existingItemIndex] = {
              ...existingItem,
              stock: numericStock - (existingItem.quantity + 1), // Decrease stock based on total quantity
              quantity: existingItem.quantity + 1,
              subtotal: (existingItem.quantity + 1) * numericPrice,
            };
          } else {
            alert('Cannot add more items. Stock limit reached.');
          }
  
          return updatedCart;
        });
      } else {
        // If the item is not in the cart, add it with quantity 1 and calculate subtotal
        setCart((prevCart) => [
          ...prevCart,
          {
            ...rest,
            id,
            stock: numericStock - 1,
            quantity: 1,
            subtotal: numericPrice,
            price: numericPrice, // Include the price in the cart item
          },
        ]);
      }
    } else {
      // Handle the case when the scanned barcode doesn't match any product
      alert('Product not found. Please try again.');
    }
  };
  

  useScanDetection({
    onComplete: addToCart,
    minLength: 3, // EAN13
  });

  // const handleScan = async (err, result) => {
  //   if (result) {
  //     setScannedData(result.text);
  //     setOpen(false); // Close the scanner after a successful scan
  //     addToCart(result.text); // Add the scanned product to the cart
  //   } else {
  //     setScannedData('Not Found');
  //   }
  // };
  const handleQuantityChange = (itemId, action) => {
    // Find the item in the cart based on itemId
    const updatedCart = cart.map((item) => {
      if (item.id === itemId) {
        const numericStock = parseInt(item.stock, 10);
        const numericPrice = parseFloat(item.price); // Convert price from string to number
  
        // Update quantity based on the action (increase or decrease)
        if (action === 'increase' && numericStock > 0) {
          // Check if increasing quantity exceeds available stock
          if (item.quantity + 1 <= numericStock) {
            // Create a new object with updated quantity and stock
            return {
              ...item,
              quantity: item.quantity + 1,
              stock: numericStock - 1,
              subtotal: (item.quantity + 1) * numericPrice, // Update subtotal
            };
          } else {
            // If quantity exceeds stock, do not update
            alert('Cannot increase quantity. Stock limit reached.');
            return item; // Do not proceed with stock update
          }
        } else if (action === 'decrease') {
          // Create a new object with updated quantity and stock
          const updatedItem = {
            ...item,
            quantity: Math.max(0, item.quantity - 1),
            stock: numericStock + 1,
            subtotal: Math.max(0, item.quantity - 1) * numericPrice, // Update subtotal
          };
  
          // Remove item from the cart if quantity becomes 0
          return updatedItem.quantity === 0 ? null : updatedItem;
        }
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
        {/* <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Barcode Scanner
        </Button> */}
      </Stack>
      <Grid container justifyContent="center">
        <Grid item md={10}>
          {/* <div>
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
          </div> */}
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
