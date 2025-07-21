import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Select, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Tooltip,
  Space,
  Divider,
  Alert
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
  Zap
} from "lucide-react";
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

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ImproveStudy = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
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
        // Map API data to include id field for React components
        const mappedSections = fetchedSections.map(section => ({
          ...section,
          id: section._id // Map _id to id for easier handling
        }));
        setSections(mappedSections);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phần:", error);
      }
    };

    fetchSections();
  }, []);

  const updateQuestionTypeOptions = useCallback((sectionId) => {
    console.log("🚀 ~ updateQuestionTypeOptions ~ called with sectionId:", sectionId);
    console.log("🚀 ~ updateQuestionTypeOptions ~ sections:", sections);
    
    let options = [];
    
    // Find the section by _id to get the part number
    const selectedSectionData = sections.find(section => section._id === sectionId);
    if (!selectedSectionData) {
      console.log("🚀 ~ updateQuestionTypeOptions ~ selectedSectionData not found for:", sectionId);
      setQuestionTypeOptions([]);
      return;
    }
    
    console.log("🚀 ~ updateQuestionTypeOptions ~ selectedSectionData:", selectedSectionData);
    
    // Extract part number from section name (e.g., "Part 1: Photographs" -> 1)
    const partMatch = selectedSectionData.name.match(/Part (\d+)/);
    const partNumber = partMatch ? parseInt(partMatch[1]) : null;
    
    console.log("🚀 ~ updateQuestionTypeOptions ~ partNumber:", partNumber);
    
    switch (partNumber) {
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
    
    console.log("🚀 ~ updateQuestionTypeOptions ~ options:", options);
    setQuestionTypeOptions(options);
  }, [sections]);

  useEffect(() => {
    if (selectedSection) {
      updateQuestionTypeOptions(selectedSection);
    } else {
      setQuestionTypeOptions([]); // Clear options when no section is selected
    }
  }, [selectedSection, updateQuestionTypeOptions]);

  // Filter all enabled sections (status === 1)
  const enabledSections = sections.filter(section => section.status === 1);
  console.log("🚀 ~ ImproveStudy ~ enabledSections:", enabledSections);
  console.log("🚀 ~ ImproveStudy ~ selectedSection:", selectedSection);
  console.log("🚀 ~ ImproveStudy ~ questionTypeOptions:", questionTypeOptions);
  console.log("🚀 ~ ImproveStudy ~ sections length:", sections.length);
  console.log("🚀 ~ ImproveStudy ~ enabledSections length:", enabledSections.length);

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
    // Find the selected section to get part number
    const selectedSectionData = sections.find(section => section._id === selectedSection);
    if (!selectedSectionData) return [question.optionA, question.optionB, question.optionC, question.optionD];
    
    const partMatch = selectedSectionData.name.match(/Part (\d+)/);
    const partNumber = partMatch ? parseInt(partMatch[1]) : null;
    
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

  // Get icon for each part
  const getPartIcon = (partNumber) => {
    switch (partNumber) {
      case 1: return <Eye className="w-4 h-4" />;
      case 2: return <Headphones className="w-4 h-4" />;
      case 3: return <Headphones className="w-4 h-4" />;
      case 4: return <Headphones className="w-4 h-4" />;
      case 5: return <PenTool className="w-4 h-4" />;
      case 6: return <BookOpen className="w-4 h-4" />;
      case 7: return <BookOpen className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px 0"
    }}>
      {!showImproveTest ? (
        <Row justify="center" style={{ minHeight: "80vh" }}>
          <Col xs={24} sm={22} md={20} lg={16} xl={14}>
            <Card
              style={{
                borderRadius: "24px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                overflow: "hidden"
              }}
              bodyStyle={{ padding: "40px" }}
            >
              {/* Header Section */}
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{ 
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  animation: "pulse 2s infinite"
                }}>
                  <Target className="w-8 h-8 text-white" />
                </div>
                <Title level={2} style={{ 
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "8px",
                  fontWeight: "700"
                }}>
                  BÀI KIỂM TRA CẢI THIỆN TỪNG PHẦN
                </Title>
                <Text style={{ 
                  fontSize: "16px", 
                  color: "#666",
                  display: "block",
                  marginBottom: "8px"
                }}>
                  Nâng cao kỹ năng TOEIC của bạn với bài tập chuyên sâu
                </Text>
                <Tag color="blue" style={{ fontSize: "12px", padding: "4px 12px" }}>
                  7 Parts • Listening & Reading
                </Tag>
              </div>

              <Divider />

              {/* Instructions */}
              <Alert
                message="Hướng dẫn sử dụng"
                description={
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Text>• Chọn phần bạn muốn luyện tập (Part 1-7)</Text>
                    <Text>• Chọn loại câu hỏi cụ thể để tập trung luyện tập</Text>
                    <Text>• Bắt đầu làm bài và nhận phản hồi chi tiết</Text>
                  </Space>
                }
                type="info"
                showIcon
                style={{ 
                  marginBottom: "32px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(64, 169, 255, 0.05))"
                }}
              />

              {/* Selection Form */}
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: "16px",
                      border: "2px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      ":hover": {
                        borderColor: "#667eea",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)"
                      }
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Target className="w-5 h-5 text-blue-500" />
                        <Text strong style={{ color: "#1890ff" }}>Chọn phần thi</Text>
                      </div>
                      <Select
                        size="large"
                        placeholder="Chọn phần TOEIC"
                        value={selectedSection}
                        onChange={(value) => {
                          console.log("🚀 ~ Section selected:", value);
                          setSelectedSection(value);
                          setSelectedQuestionType(""); // Reset question type when section changes
                        }}
                        onDropdownVisibleChange={(open) => {
                          console.log("🚀 ~ Dropdown visible:", open);
                          console.log("🚀 ~ enabledSections when dropdown opens:", enabledSections);
                        }}
                        style={{ width: "100%" }}
                        dropdownStyle={{
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)"
                        }}
                        notFoundContent="Không có dữ liệu"
                        showSearch={false}
                        allowClear
                      >
                        {enabledSections.length > 0 ? (
                          enabledSections.map((section) => {
                            // Extract part number for icon
                            const partMatch = section.name.match(/Part (\d+)/);
                            const partNumber = partMatch ? parseInt(partMatch[1]) : null;
                            const skillType = partNumber <= 4 ? "Listening" : "Reading";
                            
                            return (
                              <Option 
                                key={section._id} 
                                value={section._id}
                                style={{ padding: "8px 12px" }}
                              >
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "space-between",
                                  width: "100%" 
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {getPartIcon(partNumber)}
                                    <span style={{ fontWeight: "500" }}>{section.name}</span>
                                  </div>
                                  <Tag 
                                    color={skillType === "Listening" ? "blue" : "green"}
                                    style={{ fontSize: "11px", margin: 0 }}
                                  >
                                    {skillType}
                                  </Tag>
                                </div>
                              </Option>
                            );
                          })
                        ) : (
                          <Option disabled value="">
                            <Text type="secondary">Đang tải dữ liệu...</Text>
                          </Option>
                        )}
                      </Select>
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
                      opacity: selectedSection ? 1 : 0.6
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <BookOpen className="w-5 h-5 text-green-500" />
                        <Text strong style={{ color: "#52c41a" }}>Chọn loại câu hỏi</Text>
                      </div>
                      <Select
                        size="large"
                        placeholder="Chọn loại câu hỏi"
                        value={selectedQuestionType}
                        onChange={setSelectedQuestionType}
                        style={{ width: "100%" }}
                        disabled={!selectedSection}
                        dropdownStyle={{ 
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)"
                        }}
                        notFoundContent={!selectedSection ? "Vui lòng chọn phần thi trước" : "Không có dữ liệu"}
                        showSearch={false}
                        allowClear
                      >
                        {questionTypeOptions.map((option, index) => (
                          <Option 
                            key={index} 
                            value={option.value}
                            style={{ padding: "8px 12px" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                              <span style={{ fontWeight: "500" }}>{option.text}</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Space>
                  </Card>
                </Col>
              </Row>

              {/* Start Button */}
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={startPractice}
                  disabled={!selectedSection || !selectedQuestionType}
                  style={{
                    height: "56px",
                    padding: "0 40px",
                    borderRadius: "28px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: selectedSection && selectedQuestionType 
                      ? "linear-gradient(135deg, #667eea, #764ba2)"
                      : undefined,
                    border: "none",
                    boxShadow: selectedSection && selectedQuestionType 
                      ? "0 8px 24px rgba(102, 126, 234, 0.3)"
                      : undefined,
                    transition: "all 0.3s ease"
                  }}
                  icon={<PlayCircle className="w-5 h-5" />}
                >
                  BẮT ĐẦU LUYỆN TẬP
                </Button>
                
                {(!selectedSection || !selectedQuestionType) && (
                  <div style={{ marginTop: "12px" }}>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      Vui lòng chọn phần thi và loại câu hỏi để bắt đầu
                    </Text>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div style={{ 
                marginTop: "40px", 
                padding: "20px",
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))",
                borderRadius: "16px"
              }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <Text strong style={{ display: "block" }}>Thời gian linh hoạt</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Không giới hạn thời gian
                    </Text>
                  </Col>
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <Text strong style={{ display: "block" }}>Đánh giá chi tiết</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Phân tích kết quả ngay lập tức
                    </Text>
                  </Col>
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <Text strong style={{ display: "block" }}>Cải thiện kỹ năng</Text>
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
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none"
              }}
            >
              Quay lại
            </Button>
          </div>

          {/* Test Components */}
          {(() => {
            const selectedSectionData = sections.find(section => section._id === selectedSection);
            if (!selectedSectionData) return null;
            
            const partMatch = selectedSectionData.name.match(/Part (\d+)/);
            const partNumber = partMatch ? parseInt(partMatch[1]) : null;
            
            const commonProps = {
              questions,
              submitAnswers,
              refreshPage,
              translateText,
              getOptions,
              getOptionClass,
              clearSelection,
              checkAnswer
            };

            switch (partNumber) {
              case 1:
                return (
                  <TestPart1
                    {...commonProps}
                    getImageUrl={getImageUrl}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 2:
                return (
                  <TestPart2
                    {...commonProps}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 3:
                return (
                  <TestPart3
                    {...commonProps}
                    getImageUrl={getImageUrl}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 4:
                return (
                  <TestPart4
                    {...commonProps}
                    getImageUrl={getImageUrl}
                    getAudioUrl={getAudioUrl}
                  />
                );
              case 5:
                return <TestPart5 {...commonProps} />;
              case 6:
                return <TestPart6 {...commonProps} />;
              case 7:
                return (
                  <TestPart7Single
                    {...commonProps}
                    getImageUrl={getImageUrl}
                  />
                );
              default:
                return null;
            }
          })()}
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
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
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05)) !important;
        }
        
        .ant-select-item-option-selected {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1)) !important;
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
