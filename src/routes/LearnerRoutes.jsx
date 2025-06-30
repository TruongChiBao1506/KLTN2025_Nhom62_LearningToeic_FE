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
import NotImplemented from "../components/Learner/NotImplemented";
import AITutor from "../pages/Learner/AITutor";
import StudyTimer from "../pages/Learner/StudyTimer";

const LearnerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LearnerLayout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <LearnerDashboard />
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
              <NotImplemented 
                title="🏆 Bảng xếp hạng"
                icon="🏆"
                description="Xem thứ hạng của bạn so với các học viên khác và cạnh tranh để lên top!"
                features={[
                  "Bảng xếp hạng toàn cầu",
                  "Bảng xếp hạng theo tuần/tháng",
                  "Điểm thành tích chi tiết",
                  "Huy hiệu và thành tựu",
                  "So sánh với bạn bè"
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="achievements"
          element={
            <ProtectedRoute>
              <NotImplemented 
                title="⭐ Thành tích"
                icon="⭐"
                description="Theo dõi tiến độ học tập và mở khóa các thành tích đặc biệt!"
                features={[
                  "Hệ thống huy hiệu",
                  "Cấp độ học viên",
                  "Mốc thành tích",
                  "Phần thưởng đặc biệt",
                  "Lịch sử thành tích"
                ]}
              />
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
              <NotImplemented 
                title="🎯 Chế độ tập trung"
                icon="🎯"
                description="Loại bỏ mọi yếu tố gây xao nhãng để tập trung hoàn toàn vào việc học!"
                features={[
                  "Giao diện tối giản",
                  "Chặn thông báo",
                  "Chế độ toàn màn hình",
                  "Nhạc nền thư giãn",
                  "Theo dõi thời gian tập trung"
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="audio-trainer"
          element={
            <ProtectedRoute>
              <NotImplemented 
                title="🎧 Luyện nghe"
                icon="🎧"
                description="Cải thiện kỹ năng nghe TOEIC với các bài luyện tập đa dạng!"
                features={[
                  "Luyện nghe theo cấp độ",
                  "Điều chỉnh tốc độ phát",
                  "Lặp lại từng câu",
                  "Phụ đề tiếng Anh",
                  "Bài test nghe mini"
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="events"
          element={
            <ProtectedRoute>
              <NotImplemented 
                title="📅 Sự kiện"
                icon="📅"
                description="Tham gia các sự kiện học tập, workshop và cuộc thi đặc biệt!"
                features={[
                  "Sự kiện học tập hàng tuần",
                  "Workshop TOEIC miễn phí",
                  "Cuộc thi kiến thức",
                  "Lịch sự kiện cá nhân",
                  "Thông báo sự kiện mới"
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-groups"
          element={
            <ProtectedRoute>
              <NotImplemented 
                title="👥 Nhóm học tập"
                icon="👥"
                description="Kết nối với các học viên khác và cùng nhau tiến bộ!"
                features={[
                  "Tạo/tham gia nhóm học",
                  "Chat nhóm thời gian thực",
                  "Chia sẻ tài liệu",
                  "Thảo luận bài tập",
                  "Lịch học nhóm"
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="challenges"
          element={
            <ProtectedRoute>
              <NotImplemented 
                title="🎁 Thử thách"
                icon="🎁"
                description="Hoàn thành các thử thách hàng ngày để nhận phần thưởng hấp dẫn!"
                features={[
                  "Thử thách hàng ngày",
                  "Thử thách tuần/tháng",
                  "Phần thưởng điểm số",
                  "Thử thách nhóm",
                  "Bảng xếp hạng thử thách"
                ]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <NotImplemented 
                title="⚙️ Cài đặt"
                icon="⚙️"
                description="Tùy chỉnh trải nghiệm học tập theo sở thích cá nhân!"
                features={[
                  "Cài đặt giao diện",
                  "Thông báo học tập",
                  "Mục tiêu học tập",
                  "Tùy chỉnh âm thanh",
                  "Bảo mật tài khoản"
                ]}
              />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default LearnerRoutes;
