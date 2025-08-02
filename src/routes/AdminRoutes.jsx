import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from '../pages/Admin/AdminDashboard';
// import ProtectedRoute from './components/Admin/ProtectedRoute';

// Admin
import AdminSignIn from '../pages/Admin/AdminSignIn';
import AdminLayout from '../pages/Admin/AdminLayout';
import AdminProfile from '../pages/Admin/AdminProfile';
import Section from '../pages/Admin/Section';
import Topic from '../pages/Admin/Topic';
import Grammar from '../pages/Admin/Grammar';
import Settings from '../pages/Admin/SettingPage';
import Learner from '../pages/Admin/Learner';
import Exam from '../pages/Admin/Exam';
import Feedback from '../pages/Admin/Feedback';
import FreeMaterial from '../pages/Admin/FreeMaterial';
import LessonBySection from '../pages/Admin/LessonBySection';
import LessonContent from '../pages/Admin/LessonContent';
import TestBySection from '../pages/Admin/TestBySection';
import VocabularyByTopic from '../pages/Admin/VocabularyByTopic';
import VocabularyQuestion from '../pages/Admin/VocabularyQuestion';
import GrammarContent from '../pages/Admin/GrammarContent';
import GrammarQuestion from '../pages/Admin/GrammarQuestion';
import ExamQuestion from '../pages/Admin/ExamQuestion';
import ScoreTable from '../pages/Admin/ScoreTable';
import QuestionBySection from '../pages/Admin/QuestionBySection';
import IndicateQuestion from '../pages/Admin/IndicateQuestion';
// import các component khác nếu cần

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="section" element={<Section />} />

            <Route path="section/:sectionId/lesson" element={<LessonBySection />} />
            <Route path="section/:sectionId/lesson/:lessonId/lesson-content" element={<LessonContent />} />
            <Route path="section/:sectionId/test" element={<TestBySection />} />
            <Route path="section/:sectionId/test/:testId/indicate-questions" element={<IndicateQuestion />} />
            <Route path="section/:sectionId/question" element={<QuestionBySection />} />

            <Route path="topic" element={<Topic />} />
            <Route path="topic/:topicId/vocabulary" element={<VocabularyByTopic />} />
            <Route path="topic/:topicId/vocabulary-question" element={<VocabularyQuestion />} />


            {/* Protected Route */}
            <Route path="grammar" element={<Grammar />} />
            <Route path="grammar/:grammarId/grammar-content" element={<GrammarContent />} />
            <Route path="grammar/:grammarId/grammar-question" element={<GrammarQuestion />} />
            <Route path="setting" element={<Settings />} />
            <Route path="learner" element={<Learner />} />
            <Route path="exam" element={<Exam />} />
            <Route path="exam/:examId/exam-question" element={<ExamQuestion />} />

            {/* Protected Routes */}
            <Route path="feedback" element={<Feedback />} />
            <Route path="free-material" element={<FreeMaterial />} />
            <Route path="score-table/all" element={<ScoreTable />} />


            {/* Thêm các route con khác ở đây */}
          </Route>
    </Routes>
  );
};

export default AdminRoutes;
