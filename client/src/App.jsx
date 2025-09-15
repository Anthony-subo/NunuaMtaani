import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/styles/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from './assets/pages/signup';
import Login from './assets/pages/Login';
import Home from './assets/pages/home';
import NunuaMtaaniLanding from './assets/pages/NunuaMtaaniLanding';
import Verificat from './assets/pages/Verificat';
import RiderDashboard from './assets/pages/RiderDashboard';
import RiderTrips from './assets/pages/RiderTrips';
import RiderEarnings from './assets/pages/RiderEarnings';



import AdminDashboard from './assets/pages/AdminDashboard';
import SellerDashboard from './assets/pages/SellerDashboard';
import BuyerDashboard from './assets/pages/BuyerDashboard';

import ProtectedRoute from './assets/components/ProtectedRoute';
import Layout from './assets/components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes WITHOUT header */}
        <Route path="/" element={<NunuaMtaaniLanding />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<Verificat />} />


        {/* Routes WITH header via Layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute role="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute role="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
  path="/rider-dashboard"
  element={
    <ProtectedRoute role="rider">
      <RiderDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider-trips"
  element={
    <ProtectedRoute role="rider">
      <RiderTrips />
    </ProtectedRoute>
  }
/>
<Route
  path="/rider-earnings"
  element={
    <ProtectedRoute role="rider">
      <RiderEarnings />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
