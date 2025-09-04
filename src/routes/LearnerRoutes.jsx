import React from "react";
import { Route, Routes } from "react-router-dom";
import LearnerLayout from "../layouts/LearnerLayout";
import LearnerDashboard from "../pages/Learner/LearnerDashboard";
import LearningPath from '../pages/Learner/LearningPathNew';
import ExamList from "../pages/Learner/ExamList";
import ExamDetail from "../pages/Learner/ExamDetail";
import ExamFullTest from "../pages/Learner/ExamFullTest";
import ExamMiniTest from "../pages/Learner/ExamMiniTest";
import ExamQuestion from "../pages/Learner/ExamQuestion";
import ExamResult from "../pages/Learner/ExamResult";
import UserVocabulary from "../pages/Learner/UserVocabulary";
import Dictionary from "../pages/Learner/Dictionary";
import LearningMaterials from "../pages/Learner/LearningMaterials";
import Feedback from "../pages/Learner/Feedback";
import MaterialDetail from "../pages/Learner/MaterialDetail";
import Progress from "../pages/Learner/Progress";
import Profile from "../pages/Learner/Profile";
import Grammar from "../pages/Learner/Grammar";
import GrammarDetail from "../pages/Learner/GrammarDetail";
import Note from "../pages/Learner/Note";
import Topic from "../pages/Learner/Topic";
import TopicDetail from "../pages/Learner/TopicDetail";
import Flashcards from "../pages/Learner/Flashcards";
import Quiz from "../pages/Learner/Quiz";
import Section from "../pages/Learner/Section";
import SectionSW from "../pages/Learner/SectionSW";
import Lesson from "../pages/Learner/Lesson";
import Study from "../pages/Learner/Study";
import StudySW from "../pages/Learner/StudySW";
import ImproveStudy from "../pages/Learner/ImproveStudy";
import Blog from "../pages/Learner/Blog";
import Notification from "../pages/Learner/Notification";
import ProtectedRoute from "../components/Learner/ProtectedRoute";
import AITutor from "../pages/Learner/AITutor";
import StudyTimer from "../pages/Learner/StudyTimer";
import Leaderboard from "../pages/Learner/Leaderboard";
import Achievements from "../pages/Learner/Achievements";
import StudyGroups from "../pages/Learner/StudyGroups";
import FocusMode from "../pages/Learner/FocusMode";
import AudioTrainer from "../pages/Learner/AudioTrainer";
import Events from "../pages/Learner/Events";
import Challenges from "../pages/Learner/Challenges";
import Settings from "../pages/Learner/Settings";
import SectionList from "../pages/Learner/SectionList";

// Import Part components
import Part1 from "../pages/Learner/Part1";
import Part2 from "../pages/Learner/Part2";
import Part3 from "../pages/Learner/Part3";
import Part4 from "../pages/Learner/Part4";
import Part5 from "../pages/Learner/Part5";
import Part6 from "../pages/Learner/Part6";
import Part7 from "../pages/Learner/Part7";
import Practice from "../pages/Learner/Practice";


const LearnerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LearnerLayout />}>
        <Route
          path="feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="exams"
          element={
            <ProtectedRoute>
              <ExamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="exams/:id"
          element={
            <ProtectedRoute>
              <ExamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="materials"
          element={
            <ProtectedRoute>
              <LearningMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="materials/:id"
          element={
            <ProtectedRoute>
              <MaterialDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="grammar"
          element={
            <ProtectedRoute>
              <Grammar />
            </ProtectedRoute>
          }
        />
        <Route
          path="grammar/:grammarId"
          element={
            <ProtectedRoute>
              <GrammarDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="notes"
          element={
            <ProtectedRoute>
              <Note />
            </ProtectedRoute>
          }
        />
        <Route
          path="topics"
          element={
            <ProtectedRoute>
              <Topic />
            </ProtectedRoute>
          }
        />
        <Route
          path="topic/:topicId"
          element={
            <ProtectedRoute>
              <TopicDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="flashcards/:topicId"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />
        <Route
          path="quiz/:topicId"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="section"
          element={
            <ProtectedRoute>
              <SectionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="section/:sectionId"
          element={
            <ProtectedRoute>
              <Section />
            </ProtectedRoute>
          }
        />
        <Route
          path="practice-sw/:sectionId"
          element={
            <ProtectedRoute>
              <SectionSW />
            </ProtectedRoute>
          }
        />
        <Route
          path="section/:sectionId/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          }
        />
        <Route
          path="section/:sectionId/study/:testId"
          element={
            <ProtectedRoute>
              <Study />
            </ProtectedRoute>
          }
        />
        <Route
          path="section/:sectionId/study-sw/:testId"
          element={
            <ProtectedRoute>
              <StudySW />
            </ProtectedRoute>
          }
        />
        <Route
          path="full-test"
          element={
            <ProtectedRoute>
              <ExamFullTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="mini-test"
          element={
            <ProtectedRoute>
              <ExamMiniTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="exam-question/:examId"
          element={
            <ProtectedRoute>
              <ExamQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="exam-result/:userExamId"
          element={
            <ProtectedRoute>
              <ExamResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="vocabulary"
          element={
            <ProtectedRoute>
              <UserVocabulary />
            </ProtectedRoute>
          }
        />
        <Route path="dictionary" element={<Dictionary />} />
        <Route
          path="improve"
          element={
            <ProtectedRoute>
              <ImproveStudy />
            </ProtectedRoute>
          }
        />
        <Route path="blog" element={<Blog />} />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          }
        />
        {/* New Modern Features Routes */}
        <Route
          path="leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-timer"
          element={
            <ProtectedRoute>
              <StudyTimer />
            </ProtectedRoute>
          }
        />
        <Route
          path="focus-mode"
          element={
            <ProtectedRoute>
              <FocusMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="audio-trainer"
          element={
            <ProtectedRoute>
              <AudioTrainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-groups"
          element={
            <ProtectedRoute>
              <StudyGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="challenges"
          element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-tutor"
          element={
            <ProtectedRoute>
              {/* <AITutor /> */}
              <AITutor />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="learning-path"
          element={
            <ProtectedRoute>
              <LearningPath />
            </ProtectedRoute>
          }
        />
        {/* TOEIC Parts Routes */}
        <Route
          path="part-1"
          element={
            <ProtectedRoute>
              <Part1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="part-2"
          element={
            <ProtectedRoute>
              <Part2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="part-3"
          element={
            <ProtectedRoute>
              <Part3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="part-4"
          element={
            <ProtectedRoute>
              <Part4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="part-5"
          element={
            <ProtectedRoute>
              <Part5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="part-6"
          element={
            <ProtectedRoute>
              <Part6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="part-7"
          element={
            <ProtectedRoute>
              <Part7 />
            </ProtectedRoute>
          }
        />
        {/* Generic Practice Route */}
        <Route
          path="practice/:sectionId"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default LearnerRoutes;
