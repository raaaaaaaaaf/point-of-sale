import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';
import { AuthContextProvider } from './context/AuthContext';
import { AddtoCartProvider } from './context/AddtoCartContext';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <AuthContextProvider>
      <AddtoCartProvider>
        <BrowserRouter>
          <Suspense>
            <App />
          </Suspense>
        </BrowserRouter>
      </AddtoCartProvider>
    </AuthContextProvider>
  </HelmetProvider>
);
