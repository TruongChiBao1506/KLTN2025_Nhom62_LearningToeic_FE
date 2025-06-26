import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import examService from "../../../services/examService";
import Comment from "../../../components/Learner/Comment";
import "./style.css";

const ExamFullTest = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const retrieveExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getEnableFullTest();
        setExams(response.data || []);
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
    <div data-aos="fade-in" data-aos-duration="1000" data-aos-delay="200">
      <div className="container">
        <div id="test">
          <h1 className="text-center mt-5">
            <span>Bắt đầu bài thi TOEIC® đầy đủ ngay!</span>
          </h1>
        </div>

        <div className="my-5">
          <div className="row d-flex justify-content-start">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div
                  className="col-lg-3 col-md-6 col-sm-12 mb-4"
                  key={exam.examId}
                >
                  <div className="card exam-card">
                    <div className="card-image">
                      <img
                        src="https://th.bing.com/th/id/R.50feae0671a4ce982b6db0bc095d95ae?rik=eVczvOwjlhkXdw&pid=ImgRaw&r=0"
                        className="card-img-top"
                        alt="Hình ảnh bài thi TOEIC"
                        loading="lazy"
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
                                  className="fa-solid fa-user-pen"
                                  style={{ color: "chocolate" }}
                                ></i>{" "}
                                3 người tham gia
                              </p>
                            </div>
                            <div className="col-5">
                              <p className="card-text">
                                <i
                                  className="fas fa-clock me-2"
                                  style={{ color: "cornflowerblue" }}
                                ></i>
                                {exam.examDuration / 3600} giờ
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/exam-question-fulltest-preparation/${exam.examId}`}
                          className="text-decoration-none"
                        >
                          <div className="d-flex justify-content-center">
                            <button
                              type="button"
                              className="button my-2 w-75"
                              style={{ width: "100%" }}
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
                  Không có bài thi nào hiện tại. Vui lòng quay lại sau.
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

export default ExamFullTest;
