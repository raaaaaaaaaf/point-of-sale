import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import { IconButton } from '@mui/material';
import Iconify from 'src/components/iconify';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from 'src/firebase/firebaseConfig';
import EditModal from 'src/components/modal/EditModal';
import { toast } from 'react-toastify';
import { useState } from 'react';

// ----------------------------------------------------------------------

export default function ShopProductCard({ product }) {
  const { id, description, imageUrl, price, stock, productName } = product;

  const [open, setOpen] = useState(false)

  const handleDelete = async (id) => {
    try {
      const dataRef = doc(db, "data_products", id)
      await deleteDoc(dataRef)
      toast.success("Product removed", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } catch(err) {
      console.error(err);
    }
  }

  const renderStatus = (
    <Label
      variant="filled"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={productName}
      src={imageUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      ₱{fCurrency(price)}
      &nbsp;
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled'
        }}
      >
        {stock} stock
      </Typography>
      
      
    </Typography>
  );

  const editDelete = (
    <Link
    color="inherit"
    sx={{
      position: 'absolute',
      top: '8px', // You can adjust the positioning as needed
      right: '8px', // You can adjust the positioning as needed
      zIndex: 1,
      '&:hover': {
        textDecoration: 'none',
      },
    }}
  >
    <IconButton onClick={() => setOpen(true)} size="small" color="inherit">
      <Iconify icon={'eva:edit-fill'} />
    </IconButton>
    <IconButton onClick={() => handleDelete(id)} size="small" sx={{ color: 'error.main' }}>
      <Iconify icon={'eva:trash-2-outline'} />
    </IconButton>
    <EditModal open={open} onClose={()=> setOpen(false)} id={id} data={product}/>
  </Link>
  )

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {/* {product.status && renderStatus} */}
        {editDelete}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {productName}
        </Link>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* <ColorPreview colors={product.colors} /> */}
          {renderPrice}
        </Stack>
      </Stack>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object,
};
