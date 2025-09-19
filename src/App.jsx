import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LearnerRoutes from "./routes/LearnerRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import NotFound from "./pages/NotFound";
import AdminRoutes from "./routes/AdminRoutes";
import HomePage from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Learner Routes */}
        <Route path="/learner/*" element={<LearnerRoutes />} />

        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

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
    
  );
}

export default App;
