
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { useRouter } from 'src/routes/hooks';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from 'src/firebase/firebaseConfig';
import { toast } from 'react-toastify';

// ----------------------------------------------------------------------

export default function UserTableRow({ selected, name, avatarUrl, items, totalPrice, id }) {

  const router = useRouter();

  const handleLink = (id) => {
    router.push(`receipt/${id}`)
  }
  
  const handleDelete = async (id) => {
    try {
      const dataRef = doc(db, "data_sales", id)
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

  return (

      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          {items.map((item) => (
            <span key={item.id}>{item.productName} x{item.quantity}</span>
          ))}
        </TableCell>

        <TableCell>
        ₱ {fCurrency(totalPrice)}
        </TableCell>

        <TableCell align="left">
        <IconButton onClick={() => handleLink(id)}>
          <Iconify icon={'la:receipt'} />
          </IconButton>
          <IconButton onClick={() => handleDelete(id)} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} />
          </IconButton>
        </TableCell>
      </TableRow>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
};
