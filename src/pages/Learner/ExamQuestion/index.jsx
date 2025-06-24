import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ExamQuestionList from '../../../components/Learner/ExamQuestionList';
import examQuestionService from '../../../services/examQuestionService';
import userExamQuestionService from '../../../services/userExamQuestionService'; 
import userExamService from '../../../services/userExamService';
import userGoalService from '../../../services/userGoalService';
import examService from '../../../services/examService';
import userService from '../../../services/userService';
import scoreTableService from '../../../services/scoreTableService';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './style.css';

const ExamQuestion = () => {
  const { examId } = useParams();
  const [examQuestions, setExamQuestions] = useState([]);
  const [parts, setParts] = useState([]);
  const [groupedQuestionsByPart, setGroupedQuestionsByPart] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [userExamId, setUserExamId] = useState(null);
  const [goalScore, setGoalScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const [tableListeningScores, setTableListeningScores] = useState([]);
  const [tableReadingScores, setTableReadingScores] = useState([]);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const learnerToken = localStorage.getItem('learnerToken');
        if (!learnerToken) {
          throw new Error('Không tìm thấy token người dùng');
        }
        const decoded = jwtDecode(learnerToken);
        setUserId(decoded.id);
        return decoded.id;
      } catch (error) {
        console.error('Lỗi khi lấy userId:', error);
        toast.error('Vui lòng đăng nhập để làm bài thi');
        throw error;
      }
    };

    const retrieveExamQuestions = async (userId) => {
      try {
        setLoading(true);
        const questionsResponse = await examQuestionService.getQuestionsByExamId(examId);
        const examData = await examService.getExamById(examId);

        // Tạo user exam record
        const userExamResponse = await userExamService.create({
          userId: userId,
          examId: examId,
          startTime: new Date().toISOString(),
          status: 'IN_PROGRESS'
        });

        setUserExamId(userExamResponse.data.userExamId);
        setCountdown(examData.data.examDuration);

        const questions = questionsResponse.data;
        setExamQuestions(questions);

        // Tạo groupedQuestionsByPart và parts
        const groupedByPart = {};
        const partsArray = [];

        for (const examQuestion of questions) {
          const part = examQuestion.questionPart;
          if (!groupedByPart[part]) {
            groupedByPart[part] = [];
            partsArray.push(part);
          }
          groupedByPart[part].push(examQuestion);
        }

        setGroupedQuestionsByPart(groupedByPart);
        setParts(partsArray);

        // Lấy điểm mục tiêu của người dùng nếu có
        try {
          const goalResponse = await userGoalService.getByUserId(userId);
          if (goalResponse.data && goalResponse.data.goalScore) {
            setGoalScore(goalResponse.data.goalScore);
          }
        } catch (goalError) {
          console.log('Không có mục tiêu điểm số được thiết lập');
        }

        // Lấy bảng điểm cho Listening và Reading
        const listeningScores = await scoreTableService.getListeningScores();
        const readingScores = await scoreTableService.getReadingScores();
        setTableListeningScores(listeningScores.data);
        setTableReadingScores(readingScores.data);
        
      } catch (error) {
        console.error('Lỗi khi lấy câu hỏi bài thi:', error);
        setError('Không thể tải câu hỏi bài thi, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };

    const initializeExam = async () => {
      try {
        const uid = await getUserId();
        await retrieveExamQuestions(uid);
      } catch (error) {
        console.error('Không thể khởi tạo bài thi:', error);
      }
    };

    initializeExam();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examId]);

  useEffect(() => {
    // Bắt đầu đếm ngược khi có thời gian bài thi
    if (countdown > 0 && !hasSubmitted) {
      timerRef.current = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            clearInterval(timerRef.current);
            submitAnswers();
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown, hasSubmitted]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateToeicScore = (numCorrectAnswers, tableScores) => {
    // Tìm kiếm trong mảng số câu đúng => điểm số
    const score = tableScores.find(item => item.numCorrectAnswers === numCorrectAnswers);
    return score ? score.score : 0;
  };

  const submitAnswers = async () => {
    const answeredQuestions = examQuestions.filter(examQuestion => examQuestion.selectedOption);

    if (answeredQuestions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Bạn chưa trả lời bất kỳ câu nào. Vui lòng chọn đáp án!',
      });
      return;
    }

    // Nếu chưa hoàn thành tất cả câu hỏi, hiển thị xác nhận
    if (answeredQuestions.length < examQuestions.length) {
      const result = await Swal.fire({
        icon: 'question',
        title: 'Bạn chưa hoàn thành tất cả câu hỏi',
        text: 'Bạn thực sự muốn nộp?',
        showCancelButton: true,
        confirmButtonText: 'Nộp',
        cancelButtonText: 'Quay lại',
      });

      if (!result.isConfirmed) {
        return;
      }
    } else {
      const result = await Swal.fire({
        icon: 'question',
        title: 'Bạn có chắc chắn muốn nộp?',
        showCancelButton: true,
        confirmButtonText: 'Nộp',
        cancelButtonText: 'Quay lại',
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    // Tiến hành nộp bài
    try {
      setLoading(true);

      // Dừng đếm ngược
      clearInterval(timerRef.current);

      // Đánh dấu câu trả lời đã được chọn và nộp cho từng câu hỏi
      const userExamQuestionsData = examQuestions
        .filter(question => question.selectedOption)
        .map(question => ({
          userExamId: userExamId,
          examQuestionId: question.examQuestionId,
          selectedOption: question.selectedOption || null,
        }));

      // Lưu lại các câu trả lời của người dùng
      await userExamQuestionService.createBatch(userExamQuestionsData);

      // Đánh dấu bài thi đã hoàn thành
      const endTime = new Date().toISOString();
      
      // Tính điểm cho từng phần và tổng điểm
      const listeningQuestions = examQuestions.filter(q => 
        q.questionPart === 'PART1' || 
        q.questionPart === 'PART2' || 
        q.questionPart === 'PART3' || 
        q.questionPart === 'PART4'
      );
      
      const readingQuestions = examQuestions.filter(q => 
        q.questionPart === 'PART5' || 
        q.questionPart === 'PART6' || 
        q.questionPart === 'PART7'
      );
      
      const correctListeningCount = listeningQuestions.filter(
        q => q.selectedOption === q.correctOption
      ).length;
      
      const correctReadingCount = readingQuestions.filter(
        q => q.selectedOption === q.correctOption
      ).length;
      
      // Tính điểm TOEIC dựa trên số câu đúng và bảng quy đổi
      const listeningScore = calculateToeicScore(correctListeningCount, tableListeningScores);
      const readingScore = calculateToeicScore(correctReadingCount, tableReadingScores);
      const totalScore = listeningScore + readingScore;

      // Cập nhật dữ liệu bài thi người dùng với điểm số
      await userExamService.update(userExamId, {
        endTime: endTime,
        status: 'COMPLETED',
        listeningScore: listeningScore,
        readingScore: readingScore,
        totalScore: totalScore
      });

      // Đánh dấu các câu đã chấm điểm
      const gradedQuestions = examQuestions.map(question => {
        return {
          ...question,
          isGraded: true,
          answered: question.selectedOption !== null,
        };
      });

      setExamQuestions(gradedQuestions);
      setHasSubmitted(true);
      
      // Thông báo hoàn thành bài thi
      Swal.fire({
        icon: 'success',
        title: 'Nộp bài thành công!',
        html: `
          <p>Điểm Listening: <strong>${listeningScore}</strong></p>
          <p>Điểm Reading: <strong>${readingScore}</strong></p>
          <p>Tổng điểm: <strong>${totalScore}</strong></p>
        `,
        confirmButtonText: 'Xem kết quả chi tiết',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/exam-result/${userExamId}`;
        }
      });

    } catch (error) {
      console.error('Lỗi khi nộp bài thi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi nộp bài',
        text: 'Có lỗi xảy ra khi nộp bài, vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-test">
      <div className="container-fluid">
        <div className="row mt-3">
          {examQuestions.length > 0 && (
            <ExamQuestionList
              examQuestions={examQuestions}
              submitAnswers={submitAnswers}
              parts={parts}
              groupedQuestionsByPart={groupedQuestionsByPart}
              hasSubmitted={hasSubmitted}
              formatTime={formatTime}
              countdown={countdown}
              userExamId={userExamId}
              goalScore={goalScore}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamQuestion;
