import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force background color
document.documentElement.style.backgroundColor = "#1A1F2B";
document.body.style.backgroundColor = "#1A1F2B";

// Apply background color to root element
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.style.backgroundColor = "#1A1F2B";
  rootElement.style.minHeight = "100vh";
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
