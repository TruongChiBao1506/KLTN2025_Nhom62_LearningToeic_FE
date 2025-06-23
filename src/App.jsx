import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import LearnerRoutes from "./routes/LearnerRoutes";
import Login from "./pages/Auth/Login";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Learner Routes */}
        <Route path="/learner/*" element={<LearnerRoutes />} />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
