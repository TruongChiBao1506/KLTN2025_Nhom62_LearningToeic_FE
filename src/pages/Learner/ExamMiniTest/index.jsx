import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import examService from "../../../services/examService";
import Comment from "../../../components/Learner/Comment";
import "./style.css";

// Inline styles để đảm bảo CSS được áp dụng
const inlineStyles = {
  examCard: {
    border: '1px solid #e3e6f0',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
    overflow: 'hidden',
    height: '100%'
  },
  cardImage: {
    height: '200px',
    overflow: 'hidden'
  },
  cardImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#052649',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease'
  }
};

const ExamMiniTest = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const retrieveExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getMiniTest();
        console.log("🚀 ~ retrieveExams ~ response:", response);

        setExams(response.data || []);
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

  return (
    <div className="exam-mini-test-container" >
      <div className="container">
        <div id="test">
          <h1 className="text-center mt-5">
            <span>Bắt đầu bài thi TOEIC® mini ngay!</span>
          </h1>
          <p>
            Bài thi mini sẽ giúp bạn làm quen với cấu trúc và nội dung của bài
            thi TOEIC chính thức trong thời gian ngắn hơn. Đây là cách tốt để
            luyện tập kỹ năng và chuẩn bị cho kỳ thi thật.
          </p>
        </div>

        <div className="my-5">
          <div className="row d-flex justify-content-start">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div
                  className="col-lg-3 col-md-6 col-sm-12 mb-4"
                  key={exam._id}
                >
                  <div className="card exam-card h-100" style={inlineStyles.examCard}>
                    <div className="card-image" style={inlineStyles.cardImage}>
                      <img
                        src="https://webhouse.vn/tin-tuc/wp-content/uploads/2022/11/toeic-la-gi-nhung-dieu-can-biet-ve-bai-thi-toeic.jpg"
                        className="card-img-top"
                        alt="Hình ảnh bài thi TOEIC mini"
                        loading="lazy"
                        style={inlineStyles.cardImg}
                      />
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-md-12">
                          <p className="fw-bolder">{exam.examName}</p>
                        </div>
                        <div className="col-md-12 mb-2">
                          <div className="row">
                            <div className="col-7">
                              <p className="card-text">
                                <i
                                  className="fa-solid fa-user-pen me-1"
                                  style={{ color: "chocolate" }}
                                ></i>
                                5 người tham gia
                              </p>
                            </div>
                            <div className="col-5">
                              <p className="card-text">
                                <i
                                  className="fas fa-clock me-1"
                                  style={{ color: "cornflowerblue" }}
                                ></i>
                                {exam.examDurationMinutes || 'N/A'} phút
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/exam-question-minitest-preparation/${exam._id}`}
                          className="text-decoration-none"
                        >
                          <div className="d-flex justify-content-center">
                            <button
                              type="button"
                              className="button my-2"
                              style={inlineStyles.button}
                            >
                              Thi ngay
                            </button>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="lead">
                  Không có bài thi mini nào hiện tại. Vui lòng quay lại sau.
                </p>
              </div>
            )}
          </div>
        </div>

        <div id="test">
          <h1 className="text-center mt-5">
            <span>Bình luận nào!!!</span>
          </h1>
        </div>
        <Comment />
      </div>
    </div>
  );
};

export default ExamMiniTest;
