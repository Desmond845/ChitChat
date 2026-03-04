// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
// src/main.jsx  — replace your existing main.jsx with this
// Adds a simple route: /admin → BroadcastDashboard, everything else → App
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import BroadcastDashboard from './BroadcastDashboard.jsx';
import './index.css';

const isDashboard = window.location.pathname === '/admin';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDashboard ? <BroadcastDashboard /> : <App />}
  </StrictMode>
);