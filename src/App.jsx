import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LearnerRoutes from "./routes/LearnerRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import NotFound from "./pages/NotFound";
import AdminRoutes from "./routes/AdminRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/auth/*" element={<AuthRoutes />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Learner Routes */}
          <Route path="/learner/*" element={<LearnerRoutes />} />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/auth/signin" replace />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </NotificationProvider>
  );
}

export default App;
