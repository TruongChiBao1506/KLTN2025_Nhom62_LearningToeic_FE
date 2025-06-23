import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import TestService from "../../../services/testService";

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
  const [questions, setQuestions] = useState([]);
  const [isSubmited, setIsSubmited] = useState(false);

  // Lấy danh sách câu hỏi từ bài kiểm tra
  const retrieveQuestions = async () => {
    try {
      const response = await TestService.getQuestionsByTestId(testId);
      setQuestions(response);
    } catch (error) {
      console.log(error);
    }
  };

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
      return `http://localhost:9004/images/${imageName}`;
    }
    return "";
  };

  // Lấy đường dẫn âm thanh
  const getAudioUrl = (audioName) => {
    if (audioName) {
      return `http://localhost:9004/audios/${audioName}`;
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
  }, [testId]);

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

  return (
    <div className="bg-test">
      <div className="container-fluid">
        <div className="row mt-3">{renderTestComponent()}</div>
      </div>
    </div>
  );
};

export default Study;
