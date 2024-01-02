import { useContext, useEffect, useState } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';


import ProductCard from '../product-card';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import AddModal from 'src/components/modal/AddModal';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from 'src/firebase/firebaseConfig';
import Loader from 'src/components/loader/Loader';
import ShopProductSort from '../product-sort';
import { AddtoCartContext } from 'src/context/AddtoCartContext';
import ProductSearch from '../product-search';

// ----------------------------------------------------------------------

export default function ProductsView() {
  const [modalOpen, setModalOpen] = useState(false);

  const [product, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [productNameSearch, setProductNameSearch] = useState("");

  const { category } = useContext(AddtoCartContext)

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
  
        // Filter the data array based on the selected category
        let filteredData = category && category !== 'All Products'
          ? data.filter((item) => item.category === category)
          : data;
  
        // Apply additional filtering based on the product name search
        if (productNameSearch) {
          filteredData = filteredData.filter((item) =>
            item.productName.toLowerCase().includes(productNameSearch.toLowerCase())
          );
        }
  
        // Sort the filtered data array alphabetically based on the productName
        const sortedData = filteredData.sort((a, b) => a.productName.localeCompare(b.productName));
  
        setProducts(sortedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [category, productNameSearch]);

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        
      <ProductSearch products={product} onProductNameSearch={(value) => setProductNameSearch(value)} />
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
       
          <ShopProductSort />
          <Button
            onClick={() => setModalOpen(true)}
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Product
          </Button>
        </Stack>

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
