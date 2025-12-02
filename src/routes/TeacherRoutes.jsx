import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import TeacherProtectedRoute from '../components/TeacherProtectedRoute';
import TeacherLayout from '../layouts/TeacherLayout';

// Teacher pages
import TeacherDashboard from '../pages/Teacher/TeacherDashboard';
import TeacherProfile from '../pages/Teacher/TeacherProfile';
import Notifications from '../pages/Teacher/Notifications/NotificationPage';

// Reusing Admin pages with teacher-specific routing
import Section from '../pages/Admin/Section';
import Topic from '../pages/Admin/Topic';
import LessonBySection from '../pages/Admin/LessonBySection';
import LessonContent from '../pages/Admin/LessonContent';
import Grammar from '../pages/Admin/Grammar';
import GrammarContent from '../pages/Admin/GrammarContent';
import GrammarQuestion from '../pages/Admin/GrammarQuestion';
import VocabularyByTopic from '../pages/Admin/VocabularyByTopic';
import VocabularyQuestion from '../pages/Admin/VocabularyQuestion';
import FreeMaterial from '../pages/Admin/FreeMaterial';
import Exam from '../pages/Admin/Exam';
import ExamQuestion from '../pages/Admin/ExamQuestion';
import QuestionBySection from '../pages/Admin/QuestionBySection';
import TestBySection from '../pages/Admin/TestBySection';
import IndicateQuestion from '../pages/Admin/IndicateQuestion';
import ScoreTable from '../pages/Admin/ScoreTable';
import Learner from '../pages/Admin/Learner';
import Feedback from '../pages/Admin/Feedback';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <TeacherProtectedRoute>
          <TeacherLayout />
        </TeacherProtectedRoute>
      }>
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        
        {/* Teacher Profile Route */}
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="sections" element={<Section />} />
        <Route path="sections/:sectionId/lesson" element={<LessonBySection />} />
        <Route path="sections/:sectionId/lesson/:lessonId/lesson-content" element={<LessonContent />} />
        <Route path="sections/:sectionId/test" element={<TestBySection />} />
        <Route path="sections/:sectionId/test/:testId/indicate-questions" element={<IndicateQuestion />} />
        <Route path="sections/:sectionId/question" element={<QuestionBySection />} />

        {/* Content Management */}
        <Route path="topics" element={<Topic />} />
        <Route path="topics/:topicId/vocabulary" element={<VocabularyByTopic />} />
        <Route path="topics/:topicId/vocabulary-question" element={<VocabularyQuestion />} />
        
        <Route path="lessons" element={<LessonBySection />} />
        <Route path="lessons/:lessonId/lesson-content" element={<LessonContent />} />
        
        <Route path="grammar" element={<Grammar />} />
        <Route path="grammar/:grammarId/grammar-content" element={<GrammarContent />} />
        <Route path="grammar/:grammarId/grammar-question" element={<GrammarQuestion />} />
        
        <Route path="vocabulary" element={<VocabularyByTopic />} />
        <Route path="free-materials" element={<FreeMaterial />} />
        
        {/* Test Management */}
        <Route path="exams" element={<Exam />} />
        <Route path="exams/:examId/exam-question" element={<ExamQuestion />} />
        
        <Route path="questions" element={<QuestionBySection />} />
        <Route path="question-groups" element={<TestBySection />} />
        <Route path="question-groups/:testId/indicate-questions" element={<IndicateQuestion />} />
        
        {/* Reports & Statistics */}
        <Route path="user-progress" element={<Learner />} />
        <Route path="leaderboard" element={<ScoreTable />} />
        
        {/* Comments Management */}
        <Route path="comments" element={<Feedback />} />
      </Route>
    </Routes>
  );
};

export default TeacherRoutes;
