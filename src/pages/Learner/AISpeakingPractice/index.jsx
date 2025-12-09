import React, { useState, useEffect } from "react";
import { Video, Bot, Sparkles, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VideoCallModal from "../../../components/VideoCall";

const AISpeakingPractice = () => {
  const navigate = useNavigate();
  const [isCallActive, setIsCallActive] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const learnerToken = sessionStorage.getItem("learnerToken");
    const adminToken = sessionStorage.getItem("adminToken");
    const user =
      sessionStorage.getItem("user") || localStorage.getItem("learnerUser");

    setIsLoggedIn(!!(learnerToken || adminToken) && !!user);
  }, []);

  const startPracticeSession = async () => {
    try {
      console.log("Starting practice session...");

      // Check if user is logged in
      if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để sử dụng tính năng Luyện Nói Với AI");
        navigate("/learner/login");
        return;
      }

      // Generate unique meeting ID
      const newMeetingId = `ai-practice-${Date.now()}`;
      console.log("Generated meeting ID:", newMeetingId);

      setMeetingId(newMeetingId);
      setMeetingName("Buổi Luyện Nói Với AI");
      setIsCallActive(true);

      console.log("State updated - isCallActive:", true);
    } catch (error) {
      console.error("Error starting practice session:", error);
      alert("Failed to start practice session: " + error.message);
    }
  };

  const closePracticeSession = () => {
    setIsCallActive(false);
    setMeetingId("");
    setMeetingName("");
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-circle p-4 mb-4">
                  <Video className="text-white" size={48} />
                </div>
                <h2 className="fw-bold mb-3">Luyện Nói Với AI</h2>
                <p className="text-muted lead">
                  Luyện tập kỹ năng nói tiếng Anh với trợ lý AI của chúng tôi
                </p>
              </div>

              {/* Features */}
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body text-center p-4">
                      <Bot className="text-primary mb-3" size={40} />
                      <h5 className="fw-semibold mb-2">Trợ Lý AI</h5>
                      <p className="text-muted small mb-0">
                        Trò chuyện với AI thông minh và nhận phản hồi theo thời
                        gian thực
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body text-center p-4">
                      <MessageCircle className="text-success mb-3" size={40} />
                      <h5 className="fw-semibold mb-2">Hội Thoại Tự Nhiên</h5>
                      <p className="text-muted small mb-0">
                        Luyện tập giao tiếp thực tế trong môi trường an toàn
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body text-center p-4">
                      <Sparkles className="text-warning mb-3" size={40} />
                      <h5 className="fw-semibold mb-2">Phản Hồi Tức Thì</h5>
                      <p className="text-muted small mb-0">
                        Nhận chỉnh sửa phát âm và ngữ pháp theo thời gian thực
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="mb-5">
                <h4 className="fw-semibold mb-4 text-center">
                  Cách thức hoạt động
                </h4>
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="d-flex align-items-start">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <strong>1</strong>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Bắt Đầu Buổi Học</h6>
                        <p className="text-muted small mb-0">
                          Nhấn nút để bắt đầu
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="d-flex align-items-start">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <strong>2</strong>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Cài Đặt Thiết Bị</h6>
                        <p className="text-muted small mb-0">
                          Kiểm tra micro và camera
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="d-flex align-items-start">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <strong>3</strong>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Tham Gia Cuộc Gọi</h6>
                        <p className="text-muted small mb-0">
                          Bắt đầu trò chuyện với AI
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="d-flex align-items-start">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <strong>4</strong>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Nhận Phản Hồi</h6>
                        <p className="text-muted small mb-0">
                          Nhận chỉnh sửa ngay lập tức
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                {!isLoggedIn && (
                  <div className="alert alert-warning mb-3">
                    <strong>⚠️ Vui lòng đăng nhập trước</strong> để sử dụng
                    Luyện Nói Với AI
                  </div>
                )}
                <button
                  onClick={startPracticeSession}
                  className="btn btn-primary btn-lg px-5 py-3 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
                    border: "none",
                  }}
                >
                  <Video className="me-2" size={20} />
                  Bắt Đầu Luyện Nói Với AI
                </button>
                <p className="text-muted small mt-3 mb-0">
                  Miễn phí cho tất cả học viên • Không giới hạn thời gian
                </p>
              </div>

              {/* Tips */}
              <div className="alert alert-info mt-5" role="alert">
                <h6 className="alert-heading fw-semibold mb-2">
                  💡 Mẹo để có trải nghiệm tốt nhất:
                </h6>
                <ul className="mb-0 small">
                  <li>Sử dụng môi trường yên tĩnh</li>
                  <li>Nói rõ ràng và tự nhiên</li>
                  <li>Sử dụng tai nghe để tránh tiếng vang</li>
                  <li>Đảm bảo ánh sáng tốt nếu sử dụng camera</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={isCallActive}
        onClose={closePracticeSession}
        meetingId={meetingId}
        meetingName={meetingName}
      />
    </div>
  );
};

export default AISpeakingPractice;
