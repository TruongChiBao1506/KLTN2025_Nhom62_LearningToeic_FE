import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "../pages/Learner/SignIn";
import SignUp from "../pages/Learner/SignUp";
import Verification from "../pages/Learner/Verification";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="verification" element={<Verification />} />
    </Routes>
  );
};

export default AuthRoutes;
