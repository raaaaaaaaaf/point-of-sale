import { useContext, useState } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { listClasses } from '@mui/material/List';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { AddtoCartContext } from 'src/context/AddtoCartContext';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: null, label: 'All Products' },
  { value: 'Food and Drinks', label: 'Food and Drinks' },
  { value: 'Cleaning and Personal Health', label: 'Cleaning and Personal Health' },
  { value: 'School and Office Supplies', label: 'School and Office Supplies' },
  { value: 'Cigarettes and Tobacco', label: 'Cigarettes and Tobacco' },
  { value: 'Household Items', label: 'Household Items' },
  { value: 'Kitchen Supplies', label: 'Kitchen Supplies' },
  { value: 'Snacks and Sweets', label: 'Snacks and Sweets' },
  { value: 'Beverages', label: 'Beverages' },
];

export default function ShopProductSort() {
  const [open, setOpen] = useState(null);

  const { category, setCategory } = useContext(AddtoCartContext);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleSortOptionClick = (value) => {
    setCategory(value);
    handleClose();
  };

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        onClick={handleOpen}
        endIcon={<Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
      >
        Category:&nbsp;
        {category ? (
          <Typography component="span" variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {category}
          </Typography>
        ) : (
          <Typography component="span" variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Select Category
          </Typography>
        )}
      </Button>

      <Menu
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              [`& .${listClasses.root}`]: {
                p: 0,
              },
            },
          },
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === category}
            onClick={() => handleSortOptionClick(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
