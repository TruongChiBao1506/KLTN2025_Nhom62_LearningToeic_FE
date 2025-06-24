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

const root = ReactDOM.createRoot(document.getElementById('root'));
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed')) {
    return;
  }
  originalError(...args);
};

// Also suppress the actual error
window.addEventListener('error', e => {
  if (e.message && e.message.includes('ResizeObserver loop completed')) {
    e.stopImmediatePropagation();
    return false;
  }
});
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
