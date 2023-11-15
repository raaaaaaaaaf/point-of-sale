import React from 'react';
import { Helmet } from 'react-helmet-async';
import { OrderHistory } from 'src/sections/order/view';


const OrderPage = () => {
  return (
    <>
      <Helmet>
        <title> Order | POS B & M Store </title>
      </Helmet>

      <OrderHistory/>
    </>
  );
};

export default OrderPage;
