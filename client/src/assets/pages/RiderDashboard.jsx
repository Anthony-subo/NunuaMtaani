import React, { useState, useEffect } from 'react';
import RiderMap from '../components/RiderMap';
import RiderTrips from '../components/RiderTrips';
import RiderEarnings from '../components/RiderEarnings';
import Settings from '../components/Settings';
import Header from '../components/Header';
import { FaMapMarkedAlt, FaMotorcycle, FaWallet, FaCog } from 'react-icons/fa';
import '../styles/dashboard.css';
import axios from 'axios';

function RiderDashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [riderName, setRiderName] = useState('');
  const [riderId, setRiderId] = useState(null); // ✅ Mongo _id of rider

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'rider') {
      window.location.href = '/login';
    } else {
      setRiderName(user.name);

      // ✅ fetch rider profile using user._id
      axios
        .get(`/api/riders?userId=${user._id}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setRiderId(res.data[0]._id); // save Mongo _id
          }
        })
        .catch((err) => console.error('Error fetching rider profile:', err));
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'map':
        return riderId ? <RiderMap riderId={riderId} /> : <p>Loading rider...</p>;
      case 'trips':
        return <RiderTrips />;
      case 'earnings':
        return <RiderEarnings />;
      case 'settings':
        return <Settings />;
      default:
        return riderId ? <RiderMap riderId={riderId} /> : <p>Loading rider...</p>;
    }
  };

  return (
    <div className="container dashboard-container">
      <Header />

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'map' ? 'active' : ''}
          onClick={() => setActiveTab('map')}
          title="Live Map"
        >
          <FaMapMarkedAlt size={22} />
          <span className="tab-label">Map</span>
        </button>
        <button
          className={activeTab === 'trips' ? 'active' : ''}
          onClick={() => setActiveTab('trips')}
          title="My Trips"
        >
          <FaMotorcycle size={22} />
          <span className="tab-label">Trips</span>
        </button>
        <button
          className={activeTab === 'earnings' ? 'active' : ''}
          onClick={() => setActiveTab('earnings')}
          title="Earnings"
        >
          <FaWallet size={22} />
          <span className="tab-label">Earnings</span>
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          <FaCog size={22} />
          <span className="tab-label">Settings</span>
        </button>
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header text-center py-3 mb-3">
        <h2>
          {riderName ? (
            <span className="text-primary">🏍️ Welcome, {riderName}!</span>
          ) : (
            'Rider Dashboard'
          )}
        </h2>
        <p className="dashboard-subtext small text-muted">
          Track your deliveries, see completed trips, and check your earnings.
        </p>
      </div>

      <div className="dashboard-content container">{renderTab()}</div>
    </div>
  );
}

export default RiderDashboard;
