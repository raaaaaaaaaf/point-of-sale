/* eslint-disable perfectionist/sort-imports */
import { ToastContainer } from 'react-toastify';
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';
import 'react-toastify/dist/ReactToastify.css';
// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <ThemeProvider>
       <ToastContainer position="top-right" autoClose={3000} />
      <Router />
    </ThemeProvider>
  );
}
