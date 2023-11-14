import { Box } from '@mui/material'
import React from 'react'

const Loader = () => {
  return (
    <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
     }}>
    <img src="/assets/loader.gif" alt="loader"/>
     </Box>
  )
}

export default Loader