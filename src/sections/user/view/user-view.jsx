import { useContext, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { users } from 'src/_mock/user';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import {
  Avatar,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import Barcode from 'src/components/modal/Barcode';
import { AddtoCartContext } from 'src/context/AddtoCartContext';

// ----------------------------------------------------------------------

export default function UserPage() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dense, setDense] = useState(false);

  const [secondary, setSecondary] = useState(false);

  const [open, setOpen] = useState(false);

  const {cart} = useContext(AddtoCartContext);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: cart,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Users</Typography>

        <Button onClick={() => setOpen(true)} variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          Barcode Scanner
        </Button>
        
      </Stack>
      <Barcode open={open} onClose={() => setOpen(false)} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ width: '100%' }}>
            <UserTableToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
            />

            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table>
                  <UserTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={users.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: 'name', label: 'Product Name' },
                      { id: 'quantity', label: 'Stocks' },
                      { id: 'price', label: 'Price' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((data) => (
                        <UserTableRow
                          key={data.id}
                          data={data}
                          // selected={selected.indexOf(row.name) !== -1}
                          // handleClick={(event) => handleClick(event, row.name)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, users.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ width: '100%' }}>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              Cart
            </Typography>
            <List dense={dense}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <Iconify icon={'eva:edit-fill'} />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <Iconify icon={'eva:trash-2-outline'} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Single-line item"
                  secondary={secondary ? 'Secondary text' : null}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
