import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';

import Home from './src/pages/Home';
import Marketplace from './src/pages/Marketplace';
import Jobs from './src/pages/Jobs';
import Events from './src/pages/Events';
import Freelance from './src/pages/Freelance';
import Artistes from './src/pages/Artistes';
import ArtisteProfile from './src/pages/ArtisteProfile';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import Profile from './src/pages/Profile';
import MyProducts from './src/pages/MyProducts';
import MyJobs from './src/pages/MyJobs';
import MyEvents from './src/pages/MyEvents';
import FreelanceProfile from './src/pages/FreelanceProfile';
import Settings from './src/pages/Settings';
import Checkout from './src/pages/Checkout';
import OrderSuccess from './src/pages/OrderSuccess';
import AdminDashboard from './src/pages/AdminDashboard';
import EnhancedProfile from './src/pages/EnhancedProfile';
import MyCredits from './src/pages/MyCredits';
import Wishlist from './src/pages/Wishlist';
import ProductDetail from './src/pages/ProductDetail';
import Messages from './src/pages/Messages';
import Notifications from './src/pages/Notifications';
import NotFound from './src/pages/NotFound';

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <AuthProvider>
        <Router>
        <main className="min-h-screen font-sans">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/shop" element={<Marketplace />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/freelance" element={<Freelance />} />
            <Route path="/artistes" element={<Artistes />} />
            <Route path="/artiste-profile" element={<ArtisteProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/enhanced-profile" element={<EnhancedProfile />} />
            <Route path="/my-products" element={<MyProducts />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/freelance-profile" element={<FreelanceProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-credits" element={<MyCredits />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
      </AuthProvider>
    </Theme>
  );
}

export default App;