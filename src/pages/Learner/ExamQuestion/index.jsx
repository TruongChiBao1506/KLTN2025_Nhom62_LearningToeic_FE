import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ExamQuestionList from "../../../components/Learner/ExamQuestionList";
import examQuestionService from "../../../services/examQuestionService";
import userExamQuestionService from "../../../services/userExamQuestionService";
import userExamService from "../../../services/userExamService";
import userGoalService from "../../../services/userGoalService";
import examService from "../../../services/examService";
import userService from "../../../services/userService";
import scoreTableService from "../../../services/scoreTableService";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./style.css";

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
  const autoSaveRef = useRef(null);
  const [tableListeningScores, setTableListeningScores] = useState([]);
  const [tableReadingScores, setTableReadingScores] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [viewedQuestions, setViewedQuestions] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    percentage: 0,
  });
  useEffect(() => {
    // Xử lý sự kiện khi người dùng rời trang
    const handleBeforeUnload = (event) => {
      if (!hasSubmitted && userExamId) {
        const message =
          "Bạn có chắc chắn muốn rời khỏi trang? Dữ liệu làm bài của bạn sẽ không được lưu!";
        event.returnValue = message;
        return message;
      }
    };

    // Đăng ký sự kiện
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Xóa sự kiện khi component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasSubmitted, userExamId]);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const learnerToken = localStorage.getItem("learnerToken");
        if (!learnerToken) {
          throw new Error("Không tìm thấy token người dùng");
        }
        const decoded = jwtDecode(learnerToken);
        setUserId(decoded.id);
        return decoded.id;
      } catch (error) {
        console.error("Lỗi khi lấy userId:", error);
        toast.error("Vui lòng đăng nhập để làm bài thi");
        // Chuyển hướng đến trang đăng nhập sau 2 giây
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
        throw error;
      }
    };

    const retrieveExamQuestions = async (userId) => {
      try {
        setLoading(true);

        // Lấy thông tin bài thi
        const [
          questionsResponse,
          examData,
          userGoalData,
          listeningScores,
          readingScores,
        ] = await Promise.all([
          examQuestionService.getQuestionsByExamId(examId),
          examService.getExamById(examId),
          userGoalService.getByUserId(userId).catch(() => ({ data: null })),
          scoreTableService.getListeningScores(),
          scoreTableService.getReadingScores(),
        ]);

        // Tạo user exam record
        const userExamResponse = await userExamService.create({
          userId: userId,
          examId: examId,
          startTime: new Date().toISOString(),
          status: "IN_PROGRESS",
        });

        // Thiết lập dữ liệu trạng thái
        setUserExamId(userExamResponse.data.userExamId);
        setCountdown(examData.data.examDuration);

        // Lấy và thiết lập mục tiêu
        if (userGoalData && userGoalData.data && userGoalData.data.goalScore) {
          setGoalScore(userGoalData.data.goalScore);
        }

        // Thiết lập bảng điểm
        setTableListeningScores(listeningScores.data);
        setTableReadingScores(readingScores.data);

        // Xử lý dữ liệu câu hỏi
        const questions = questionsResponse.data;

        // Kiểm tra xem có bản lưu trong localStorage không
        const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
        if (savedAnswers && !hasSubmitted) {
          try {
            const parsedAnswers = JSON.parse(savedAnswers);
            // Áp dụng câu trả lời đã lưu vào câu hỏi
            const updatedQuestions = questions.map((q) => {
              const savedQuestion = parsedAnswers.find(
                (sq) => sq.examQuestionId === q.examQuestionId
              );
              if (savedQuestion && savedQuestion.selectedOption) {
                return { ...q, selectedOption: savedQuestion.selectedOption };
              }
              return q;
            });
            setExamQuestions(updatedQuestions);

            // Hiển thị thông báo đã khôi phục
            toast.info("Đã khôi phục phiên làm bài trước đó của bạn");
          } catch (e) {
            console.error("Lỗi khi khôi phục dữ liệu:", e);
            setExamQuestions(questions);
          }
        } else {
          setExamQuestions(questions);
        }

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
      } catch (error) {
        console.error("Lỗi khi lấy câu hỏi bài thi:", error);
        setError("Không thể tải câu hỏi bài thi, vui lòng thử lại sau");
      } finally {
        setLoading(false);
      }
    };

    const initializeExam = async () => {
      try {
        const uid = await getUserId();
        await retrieveExamQuestions(uid);
      } catch (error) {
        console.error("Không thể khởi tạo bài thi:", error);
      }
    };

    initializeExam();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examId]); // Cập nhật tiến độ làm bài
  useEffect(() => {
    if (examQuestions.length > 0) {
      const answered = examQuestions.filter((q) => q.selectedOption).length;
      setProgress({
        totalQuestions: examQuestions.length,
        answeredQuestions: answered,
        percentage: Math.round((answered / examQuestions.length) * 100),
      });
    }
  }, [examQuestions]);

  // Kiểm tra và hiển thị hướng dẫn cho người dùng mới
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("exam_guide_seen");
    if (!hasSeenGuide && examQuestions.length > 0 && !loading) {
      setShowGuide(true);
    }
  }, [examQuestions, loading]);

  // Lưu trạng thái câu hỏi đã xem
  useEffect(() => {
    if (!hasSubmitted && userExamId) {
      const savedViewed = localStorage.getItem(`exam_${examId}_viewed`);
      if (savedViewed) {
        try {
          setViewedQuestions(JSON.parse(savedViewed));
        } catch (e) {
          console.error("Lỗi khi đọc câu hỏi đã xem:", e);
        }
      }
    }
  }, [examId, userExamId, hasSubmitted]);

  // Xử lý đánh dấu câu hỏi đã xem
  const markQuestionAsViewed = (questionId) => {
    if (!viewedQuestions.includes(questionId)) {
      const updatedViewed = [...viewedQuestions, questionId];
      setViewedQuestions(updatedViewed);
      localStorage.setItem(
        `exam_${examId}_viewed`,
        JSON.stringify(updatedViewed)
      );
    }
  };

  // Chuyển đổi chế độ tối/sáng
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    localStorage.setItem("exam_dark_mode", !darkMode ? "true" : "false");
  };

  // Đóng hướng dẫn và đánh dấu đã xem
  const closeGuide = () => {
    setShowGuide(false);
    localStorage.setItem("exam_guide_seen", "true");
  };

  // Phân tích điểm yếu dựa trên kết quả
  const analyzeWeaknesses = (partStatistics) => {
    const weakParts = [];

    for (const part in partStatistics) {
      const stats = partStatistics[part];
      const correctRate = stats.total > 0 ? stats.correct / stats.total : 0;

      if (correctRate < 0.6) {
        // Dưới 60% chính xác
        weakParts.push({
          part,
          correctRate,
          suggestion: getSuggestionForPart(part),
        });
      }
    }

    return weakParts.sort((a, b) => a.correctRate - b.correctRate);
  };

  // Gợi ý ôn tập theo phần
  const getSuggestionForPart = (part) => {
    switch (part) {
      case "PART1":
        return "Ôn tập từ vựng miêu tả hình ảnh và tình huống thường ngày";
      case "PART2":
        return "Luyện nghe và phản ứng nhanh với câu hỏi";
      case "PART3":
        return "Tập trung vào nghe hội thoại và nắm bắt thông tin chính";
      case "PART4":
        return "Luyện nghe bài nói dài và tóm tắt ý chính";
      case "PART5":
        return "Ôn tập ngữ pháp và từ vựng cơ bản";
      case "PART6":
        return "Luyện đọc hiểu đoạn văn ngắn và hoàn thành câu";
      case "PART7":
        return "Tập đọc hiểu nhanh và tìm thông tin trong đoạn văn dài";
      default:
        return "Ôn tập toàn diện các kỹ năng";
    }
  };

  // Hàm tự động lưu câu trả lời
  const autoSaveAnswers = () => {
    if (hasSubmitted || !userExamId) return;

    const answeredQuestions = examQuestions
      .filter((q) => q.selectedOption)
      .map((q) => ({
        examQuestionId: q.examQuestionId,
        selectedOption: q.selectedOption,
      }));

    if (answeredQuestions.length > 0) {
      localStorage.setItem(
        `exam_${examId}_answers`,
        JSON.stringify(answeredQuestions)
      );
      setLastSaved(new Date());
    }
  };

  // Thiết lập tự động lưu mỗi 30 giây
  useEffect(() => {
    if (!hasSubmitted && examQuestions.length > 0) {
      autoSaveRef.current = setInterval(autoSaveAnswers, 30000);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [examQuestions, hasSubmitted, userExamId]);

  // Đếm ngược thời gian
  useEffect(() => {
    // Bắt đầu đếm ngược khi có thời gian bài thi
    if (countdown > 0 && !hasSubmitted) {
      timerRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          // Khi chỉ còn 5 phút, hiện cảnh báo
          if (prevCountdown === 300) {
            toast.warning("Còn 5 phút nữa hết giờ làm bài!", {
              position: "top-center",
              autoClose: 5000,
            });
          }

          // Khi hết giờ, tự động nộp bài
          if (prevCountdown <= 1) {
            clearInterval(timerRef.current);
            toast.info("Hết thời gian làm bài!", {
              position: "top-center",
              autoClose: 3000,
            });
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

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const calculateToeicScore = (numCorrectAnswers, tableScores) => {
    // Tìm kiếm trong mảng số câu đúng => điểm số
    const score = tableScores.find(
      (item) => item.numCorrectAnswers === numCorrectAnswers
    );
    return score ? score.score : 0;
  };

  const submitAnswers = async () => {
    const answeredQuestions = examQuestions.filter(
      (examQuestion) => examQuestion.selectedOption
    );

    if (answeredQuestions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Bạn chưa trả lời bất kỳ câu nào. Vui lòng chọn đáp án!",
      });
      return;
    }

    // Nếu chưa hoàn thành tất cả câu hỏi, hiển thị xác nhận
    if (answeredQuestions.length < examQuestions.length) {
      const result = await Swal.fire({
        icon: "question",
        title: "Bạn chưa hoàn thành tất cả câu hỏi",
        text: "Bạn thực sự muốn nộp?",
        showCancelButton: true,
        confirmButtonText: "Nộp",
        cancelButtonText: "Quay lại",
      });

      if (!result.isConfirmed) {
        return;
      }
    } else {
      const result = await Swal.fire({
        icon: "question",
        title: "Bạn có chắc chắn muốn nộp?",
        showCancelButton: true,
        confirmButtonText: "Nộp",
        cancelButtonText: "Quay lại",
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
        .filter((question) => question.selectedOption)
        .map((question) => ({
          userExamId: userExamId,
          examQuestionId: question.examQuestionId,
          selectedOption: question.selectedOption || null,
        }));

      // Lưu lại các câu trả lời của người dùng
      await userExamQuestionService.createBatch(userExamQuestionsData);

      // Đánh dấu bài thi đã hoàn thành
      const endTime = new Date().toISOString();

      // Xóa dữ liệu lưu tạm
      localStorage.removeItem(`exam_${userExamId}_state`);

      // Tính điểm cho từng phần và tổng điểm
      const listeningQuestions = examQuestions.filter(
        (q) =>
          q.questionPart === "PART1" ||
          q.questionPart === "PART2" ||
          q.questionPart === "PART3" ||
          q.questionPart === "PART4"
      );

      const readingQuestions = examQuestions.filter(
        (q) =>
          q.questionPart === "PART5" ||
          q.questionPart === "PART6" ||
          q.questionPart === "PART7"
      );

      const correctListeningCount = listeningQuestions.filter(
        (q) => q.selectedOption === q.correctOption
      ).length;

      const correctReadingCount = readingQuestions.filter(
        (q) => q.selectedOption === q.correctOption
      ).length;

      // Thống kê theo từng phần
      const partStatistics = {};
      parts.forEach((part) => {
        const questionsOfPart = examQuestions.filter(
          (q) => q.questionPart === part
        );
        const answeredQuestionsOfPart = questionsOfPart.filter(
          (q) => q.selectedOption
        );
        const correctQuestionsOfPart = questionsOfPart.filter(
          (q) => q.selectedOption === q.correctOption
        );

        partStatistics[part] = {
          total: questionsOfPart.length,
          answered: answeredQuestionsOfPart.length,
          correct: correctQuestionsOfPart.length,
        };
      });

      // Tính điểm TOEIC dựa trên số câu đúng và bảng quy đổi
      const listeningScore = calculateToeicScore(
        correctListeningCount,
        tableListeningScores
      );
      const readingScore = calculateToeicScore(
        correctReadingCount,
        tableReadingScores
      );
      const totalScore = listeningScore + readingScore;

      // Cập nhật dữ liệu bài thi người dùng với điểm số
      await userExamService.update(userExamId, {
        endTime: endTime,
        status: "COMPLETED",
        listeningScore: listeningScore,
        readingScore: readingScore,
        totalScore: totalScore,
      });

      // Đánh dấu các câu đã chấm điểm
      const gradedQuestions = examQuestions.map((question) => {
        return {
          ...question,
          isGraded: true,
          answered: question.selectedOption !== null,
        };
      });

      setExamQuestions(gradedQuestions);
      setHasSubmitted(true); // Xóa tất cả dữ liệu lưu tạm và trạng thái
      localStorage.removeItem(`exam_${examId}_answers`);
      localStorage.removeItem(`exam_${examId}_viewed`);
      localStorage.removeItem(`exam_${userExamId}_state`);

      // Phân tích điểm yếu
      const weaknesses = analyzeWeaknesses(partStatistics);

      // Thông báo hoàn thành bài thi
      let goalMessage = "";
      if (goalScore && totalScore >= goalScore) {
        goalMessage = `<p class="text-success"><i class="fas fa-trophy me-1"></i> Chúc mừng! Bạn đã đạt mục tiêu điểm số ${goalScore} của mình.</p>`;
      } else if (goalScore) {
        const diffToGoal = goalScore - totalScore;
        goalMessage = `<p>Mục tiêu của bạn là: <strong>${goalScore}</strong> điểm. Còn thiếu <strong>${diffToGoal}</strong> điểm nữa. Hãy tiếp tục cố gắng!</p>`;
      }

      // Chi tiết thống kê
      let statisticsHtml =
        '<div class="mt-3"><h6>Thống kê chi tiết:</h6><ul style="text-align: left;">';

      // Điểm nghe và đọc
      statisticsHtml += `<li>Nghe: ${correctListeningCount}/${
        listeningQuestions.length
      } câu đúng (${Math.round(
        (correctListeningCount / listeningQuestions.length) * 100
      )}%) - <strong>${listeningScore}</strong> điểm</li>`;
      statisticsHtml += `<li>Đọc: ${correctReadingCount}/${
        readingQuestions.length
      } câu đúng (${Math.round(
        (correctReadingCount / readingQuestions.length) * 100
      )}%) - <strong>${readingScore}</strong> điểm</li>`;

      // Chi tiết từng phần
      for (const part in partStatistics) {
        const stats = partStatistics[part];
        const percent =
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        let colorClass = "text-success";
        if (percent < 60) colorClass = "text-danger";
        else if (percent < 80) colorClass = "text-warning";

        statisticsHtml += `<li>Phần ${part.replace(
          "PART",
          ""
        )}: <span class="${colorClass}">${stats.correct}/${
          stats.total
        } câu đúng (${percent}%)</span></li>`;
      }
      statisticsHtml += "</ul></div>";

      // Đề xuất cải thiện
      let suggestionsHtml = "";
      if (weaknesses.length > 0) {
        suggestionsHtml =
          '<div class="mt-3"><h6>Đề xuất ôn tập:</h6><ul style="text-align: left;">';
        weaknesses.forEach((weak) => {
          const partName = weak.part.replace("PART", "");
          suggestionsHtml += `<li><strong>Phần ${partName}:</strong> ${weak.suggestion}</li>`;
        });
        suggestionsHtml += "</ul></div>";
      }

      Swal.fire({
        icon: "success",
        title: "Nộp bài thành công!",
        html: `
          <div style="text-align: center; margin-bottom: 15px;">
            <h5>Tổng điểm: <strong>${totalScore}</strong>/990</h5>
            <div class="progress my-2">
              <div class="progress-bar" role="progressbar" 
                style="width: ${Math.round(
                  (totalScore / 990) * 100
                )}%; background-color: #34447c;" 
                aria-valuenow="${totalScore}" aria-valuemin="0" aria-valuemax="990">
              </div>
            </div>
            <div class="row">
              <div class="col-6 text-center border-end">
                <div>Listening</div>
                <div class="h4">${listeningScore}</div>
              </div>
              <div class="col-6 text-center">
                <div>Reading</div>
                <div class="h4">${readingScore}</div>
              </div>
            </div>
          </div>
          ${goalMessage}
          ${statisticsHtml}
          ${suggestionsHtml}
        `,
        confirmButtonText: "Xem kết quả chi tiết",
        confirmButtonColor: "#34447c",
        showCancelButton: true,
        cancelButtonText: "Đóng",
        width: "600px",
        focusConfirm: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/exam-result/${userExamId}`;
        }
      });
    } catch (error) {
      console.error("Lỗi khi nộp bài thi:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi khi nộp bài",
        text: "Có lỗi xảy ra khi nộp bài, vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
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
  // Xử lý khi thay đổi câu trả lời
  const handleAnswerChange = (examQuestionId, selectedOption) => {
    const updatedQuestions = examQuestions.map((q) => {
      if (q.examQuestionId === examQuestionId) {
        return { ...q, selectedOption };
      }
      return q;
    });
    setExamQuestions(updatedQuestions);

    // Tự động lưu khi thay đổi câu trả lời
    autoSaveAnswers();
  };
  return (
    <div className={`bg-test ${darkMode ? "dark-mode" : ""}`}>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center px-3 pt-2">
          {lastSaved && (
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              <i className="fas fa-save me-1"></i>
              Tự động lưu lần cuối: {lastSaved.toLocaleTimeString()}
            </div>
          )}

          <div className="d-flex align-items-center">
            <button
              className="btn btn-sm btn-link text-decoration-none"
              onClick={() => setShowGuide(true)}
              title="Hướng dẫn"
            >
              <i className="fas fa-question-circle"></i>
            </button>

            <button
              className="btn btn-sm btn-link text-decoration-none ms-2"
              onClick={toggleDarkMode}
              title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
            >
              <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
            </button>
          </div>
        </div>

        {/* Hiển thị tiến độ làm bài */}
        {!hasSubmitted && progress.totalQuestions > 0 && (
          <div className="px-3 pt-1">
            <div className="progress" style={{ height: "10px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progress.percentage}%` }}
                aria-valuenow={progress.percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div className="text-end text-muted" style={{ fontSize: "0.8rem" }}>
              Đã làm {progress.answeredQuestions}/{progress.totalQuestions} câu
              ({progress.percentage}%)
            </div>
          </div>
        )}

        <div className="row mt-2">
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
              onAnswerChange={handleAnswerChange}
              viewedQuestions={viewedQuestions}
              markQuestionAsViewed={markQuestionAsViewed}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* Hướng dẫn sử dụng */}
      {showGuide && (
        <div className="modal-backdrop">
          <div className="modal-content-custom" style={{ maxWidth: "600px" }}>
            <div className="modal-header-custom">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2"></i>
                Hướng dẫn làm bài thi TOEIC
              </h5>
              <button
                type="button"
                className="modal-close-button"
                onClick={closeGuide}
              >
                &times;
              </button>
            </div>
            <div className="modal-body-custom">
              <h6 className="fw-bold">Cách làm bài:</h6>
              <ol className="ps-3">
                <li>
                  Các câu hỏi được phân loại theo 7 phần của bài thi TOEIC chính
                  thức
                </li>
                <li>Bạn nên làm bài theo thứ tự các phần từ 1-7</li>
                <li>
                  Đối với phần nghe (phần 1-4), bạn chỉ được nghe{" "}
                  <strong>một lần duy nhất</strong>
                </li>
                <li>
                  Bạn có thể đánh dấu câu hỏi để xem lại sau bằng nút "Cắm cờ"
                </li>
                <li>Thời gian làm bài được hiển thị ở góc phải màn hình</li>
                <li>Bài làm của bạn được tự động lưu định kỳ</li>
              </ol>
              <h6 className="fw-bold mt-3">Tính năng:</h6>
              <ul className="ps-3">
                <li>Chuyển đổi chế độ tối/sáng để bảo vệ mắt</li>
                <li>Hiển thị tiến độ làm bài theo phần trăm</li>
                <li>
                  Bạn có thể bấm vào số thứ tự câu hỏi ở bảng bên phải để di
                  chuyển đến câu đó
                </li>
                <li>
                  Sau khi nộp bài, bạn sẽ nhận được phân tích chi tiết kết quả
                </li>
              </ul>
              <div className="text-center mt-3">
                <button className="btn btn-primary" onClick={closeGuide}>
                  Tôi đã hiểu, bắt đầu làm bài!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamQuestion;
