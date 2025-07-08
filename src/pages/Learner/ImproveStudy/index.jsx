import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import sectionsService from "../../../services/sectionsService";
import questionService from "../../../services/questionService";

// Import các component test
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

const ImproveStudy = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
  const [showImproveTest, setShowImproveTest] = useState(false);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const fetchedSections = await sectionsService.allEnable();
        setSections(fetchedSections);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phần:", error);
      }
    };

    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      updateQuestionTypeOptions(selectedSection);
    }
  }, [selectedSection]);

  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

  const updateQuestionTypeOptions = (sectionId) => {
    let options = [];
    switch (parseInt(sectionId)) {
      case 1:
        options = [
          {
            value: "[Part 1] Tranh tả cả người và vật",
            text: "[Part 1] Tranh tả cả người và vật",
          },
          { value: "[Part 1] Tranh tả người", text: "[Part 1] Tranh tả người" },
          { value: "[Part 1] Tranh tả vật", text: "[Part 1] Tranh tả vật" },
        ];
        break;
      case 2:
        options = [
          { value: "[Part 2] Câu hỏi đuôi", text: "[Part 2] Câu hỏi đuôi" },
          { value: "[Part 2] Câu hỏi HOW", text: "[Part 2] Câu hỏi HOW" },
          {
            value: "[Part 2] Câu hỏi lựa chọn",
            text: "[Part 2] Câu hỏi lựa chọn",
          },
          { value: "[Part 2] Câu hỏi WHAT", text: "[Part 2] Câu hỏi WHAT" },
          { value: "[Part 2] Câu hỏi WHEN", text: "[Part 2] Câu hỏi WHEN" },
          { value: "[Part 2] Câu hỏi WHERE", text: "[Part 2] Câu hỏi WHERE" },
          { value: "[Part 2] Câu hỏi WHO", text: "[Part 2] Câu hỏi WHO" },
          { value: "[Part 2] Câu hỏi WHY", text: "[Part 2] Câu hỏi WHY" },
          { value: "[Part 2] Câu hỏi YES/NO", text: "[Part 2] Câu hỏi YES/NO" },
          {
            value: "[Part 2] Câu yêu cầu, đề nghị",
            text: "[Part 2] Câu yêu cầu, đề nghị",
          },
        ];
        break;
      case 3:
        options = [
          {
            value: "[Part 3] Câu hỏi kết hợp bảng biểu",
            text: "[Part 3] Câu hỏi kết hợp bảng biểu",
          },
          {
            value: "[Part 3] Câu hỏi về chi tiết cuộc hội thoại",
            text: "[Part 3] Câu hỏi về chi tiết cuộc hội thoại",
          },
          {
            value: "[Part 3] Câu hỏi về chủ đề, mục đích",
            text: "[Part 3] Câu hỏi về chủ đề, mục đích",
          },
          {
            value: "[Part 3] Câu hỏi về danh tính người nói",
            text: "[Part 3] Câu hỏi về danh tính người nói",
          },
          {
            value: "[Part 3] Câu hỏi về địa điểm hội thoại",
            text: "[Part 3] Câu hỏi về địa điểm hội thoại",
          },
          {
            value: "[Part 3] Câu hỏi về hàm ý câu nói",
            text: "[Part 3] Câu hỏi về hàm ý câu nói",
          },
          {
            value: "[Part 3] Câu hỏi về hành động tương lai",
            text: "[Part 3] Câu hỏi về hành động tương lai",
          },
          {
            value: "[Part 3] Câu hỏi về yêu cầu, gợi ý",
            text: "[Part 3] Câu hỏi về yêu cầu, gợi ý",
          },
        ];
        break;
      case 4:
        options = [
          {
            value: "[Part 4] Câu hỏi kết hợp bảng biểu",
            text: "[Part 4] Câu hỏi kết hợp bảng biểu",
          },
          {
            value: "[Part 4] Câu hỏi về chi tiết",
            text: "[Part 4] Câu hỏi về chi tiết",
          },
          {
            value: "[Part 4] Câu hỏi về chủ đề, mục đích",
            text: "[Part 4] Câu hỏi về chủ đề, mục đích",
          },
          {
            value: "[Part 4] Câu hỏi về danh tính, địa điểm",
            text: "[Part 4] Câu hỏi về danh tính, địa điểm",
          },
          {
            value: "[Part 4] Câu hỏi về hàm ý câu nói",
            text: "[Part 4] Câu hỏi về hàm ý câu nói",
          },
          {
            value: "[Part 4] Câu hỏi về hành động tương lai",
            text: "[Part 4] Câu hỏi về hành động tương lai",
          },
          {
            value: "[Part 4] Câu hỏi yêu cầu, gợi ý",
            text: "[Part 4] Câu hỏi yêu cầu, gợi ý",
          },
        ];
        break;
      case 5:
        options = [
          {
            value: "[Part 5] Câu hỏi ngữ pháp",
            text: "[Part 5] Câu hỏi ngữ pháp",
          },
          {
            value: "[Part 5] Câu hỏi từ vựng",
            text: "[Part 5] Câu hỏi từ vựng",
          },
          {
            value: "[Part 5] Câu hỏi từ loại",
            text: "[Part 5] Câu hỏi từ loại",
          },
        ];
        break;
      case 6:
        options = [
          {
            value: "[Part 6] Câu hỏi ngữ pháp",
            text: "[Part 6] Câu hỏi ngữ pháp",
          },
          {
            value: "[Part 6] Câu hỏi từ vựng",
            text: "[Part 6] Câu hỏi từ vựng",
          },
          {
            value: "[Part 6] Câu hỏi từ loại",
            text: "[Part 6] Câu hỏi từ loại",
          },
          {
            value: "[Part 6] Câu hỏi điền câu",
            text: "[Part 6] Câu hỏi điền câu",
          },
        ];
        break;
      case 7:
      case 12:
      case 13:
        options = [
          {
            value: "[Part 7] Câu hỏi điền câu",
            text: "[Part 7] Câu hỏi điền câu",
          },
          {
            value: "[Part 7] Câu hỏi suy luận",
            text: "[Part 7] Câu hỏi suy luận",
          },
          {
            value: "[Part 7] Câu hỏi tìm thông tin",
            text: "[Part 7] Câu hỏi tìm thông tin",
          },
          {
            value: "[Part 7] Câu hỏi tìm chi tiết sai",
            text: "[Part 7] Câu hỏi tìm chi tiết sai",
          },
          {
            value: "[Part 7] Câu hỏi tìm từ đồng nghĩa",
            text: "[Part 7] Câu hỏi tìm từ đồng nghĩa",
          },
          {
            value: "[Part 7] Câu hỏi về chủ đề, mục đích",
            text: "[Part 7] Câu hỏi về chủ đề, mục đích",
          },
          {
            value: "[Part 7] Câu hỏi về hàm ý câu nói",
            text: "[Part 7] Câu hỏi về hàm ý câu nói",
          },
        ];
        break;
      default:
        options = [];
    }
    setQuestionTypeOptions(options);
  };

  const startPractice = async () => {
    if (selectedSection && selectedQuestionType) {
      const requestData = {
        sectionId: selectedSection,
        questionType: selectedQuestionType,
      };
      try {
        const fetchedQuestions =
          await questionService.getQuestionsBySectionIdAndType(requestData);
        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
          setShowImproveTest(true);
        } else {
          Swal.fire({
            icon: "info",
            title: "Thông báo",
            text: "Không tìm thấy câu hỏi nào phù hợp với tiêu chí bạn chọn!",
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải câu hỏi:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi tải câu hỏi. Vui lòng thử lại sau!",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Lưu ý",
        text: "Vui lòng chọn cả một phần và loại câu hỏi trước khi bắt đầu!",
      });
    }
  };

  const goBack = () => {
    setShowImproveTest(false);
  };

  const submitAnswers = async () => {
    // Kiểm tra xem người dùng đã trả lời ít nhất một câu hỏi chưa
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

  const continueSubmit = () => {
    const updatedQuestions = [...questions].map((question) => {
      if (question.selectedOption) {
        return { ...question, answered: true, isGraded: true };
      }
      return { ...question, isGraded: true };
    });

    setQuestions(updatedQuestions);

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

  const refreshPage = () => {
    // Đặt lại tất cả câu hỏi về trạng thái ban đầu
    const resetQuestions = [...questions].map((question) => ({
      ...question,
      selectedOption: null,
      answered: false,
      isGraded: false,
    }));
    setQuestions(resetQuestions);
  };

  const getImageUrl = (imageName) => {
    if (imageName) {
      return `http://localhost:5000/images/${imageName}`;
    }
    return "";
  };

  const getAudioUrl = (audioName) => {
    if (audioName) {
      return `http://localhost:5000/audios/${audioName}`;
    }
    return "";
  };

  const getOptions = (question) => {
    if (parseInt(selectedSection) === 2) {
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

  const getOptionClass = (question, option) => {
    return option === question.selectedOption ? "highlight-row" : "";
  };

  const clearSelection = (question) => {
    const updatedQuestions = [...questions].map((q) =>
      q._id === question._id ? { ...q, selectedOption: null } : q
    );
    setQuestions(updatedQuestions);
  };

  const checkAnswer = (question, selectedOption) => {
    const updatedQuestions = [...questions].map((q) =>
      q._id === question._id ? { ...q, selectedOption, answered: true } : q
    );
    setQuestions(updatedQuestions);
  };

  const translateText = async (text, targetLanguage = "vi") => {
    try {
      const apiKey = "AIzaSyD-7uWTjTodZba7ky7mgfSgnVxAX_opoh8";
      const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const sourceLang = "en"; // Ngôn ngữ là tiếng Anh (Anh -> Việt)

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLanguage,
        }),
      });

      const result = await response.json();
      return result.data.translations[0].translatedText;
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error);
      return text; // Trả về văn bản gốc nếu có lỗi
    }
  };

  return (
    <div className="container-fluid">
      {!showImproveTest ? (
        <div
          className="card border-0 rounded-5 mt-4 mb-5"
          style={{ minHeight: "600px" }}
        >
          <div className="row g-0 mt-5">
            <div className="col-sm-5 my-4 d-flex align-items-center justify-content-center">
              <img
                src="https://i0.wp.com/www.shoutmeloud.com/wp-content/uploads/2019/09/how-to-improve-english-writing-skills.jpg?resize=1024%2C968&ssl=1"
                alt="Improve English Writing Skills"
                style={{ width: "600px", height: "400px" }}
                className="rounded-5"
              />
            </div>
            <div className="col-sm-7">
              <div className="card-body">
                <div
                  className="row d-flex justify-content-center align-items-center"
                  style={{ height: "500px" }}
                >
                  <div className="col-sm-12 mb-3 mt-5">
                    <h2>BÀI KIỂM TRA CẢI THIỆN TỪNG PHẦN</h2>
                    <p>Dưới đây là một số quy định bạn cần lưu ý: </p>
                    <p>
                      Bài kiểm tra bao gồm những câu hỏi chia làm{" "}
                      <strong>7 Part (1, 2, 3, 4, 5, 6, 7)</strong>
                    </p>
                    <p>
                      Hướng dẫn: Chọn phần, sau đó chọn phân loại câu hỏi của
                      phần đó và bắt đầu luyện tập ngay
                    </p>
                    <div className="row mt-3">
                      <div className="col">
                        <select
                          className="form-select border-secondary mt-2"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                        >
                          <option value="" disabled>
                            Vui lòng chọn phần
                          </option>
                          {docngheSections.map((section) => (
                            <option key={section.id} value={section.id}>
                              {section.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col">
                        <select
                          className="form-select border-secondary mt-2"
                          value={selectedQuestionType}
                          onChange={(e) =>
                            setSelectedQuestionType(e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Vui lòng chọn loại câu hỏi
                          </option>
                          {questionTypeOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                              {option.text}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col">
                        <div className="d-flex justify-content-center">
                          <button
                            type="button"
                            className="button my-2 w-75"
                            style={{ width: "100%" }}
                            onClick={startPractice}
                          >
                            BẮT ĐẦU NGAY
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row mt-3">
          <div className="d-flex justify-content-start align-items-center my-2">
            <button
              type="button"
              className="button"
              style={{ width: "200px" }}
              onClick={goBack}
            >
              Quay lại
            </button>
          </div>

          {parseInt(selectedSection) === 1 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart1
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getImageUrl={getImageUrl}
                getAudioUrl={getAudioUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 2 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart2
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getAudioUrl={getAudioUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 3 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart3
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getImageUrl={getImageUrl}
                getAudioUrl={getAudioUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 4 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart4
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getImageUrl={getImageUrl}
                getAudioUrl={getAudioUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 5 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart5
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 6 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart6
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 7 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart7Single
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getImageUrl={getImageUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 12 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart7Double
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getImageUrl={getImageUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}

          {parseInt(selectedSection) === 13 &&
            selectedQuestionType &&
            showImproveTest && (
              <TestPart7Triple
                questions={questions}
                submitAnswers={submitAnswers}
                refreshPage={refreshPage}
                getImageUrl={getImageUrl}
                translateText={translateText}
                getOptions={getOptions}
                getOptionClass={getOptionClass}
                clearSelection={clearSelection}
                checkAnswer={checkAnswer}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default ImproveStudy;
