import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { db } from 'src/firebase/firebaseConfig';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import Loader from '../loader/Loader';
import Iconify from '../iconify';

const Receipt = () => {
  const [receiptData, setReceiptData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const dataRef = doc(db, 'data_sales', id);

      const fetchData = async () => {
        try {
          const docSnap = await getDoc(dataRef);
          if (docSnap.exists()) {
            setReceiptData({ ...docSnap.data(), id: docSnap.id });
          } else {
            setReceiptData({});
          }
        } catch (err) {
          console.error(err);
          setError(err.message); // Handle and display the error to the user
        } finally {
          setLoading(false); // Set loading to false once data fetching is complete
        }
      };

      fetchData();
    }
  }, [id]);

  console.log(receiptData);

  const componentRef = useRef();
  return (
    <div>
      <ReactToPrint
        trigger={() => {
          // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
          // to the root node of the returned component as it will be overwritten.
          return (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="material-symbols:print-outline" />}
            >
              Print
            </Button>
          );
        }}
        content={() => componentRef.current}
      />
      {loading ? (
        <Loader />
      ) : (
        <Container ref={componentRef} sx={{ py: 5 }}>
          <Card elevation={3} sx={{ maxWidth: 600, margin: 'auto' }}>
            <CardContent sx={{ mx: 4 }}>
              <Container>
                <Typography variant="h4" align="center" sx={{ my: 5 }}>
                  Thank you for your purchase
                </Typography>


                <Grid item xs={12} md={4}>
                  <Typography variant="body1">B & M Store</Typography>
                  <Typography variant="body1">{receiptData.displayName}</Typography>
                  <Typography variant="body1">
                    Receipt
                    <span style={{ color: 'grey', fontSize: 'smaller' }}> #{receiptData.id}</span>
                  </Typography>
                  <Typography variant="body1">{fDateTime(receiptData.timeStamp)}</Typography>
                </Grid>

                {receiptData.items.map((item) => (
                  <Grid item xs={12} md={8} key={item.id}>
                    {' '}
                    {/* Make sure to add a unique key */}
                    <Divider />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '15px',
                        marginBottom: '15px',
                      }}
                    >
                      <Typography variant="body1">
                        {item.productName} x{item.quantity}
                      </Typography>
                      <Typography variant="body1" align="right">
                        ₱{fCurrency(item.subtotal)}
                      </Typography>
                    </div>
                    <Divider />
                    {/* Repeat the above structure for other items */}
                  </Grid>
                ))}

                <Grid container className="text-black" sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Typography variant="body1" align="right">
                      Cash ₱{fCurrency(receiptData.cash)}
                    </Typography>
                    <Typography variant="body1" align="right">
                      Change ₱{fCurrency(receiptData.change)}
                    </Typography>
                    <Typography variant="body1" align="right" fontWeight="bold">
                      Total ₱{fCurrency(receiptData.totalPrice)}
                    </Typography>
                  </Grid>
                  <Divider />
                </Grid>
              </Container>
            </CardContent>
          </Card>
        </Container>
      )}
    </div>
  );
};

export default Receipt;
