import { useEffect, useState } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import ProductCard from '../product-card';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import AddModal from 'src/components/modal/AddModal';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from 'src/firebase/firebaseConfig';
import Loader from 'src/components/loader/Loader';

// ----------------------------------------------------------------------

export default function ProductsView() {
  const [modalOpen, setModalOpen] = useState(false);

  const [product, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

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
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Products</Typography>

        <Button
          onClick={() => setModalOpen(true)}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          New Product
        </Button>

        <AddModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </Stack>
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          {product.map((products) => (
            <Grid key={products.id} xs={12} sm={6} md={3}>
              <ProductCard product={products} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
