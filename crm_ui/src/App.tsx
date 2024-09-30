import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack'; // Import notistack provider
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Profile from './pages/Profile';

import { AuthProvider } from './providers/AuthContext'; // Import the AuthProvider
import Home from './pages/Home';
import GRNs from './pages/GRNs';
import Shop from './pages/Shop';
import ProductDetailedPage from './pages/ProductDetailedPage';
import CartPage from './pages/Cart';
import Orders from './pages/Orders';

// Create other page components like GRN, Orders

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SnackbarProvider
        maxSnack={3} // Limit the number of snackbars
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right', // Position to top-right corner
        }}
        autoHideDuration={3000} // Auto-dismiss after 3 seconds
      >
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="grns" element={<GRNs />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="shop" element={<Shop />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/product-detail/:index" element={<ProductDetailedPage />} />
              {/* Add other routes */}
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
