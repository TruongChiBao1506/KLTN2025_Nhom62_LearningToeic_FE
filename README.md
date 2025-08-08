# HỆ THỐNG HỌC VÀ LUYỆN THI TOEIC VỚI AI HỖ TRỢ HỌC TẬP

## CHƯƠNG 1: GIỚI THIỆU

### 1.1 Tổng quan

Trong bối cảnh toàn cầu hóa và hội nhập quốc tế ngày càng sâu rộng, việc nắm vững tiếng Anh, đặc biệt là đạt điểm số cao trong các kỳ thi chuẩn hóa như TOEIC, đã trở thành yêu cầu thiết yếu đối với học sinh, sinh viên và người đi làm tại Việt Nam. Theo báo cáo của Educational Testing Service (ETS), số lượng thí sinh tham gia kỳ thi TOEIC tại Việt Nam đạt hàng trăm nghìn lượt mỗi năm, với nhu cầu học tập và cải thiện khả năng tiếng Anh ngày càng tăng cao.

Với phương pháp học truyền thống, việc luyện thi TOEIC gặp phải nhiều thách thức: thiếu tài liệu luyện tập đa dạng, không có phản hồi chi tiết về kết quả học tập, khó khăn trong việc theo dõi tiến độ cá nhân, và đặc biệt là thiếu sự cá nhân hóa trong quá trình học. Nhiều học viên gặp khó khăn trong việc xác định điểm yếu cụ thể và không có lộ trình học tập phù hợp với trình độ hiện tại.

Theo Chiến lược phát triển giáo dục 2021-2030, tầm nhìn 2045 của Chính phủ Việt Nam, việc ứng dụng công nghệ thông tin, đặc biệt là trí tuệ nhân tạo (AI) vào giáo dục được coi là một trong những ưu tiên hàng đầu để nâng cao chất lượng giáo dục và đào tạo.

Với sự phát triển mạnh mẽ của các công nghệ AI như Machine Learning, Natural Language Processing (NLP), Speech Recognition, và Text-to-Speech trong những năm gần đây, chúng tôi có cơ sở để xây dựng một hệ thống học và luyện thi TOEIC hiện đại, thông minh và hiệu quả. Công nghệ AI giúp phân tích chính xác điểm mạnh, điểm yếu của từng học viên, từ đó đưa ra lộ trình học tập cá nhân hóa và phản hồi real-time.

Trong hệ thống này, chúng tôi đã tích hợp nhiều công nghệ tiên tiến: Speech Recognition API để nhận diện và phân tích giọng nói trong module Speaking; Text-to-Speech API để hỗ trợ luyện nghe và phát âm; Natural Language Processing để phân tích văn bản trong module Writing; Machine Learning algorithms để tracking tiến độ học tập và đưa ra đề xuất cá nhân hóa. Nhờ vào việc tích hợp các công nghệ này, hệ thống không chỉ cung cấp trải nghiệm học tập tương tác và sinh động, mà còn tạo ra một nền tảng học tập thông minh, hiệu quả và phù hợp với từng cá nhân.

Để phát triển hệ thống, chúng tôi sử dụng công nghệ Node.js với Express.js cho Backend, React.js với Ant Design cho Frontend Admin, MongoDB cho cơ sở dữ liệu, mang đến trải nghiệm mượt mà và tối ưu cho người dùng. Toàn bộ hệ thống được thiết kế theo kiến trúc RESTful API, đảm bảo khả năng mở rộng và tính ổn định cao. Với mục tiêu phục vụ thị trường Việt Nam, chúng tôi hy vọng hệ thống sẽ tạo ra một bước đột phá trong ngành giáo dục tiếng Anh, mang lại hiệu quả học tập cao và trải nghiệm học tập thú vị cho người học.

### 1.2 Mục tiêu chính của đề tài

- **Xây dựng nền tảng học tập thông minh và toàn diện**: Cung cấp giải pháp AI tiên tiến để hỗ trợ luyện tập 4 kỹ năng TOEIC (Listening, Reading, Speaking, Writing); phát triển hệ thống quản lý học tập cá nhân hóa với tracking tiến độ real-time; tích hợp công nghệ Speech Recognition và Text-to-Speech cho trải nghiệm tương tác tối ưu.

- **Cải thiện trải nghiệm học tập với công nghệ hiện đại**: Thiết kế giao diện responsive với Ant Design và Lucide React icons; xây dựng các module luyện tập tương tác với countdown timers, audio recording, và speech recognition; cung cấp phản hồi chi tiết và ngay lập tức cho mọi bài tập thông qua AI analysis.

- **Hỗ trợ giáo viên và quản trị viên quản lý hiệu quả**: Cung cấp dashboard admin để quản lý sections, tests, và questions; công cụ theo dõi tiến độ học viên và phân tích performance; hệ thống quản lý nội dung linh hoạt với khả năng upload materials, audios, và images.

- **Đảm bảo chất lượng học tập với AI-powered features**: Ứng dụng Speech Recognition để phân tích phát âm và fluency trong Speaking tests; sử dụng NLP để đánh giá Writing submissions với feedback chi tiết; tích hợp Machine Learning để đề xuất lộ trình học tập tối ưu và predict performance.

- **Cá nhân hóa trải nghiệm học tập**: Phân tích điểm mạnh/yếu của từng học viên qua AI analytics; đề xuất bài tập phù hợp với trình độ và mục tiêu cá nhân; tạo lộ trình học tập adaptive dựa trên performance history và learning patterns.

- **Tự động hóa quá trình đánh giá và phản hồi**: Sử dụng AI để chấm điểm tự động các bài tập Speaking và Writing; cung cấp detailed feedback với scoring breakdown và improvement suggestions; tracking progress với visual analytics và performance predictions.

- **Ứng dụng các công nghệ hiện đại**: Node.js, Express.js, React.js, MongoDB, Ant Design, Speech APIs, NLP services để phát triển hệ thống toàn diện và scalable.

### 1.3 Phạm vi đề tài

Nghiên cứu này tập trung vào việc phát triển một hệ thống học và luyện thi TOEIC thông minh, phục vụ cho thị trường giáo dục tiếng Anh tại Việt Nam, hướng đến các đối tượng:

**Phạm vi chức năng của hệ thống bao gồm:**

#### Quản lý học tập thông minh với AI:

- Tích hợp Speech Recognition API để nhận diện và phân tích giọng nói real-time trong Speaking tests
- Sử dụng Text-to-Speech API để hỗ trợ pronunciation practice và listening comprehension
- Áp dụng Natural Language Processing để phân tích Writing submissions và đưa ra feedback chi tiết
- Machine Learning algorithms để tracking learning progress và đề xuất personalized study paths

#### Hệ thống luyện tập 4 kỹ năng TOEIC:

- **Listening Module**: Audio playback với quality controls, các dạng bài tập theo format TOEIC chuẩn
- **Reading Module**: Comprehension exercises với timer, highlight tools, và progress tracking
- **Speaking Module**: Recording capabilities với Speech Recognition analysis, pronunciation scoring
- **Writing Module**: Text editor với grammar checking, AI-powered assessment, và improvement suggestions

#### Quản lý nội dung và assessment:

- Database-driven content management với sections, tests, và questions hierarchy
- File upload system cho audios, images, và materials với cloud storage integration
- Automated scoring system với AI algorithms cho Speaking và Writing assessments
- Comprehensive analytics dashboard với performance metrics và progress visualization

**Phạm vi người dùng:**

Hệ thống phục vụ ba nhóm người dùng chính:

#### Học viên (Learners):

- Sinh viên, học sinh cần cải thiện điểm số TOEIC để đáp ứng yêu cầu học tập và việc làm
- Nhân viên văn phòng cần chứng chỉ TOEIC cho thăng tiến nghề nghiệp
- Người học tự do muốn nâng cao trình độ tiếng Anh một cách có hệ thống

#### Giáo viên và Instructors:

- Giảng viên tiếng Anh tại các trường đại học, cao đẳng, và trung tâm ngoại ngữ
- Gia sư dạy TOEIC cần công cụ hỗ trợ teaching và student progress monitoring
- Chuyên gia luyện thi TOEIC muốn sử dụng technology-enhanced teaching methods

#### Quản trị viên hệ thống (Admins):

- Content managers chịu trách nhiệm quản lý và cập nhật ngân hàng câu hỏi
- System administrators theo dõi performance và user analytics
- Educational coordinators điều phối curriculum và assessment standards

### 1.4 Yêu cầu chức năng

**Các chức năng chính của hệ thống:**

#### Quản lý tài khoản và authentication:

- Đăng ký account với email verification và profile setup
- Đăng nhập secure với JWT authentication và session management
- Profile management với learning goals, preferences, và progress tracking
- Password reset và account security features

#### Module Listening với AI enhancement:

- Audio playback system với multiple speed controls và repeat functionality
- Diverse listening materials theo format TOEIC Parts 1-4
- Real-time comprehension checking với immediate feedback
- Progress analytics với listening skill breakdown và improvement suggestions

#### Module Reading với intelligent features:

- Interactive reading passages với built-in dictionary và vocabulary tools
- Timer-based practice sessions mô phỏng actual test conditions
- AI-powered difficulty adjustment dựa trên user performance
- Reading speed analysis và comprehension accuracy tracking

#### Module Speaking với Speech Recognition:

- Voice recording capabilities với high-quality audio processing
- Real-time Speech Recognition để transcribe và analyze pronunciation
- Fluency assessment với timing, pace, và clarity metrics
- Pronunciation scoring với detailed phonetic feedback và improvement tips
- Speaking test simulation với authentic TOEIC Speaking format

#### Module Writing với NLP analysis:

- Rich text editor với grammar và spell checking capabilities
- AI-powered writing assessment covering grammar, vocabulary, organization, và content
- Automated scoring với detailed breakdown và specific improvement suggestions
- Essay templates và model answers để guide learning process
- Progress tracking với writing skill development over time

#### Comprehensive Test System:

- Full-length TOEIC mock tests với authentic timing và format
- Section-specific practice tests để focus on particular skills
- Adaptive testing system adjusting difficulty based on performance
- Detailed score reports với predictive analytics for actual TOEIC performance

#### Admin Dashboard và Content Management:

- Section management với hierarchical organization (Listening, Reading, Speaking, Writing)
- Test creation và editing tools với flexible question formats
- Question bank management với categorization, difficulty levels, và tagging
- User management với role-based access control và activity monitoring
- Analytics dashboard với user engagement metrics và learning outcomes

#### AI Analytics và Reporting:

- Personalized dashboard showing learning progress across all skills
- Detailed performance analytics với strengths/weaknesses identification
- Predictive modeling để estimate TOEIC score improvement timeline
- Recommendation engine để suggest optimal study materials và practice frequency
- Comparative analysis với peer performance và benchmark standards

### 1.5 Yêu cầu phi chức năng

#### Về performance và user experience:

- Responsive design hoạt động mượt mà trên desktop, tablet, và mobile devices
- Fast loading times (<3 giây) cho tất cả pages và interactive elements
- Real-time audio/video processing với minimal latency cho Speech Recognition
- Smooth animations và transitions với modern UI/UX design principles

#### Về reliability và availability:

- High availability system với 99.9% uptime target
- Robust error handling và graceful degradation khi có technical issues
- Automatic backup và disaster recovery mechanisms
- Scalable architecture để handle increasing user load

#### Về security và data protection:

- Secure data transmission với HTTPS encryption
- User data protection tuân thủ privacy regulations
- Secure file upload và storage với virus scanning
- Regular security audits và vulnerability assessments

#### Về compatibility và accessibility:

- Cross-browser compatibility với major browsers (Chrome, Firefox, Safari, Edge)
- Accessibility features để support users with disabilities
- Multi-language support với internationalization capabilities
- Offline functionality cho basic features khi không có internet connection

---

## CẤU TRÚC DỰ ÁN HIỆN TẠI

### Frontend Architecture (React.js + Ant Design)

```
KLTN_FE_Toeic_Admin/
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/             # React components
│   │   ├── Admin/              # Admin dashboard components
│   │   │   ├── Dashboard/
│   │   │   ├── SectionManagement/
│   │   │   ├── TestManagement/
│   │   │   └── UserManagement/
│   │   ├── Learner/            # Student learning interface
│   │   │   ├── Listening/      # Listening practice components
│   │   │   ├── Reading/        # Reading comprehension components
│   │   │   ├── Speaking/       # Speaking practice với Speech Recognition
│   │   │   │   ├── No1To2.jsx  # Speaking test component với AI features
│   │   │   │   └── SpeakingResult.jsx # AI-powered result analysis
│   │   │   └── Writing/        # Writing practice với NLP
│   │   │       ├── No1To5.jsx  # Writing test component
│   │   │       └── WritingResult.jsx # AI writing assessment
│   │   ├── TextHighlighter/    # Utility components
│   │   └── AudioPlayer.jsx     # Custom audio player
│   ├── services/               # API service layer
│   │   ├── authService.js      # Authentication services
│   │   ├── testService.js      # Test management services
│   │   ├── sectionService.js   # Section management services
│   │   └── axiosClient.js      # HTTP client configuration
│   ├── pages/                  # Page components
│   │   ├── Admin/              # Admin pages
│   │   ├── Auth/               # Authentication pages
│   │   └── Learner/            # Student learning pages
│   ├── routes/                 # React routing configuration
│   │   ├── AdminRoutes.jsx
│   │   ├── AuthRoutes.jsx
│   │   └── LearnerRoutes.jsx
│   ├── store/                  # State management
│   ├── hooks/                  # Custom React hooks
│   │   └── useAdminStore.js
│   ├── layouts/                # Layout components
│   │   └── LearnerLayout.jsx
│   ├── assets/                 # Static assets (images, styles)
│   └── utils/                  # Utility functions
├── package.json                # Dependencies và scripts
└── tailwind.config.js         # Tailwind CSS configuration
```

### Backend Architecture (Node.js + Express.js + MongoDB)

```
KLTN_BE_Toeic/
├── src/
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.js  # Authentication logic
│   │   ├── exam.controller.js  # Test management
│   │   ├── comment.controller.js # User feedback
│   │   └── ...                 # Other controllers
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js             # User model
│   │   ├── Section.js          # Section model
│   │   ├── Test.js             # Test model
│   │   ├── Question.js         # Question model
│   │   └── ...                 # Other models
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── testRoutes.js
│   │   └── ...
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── upload.js           # File upload handling
│   │   └── validation.js       # Input validation
│   ├── services/               # Business logic
│   │   ├── aiService.js        # AI/ML integration
│   │   ├── speechService.js    # Speech Recognition API
│   │   └── nlpService.js       # Natural Language Processing
│   ├── utils/                  # Utility functions
│   │   ├── emailService.js     # Email notifications
│   │   └── fileHandler.js      # File operations
│   ├── config/                 # Configuration files
│   │   ├── database.js         # MongoDB connection
│   │   ├── auth.js             # Authentication config
│   │   └── email.js            # Email service config
│   └── server.js               # Application entry point
├── uploads/                    # File storage
│   ├── audios/                 # Audio files for listening tests
│   ├── images/                 # Images for reading comprehension
│   ├── materials/              # Learning materials
│   └── pdfs/                   # Document storage
├── templates/                  # Email templates
├── postman/                    # API documentation
│   ├── TOEIC_Complete_API_Collection.json
│   └── TOEIC_Environment.json
└── package.json               # Dependencies và scripts
```

### Công nghệ và thư viện chính

#### Frontend Technologies:

- **React.js 18**: Modern React với hooks và functional components
- **Ant Design**: Professional UI component library với comprehensive design system
- **Lucide React**: Modern icon library thay thế FontAwesome
- **Axios**: HTTP client để communicate với backend APIs
- **React Router**: Client-side routing cho SPA navigation
- **Tailwind CSS**: Utility-first CSS framework cho responsive design

#### Backend Technologies:

- **Node.js + Express.js**: Server-side JavaScript runtime và web framework
- **MongoDB + Mongoose**: NoSQL database với object modeling for Node.js
- **JWT (jsonwebtoken)**: Secure authentication với token-based system
- **Multer**: Middleware để handle file uploads (audio, images, documents)
- **Nodemailer**: Email service để send notifications và verification emails
- **bcryptjs**: Password hashing để secure user authentication

#### AI/ML Integration:

- **Speech Recognition API**: Browser-native speech-to-text cho Speaking assessments
- **Text-to-Speech API**: Browser-native text-to-speech cho pronunciation practice
- **Natural Language Processing**: Custom algorithms để analyze writing submissions
- **Machine Learning APIs**: Third-party services cho advanced analytics và recommendations

---

## TÍNH NĂNG HIỆN TẠI ĐÃ TRIỂN KHAI

### 🎯 Module Speaking với AI Speech Recognition

- **Voice Recording**: High-quality audio recording với MediaRecorder API
- **Real-time Speech Recognition**: Chuyển đổi speech-to-text với accuracy analysis
- **Pronunciation Assessment**: Đánh giá phát âm, fluency, và clarity
- **Interactive Practice**: Countdown timers, preparation phases, và recording phases
- **Comprehensive Results**: AI-powered scoring với detailed feedback và improvement suggestions

### ✍️ Module Writing với NLP Analysis

- **Rich Text Editor**: Advanced text input với formatting capabilities
- **Timed Practice**: Countdown timers mô phỏng real test conditions
- **Progress Tracking**: Monitor completion status và time management
- **AI Assessment**: Automated scoring cho grammar, vocabulary, organization, và content
- **Improvement Suggestions**: Personalized feedback để enhance writing skills

### 📊 Admin Dashboard Management

- **Section Management**: Create và organize Learning sections (Listening, Reading, Speaking, Writing)
- **Test Management**: Design và configure practice tests với flexible parameters
- **Question Bank**: Comprehensive question management với categorization và difficulty levels
- **User Analytics**: Track student progress và performance metrics
- **Content Upload**: File management system cho audios, images, và learning materials

### 🤖 AI-Powered Features

- **Speech Recognition Integration**: Real-time voice analysis với pronunciation feedback
- **Text Analysis**: NLP algorithms để evaluate writing quality và provide suggestions
- **Progress Analytics**: Machine learning để track improvement patterns và predict performance
- **Personalized Recommendations**: AI-driven study path suggestions based on individual performance

### 📱 Modern UI/UX Design

- **Responsive Design**: Optimal experience across desktop, tablet, và mobile devices
- **Ant Design System**: Professional, consistent UI components với accessibility features
- **Interactive Elements**: Smooth animations, progress indicators, và real-time feedback
- **Intuitive Navigation**: User-friendly interface với clear learning paths và progress tracking

---

## HƯỚNG DẪN CÀI ĐẶT VÀ DEVELOPMENT

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- NPM hoặc Yarn package manager
- Modern web browser với Speech API support

```bash
cd KLTN_FE_Toeic_Admin
npm install
npm start                       # Development server trên http://localhost:3000
npm run build                   # Production build
```

### Backend Setup

```bash
cd KLTN_BE_Toeic
npm install
npm run dev                     # Development mode với hot reload
npm start                       # Production mode
```

### Database Configuration

1. Install và start MongoDB server
2. Create database: `toeic_learning_system`
3. Run seed scripts để populate sample data:
   ```bash
   node scripts/add_speaking_writing_sections.js
   node scripts/add_speaking_writing_tests.js
   node scripts/add_speaking_writing_questions.js
   ```
4. Configure connection string trong `src/config/database.js`

### Environment Variables

Create `.env` file trong backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/toeic_learning_system
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## API DOCUMENTATION

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Test Management Endpoints

- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get specific test
- `POST /api/tests` - Create new test (Admin only)
- `PUT /api/tests/:id` - Update test (Admin only)
- `DELETE /api/tests/:id` - Delete test (Admin only)

### Section Management Endpoints

- `GET /api/sections` - Get all sections
- `GET /api/sections/:id/tests` - Get tests by section
- `POST /api/sections` - Create new section (Admin only)

### Question Management Endpoints

- `GET /api/questions/test/:testId` - Get questions by test ID
- `POST /api/questions` - Create new question (Admin only)
- `PUT /api/questions/:id` - Update question (Admin only)

---

## ROADMAP PHÁT TRIỂN

### Phase 1: Core Learning Platform ✅

- [x] User authentication và authorization system
- [x] Basic CRUD operations cho sections, tests, questions
- [x] Speaking module với Speech Recognition integration
- [x] Writing module với timed practice
- [x] Admin dashboard với content management

### Phase 2: Enhanced AI Features 🚧

- [ ] Advanced NLP analysis cho Writing assessment
- [ ] Machine Learning recommendations engine
- [ ] Predictive analytics cho TOEIC score estimation
- [ ] Adaptive learning algorithms based on performance

### Phase 3: Complete TOEIC Suite 📋

- [ ] Listening module với audio comprehension
- [ ] Reading module với text analysis
- [ ] Full-length mock TOEIC tests
- [ ] Comprehensive score reporting system

### Phase 4: Advanced Features 📋

- [ ] Mobile application development
- [ ] Social learning features (study groups, competitions)
- [ ] Integration với external TOEIC prep materials
- [ ] Advanced analytics dashboard với detailed insights

### Phase 5: Scale và Optimization 📋

- [ ] Performance optimization cho large user base
- [ ] Cloud deployment với auto-scaling
- [ ] Enterprise features cho institutions
- [ ] Multi-language support

---

## TESTING VÀ QUALITY ASSURANCE

### Testing Strategy

- **Unit Testing**: Individual component và function testing
- **Integration Testing**: API endpoints và database operations
- **User Acceptance Testing**: End-to-end user journey validation
- **Performance Testing**: Load testing cho concurrent users
- **Security Testing**: Authentication, authorization, và data protection

### Code Quality Standards

- ESLint configuration cho consistent code style
- Prettier formatting cho readable code
- Git hooks để ensure code quality before commits
- Code review process cho all pull requests

---

## DEPLOYMENT VÀ MONITORING

### Production Deployment

- **Frontend**: Static hosting trên Vercel hoặc Netlify
- **Backend**: Node.js deployment trên AWS EC2 hoặc Heroku
- **Database**: MongoDB Atlas cho cloud database
- **File Storage**: AWS S3 cho audio, image, và document storage

### Monitoring và Analytics

- Application performance monitoring với error tracking
- User analytics để understand learning patterns
- System health monitoring với uptime tracking
- Database performance optimization và query analysis

---

## CONTRIBUTING VÀ DEVELOPMENT TEAM

### Development Guidelines

- Follow React best practices với functional components và hooks
- Use TypeScript cho type safety (future enhancement)
- Implement responsive design với mobile-first approach
- Write comprehensive documentation cho all components và APIs

### Team Structure

- **Frontend Developers**: React.js, UI/UX implementation
- **Backend Developers**: Node.js, API development, database design
- **AI/ML Engineers**: Speech Recognition, NLP integration, analytics
- **QA Engineers**: Testing, quality assurance, user experience validation
- **DevOps Engineers**: Deployment, monitoring, system optimization

---

## LIÊN HỆ VÀ HỖ TRỢ

### Technical Support

- GitHub Issues để report bugs hoặc feature requests
- Documentation wiki để detailed technical guides
- Developer forum để community support và discussions

### Project Maintainers

- **Project Lead**: System architecture và overall direction
- **Frontend Lead**: React.js development và UI/UX design
- **Backend Lead**: Node.js APIs và database management
- **AI Lead**: Machine Learning integration và speech processing

---

_Cập nhật lần cuối: Tháng 8/2025_

> **Note**: Đây là hệ thống đang trong quá trình phát triển với focus chính trên Speaking và Writing modules. Các module Listening và Reading sẽ được implement trong các phases tiếp theo theo roadmap đã outlined.

---

## AVAILABLE SCRIPTS (Create React App)

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
