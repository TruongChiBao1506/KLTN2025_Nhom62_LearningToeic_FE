import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Progress, 
  Radio, 
  Space, 
  message, 
  Spin, 
  Result,
  Divider
} from 'antd';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  RotateCcw,
  BookOpen,
  AlertCircle,
  XCircle
} from 'lucide-react';
import './style.css';

// Import services
import vocabularyQuestionService from '../../../services/vocabularyQuestionService';
import learningProgressService from '../../../services/learningProgressService';

const { Title, Text } = Typography;

const VocabularyQuiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [topicName, setTopicName] = useState('');

  // Timer
  useEffect(() => {
    let timer;
    if (questions.length > 0 && quizStarted && !quizCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [questions.length, quizStarted, quizCompleted]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await vocabularyQuestionService.getEnableVocabularyQuestionsByTopic(topicId);
        
        console.log('Full response from server:', response);
        console.log('Response type:', typeof response);
        console.log('Is response array?', Array.isArray(response));
        console.log('Response.data type:', typeof response?.data);
        console.log('Is response.data array?', Array.isArray(response?.data));
        
        // Xử lý cả trường hợp response là array trực tiếp hoặc có property data
        let questionsData = [];
        
        if (Array.isArray(response)) {
          // Trường hợp service trả về array trực tiếp
          questionsData = response;
          console.log('Using response as direct array');
        } else if (response?.data && Array.isArray(response.data)) {
          // Trường hợp response có property data
          questionsData = response.data;
          console.log('Using response.data as array');
        } else {
          console.log('No valid questions data found');
        }
        
        if (questionsData.length > 0) {
          console.log('Raw questions from server:', questionsData);
          
          // Chuyển đổi cấu trúc dữ liệu từ server về format component mong đợi
          const processedQuestions = questionsData.map(question => {
            // Tạo mảng options từ optionA, optionB, optionC, optionD
            const options = [];
            if (question.optionA) options.push(question.optionA);
            if (question.optionB) options.push(question.optionB);
            if (question.optionC) options.push(question.optionC);
            if (question.optionD) options.push(question.optionD);
            
            // Xác định đáp án đúng dựa trên correctOption (A, B, C, D)
            let correctAnswerValue = '';
            switch (question.correctOption) {
              case 'A':
                correctAnswerValue = question.optionA;
                break;
              case 'B':
                correctAnswerValue = question.optionB;
                break;
              case 'C':
                correctAnswerValue = question.optionC;
                break;
              case 'D':
                correctAnswerValue = question.optionD;
                break;
              default:
                correctAnswerValue = question.optionA; // fallback
            }
            
            const processedQuestion = {
              ...question,
              questionText: question.questionContent, // Mapping questionContent -> questionText
              options: options,
              correctAnswer: correctAnswerValue,
              questionType: question.questionType || 'meaning' // Default type
            };
            
            console.log('Processing question:', {
              original: question,
              processed: processedQuestion,
              correctOption: question.correctOption,
              correctAnswerValue: correctAnswerValue
            });
            
            return processedQuestion;
          });
          
          // Trộn ngẫu nhiên câu hỏi
          const shuffledQuestions = processedQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 20); // Giới hạn 20 câu
          
          console.log('Total processed questions:', processedQuestions.length);
          console.log('Shuffled questions:', shuffledQuestions);
          console.log('Final questions length:', shuffledQuestions.length);
          
          setQuestions(shuffledQuestions);
          
          // Lấy tên topic từ câu hỏi đầu tiên
          if (shuffledQuestions.length > 0) {
            const topicData = shuffledQuestions[0].topic || shuffledQuestions[0].topicData;
            setTopicName(topicData?.topicName || 'Bài kiểm tra từ vựng');
          }
        } else {
          console.log('No questions found - questionsData length:', questionsData.length);
          message.warning('Không có câu hỏi nào cho chủ đề này');
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        message.error('Không thể tải câu hỏi. Vui lòng thử lại sau.');
        setQuestions([]);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    if (topicId) {
      fetchQuestions();
    }
  }, [topicId]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setTimeElapsed(0);
  };

  // Complete quiz and show summary
  const completeQuiz = () => {
    setQuizCompleted(true);
    setShowSummary(true);
  };

  // Handle answer selection - Hiển thị kết quả ngay lập tức
  const handleAnswerSelect = (questionIndex, answer, optionIndex) => {
    const currentQuestion = questions[questionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Lưu câu trả lời với cả nội dung và index
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        answer,
        optionIndex, // Lưu thêm index của option được chọn
        isCorrect,
        answered: true
      }
    }));

    // Ghi nhận kết quả vào backend
    recordAnswerResult(currentQuestion, answer, isCorrect);

    // Kiểm tra xem đã hoàn thành tất cả câu chưa
    const newAnswers = {
      ...selectedAnswers,
      [questionIndex]: { answer, optionIndex, isCorrect, answered: true }
    };
    
    const answeredCount = Object.keys(newAnswers).length;
    if (answeredCount === questions.length) {
      // Delay để người dùng có thể thấy kết quả câu cuối
      setTimeout(() => {
        completeQuiz();
      }, 1500);
    }
  };

  // Navigate to question
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Record individual answer result
  const recordAnswerResult = async (question, userAnswer, isCorrect) => {
    try {
      await learningProgressService.recordVocabularyAnswer({
        vocabularyQuestionId: question._id,
        topicId: topicId,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        timeSpent: Math.round(timeElapsed / questions.length)
      });
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  };

  // Reset quiz (for practice mode)
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeElapsed(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setShowSummary(false);
  };

  // Calculate quiz statistics
  const getQuizStats = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const correctAnswers = Object.values(selectedAnswers).filter(answer => answer.isCorrect).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      percentage
    };
  };

  // Get question type display
//   const getQuestionTypeDisplay = (type) => {
//     const types = {
//       'fill-blank': { text: 'Điền từ', color: '#1890ff', icon: '📝' },
//       'complete-sentence': { text: 'Hoàn thành câu', color: '#52c41a', icon: '✏️' },
//       'meaning': { text: 'Nghĩa từ vựng', color: '#faad14', icon: '📖' },
//       'synonym': { text: 'Từ đồng nghĩa', color: '#722ed1', icon: '🔄' },
//       'antonym': { text: 'Từ trái nghĩa', color: '#f5222d', icon: '⚡' }
//     };
//     return types[type] || { text: 'Trắc nghiệm', color: '#666', icon: '❓' };
//   };

  if (loading) {
    return (
      <div className="quiz-loading">
        <Spin size="large" />
        <Text style={{ marginTop: 16, display: 'block' }}>Đang tải câu hỏi...</Text>
      </div>
    );
  }

  if (!loading && questions.length === 0) {
    console.log('No questions available, loading:', loading, 'questions length:', questions.length);
    return (
      <div className="quiz-no-questions">
        <Result
          icon={<BookOpen size={64} style={{ color: '#faad14' }} />}
          title="Chưa có câu hỏi"
          subTitle="Chủ đề này chưa có câu hỏi trắc nghiệm nào."
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} style={{ marginRight: 8 }} />
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  // Quiz Introduction
  if (!quizStarted && !loading && questions.length > 0) {
    return (
      <div className="quiz-intro">
        <Card className="intro-card">
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            {/* Main Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(24,144,255,0.3)'
            }}>
              <BookOpen size={36} style={{ color: 'white' }} />
            </div>

            {/* Title */}
            <Title level={2} style={{ 
              color: '#2c3e50', 
              marginBottom: 8,
              fontSize: '28px',
              fontWeight: '600'
            }}>
              Kiểm tra từ vựng
            </Title>
            
            {/* Subtitle */}
            <Text style={{ 
              fontSize: 16, 
              color: '#1890ff',
              display: 'block',
              marginBottom: 32,
              fontWeight: '500'
            }}>
              {topicName || 'Business & Finance'}
            </Text>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={8}>
                <Card 
                  size="small" 
                  style={{ 
                    background: '#f0f8ff', 
                    border: '1px solid #d6e4ff',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ color: '#1890ff', fontSize: '16px', marginBottom: 4 }}>
                    <BookOpen size={20} style={{ marginBottom: 4 }} />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: 4 }}>
                    {questions.length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Câu hỏi
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card 
                  size="small" 
                  style={{ 
                    background: '#fff7e6', 
                    border: '1px solid #ffd591',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ color: '#fa8c16', fontSize: '16px', marginBottom: 4 }}>
                    <Clock size={20} style={{ marginBottom: 4 }} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16', marginBottom: 4 }}>
                    Không giới hạn
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Thời gian
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card 
                  size="small" 
                  style={{ 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ color: '#52c41a', fontSize: '16px', marginBottom: 4 }}>
                    ⭐
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a', marginBottom: 4 }}>
                    {Math.round((questions.length * 100) / questions.length)}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Mục tiêu
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Instructions */}
            <Card 
              style={{ 
                background: '#fafafa', 
                border: '1px solid #f0f0f0',
                borderRadius: '12px',
                marginBottom: 32,
                textAlign: 'left',
                padding:"16px 24px"
              }}
            >
              <Title level={5} style={{ 
                marginBottom: 16, 
                color: '#2c3e50',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Hướng dẫn:
              </Title>
              <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                <div style={{ marginBottom: 8 }}>
                  • Đọc câu hỏi và các lựa chọn một cách cẩn thận
                </div>
                <div style={{ marginBottom: 8 }}>
                  • Không giới hạn thời gian - hãy suy nghĩ thật kỹ
                </div>
                <div style={{ marginBottom: 8 }}>
                  • Mỗi câu hỏi chỉ có thể chọn một lần duy nhất
                </div>
                <div style={{ marginBottom: 8 }}>
                  • Kết quả sẽ hiển thị ngay sau khi chọn đáp án
                </div>
                <div>
                  • Hoàn thành tất cả {questions.length} câu để xem tổng kết
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <Space size="middle">
              <Button 
                type="primary" 
                size="large" 
                onClick={startQuiz}
                style={{ 
                  minWidth: 140, 
                  height: 48,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                <CheckCircle size={18} style={{ marginRight: 8 }} />
                Bắt đầu luyện tập
              </Button>
              <Button 
                size="large" 
                onClick={() => navigate(`/learner/topic/${topicId}`)}
                style={{ 
                  minWidth: 120, 
                  height: 48,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                <ArrowLeft size={18} style={{ marginRight: 8 }} />
                Quay lại
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  // Quiz Summary
  if (showSummary && quizCompleted) {
    const stats = getQuizStats();
    
    return (
      <div className="quiz-summary">
        <Card className="summary-card">
          <div style={{ textAlign: 'center', padding: '24px' }}>
            {/* Warning Icon */}
            <div className="summary-header">
              <div className="warning-icon">
                <AlertCircle size={48} style={{ color: '#FFA500' }} />
              </div>
              <Title level={2} style={{ marginBottom: 8, marginTop: 16 }}>
                Hoàn thành bài kiểm tra!
              </Title>
              <Text style={{ fontSize: 16, color: '#666' }}>
                Business & Finance
              </Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginTop: 32, marginBottom: 32 }}>
              <Col xs={24} sm={12} md={6}>
                <div className="modern-stat-card score-card" style={{ animationDelay: '0.1s' }}>
                  <div className="stat-content">
                    <div className="stat-label">Điểm số</div>
                    <div className="stat-value">{stats.percentage}%</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="modern-stat-card correct-card" style={{ animationDelay: '0.2s' }}>
                  <div className="stat-content">
                    <div className="stat-label">Câu đúng</div>
                    <div className="stat-value">{stats.correctAnswers}/{stats.totalQuestions}</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="modern-stat-card incorrect-card" style={{ animationDelay: '0.3s' }}>
                  <div className="stat-content">
                    <div className="stat-label">Câu sai</div>
                    <div className="stat-value">{stats.incorrectAnswers}/{stats.totalQuestions}</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="modern-stat-card time-card" style={{ animationDelay: '0.4s' }}>
                  <div className="stat-content">
                    <div className="stat-label">Thời gian</div>
                    <div className="stat-value">{formatTime(timeElapsed)}</div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Question Review Grid */}
            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>Danh sách câu hỏi</Title>
              <div className="modern-question-grid">
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer?.isCorrect;
                  const answered = userAnswer?.answered;
                  
                  return (
                    <div 
                      key={index} 
                      className={`modern-question-item ${
                        answered 
                          ? isCorrect 
                            ? 'correct' 
                            : 'incorrect'
                          : 'unanswered'
                      }`}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setShowSummary(false);
                      }}
                    >
                      <span className="question-number">{index + 1}</span>
                      <div className="question-status">
                        {answered ? (
                          isCorrect ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )
                        ) : (
                          <div className="unanswered-dot"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                onClick={resetQuiz}
                style={{ minWidth: 120, height: 48 }}
              >
                <RotateCcw size={20} style={{ marginRight: 8 }} />
                Làm lại
              </Button>
              <Button 
                size="large" 
                onClick={() => navigate(`/learner/topic/${topicId}`)}
                style={{ minWidth: 120, height: 48 }}
              >
                <ArrowLeft size={20} style={{ marginRight: 8 }} />
                Quay về chủ đề
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  console.log('Component render - Loading:', loading, 'Questions length:', questions.length);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
//   const typeDisplay = getQuestionTypeDisplay(currentQuestion?.questionType);

  return (
    <div className="vocabulary-quiz">
      {/* Header */}
      <div className="quiz-header">
        <Card className="header-card">
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Link to={`/learner/topic/${topicId}`}>
                  <Button type="text" icon={<ArrowLeft size={16} />}>
                    Quay lại
                  </Button>
                </Link>
                <Divider type="vertical" />
                <Title level={4} style={{ margin: 0 }}>
                  {topicName}
                </Title>
                {/* <Tag color={typeDisplay.color}>
                  {typeDisplay.icon} {typeDisplay.text}
                </Tag> */}
              </Space>
            </Col>
            <Col>
              <Space size="large">
                <div className="time-display">
                  <Clock size={16} />
                  <Text strong>{formatTime(timeElapsed)}</Text>
                </div>
                <Text strong>
                  {currentQuestionIndex + 1}/{questions.length}
                </Text>
              </Space>
            </Col>
          </Row>
          <Progress 
            percent={progress} 
            showInfo={false} 
            strokeColor="#1890ff"
            style={{ marginTop: 16 }}
          />
        </Card>
      </div>

      <Row gutter={24} className="quiz-content">
        {/* Question Panel */}
        <Col span={18}>
          <Card className={`question-card ${selectedAnswers[currentQuestionIndex] ? 'has-explanation' : ''}`}>
            <div className="question-header">
              <Space>
                <span className="question-number">
                  Câu {currentQuestionIndex + 1}
                </span>
                {/* <Tag color={typeDisplay.color}>
                  {typeDisplay.icon} {typeDisplay.text}
                </Tag> */}
              </Space>
            </div>

            <div className="question-content-container">
              <div className="question-content">
                <Title level={4} style={{ marginBottom: 24 }}>
                  {currentQuestion.questionText}
                </Title>

                {currentQuestion.context && (
                  <div className="question-context">
                    <Text italic>"{currentQuestion.context}"</Text>
                  </div>
                )}

                <div className="answer-options">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {currentQuestion.options?.map((option, index) => {
                    const userAnswer = selectedAnswers[currentQuestionIndex];
                    // Sử dụng index thay vì nội dung để xác định đáp án được chọn
                    const isSelectedByIndex = userAnswer?.optionIndex === index;
                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                    const hasAnswered = !!userAnswer;
                    const userAnsweredCorrectly = userAnswer?.isCorrect;



                    let optionClass = 'answer-option';
                    let showCheck = false;
                    let showCross = false;

                    if (hasAnswered) {
                      if (userAnsweredCorrectly) {
                        // Chỉ đáp án đúng được chọn có màu xanh
                        if (isSelectedByIndex && isCorrectAnswer) {
                          optionClass += ' correct-answer';
                          showCheck = true;
                        }
                      } else {
                        // Chỉ đáp án được chọn (theo index) có màu đỏ
                        // và đáp án đúng có màu xanh
                        if (isSelectedByIndex) {
                          optionClass += ' incorrect-answer';
                          showCross = true;
                        } else if (isCorrectAnswer) {
                          optionClass += ' correct-answer';
                          showCheck = true;
                        }
                      }
                    }

                    return (
                      <Radio 
                        key={index} 
                        checked={isSelectedByIndex}
                        disabled={hasAnswered}
                        className={optionClass}
                        onChange={() => {
                          if (!hasAnswered) {
                            handleAnswerSelect(currentQuestionIndex, option, index);
                          }
                        }}
                      >
                        <span className="option-text">
                          {option}
                          {hasAnswered && showCheck && (
                            <CheckCircle size={16} style={{ marginLeft: 8, color: '#52c41a' }} />
                          )}
                          {hasAnswered && showCross && (
                            <span style={{ marginLeft: 8, color: '#f5222d' }}>✗</span>
                          )}
                        </span>
                      </Radio>
                    );
                  })}
                </Space>
              </div>

              {/* Hiển thị giải thích nếu đã trả lời */}
              {selectedAnswers[currentQuestionIndex] && (
                <div className="answer-explanation" style={{ marginTop: 20 }}>
                  {selectedAnswers[currentQuestionIndex].isCorrect ? (
                    <div className="correct-feedback">
                      <CheckCircle size={20} style={{ color: '#52c41a', marginRight: 8 }} />
                      <Text strong style={{ color: '#52c41a' }}>Chính xác!</Text>
                    </div>
                  ) : (
                    <div className="incorrect-feedback">
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: '#f5222d', marginRight: 8 }}>✗</span>
                        <Text strong style={{ color: '#f5222d' }}>Chưa đúng!</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Đáp án của bạn: </Text>
                        <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>{selectedAnswers[currentQuestionIndex].answer}</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Đáp án đúng: </Text>
                        <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{currentQuestion.correctAnswer}</Text>
                      </div>
                      {currentQuestion.questionExplanation && (
                        <div style={{ 
                          background: 'rgba(250,173,20,0.1)', 
                          padding: '12px', 
                          borderRadius: '8px',
                          borderLeft: '4px solid #faad14'
                        }}>
                          <Text strong>Giải thích: </Text>
                          <Text>{currentQuestion.questionExplanation}</Text>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>

            <div className="question-navigation">
              <Space>
                <Button 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                >
                  Câu trước
                </Button>
                <Button 
                  type="primary"
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Câu tiếp theo
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Question List Panel */}
        <Col span={6}>
          <Card title="Danh sách câu hỏi" className="question-list-card">
            <div className="question-grid">
              {questions.map((_, index) => {
                const userAnswer = selectedAnswers[index];
                const isAnswered = userAnswer?.answered;
                const isCorrect = userAnswer?.isCorrect;
                
                return (
                  <Button
                    key={index}
                    size="small"
                    type={index === currentQuestionIndex ? 'primary' : 'default'}
                    className={`question-btn ${
                      isAnswered 
                        ? isCorrect 
                          ? 'answered correct' 
                          : 'answered incorrect' 
                        : 'unanswered'
                    }`}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                    {isAnswered && (
                      isCorrect ? (
                        <CheckCircle size={12} className="answered-icon" />
                      ) : (
                        <XCircle size={12} className="answered-icon" style={{ background: '#f5222d' }} />
                      )
                    )}
                  </Button>
                );
              })}
            </div>

            <Divider />

            <div className="quiz-stats">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div className="stat-item">
                    <Text type="secondary">Đã trả lời:</Text>
                    <Text strong>{Object.keys(selectedAnswers).length}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-item">
                    <Text type="secondary">Còn lại:</Text>
                    <Text strong>{questions.length - Object.keys(selectedAnswers).length}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="practice-summary" style={{ marginTop: 16 }}>
              
              
              {/* Show summary button if all questions answered */}
              {Object.keys(selectedAnswers).length === questions.length && (
                <Button 
                  type="primary" 
                  size="large"
                  block
                  onClick={() => setShowSummary(true)}
                  style={{ marginBottom: '8px', background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Xem tổng kết
                </Button>
              )}
              
              <Button 
                type="primary" 
                size="large"
                block
                onClick={resetQuiz}
                icon={<RotateCcw size={16} />}
                style={{ marginBottom: '8px' }}
              >
                Làm lại từ đầu
              </Button>
              
              <Button 
                size="large"
                block
                onClick={() => navigate(`/learner/topic/${topicId}`)}
              >
                Quay về chủ đề
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VocabularyQuiz;
