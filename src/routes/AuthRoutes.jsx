import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "../pages/Learner/SignIn";
import SignUp from "../pages/Learner/SignUp";
import Verification from "../pages/Learner/Verification";
import AdminSignIn from '../pages/Admin/AdminSignIn';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="verification" element={<Verification />} />
      <Route path="admin/signin" element={<AdminSignIn />} />
      {/* Redirect to admin sign-in if no other routes match */}
    </Routes>
  );
};

export default AuthRoutes;
