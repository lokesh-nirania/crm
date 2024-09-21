import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack'; // Import notistack provider
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Profile from './pages/Profile';

import { AuthProvider } from './providers/AuthContext'; // Import the AuthProvider
import { Shop } from '@mui/icons-material';
import Home from './pages/Home';
import ProductForm from './components/ProductForm';

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
              <Route path="profile" element={<Profile />} />
              <Route path="shop" element={<Shop />} />
              {/* Add other routes */}
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
