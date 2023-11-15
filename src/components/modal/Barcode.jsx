import { Dialog } from '@mui/material';
import React, {  useEffect, useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import './barcode.css';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from 'src/firebase/firebaseConfig';


const Barcode = ({ open, onClose, cart, setCart }) => {

  const [product, setProduct] = useState([])
  const [scannedData, setScannedData] = useState('Not found');
  

  useEffect(() => {
    const fetchData = async() => {
      try {
        const data = [];
        const dataRef = query(collection(db, "data_products"));
        const dataSnap = await getDocs(dataRef)
        dataSnap.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        setProduct(data)
      } catch(err) {
        console.error(err)
      }
    }
    fetchData();
  }, [])

  const addToCart = (scannedBarcode) => {
    const matchingProduct = product.find(product => product.barcodeData === scannedBarcode);
    if (matchingProduct) {
      setCart([...cart, matchingProduct]);
    } else {
      // Handle the case when the scanned barcode doesn't match any product
      console.error('Product not found');
    }
  };

  const handleScan = async (err, result) => {
    if (result) {
      setScannedData(result.text);
      onClose(); // Close the scanner after a successful scan
      addToCart(result.text); // Add the scanned product to the cart
    } else {
      setScannedData('Not Found');
    }
  };
  
  

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
      <div className="scanner-container">
      <BarcodeScannerComponent
          width="100%"
          height="100%"
          onUpdate={handleScan}
        />
        {scannedData && (
          <div>
            <p>Scanned Data: {scannedData}</p>
          </div>
        )}
      </div>


      </Dialog>
    </div>
  )
}

export default Barcode