import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Result } from "antd";
import {
  ReloadOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import TestService from "../../../services/testService";
import useAchievementNotifications from "../../../hooks/useAchievementNotifications";

// Những component TestPart sẽ được tạo sau
import TestPart1 from "../../../components/Learner/TestPart1";
import TestPart2 from "../../../components/Learner/TestPart2";
import TestPart3 from "../../../components/Learner/TestPart3";
import TestPart4 from "../../../components/Learner/TestPart4";
import TestPart5 from "../../../components/Learner/TestPart5";
import TestPart6 from "../../../components/Learner/TestPart6";
import TestPart7Single from "../../../components/Learner/TestPart7Single";
import TestPart7Double from "../../../components/Learner/TestPart7Double";
import TestPart7Triple from "../../../components/Learner/TestPart7Triple";

import "./style.css";

const Study = () => {
  const { sectionId, testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isSubmited, setIsSubmited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noQuestions, setNoQuestions] = useState(false);
  const { recordCompleteQuestion } = useAchievementNotifications();

  // Lấy danh sách câu hỏi từ bài kiểm tra
  const retrieveQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNoQuestions(false);

      const response = await TestService.getQuestionsByTestId(testId);

      if (response && response.length > 0) {
        setQuestions(response);
      } else {
        // Không có câu hỏi nào cho bài test này
        setNoQuestions(true);
        setQuestions([]);
      }
    } catch (error) {
      console.log(error);

      // Kiểm tra loại lỗi để hiển thị thông báo phù hợp
      if (
        error.response?.status === 404 ||
        error.response?.data?.message === "No questions found for this test"
      ) {
        setNoQuestions(true);
        setQuestions([]);
      } else {
        setError({
          status: error.response?.status || 500,
          message:
            error.response?.data?.message || "Có lỗi xảy ra khi tải câu hỏi",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [testId]);

  // Xử lý việc nộp bài
  const submitAnswers = async () => {
    // Kiểm tra đã trả lời ít nhất 1 câu
    const answeredQuestions = questions.filter(
      (question) => question.selectedOption
    );
    if (answeredQuestions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Bạn chưa trả lời bất kỳ câu nào. Vui lòng chọn đáp án!",
      });
    } else if (answeredQuestions.length < questions.length) {
      const result = await Swal.fire({
        icon: "question",
        title: "Bạn chưa hoàn thành tất cả câu hỏi",
        text: "Bạn thực sự muốn nộp?",
        showCancelButton: true,
        confirmButtonText: "Nộp",
        cancelButtonText: "Quay lại",
      });
      if (result.isConfirmed) {
        continueSubmit();
      }
    } else {
      const result = await Swal.fire({
        icon: "question",
        title: "Bạn có chắc chắn muốn nộp?",
        showCancelButton: true,
        confirmButtonText: "Nộp",
        cancelButtonText: "Quay lại",
      });
      if (result.isConfirmed) {
        continueSubmit();
      }
    }
  };

  // Xử lý việc tiếp tục nộp bài và tính điểm
  const continueSubmit = () => {
    const updatedQuestions = questions.map((question) => {
      if (question.selectedOption) {
        question.answered = true;
      }
      question.isGraded = true;
      return question;
    });

    setQuestions(updatedQuestions);
    setIsSubmited(true);

    // Tính điểm
    const correctCount = updatedQuestions.filter(
      (question) =>
        question.answered && question.selectedOption === question.correctOption
    ).length;
    const incorrectCount = updatedQuestions.filter(
      (question) =>
        question.answered && question.selectedOption !== question.correctOption
    ).length;

    // Ghi nhận hoàn thành câu hỏi cho streak với notification
    try {
      const learnerToken = localStorage.getItem("learnerToken");
      if (learnerToken) {
        const decoded = JSON.parse(atob(learnerToken.split(".")[1]));
        const userId = decoded.id;
        const skill =
          sectionId === "1" || sectionId === "2" ? "listening" : "reading";

        // Ghi nhận từng câu hỏi đã trả lời đúng với notification
        for (let i = 0; i < correctCount; i++) {
          recordCompleteQuestion(userId, 1, skill).catch((streakError) => {
            console.warn("⚠️ Không thể ghi nhận streak câu hỏi:", streakError);
          });
        }

        console.log(
          `✅ Đã ghi nhận ${correctCount} câu hỏi đúng cho streak với notification`
        );
      }
    } catch (error) {
      console.warn("⚠️ Lỗi khi ghi nhận hoàn thành câu hỏi:", error);
    }

    // Hiển thị kết quả
    Swal.fire({
      icon: "info",
      title: "Kết quả",
      html: `Số câu đúng: <strong>${correctCount}</strong><br>Số câu sai: <strong>${incorrectCount}</strong>`,
    });
  };

  // Làm lại bài kiểm tra
  const refreshPage = () => {
    const resetQuestions = questions.map((question) => {
      return {
        ...question,
        selectedOption: null,
        answered: false,
        isGraded: false,
      };
    });
    setQuestions(resetQuestions);
    setIsSubmited(false);
  };

  // Lấy đường dẫn hình ảnh
  const getImageUrl = (imageName) => {
    if (imageName) {
      return `${process.env.LOCALHOST}/images/${imageName}`;
    }
    return "";
  };

  // Lấy đường dẫn âm thanh
  const getAudioUrl = (audioName) => {
    if (audioName) {
      return `${process.env.LOCALHOST}/audios/${audioName}`;
    }
    return "";
  };

  // Lấy các tùy chọn câu trả lời
  const getOptions = (question) => {
    if (sectionId === "2") {
      return [question.optionA, question.optionB, question.optionC];
    } else {
      return [
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
      ];
    }
  };

  // Lấy lớp CSS cho tùy chọn
  const getOptionClass = (question, option) => {
    return {
      "highlight-row": option === question.selectedOption,
    };
  };

  // Xóa lựa chọn
  const clearSelection = (question) => {
    const updatedQuestions = questions.map((q) => {
      if (q.questionId === question.questionId) {
        return {
          ...q,
          selectedOption: null,
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  // Kiểm tra câu trả lời
  const checkAnswer = (question) => {
    const updatedQuestions = questions.map((q) => {
      if (q.questionId === question.questionId && q.selectedOption) {
        return {
          ...q,
          answered: true,
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  // Dịch văn bản
  const translateText = async (text, targetLanguage) => {
    const apiKey = "AIzaSyD-7uWTjTodZba7ky7mgfSgnVxAX_opoh8";
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const sourceLang = "en"; // Ngôn ngữ là tiếng Anh (Anh -> Việt)
    const data = {
      q: text,
      source: sourceLang,
      target: targetLanguage,
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result.data.translations[0].translatedText;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    retrieveQuestions();
  }, [testId, retrieveQuestions]);

  // Render component tương ứng dựa vào sectionId
  const renderTestComponent = () => {
    const commonProps = {
      questions,
      submitAnswers,
      refreshPage,
      isSubmited,
      getImageUrl,
      getAudioUrl,
      translateText,
      getOptions,
      getOptionClass,
      clearSelection,
      checkAnswer,
    };

    switch (sectionId) {
      case "1":
        return <TestPart1 {...commonProps} />;
      case "2":
        return <TestPart2 {...commonProps} />;
      case "3":
        return <TestPart3 {...commonProps} />;
      case "4":
        return <TestPart4 {...commonProps} />;
      case "5":
        return <TestPart5 {...commonProps} />;
      case "6":
        return <TestPart6 {...commonProps} />;
      case "7":
        return <TestPart7Single {...commonProps} />;
      case "12":
        return <TestPart7Double {...commonProps} />;
      case "13":
        return <TestPart7Triple {...commonProps} />;
      default:
        return <div>Không tìm thấy dạng bài phù hợp</div>;
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    retrieveQuestions();
  };

  return (
    <div className="bg-test">
      <div className="container-fluid">
        <div className="row mt-3">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
                flexDirection: "column",
              }}
            >
              <Spin size="large" />
              <p style={{ marginTop: 16, color: "#666" }}>
                Đang tải câu hỏi...
              </p>
            </div>
          ) : noQuestions ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
              }}
            >
              <Result
                icon={
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                }
                title="Chưa có câu hỏi cho bài test này"
                subTitle="Bài test này hiện tại chưa có câu hỏi nào. Vui lòng thử lại sau hoặc chọn bài test khác."
                extra={[
                  <Button
                    key="back"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleGoBack}
                  >
                    Quay lại
                  </Button>,
                  <Button
                    key="retry"
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRetry}
                  >
                    Thử lại
                  </Button>,
                ]}
              />
            </div>
          ) : error ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
              }}
            >
              <Result
                status="error"
                title={`Lỗi ${error.status}`}
                subTitle={error.message}
                extra={[
                  <Button
                    key="back"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleGoBack}
                  >
                    Quay lại
                  </Button>,
                  <Button
                    key="retry"
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRetry}
                  >
                    Thử lại
                  </Button>,
                ]}
              />
            </div>
          ) : (
            renderTestComponent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Study;
