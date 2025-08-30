import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/styles/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from './assets/pages/signup';
import Login from './assets/pages/Login';
import Home from './assets/pages/home';

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
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
