## Báo cáo Chuyển đổi TOEIC Learner từ Vue sang React

### Đã hoàn thành:

1. **Pages đã chuyển đổi:**

   - Section - Hiển thị danh sách các bài học thuộc section
   - SectionSW - Hiển thị danh sách các bài kiểm tra Speaking & Writing
   - Lesson - Hiển thị nội dung bài học và các bài kiểm tra
   - Study - Hiển thị giao diện làm bài kiểm tra

2. **Components đã chuyển đổi:**

   - TestPart1 - Component cho phần kiểm tra Part 1 TOEIC

3. **Services đã cập nhật:**

   - sectionsService - Thêm phương thức allEnable()
   - testService - Thêm phương thức getEnableTestsBySection()
   - lessonService - Thêm phương thức getEnableLessonsBySection()
   - lessonContentService - Thêm phương thức getEnableLessonContentsByLesson()

4. **Routes đã cập nhật:**
   - Thêm các routes mới: "/section/:sectionId", "/practice-sw/:sectionId", "/section/:sectionId/lesson/:lessonId", "/section/:sectionId/study/:testId"

### Cần làm tiếp:

1. **Components cần hoàn thành:**

   - TestPart2, TestPart3, TestPart4, TestPart5, TestPart6, TestPart7Single, TestPart7Double, TestPart7Triple - Tương tự như TestPart1 nhưng với một số thay đổi cho từng loại part

2. **Pages cần hoàn thành:**

   - StudySW - Cho phần Speaking & Writing tương tự như Study
   - ExamFullTest, ExamMiniTest, ExamQuestion, ExamResult - Cho trang bài thi đầy đủ
   - UserVocabulary, Dictionary - Cho phần từ vựng người dùng
   - Blog, Notification, ImproveStudy - Cho các trang bổ sung
   - SignIn, SignUp, Verification - Cho phần đăng nhập, đăng ký

3. **Services cần thêm/cập nhật:**
   - userExamService - Quản lý bài thi của người dùng
   - userVocabularyService - Quản lý từ vựng của người dùng
   - notificationService - Quản lý thông báo

### Lưu ý:

- Tất cả các văn bản, thông báo, hướng dẫn đã được chuyển sang tiếng Việt.
- Cần đảm bảo gọi API đúng endpoint và xử lý phản hồi phù hợp.
- Các component React được cấu trúc theo cách tương tự như Vue, nhưng sử dụng hooks thay vì options API.
- Các chức năng như dịch văn bản, âm thanh, hình ảnh đã được bảo toàn.
- Cần kiểm tra và đảm bảo CSS hoạt động đúng cách trong môi trường React.
