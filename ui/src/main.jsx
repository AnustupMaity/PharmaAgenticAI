import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/theme.css'
import './styles/dark-theme.css'
import './styles/theme-toggle.css'
import {GoogleOAuthProvider} from "@react-oauth/google";

const client_Id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId={client_Id}>
          <App />
      </GoogleOAuthProvider>
  </React.StrictMode>,
)
