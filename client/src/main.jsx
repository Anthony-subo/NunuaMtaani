import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'

// 🌍 Automatically attach token globally to all axios requests
const storedUser = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token') || (storedUser && storedUser.token);

if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)