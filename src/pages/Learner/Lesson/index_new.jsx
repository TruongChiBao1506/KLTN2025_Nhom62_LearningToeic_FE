import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import LessonService from "../../../services/lessonService";
import TestService from "../../../services/testService";
import LessonContentService from "../../../services/lessonContentService";
import "./style.css";

const Lesson = () => {
  const { sectionId, lessonId } = useParams();
  const [lessonContents, setLessonContents] = useState([]);
  const [lessonName, setLessonName] = useState("");
  const [lessons, setLessons] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy nội dung bài học
  const retrieveLessonContents = useCallback(async () => {
    if (!lessonId) return;
    try {
      console.log("Fetching lesson contents for lessonId:", lessonId);
      const response =
        await LessonContentService.getEnableLessonContentsByLesson(lessonId);
      console.log("Lesson contents response:", response);
      
      // Xử lý response data
      const lessonContentsData = response.data || response;
      console.log("Processed lesson contents data:", lessonContentsData);
      
      if (Array.isArray(lessonContentsData)) {
        setLessonContents(lessonContentsData);
      } else {
        setLessonContents(lessonContentsData?.contents || lessonContentsData?.data || []);
      }
    } catch (error) {
      console.error("Error fetching lesson contents:", error);
      setLessonContents([]);
    }
  }, [lessonId]);

  // Lấy thông tin lesson cụ thể để lấy tên
  const retrieveLessonInfo = useCallback(async () => {
    if (!lessonId) return;
    try {
      console.log("Fetching lesson info for lessonId:", lessonId);
      const response = await LessonService.get(lessonId);
      console.log("Lesson info response:", response);
      
      const lessonData = response.data || response;
      setLessonName(lessonData?.lessonName || lessonData?.name || "");
    } catch (error) {
      console.error("Error fetching lesson info:", error);
    }
  }, [lessonId]);

  // Lấy danh sách các bài học trong cùng section
  const retrieveLessons = useCallback(async () => {
    if (!sectionId) return;
    try {
      console.log("Fetching lessons for sectionId:", sectionId);
      const response = await LessonService.getEnableLessonsBySection(sectionId);
      console.log("Lessons response:", response);
      
      // Xử lý response data
      const lessonsData = response.data || response;
      
      if (Array.isArray(lessonsData)) {
        setLessons(lessonsData);
        if (lessonsData.length > 0) {
          setSectionName(lessonsData[0].section?.name || "");
        }
      } else {
        setLessons(lessonsData?.lessons || lessonsData?.data || []);
        if (lessonsData?.lessons?.length > 0) {
          setSectionName(lessonsData.lessons[0].section?.name || "");
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  }, [sectionId]);

  // Lấy danh sách các bài kiểm tra trong cùng section
  const retrieveTests = useCallback(async () => {
    if (!sectionId) return;
    try {
      console.log("Fetching tests for sectionId:", sectionId);
      const response = await TestService.getEnableTestsBySection(sectionId);
      console.log("Tests response:", response);
      
      // Xử lý response data
      const testsData = response.data || response;
      
      if (Array.isArray(testsData)) {
        setTests(testsData);
      } else {
        setTests(testsData?.tests || testsData?.data || []);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      setTests([]);
    }
  }, [sectionId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          retrieveLessonInfo(),
          retrieveLessonContents(),
          retrieveLessons(),
          retrieveTests()
        ]);
      } catch (err) {
        console.error("Error loading lesson data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (sectionId && lessonId) {
      fetchData();
    }
  }, [retrieveLessonInfo, retrieveLessonContents, retrieveLessons, retrieveTests, sectionId, lessonId]);

  return (
    <div className="container-fluid" style={{ background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)", minHeight: "100vh", padding: "20px 0" }}>
      <div className="container">
        <h1 className="text-center mt-3 mb-4" style={{ color: "#1e293b", fontWeight: "700" }}>
          <span>{sectionName}</span>
        </h1>
        <div className="row mt-4">
          <div className="col-lg-8 col-md-8 col-sm-12">
            <div className="card specific-card">
              <div
                className="card-body lesson-content"
                style={{ minHeight: "500px" }}
              >
                <h4 className="card-title text-center lesson-title mb-3">
                  <span>{lessonName}</span>
                </h4>
                
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải nội dung bài học...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                ) : lessonContents.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">Chưa có nội dung cho bài học này.</p>
                  </div>
                ) : (
                  lessonContents.map((lessonContent) => (
                    <div key={lessonContent.contentId || lessonContent._id} className="mb-4">
                      <h4 className="card-subtitle mb-2 text-body-secondary lesson-subtitle">
                        <span className="highlight">{lessonContent.title}</span>
                      </h4>
                      <div
                        className="card-text"
                        dangerouslySetInnerHTML={{ __html: lessonContent.content }}
                      ></div>
                    </div>
                  ))
                )}
                
                <div
                  className="warning"
                  style={{ marginBottom: "15px", padding: "4px 12px" }}
                >
                  <p className="d-flex align-items-center">
                    <strong>Lưu ý!</strong> Hãy nhớ học từ vựng trước khi làm bài
                    kiểm tra
                  </p>
                </div>
                <FontAwesomeIcon icon={faBook} className="book-icon" />
              </div>
            </div>

            {/* Phần hiển thị các bài test liên quan */}
            {tests.length > 0 && (
              <div className="mt-4">
                <h5 className="mb-3 fw-bold text-primary">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Bài kiểm tra thực hành:
                </h5>
                <div className="row">
                  {tests.map((test) => (
                    <div className="col-lg-4 col-md-6 col-sm-12" key={test.testId || test._id}>
                      <div 
                        className="card test-practice-card h-100"
                        style={{
                          border: "none",
                          borderRadius: "16px",
                          background: "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
                          boxShadow: "0 4px 20px rgba(16, 185, 129, 0.1)",
                          transition: "all 0.3s ease",
                          marginBottom: "20px",
                          cursor: "pointer"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 30px rgba(16, 185, 129, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.1)";
                        }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "12px"
                              }}
                            >
                              <i className="fas fa-play text-white"></i>
                            </div>
                            <div>
                              <h6 className="card-title mb-1 fw-bold" style={{ color: "#1e293b" }}>
                                {test.testName || test.name}
                              </h6>
                              <small className="text-muted">Bài kiểm tra</small>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2">
                              <small className="text-muted">Tiến độ:</small>
                              <small className="fw-medium">20%</small>
                            </div>
                            <div className="progress" style={{ height: "6px", borderRadius: "3px" }}>
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{ width: "20%" }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="fas fa-users me-1"></i>
                              Tham gia: {test.testParticipants || 0}
                            </small>
                            <Link
                              to={`/learner/section/${sectionId}/study/${test.testId || test._id}`}
                              className="btn btn-success btn-sm"
                              style={{
                                borderRadius: "8px",
                                padding: "6px 16px",
                                fontWeight: "500",
                                border: "none",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                              }}
                            >
                              <i className="fas fa-play me-1"></i>
                              Làm bài
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4 col-md-4 col-sm-12">
            <div className="lesson-sidebar">
              <h5 className="mb-3 fw-bold text-primary">
                <i className="fas fa-book-open me-2"></i>
                Các bài học khác:
              </h5>
              <div className="lesson-list">
                {lessons.map((lesson) => {
                  const isCurrentLesson = (lesson.lessonId || lesson._id) === lessonId;
                  return (
                    <div 
                      className={`lesson-item mb-2 ${isCurrentLesson ? 'current-lesson' : ''}`} 
                      key={lesson.lessonId || lesson._id}
                    >
                      <Link
                        to={`/learner/section/${sectionId}/lesson/${lesson.lessonId || lesson._id}`}
                        className={`card-body custom-card text-decoration-none d-block ${isCurrentLesson ? 'current' : ''}`}
                        style={{
                          borderRadius: "12px",
                          padding: "16px",
                          background: isCurrentLesson 
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                            : "rgba(255, 255, 255, 0.8)",
                          color: isCurrentLesson ? "#ffffff" : "#64748b",
                          border: isCurrentLesson ? "2px solid #667eea" : "1px solid #e2e8f0",
                          transition: "all 0.3s ease",
                          display: "block",
                          textDecoration: "none"
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentLesson) {
                            e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
                            e.currentTarget.style.color = "#667eea";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentLesson) {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                            e.currentTarget.style.color = "#64748b";
                            e.currentTarget.style.transform = "translateX(0)";
                          }
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div 
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: isCurrentLesson 
                                ? "rgba(255, 255, 255, 0.2)" 
                                : "rgba(102, 126, 234, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                              fontSize: "14px"
                            }}
                          >
                            <i className={`fas ${isCurrentLesson ? 'fa-play' : 'fa-book'}`}></i>
                          </div>
                          <span
                            className="overflow-ellipsis"
                            title={lesson.lessonName || lesson.name}
                            style={{
                              fontWeight: isCurrentLesson ? "600" : "500",
                              fontSize: "14px"
                            }}
                          >
                            {lesson.lessonName || lesson.name}
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
