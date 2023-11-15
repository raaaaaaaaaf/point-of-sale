import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import Loader from 'src/components/loader/Loader';
import Receipt from 'src/components/modal/Receipt';
import { AuthContext } from 'src/context/AuthContext';

import DashboardLayout from 'src/layouts/dashboard';
import CartPage from 'src/pages/cart';
import OrderPage from 'src/pages/order';
import RegisterPage from 'src/pages/register';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {

  const {currentUser, loading} = useContext(AuthContext)

  const ProtectedRoute = ({children}) => {
    const [timedOute, setTimedOut] = useState(false)

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setTimedOut(true);
      }, 2000);

      return () => {
        clearTimeout(timeoutId);
      }
    }, [])

    if (loading) {
      if (timedOute) {
        // Redirect to login page if loading takes too long
        return <Navigate to="/login" replace />;
      } else {
        return <Loader/>
      }
    }
    if(!currentUser) {
      return <Navigate to='/login'/>
    }
    return children
  }

  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element:<ProtectedRoute><IndexPage /></ProtectedRoute> , index: true },
        { path: 'app', element: <ProtectedRoute><IndexPage /></ProtectedRoute>  },
        { path: 'products', element: <ProtectedRoute><ProductsPage /></ProtectedRoute> },
        { path: 'cart', element: <ProtectedRoute><CartPage /></ProtectedRoute> },
        { path: 'cart/receipt/:id', element: <ProtectedRoute><Receipt /></ProtectedRoute> },
        { path: 'order', element: <ProtectedRoute><OrderPage /></ProtectedRoute> },
        { path: 'order/receipt/:id', element: <ProtectedRoute><Receipt /></ProtectedRoute> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'register',
      element: <RegisterPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
