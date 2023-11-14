import React, { createContext, useState } from 'react'

export const AddtoCartContext = createContext();

export const AddtoCartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    
  return (
    <AddtoCartContext.Provider value={{cart, setCart}}>
        {children}
    </AddtoCartContext.Provider>
  )
}

