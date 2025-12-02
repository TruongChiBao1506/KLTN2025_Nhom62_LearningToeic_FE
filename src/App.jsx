import React, { useEffect } from "react";
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
import TeacherRoutes from "./routes/TeacherRoutes";
import HomePage from "./pages/Home";
import socketService from "./services/socketService";
import { clearOldTokens } from "./utils/clearOldTokens";

// 🎨 Override CSS cho progress bar của toast - chỉ một màu xám đơn giản
const style = document.createElement('style');
style.innerHTML = `
  /* Override tất cả màu gradient của progress bar */
  .Toastify__progress-bar {
    background: #d9d9d9 !important;
    background-image: none !important;
    background-color: #d9d9d9 !important;
  }
  
  /* Override tất cả các variant types */
  .Toastify__progress-bar--default,
  .Toastify__progress-bar--info,
  .Toastify__progress-bar--success,
  .Toastify__progress-bar--warning,
  .Toastify__progress-bar--error,
  .Toastify__progress-bar--dark,
  .Toastify__progress-bar-theme--light,
  .Toastify__progress-bar-theme--dark,
  .Toastify__progress-bar-theme--colored {
    background: #d9d9d9 !important;
    background-image: none !important;
    background-color: #d9d9d9 !important;
  }
  
  /* Custom progress bar class */
  .toast-progress-bar {
    background: #d9d9d9 !important;
    background-image: none !important;
  }
`;
document.head.appendChild(style);

function App() {
  useEffect(() => {
    // ✅ Clear old localStorage tokens on first load (backward compatibility)
    clearOldTokens();
    
    // ✅ Socket connection is now handled by individual Layouts (AdminLayout/TeacherLayout/LearnerLayout)
    // No need to connect here to avoid duplicate connections
    
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Redirect old admin signin to new path */}
        <Route path="/admin/signin" element={<Navigate to="/auth/admin/signin" replace />} />

        {/* Admin Routes (now supports both admin and teacher) */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Teacher Routes (redirect to admin with teacher permissions) */}
        <Route path="/teacher/*" element={<TeacherRoutes />} />

        {/* Learner Routes */}
        <Route path="/learner/*" element={<LearnerRoutes />} />

        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications with custom progress bar */}
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
        progressClassName="toast-progress-bar"
      />
      </Router>
    
  );
}

export default App;
