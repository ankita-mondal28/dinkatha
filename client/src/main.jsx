import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-sans';
import '@fontsource/noto-sans-bengali';
import '@fontsource/noto-sans-devanagari';
import './styles/tokens.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
