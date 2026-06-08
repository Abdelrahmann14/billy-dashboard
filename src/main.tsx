import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety hook: Traps and ignores development-only HMR WebSocket errors
// from displaying unhandled rejection alerts in the dev sandbox.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event.reason?.message || '';
    const errorStack = event.reason?.stack || '';
    if (
      errorMsg.includes('WebSocket') || 
      errorMsg.includes('vite') || 
      errorStack.includes('vite/client')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

