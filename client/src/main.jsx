import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RoleProvider } from './context/RoleContext';
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
    <RoleProvider>
    <App />
    </RoleProvider>
)
