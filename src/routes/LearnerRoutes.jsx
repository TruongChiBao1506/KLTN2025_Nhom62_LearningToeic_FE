import React from "react";
import { Route, Routes } from "react-router-dom";
import LearnerLayout from "../layouts/LearnerLayout";
import LearnerDashboard from "../pages/Learner/LearnerDashboard";
import ExamList from "../pages/Learner/ExamList";
import ExamDetail from "../pages/Learner/ExamDetail";
import ExamFullTest from "../pages/Learner/ExamFullTest";
import ExamMiniTest from "../pages/Learner/ExamMiniTest";
import ExamQuestion from "../pages/Learner/ExamQuestion";
import ExamResult from "../pages/Learner/ExamResult";
import UserVocabulary from "../pages/Learner/UserVocabulary";
import Dictionary from "../pages/Learner/Dictionary";
import LearningMaterials from "../pages/Learner/LearningMaterials";
import Progress from "../pages/Learner/Progress";
import Profile from "../pages/Learner/Profile";
import Grammar from "../pages/Learner/Grammar";
import GrammarDetail from "../pages/Learner/GrammarDetail";
import Note from "../pages/Learner/Note";
import Topic from "../pages/Learner/Topic";
import TopicDetail from "../pages/Learner/TopicDetail";
import Section from "../pages/Learner/Section";
import SectionSW from "../pages/Learner/SectionSW";
import Lesson from "../pages/Learner/Lesson";
import Study from "../pages/Learner/Study";
import StudySW from "../pages/Learner/StudySW";

const LearnerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LearnerLayout />}>
        <Route index element={<LearnerDashboard />} />
        <Route path="dashboard" element={<LearnerDashboard />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/:id" element={<ExamDetail />} />
        <Route path="materials" element={<LearningMaterials />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />
        <Route path="grammar" element={<Grammar />} />
        <Route path="grammar/:grammarId" element={<GrammarDetail />} />
        <Route path="notes" element={<Note />} />{" "}
        <Route path="topics" element={<Topic />} />
        <Route path="topic/:topicId" element={<TopicDetail />} />
        <Route path="section/:sectionId" element={<Section />} />
        <Route path="practice-sw/:sectionId" element={<SectionSW />} />
        <Route
          path="section/:sectionId/lesson/:lessonId"
          element={<Lesson />}
        />        <Route path="section/:sectionId/study/:testId" element={<Study />} />
        <Route path="section/:sectionId/study-sw/:testId" element={<StudySW />} />        <Route path="full-test" element={<ExamFullTest />} />
        <Route path="mini-test" element={<ExamMiniTest />} />
        <Route path="exam-question/:examId" element={<ExamQuestion />} />
        <Route path="exam-result/:userExamId" element={<ExamResult />} />
        <Route path="vocabulary" element={<UserVocabulary />} />
        <Route path="dictionary" element={<Dictionary />} />
      </Route>
    </Routes>
  );
};

export default LearnerRoutes;
