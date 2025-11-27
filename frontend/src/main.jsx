import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter , RouterProvider } from 'react-router';
import './index.css'
import App from './App.jsx'
import AdminNavSideBar from './components/admin/AdminNavSideBar.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)