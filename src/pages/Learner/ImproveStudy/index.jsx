import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  Alert,
} from "antd";

import {
  BookOpen,
  Headphones,
  PenTool,
  Eye,
  PlayCircle,
  Target,
  ChevronRight,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import Swal from "sweetalert2";
import sectionsService from "../../../services/sectionsService";
import questionService from "../../../services/questionService";

// Import các component test
import TestPart1 from "../../../components/Learner/TestPart1/index";
import TestPart2 from "../../../components/Learner/TestPart2/index";
import TestPart3 from "../../../components/Learner/TestPart3/index";
import TestPart4 from "../../../components/Learner/TestPart4/index";
import TestPart5 from "../../../components/Learner/TestPart5/index";
import TestPart6 from "../../../components/Learner/TestPart6/index";
import TestPart7Single from "../../../components/Learner/TestPart7Single/index";
import "./style.css";

const { Title, Text } = Typography;

const ImproveStudy = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  console.log("🚀 ~ ImproveStudy ~ selectedSection:", selectedSection);

  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
  console.log("🚀 ~ ImproveStudy ~ questionTypeOptions:", questionTypeOptions);

  const [showImproveTest, setShowImproveTest] = useState(false);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const fetchedSections = await sectionsService.allEnable();
        console.log("🚀 ~ fetchSections ~ fetchedSections:", fetchedSections);

        // Ensure data consistency - use _id as primary identifier
        const mappedSections = fetchedSections.map((section) => ({
          ...section,
          // Keep _id as primary identifier, ensure id field exists for compatibility
          id: section.id || section._id,
        }));

        console.log("🚀 ~ fetchSections ~ mappedSections:", mappedSections);
        console.log(
          "🚀 ~ fetchSections ~ About to setSections with length:",
          mappedSections.length
        );
        setSections(mappedSections);
        console.log("🚀 ~ fetchSections ~ setSections called");
      } catch (error) {
        console.error("Lỗi khi tải danh sách phần:", error);
        // Fallback data
        const fallbackSections = [
          {
            _id: "686ce171b614dda1fc08f1d0",
            name: "Part 1: Photographs",
            status: 1,
          },
          {
            _id: "686ce171b614dda1fc08f1d1",
            name: "Part 2: Question-Response",
            status: 1,
          },
          {
            _id: "686ce171b614dda1fc08f1d2",
            name: "Part 3: Conversations",
            status: 1,
          },
          { _id: "686ce171b614dda1fc08f1d3", name: "Part 4: Talks", status: 1 },
          {
            _id: "686ce171b614dda1fc08f1d4",
            name: "Part 5: Incomplete Sentences",
            status: 1,
          },
          {
            _id: "686ce171b614dda1fc08f1d5",
            name: "Part 6: Text Completion",
            status: 1,
          },
          {
            _id: "686ce171b614dda1fc08f1d6",
            name: "Part 7: Reading Comprehension",
            status: 1,
          },
        ];
        setSections(fallbackSections);
      }
    };

    console.log("🚀 ~ useEffect ~ About to fetchSections");
    fetchSections();
  }, []);

  // Debug: Monitor sections state changes
  useEffect(() => {
    console.log("🚀 ~ sections state changed:", sections);
    console.log("🚀 ~ sections.length:", sections.length);
  }, [sections]);

  const updateQuestionTypeOptions = useCallback(
    async (sectionId) => {
      console.log(
        "🚀 ~ updateQuestionTypeOptions ~ called with sectionId:",
        sectionId
      );
      console.log("🚀 ~ updateQuestionTypeOptions ~ sections:", sections);

      // Find the section by _id to get the part number
      const selectedSectionData = sections.find(
        (section) => section._id === sectionId
      );
      if (!selectedSectionData) {
        console.log(
          "🚀 ~ updateQuestionTypeOptions ~ selectedSectionData not found for:",
          sectionId
        );
        setQuestionTypeOptions([]);
        return;
      }

      console.log(
        "🚀 ~ updateQuestionTypeOptions ~ selectedSectionData:",
        selectedSectionData
      );

      // Extract part number from section name (e.g., "Part 1: Photographs" -> 1)
      const partMatch = selectedSectionData.name.match(/Part (\d+)/);
      const partNumber = partMatch ? parseInt(partMatch[1]) : null;

      console.log("🚀 ~ updateQuestionTypeOptions ~ partNumber:", partNumber);

      if (!partNumber) {
        console.log("❌ Cannot extract part number from section name");
        setQuestionTypeOptions([]);
        return;
      }

      try {
        // ✅ Gọi API để lấy subTypes từ database
        const response = await questionService.getSubTypesByPartNumber(partNumber);
        if (response?.success && response?.data?.subTypes) {
          const options = response.data.subTypes.map(subType => ({
            value: subType,
            text: subType
          }));
          
          console.log("✅ ~ updateQuestionTypeOptions ~ options from API:", options);
          
          if (options.length === 0) {
            // Hiển thị cảnh báo nếu không có subType nào
            Swal.fire({
              icon: "warning",
              title: "Chưa có dữ liệu",
              text: `Chưa có loại câu hỏi nào cho ${selectedSectionData.name}. Vui lòng thêm câu hỏi vào hệ thống!`,
              timer: 3000,
            });
          }
          
          setQuestionTypeOptions(options);
        } else {
          console.log("❌ ~ No subTypes found in API response");
          Swal.fire({
            icon: "info",
            title: "Không có dữ liệu",
            text: `Chưa có loại câu hỏi nào cho ${selectedSectionData.name} trong hệ thống.`,
          });
          setQuestionTypeOptions([]);
        }
      } catch (error) {
        console.error("❌ ~ Error fetching subTypes:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải danh sách loại câu hỏi. Vui lòng thử lại!",
        });
        setQuestionTypeOptions([]);
      }
    },
    [sections]
  );

  useEffect(() => {
    if (selectedSection) {
      updateQuestionTypeOptions(selectedSection);
    } else {
      setQuestionTypeOptions([]); // Clear options when no section is selected
    }
  }, [selectedSection, updateQuestionTypeOptions]);

  // Filter all enabled sections (status === 1)
  const enabledSections = sections.filter((section) => section.status === 1);
  console.log("🚀 ~ ImproveStudy ~ enabledSections:", enabledSections);
  console.log("🚀 ~ ImproveStudy ~ selectedSection:", selectedSection);
  console.log("🚀 ~ ImproveStudy ~ questionTypeOptions:", questionTypeOptions);
  console.log("🚀 ~ ImproveStudy ~ sections length:", sections.length);
  console.log(
    "🚀 ~ ImproveStudy ~ enabledSections length:",
    enabledSections.length
  );

  // Debug: Log section data structure
  if (enabledSections.length > 0) {
    console.log(
      "🚀 ~ ImproveStudy ~ first enabled section:",
      enabledSections[0]
    );
    console.log(
      "🚀 ~ ImproveStudy ~ section fields:",
      Object.keys(enabledSections[0])
    );
  }

  const startPractice = async () => {
    if (selectedSection && selectedQuestionType) {
      // Log section details for debugging
      const selectedSectionData = sections.find(
        (section) => section._id === selectedSection
      );
      console.log(
        "🚀 ~ startPractice ~ selectedSectionData:",
        selectedSectionData
      );

      // ✅ SỬ DỤNG API MỚI: Gửi chính xác subType (selectedQuestionType)
      const requestParams = {
        sectionId: selectedSection,
        subType: selectedQuestionType, // ✅ Gửi đúng subType như "[Part 1] Tranh tả người"
        limit: 30, // Giới hạn số câu hỏi trả về
      };

      console.log("🚀 ~ startPractice ~ Request Params:", requestParams);
      console.log("🚀 ~ startPractice ~ selectedSection:", selectedSection);
      console.log(
        "🚀 ~ startPractice ~ selectedQuestionType (subType):",
        selectedQuestionType
      );

      try {
        console.log("🚀 ~ startPractice ~ Calling practice API...");
        
        // ✅ Debug: Log chính xác URL sẽ gọi
        console.log("📍 API Endpoint will call:", {
          baseURL: "http://localhost:5000/api/questions/practice",
          params: requestParams,
          fullURL: `http://localhost:5000/api/questions/practice?sectionId=${requestParams.sectionId}&subType=${encodeURIComponent(requestParams.subType)}&limit=${requestParams.limit}`
        });
        
        // ✅ GỌI API MỚI: GET /api/questions/practice
        let apiResponse = await questionService.getQuestionsByPracticeFilter(requestParams);
        
        console.log("🚀 ~ startPractice ~ API Response:", apiResponse);
        
        // ✅ Extract questions array from response structure
        let fetchedQuestions = apiResponse?.data?.questions || apiResponse?.questions || apiResponse;
        
        console.log("🚀 ~ startPractice ~ Extracted questions:", fetchedQuestions);
        console.log("🚀 ~ startPractice ~ Questions type:", typeof fetchedQuestions);
        console.log("🚀 ~ startPractice ~ Questions isArray:", Array.isArray(fetchedQuestions));
        console.log("🚀 ~ startPractice ~ Questions length:", fetchedQuestions?.length);

        // 🔄 FALLBACK: Nếu API mới không trả về kết quả, thử API cũ
        if (!fetchedQuestions || fetchedQuestions.length === 0) {
          console.log("🔄 ~ startPractice ~ Trying fallback with old API...");
          
          // Map questionType cho API cũ
          const partMatch = selectedSectionData?.name.match(/Part (\d+)/);
          const partNumber = partMatch ? parseInt(partMatch[1]) : null;
          let fallbackQuestionType = "listening";
          
          if (partNumber >= 5 && partNumber <= 7) {
            fallbackQuestionType = "reading";
          }
          
          const fallbackRequest = {
            sectionId: selectedSection,
            questionType: fallbackQuestionType,
          };
          
          console.log("🔄 ~ startPractice ~ Fallback request:", fallbackRequest);
          
          try {
            fetchedQuestions = await questionService.getQuestionsBySectionIdAndType(fallbackRequest);
            console.log("🔄 ~ startPractice ~ Fallback questions:", fetchedQuestions);
            
            // Lọc client-side theo subType nếu có kết quả
            if (fetchedQuestions && fetchedQuestions.length > 0) {
              fetchedQuestions = fetchedQuestions.filter(q => 
                q.questionSubType === selectedQuestionType || 
                q.questionType === selectedQuestionType
              );
              console.log("🔄 ~ startPractice ~ Filtered questions:", fetchedQuestions.length);
            }
          } catch (fallbackError) {
            console.error("🔄 ~ startPractice ~ Fallback error:", fallbackError);
          }
        }

        if (fetchedQuestions && fetchedQuestions.length > 0) {
          // ✅ Lấy partNumber để quyết định có group hay không
          const partMatch = selectedSectionData?.name.match(/Part (\d+)/);
          const partNumber = partMatch ? parseInt(partMatch[1]) : null;

          let finalQuestions;
          finalQuestions = fetchedQuestions;
          console.log("🚀 ~ startPractice ~ Final questions:", finalQuestions);

          setQuestions(finalQuestions); // Lưu final data
          setShowImproveTest(true);
          
          // Hiển thị thông báo thành công
          // Swal.fire({
          //   icon: "success",
          //   title: "Bắt đầu luyện tập!",
          //   text: `Đã tải ${fetchedQuestions.length} câu hỏi`,
          //   timer: 1500,
          //   showConfirmButton: false,
          // });
        } else {
          console.log("🚀 ~ startPractice ~ No questions found even after fallback");
          Swal.fire({
            icon: "info",
            title: "Thông báo",
            text: "Không tìm thấy câu hỏi nào phù hợp với tiêu chí bạn chọn!",
            html: `<p>Không tìm thấy câu hỏi cho:</p>
                   <p><strong>Section:</strong> ${selectedSectionData?.name}</p>
                   <p><strong>Loại:</strong> ${selectedQuestionType}</p>
                   <p><strong>Debug info:</strong></p>
                   <ul style="text-align: left; font-size: 12px;">
                     <li>Section ID: ${selectedSection}</li>
                     <li>SubType: ${selectedQuestionType}</li>
                   </ul>
                   <p>Vui lòng chọn loại câu hỏi khác hoặc kiểm tra dữ liệu backend.</p>`,
          });
        }
      } catch (error) {
        console.error("🚀 ~ startPractice ~ Full error object:", error);
        console.error("🚀 ~ startPractice ~ Error message:", error.message);
        console.error("🚀 ~ startPractice ~ Error response:", error.response);
        console.error(
          "🚀 ~ startPractice ~ Error response data:",
          error.response?.data
        );
        console.error(
          "🚀 ~ startPractice ~ Error status:",
          error.response?.status
        );

        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: `Đã xảy ra lỗi khi tải câu hỏi: ${
            error.response?.data?.message || error.message
          }`,
        });
      }
    } else {
      console.log(
        "🚀 ~ startPractice ~ Missing selection - selectedSection:",
        selectedSection,
        "selectedQuestionType:",
        selectedQuestionType
      );
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
    const allQuestions = questions.filter(q => q);
    const answeredQuestions = allQuestions.filter(
      (question) => question.selectedOption
    );
    if (answeredQuestions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Bạn chưa trả lời bất kỳ câu nào. Vui lòng chọn đáp án!",
      });
    } else if (answeredQuestions.length < allQuestions.length) {
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
    const allQuestions = questions.filter(q => q);
    const updatedAllQuestions = allQuestions.map((question) => {
      if (question.selectedOption) {
        // Convert selected option content to letter for comparison
        let selectedLetter = null;

        if (question.selectedOption === question.optionA) {
          selectedLetter = "A";
        } else if (question.selectedOption === question.optionB) {
          selectedLetter = "B";
        } else if (question.selectedOption === question.optionC) {
          selectedLetter = "C";
        } else if (question.selectedOption === question.optionD) {
          selectedLetter = "D";
        }

        // 🔍 Debug log
        // console.log("🎯 Question grading debug:", {
        //   questionId: question._id,
        //   selectedOption: question.selectedOption,
        //   selectedLetter: selectedLetter,
        //   correctOption: question.correctOption,
        //   optionA: question.optionA,
        //   optionB: question.optionB,
        //   optionC: question.optionC,
        //   optionD: question.optionD,
        // });

        return {
          ...question,
          answered: true,
          isGraded: true,
          selectedLetter: selectedLetter, // Store both content and letter
        };
      }
      return { ...question, isGraded: true };
    });

    setQuestions(updatedAllQuestions);

    // ✅ Tính điểm - hỗ trợ CẢ 2 định dạng correctOption (chữ cái "A" HOẶC nội dung đầy đủ)
    const correctCount = updatedAllQuestions.filter((question) => {
      if (!question || !question.answered) return false;
      
      // ✅ Kiểm tra correctOption là chữ cái (A/B/C/D) hay nội dung đầy đủ
      const correctOpt = question.correctOption;
      
      // 🔍 Debug mỗi câu hỏi
      const isCorrect = (correctOpt === "A" || correctOpt === "B" || correctOpt === "C" || correctOpt === "D")
        ? question.selectedLetter === correctOpt
        : question.selectedOption === correctOpt;
      
      // console.log("✅ Checking question:", {
      //   correctOption: correctOpt,
      //   selectedLetter: question.selectedLetter,
      //   selectedOption: question.selectedOption,
      //   isCorrect: isCorrect
      // });
      
      // Trường hợp 1: correctOption là chữ cái "A", "B", "C", "D"
      if (correctOpt === "A" || correctOpt === "B" || correctOpt === "C" || correctOpt === "D") {
        return question.selectedLetter === correctOpt;
      }
      
      // Trường hợp 2: correctOption là nội dung đầy đủ (database cũ)
      return question.selectedOption === correctOpt;
    }).length;

    const incorrectCount = updatedAllQuestions.filter((question) => {
      if (!question || !question.answered) return false;
      
      const correctOpt = question.correctOption;
      
      // Trường hợp 1: correctOption là chữ cái
      if (correctOpt === "A" || correctOpt === "B" || correctOpt === "C" || correctOpt === "D") {
        return question.selectedLetter !== correctOpt;
      }
      
      // Trường hợp 2: correctOption là nội dung đầy đủ
      return question.selectedOption !== correctOpt;
    }).length;

    // Hiển thị kết quả
    Swal.fire({
      icon: "info",
      title: "Kết quả",
      html: `Số câu đúng: <strong>${correctCount}</strong><br>Số câu sai: <strong>${incorrectCount}</strong>`,
    });
  };

  const refreshPage = () => {
    // Đặt lại tất cả câu hỏi về trạng thái ban đầu
    const allQuestions = questions.filter(q => q);
    const resetAllQuestions = allQuestions.map((question) => ({
      ...question,
      selectedOption: null,
      selectedLetter: null,
      answered: false,
      isGraded: false,
    }));

    setQuestions(resetAllQuestions);
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return "";
    
    // Nếu đã có URL đầy đủ (http/https), dùng luôn
    if (imageName.startsWith("http")) {
      return imageName;
    }

    // Nếu chưa có, thêm localhost prefix
    return `http://localhost:5000/images/${imageName}`;
  };

  const getAudioUrl = (audioName) => {
    if (!audioName) return "";
    
    // Nếu đã có URL đầy đủ (http/https), dùng luôn
    if (audioName.startsWith("http")) {
      return audioName;
    }

    // Nếu chưa có, thêm localhost prefix
    return `http://localhost:5000/audios/${audioName}`;
  };

  const getOptions = (question) => {
    // Find the selected section to get part number
    const selectedSectionData = sections.find(
      (section) => section._id === selectedSection
    );
    console.log("🚀 ~ getOptions ~ selectedSectionData:", selectedSectionData);
    console.log("🚀 ~ getOptions ~ selectedSection:", selectedSection);

    if (!selectedSectionData) {
      console.log(
        "🚀 ~ getOptions ~ section not found, returning default options"
      );
      return [
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
      ];
    }

    const partMatch = selectedSectionData.name.match(/Part (\d+)/);
    const partNumber = partMatch ? parseInt(partMatch[1]) : null;
    console.log("🚀 ~ getOptions ~ partNumber:", partNumber);

    if (partNumber === 2) {
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
    const updatedQuestions = questions.map((q) =>
      q._id === question._id
        ? { ...q, selectedOption: null, answered: false }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const checkAnswer = (question, selectedOption = null) => {
    // If no selectedOption passed, use the one already set on question object
    const optionToSet = selectedOption || question.selectedOption;

    console.log("🎯 checkAnswer Debug:", {
      questionId: question._id,
      selectedOption: optionToSet,
      correctOption: question.correctOption,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
    });

    // Store the content string for radio display, conversion happens during scoring
    const updatedQuestions = questions.map((q) =>
      q._id === question._id
        ? { ...q, selectedOption: optionToSet, answered: !!optionToSet }
        : q
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
    <div
      className="improve-study-container"
      style={{
        minHeight: "100vh",
        background: "#2C5F8D",
        padding: "20px 0",
      }}
    >
      {!showImproveTest ? (
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={16} xl={14}>
            <Card
              style={{
                borderRadius: "24px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                overflow: "visible",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {/* Header Section */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    background: "#2C5F8D",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    animation: "pulse 2s infinite",
                  }}
                >
                  <Target className="w-6 h-6 text-white" />
                </div>
                <Title
                  level={3}
                  style={{
                    background: "#2C5F8D",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: "6px",
                    fontWeight: "700",
                    fontSize: "20px",
                  }}
                >
                  BÀI KIỂM TRA CẢI THIỆN TỪNG PHẦN
                </Title>
                <Text
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Nâng cao kỹ năng TOEIC của bạn với bài tập chuyên sâu
                </Text>
                <Tag
                  color="blue"
                  style={{ fontSize: "12px", padding: "4px 12px" }}
                >
                  7 Parts • Listening & Reading
                </Tag>
              </div>

              {/* Instructions */}
              <Alert
                message="Hướng dẫn sử dụng"
                description={
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text>• Chọn phần bạn muốn luyện tập (Part 1-7)</Text>
                    <Text>
                      • Chọn loại câu hỏi cụ thể để tập trung luyện tập
                    </Text>
                    <Text>• Bắt đầu làm bài và nhận phản hồi chi tiết</Text>
                  </Space>
                }
                type="info"
                showIcon
                style={{
                  marginBottom: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(64, 169, 255, 0.05))",
                }}
              />

              {/* Selection Form */}
              <Row gutter={[16, 16]}>
                {/* Debug info */}
                {/* {process.env.NODE_ENV === "development" && (
                  <Col xs={24}>
                    <Alert
                      message={`Debug: Sections loaded: ${sections.length}, Enabled: ${enabledSections.length}`}
                      type="info"
                      style={{ marginBottom: "16px" }}
                    />
                  </Col>
                )} */}

                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: "16px",
                      border: "2px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      overflow: "visible",
                      ":hover": {
                        borderColor: "var(--color-brand-purple)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                      },
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Target className="w-5 h-5 text-blue-500" />
                        <Text strong style={{ color: "var(--color-primary)" }}>
                          Chọn phần thi
                        </Text>
                      </div>
                      <div style={{ width: "100%" }}>
                        <select
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #d9d9d9",
                            fontSize: "12px",
                          }}
                          value={selectedSection}
                          onChange={(e) => {
                            console.log(
                              "🚀 ~ Section selected:",
                              e.target.value
                            );
                            setSelectedSection(e.target.value);
                            setSelectedQuestionType("");
                          }}
                        >
                          <option value="">Chọn phần TOEIC</option>
                          {enabledSections.map((section) => {
                            return (
                              <option key={section._id} value={section._id}>
                                {section.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: "16px",
                      border: "2px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      overflow: "visible",
                      opacity: selectedSection ? 1 : 0.6,
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <BookOpen className="w-5 h-5 text-green-500" />
                        <Text strong style={{ color: "var(--color-success)" }}>
                          Chọn loại câu hỏi
                        </Text>
                      </div>
                      <div style={{ width: "100%" }}>
                        <select
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #d9d9d9",
                            fontSize: "12px",
                            opacity: selectedSection ? 1 : 0.6,
                          }}
                          value={selectedQuestionType}
                          onChange={(e) =>
                            setSelectedQuestionType(e.target.value)
                          }
                          disabled={!selectedSection}
                        >
                          <option value="">
                            {!selectedSection
                              ? "Vui lòng chọn phần thi trước"
                              : "Chọn loại câu hỏi"}
                          </option>
                          {questionTypeOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                              {option.text}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              {/* Start Button */}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={startPractice}
                  disabled={!selectedSection || !selectedQuestionType}
                  style={{
                    height: "44px",
                    padding: "0 32px",
                    borderRadius: "22px",
                    fontSize: "14px",
                    fontWeight: "600",
                    background:
                      selectedSection && selectedQuestionType
                        ? "#2C5F8D"
                        : undefined,
                    border: "none",
                    boxShadow:
                      selectedSection && selectedQuestionType
                        ? "0 8px 24px rgba(102, 126, 234, 0.3)"
                        : undefined,
                    transition: "all 0.3s ease",
                  }}
                  icon={<PlayCircle className="w-5 h-5" />}
                >
                  BẮT ĐẦU LUYỆN TẬP
                </Button>

                {(!selectedSection || !selectedQuestionType) && (
                  <div style={{ marginTop: "12px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Vui lòng chọn phần thi và loại câu hỏi để bắt đầu
                    </Text>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))",
                  borderRadius: "16px",
                }}
              >
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <Text strong style={{ display: "block" }}>
                      Thời gian linh hoạt
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Không giới hạn thời gian
                    </Text>
                  </Col>
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Award className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <Text strong style={{ display: "block" }}>
                      Đánh giá chi tiết
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Phân tích kết quả ngay lập tức
                    </Text>
                  </Col>
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Zap className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                    <Text strong style={{ display: "block" }}>
                      Cải thiện kỹ năng
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Tập trung vào điểm yếu
                    </Text>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <div style={{ padding: "0 20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <Button
              type="primary"
              onClick={goBack}
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              style={{
                borderRadius: "12px",
                height: "40px",
                background: "#2C5F8D",
                border: "none",
              }}
            >
              Quay lại
            </Button>
          </div>

          {/* Test Components */}
          {(() => {
            const selectedSectionData = sections.find(
              (section) => section._id === selectedSection
            );
            console.log(
              "🚀 ~ Test Component Render ~ selectedSectionData:",
              selectedSectionData
            );
            console.log(
              "🚀 ~ Test Component Render ~ selectedSection:",
              selectedSection
            );
            console.log("🚀 ~ Test Component Render ~ sections:", sections);

            if (!selectedSectionData) {
              console.log(
                "🚀 ~ Test Component Render ~ selectedSectionData not found"
              );
              return null;
            }

            const partMatch = selectedSectionData.name.match(/Part (\d+)/);
            const partNumber = partMatch ? parseInt(partMatch[1]) : null;
            console.log("🚀 ~ Test Component Render ~ partNumber:", partNumber);

            const commonProps = {
              questions,
              submitAnswers,
              refreshPage,
              translateText,
              getOptions,
              getOptionClass,
              clearSelection,
              checkAnswer,
            };

            switch (partNumber) {
              case 1:
                console.log("🚀 ~ Rendering TestPart1");
                return (
                  <TestPart1
                    {...commonProps}
                    getImageUrl={getImageUrl}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 2:
                console.log("🚀 ~ Rendering TestPart2");
                return <TestPart2 {...commonProps} getAudioUrl={getAudioUrl} />;
              case 3:
                console.log("🚀 ~ Rendering TestPart3");
                return (
                  <TestPart3
                    {...commonProps}
                    getImageUrl={getImageUrl}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 4:
                console.log("🚀 ~ Rendering TestPart4");
                return (
                  <TestPart4
                    {...commonProps}
                    getImageUrl={getImageUrl}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 5:
                console.log("🚀 ~ Rendering TestPart5");
                return <TestPart5 {...commonProps} />;
              case 6:
                console.log("🚀 ~ Rendering TestPart6");
                return <TestPart6 {...commonProps} />;
              case 7:
                console.log("🚀 ~ Rendering TestPart7Single");
                return (
                  <TestPart7Single {...commonProps} getImageUrl={getImageUrl} />
                );
              default:
                console.log("🚀 ~ No matching part number, returning null");
                return null;
            }
          })()}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15) !important;
        }

        .ant-select-dropdown {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .ant-select-item {
          border-radius: 8px !important;
          margin: 2px 4px !important;
          transition: all 0.2s ease !important;
        }

        .ant-select-item:hover {
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1),
            rgba(118, 75, 162, 0.05)
          ) !important;
        }

        .ant-select-item-option-selected {
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.15),
            rgba(118, 75, 162, 0.1)
          ) !important;
          font-weight: 600 !important;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
        }

        .ant-select-focused .ant-select-selector {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default ImproveStudy;
