import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'antd/dist/reset.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Suppress ResizeObserver console errors
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed')) {
    return;
  }
  originalError(...args);
};

// Suppress ResizeObserver actual errors
if (window && window.ResizeObserver) {
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (err) {
          if (err.message && err.message.includes('ResizeObserver loop completed')) {
            // Ignore this specific error
            return;
          }
          throw err;
        }
      });
    }
  };
}

// Also suppress window console errors
if (window && window.console) {
  const origError = window.console.error;
  window.console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("ResizeObserver loop completed")
    ) {
      return;
    }
    origError.apply(window.console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <div className="App">
        <App />
      </div>
    </PersistGate>
  </Provider>
);

reportWebVitals();