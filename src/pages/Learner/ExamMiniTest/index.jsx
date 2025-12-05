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

const ExamMiniTest = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Bài thi TOEIC Mini | TOEIC Learning Platform";

    const retrieveExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getMiniTest();

        setExams(response || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi mini:", error);
        setError("Không thể tải danh sách bài thi mini. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    retrieveExams();
  }, []);

  if (loading) {
    return (
      <div className="exam-minitest-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải danh sách bài thi mini...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-minitest-container">
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-minitest-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/learner/dashboard">
                <FontAwesomeIcon icon={faHouse} className="me-2" />
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active">
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              Bài thi Mini Test
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="exam-header mini-test-header">
        <div className="exam-header-content">
          <h2>Bài thi TOEIC® Mini Test</h2>
          <p>Luyện tập nhanh và hiệu quả với các bài thi ngắn từ 50-100 câu hỏi</p>
        </div>
      </div>

      {/* Exam List */}
      <div className="exam-list">
        {exams.length > 0 ? (
          <div className="row g-4">
            {exams.map((exam) => (
              <div className="col-12 col-md-6 col-lg-4" key={exam._id}>
                <div className="exam-card mini-test-card">
                  <div className="exam-card-header">
                    <div className="exam-badge mini-badge">MINI TEST</div>
                    <h5>{exam.examName}</h5>
                  </div>
                  
                  <div className="exam-card-body">
                    <div className="exam-info-grid">
                      <div className="exam-info-item">
                        <FontAwesomeIcon icon={faClock} className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Thời gian</span>
                          <span className="info-value">{exam.examDurationMinutes || 60} phút</span>
                        </div>
                      </div>
                      
                      <div className="exam-info-item">
                        <FontAwesomeIcon icon={faQuestionCircle} className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Số câu hỏi</span>
                          <span className="info-value">{exam.questionCount || 100} câu</span>
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
                            {new Date(exam.updatedAt || new Date()).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="exam-card-footer">
                    <Link to={`/learner/exams/${exam._id}`} className="btn-start-exam mini-test-btn">
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
            <p>Hiện tại chưa có bài thi Mini Test nào. Vui lòng quay lại sau!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamMiniTest;
