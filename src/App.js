import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './App.css';

// Protected pages
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Admin
import AdminSignIn from './pages/AdminSignIn';
import AdminLayout from './pages/AdminLayout';
import AdminProfile from './pages/AdminProfile';
import Section from './pages/Section';
import Topic from './pages/Topic';
import Grammar from './pages/Grammar';
import Settings from './pages/SettingPage';
import Learner from './pages/Learner';
import Exam from './pages/Exam';
import Feedback from './pages/Feedback';
import FreeMaterial from './pages/FreeMaterial';
import LessonBySection from './pages/LessonBySection';
import LessonContent from './pages/LessonContent';
import TestBySection from './pages/TestBySection';
import VocabularyByTopic from './pages/VocabularyByTopic';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}


        {/* Admin Auth Route - nằm ngoài AdminLayout */}
        <Route path="/admin/signin" element={<AdminSignIn />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="section" element={<Section />} />

            <Route path="section/:sectionId/lesson" element={<LessonBySection />} />
            <Route path="section/:sectionId/lesson/:lessonId/lesson-content" element={<LessonContent />} />
            <Route path="section/:sectionId/test" element={<TestBySection />} />

          <Route path="topic" element={<Topic />} />
            <Route path="topic/:topicId/vocabulary" element={<VocabularyByTopic />} />
          
          {/* Protected Route */}
          <Route path="grammar" element={<Grammar />} />
          <Route path="setting" element={<Settings />} />
          <Route path="learner" element={<Learner />} />
          <Route path="exam" element={<Exam />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="free-material" element={<FreeMaterial />} />


          {/* Thêm các route con khác ở đây */}
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/admin/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;