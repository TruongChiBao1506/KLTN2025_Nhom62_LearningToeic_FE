import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Learner from "../pages/Admin/Learner";
import AdminProfile from "../pages/Admin/AdminProfile";
// import các component khác nếu cần

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="learners" element={<Learner />} />
        <Route path="profile" element={<AdminProfile />} />
        {/* Thêm các route khác của admin nếu cần */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
