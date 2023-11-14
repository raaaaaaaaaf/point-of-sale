import React from 'react'
import { Helmet } from 'react-helmet-async'
import CartView from 'src/sections/cart/CartView'

const CartPage = () => {
  return (
    <>
    <Helmet>
      <title> Cart </title>
    </Helmet>

    <CartView />
  </>
  )
}

export default CartPage