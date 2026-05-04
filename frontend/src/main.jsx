import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13161e',
            color: '#e8eaf0',
            border: '1px solid #252a38',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#0d0f14' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0d0f14' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)