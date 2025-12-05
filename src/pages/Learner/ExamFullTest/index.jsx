import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFileAlt,
  faClock,
  faUsers,
  faQuestionCircle,
  faPlayCircle,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import examService from "../../../services/examService";
import "./style.css";

const ExamFullTest = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Bài thi TOEIC đầy đủ | TOEIC Learning Platform";

    const retrieveExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getEnableFullTest();

        // Handle both direct array response and nested data response
        const examData = Array.isArray(response)
          ? response
          : response.data || [];
        setExams(examData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi:", error);
        setError("Không thể tải danh sách bài thi. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    retrieveExams();
  }, []);

  if (loading) {
    return (
      <div className="exam-fulltest-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải danh sách bài thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-fulltest-container">
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-fulltest-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb" style={{marginTop:"13px"}}>
            <li className="breadcrumb-item">
              <Link to="/learner/dashboard">
                <FontAwesomeIcon icon={faHouse} className="me-2" />
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active">
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              Bài thi Full Test
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="exam-header">
        <div className="exam-header-content">
          <h2>Bài thi TOEIC® Full Test</h2>
          <p>Trải nghiệm mô phỏng hoàn chỉnh bài thi TOEIC® với 200 câu hỏi trong 120 phút</p>
        </div>
      </div>

      {/* Exam List */}
      <div className="exam-list">
        {exams.length > 0 ? (
          <div className="row g-4">
            {exams.map((exam) => (
              <div className="col-12 col-md-6 col-lg-4" key={exam._id}>
                <div className="exam-card">
                  <div className="exam-card-header">
                    <div className="exam-badge">FULL TEST</div>
                    <h5>{exam.examName}</h5>
                  </div>
                  
                  <div className="exam-card-body">
                    <div className="exam-info-grid">
                      <div className="exam-info-item">
                        <FontAwesomeIcon icon={faClock} className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Thời gian</span>
                          <span className="info-value">{exam.examDurationMinutes || 120} phút</span>
                        </div>
                      </div>
                      
                      <div className="exam-info-item">
                        <FontAwesomeIcon icon={faQuestionCircle} className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Số câu hỏi</span>
                          <span className="info-value">{exam.questionCount || 200} câu</span>
                        </div>
                      </div>
                      
                      <div className="exam-info-item">
                        <FontAwesomeIcon icon={faUsers} className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Đã tham gia</span>
                          <span className="info-value">{exam.participantCount || 0} người</span>
                        </div>
                      </div>
                      
                      <div className="exam-info-item">
                        <FontAwesomeIcon icon={faCalendarAlt} className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Cập nhật</span>
                          <span className="info-value">
                            {new Date(exam.updatedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="exam-card-footer">
                    <Link to={`/learner/exams/${exam._id}`} className="btn-start-exam">
                      <FontAwesomeIcon icon={faPlayCircle} className="me-2" />
                      Bắt đầu làm bài
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-exams">
            <FontAwesomeIcon icon={faFileAlt} size="3x" className="mb-3" />
            <h5>Chưa có bài thi</h5>
            <p>Hiện tại chưa có bài thi Full Test nào. Vui lòng quay lại sau!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamFullTest;
