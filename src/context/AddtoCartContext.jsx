import React, { createContext, useState } from 'react'

export const AddtoCartContext = createContext();

export const AddtoCartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState("")
    
  return (
    <AddtoCartContext.Provider value={{cart, setCart, category, setCategory}}>
        {children}
    </AddtoCartContext.Provider>
  )
}

