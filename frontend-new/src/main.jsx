import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/global.css'

console.log('🎯 Trading Journal starting in Real Data Mode');
console.log('📊 All data will be stored in Firebase');
console.log('🚫 Sample/mock data disabled');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
