import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from 'src/context/AuthContext';
import { db } from 'src/firebase/firebaseConfig';
import { useRouter } from 'src/routes/hooks';
import { fCurrency } from 'src/utils/format-number';

const CheckOutModal = ({ isOpen, onClose, items }) => {
  const [total, setTotal] = useState(0);
  const [cash, setCash] = useState(0);
  const [change, setChange] = useState(0);

  const router = useRouter();

  const { userData } = useContext(AuthContext);

  const calculateTotal = () => {
    const newTotal = items.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
    return newTotal;
  };

  const calculateChange = () => {
    const cashValue = parseFloat(cash);
    const totalValue = parseFloat(total);
    
    /* eslint-disable no-restricted-globals */
    if (!isNaN(cashValue) && !isNaN(totalValue)) {
      const calculatedChange = cashValue - totalValue;
      setChange(calculatedChange);
    }
  };

  useEffect(() => {
    calculateChange();
  }, [cash, total]);

  const handleCashChange = (event) => {
    setCash(event.target.value);
  };

  // Call calculateTotal once, when component mounts or when items change
  useEffect(() => {
    console.log('Items:', items);
    const newTotal = calculateTotal();
    console.log('New Total:', newTotal);
    setTotal(newTotal);
  }, [items]);

  const handleAddToCart = async () => {
    try {
      if (items.length === 0) {
        console.warn('Cart is empty');
        return;
      }

      const orderRef = collection(db, 'data_sales');
      const productRefs = items.map((item) => {
        if (item && item.id) {
          return doc(db, 'data_products', item.id);
        } else {
          console.error('Invalid or undefined items object.');
          // Handle the error or return a default value
          return null;
        }
      });

      // Create an array to store items in the order
      const orderItems = items.map((product) => ({
        productName: product.productName,
        quantity: product.quantity,
        price: product.price,
        subtotal: product.quantity * product.price,
      }));

      const order = {
        displayName: userData.displayName,
        items: orderItems,
        totalPrice: total,
        cash: cash,
        change: change,
        timeStamp: serverTimestamp(),
      };

      const docRef = await addDoc(orderRef, order);

      const docId = docRef.id;
      // Update the stock of products in the 'data_products' collection
      const updatePromises = productRefs.map(async (productRef, index) => {
        // Update the stock for each product
        await updateDoc(productRef, {
          stock: items[index].stock, // Assuming each item in 'items' has a 'stock' property
        });
      });

      await Promise.all(updatePromises);

      router.push(`receipt/${docId}`);

      toast.success('Order Success', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Items List</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total Price</TableCell>
                {/* Add more table headers if needed */}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₱{fCurrency(item.price)}</TableCell>
                  <TableCell>₱{fCurrency(item.subtotal)}</TableCell>
                  {/* Add more cells for additional item properties */}
                </TableRow>
              ))}
              <TableRow>
                <TableCell>Total:</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>₱{fCurrency(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TextField
          margin="dense"
          required
          id="cash"
          name="cash"
          value={cash}
          onChange={handleCashChange}
          label="Cash"
          variant="outlined"
          fullWidth
          type="number"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleAddToCart} color="primary" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckOutModal;
