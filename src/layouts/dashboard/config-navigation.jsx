import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------



const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: <Iconify icon={'carbon:analytics'}/>,
  },
  {
    title: 'Order',
    path: '/cart',
    icon: <Iconify icon={'solar:bag-3-broken'}/>,
  },
  {
    title: 'Order History',
    path: '/order',
    icon: <Iconify icon={'simple-line-icons:bag'}/>,
  },
  {
    title: 'Inventory',
    path: '/products',
    icon: <Iconify icon={'material-symbols:inventory-2-outline-rounded'}/>,
  },

];

export default navConfig;
