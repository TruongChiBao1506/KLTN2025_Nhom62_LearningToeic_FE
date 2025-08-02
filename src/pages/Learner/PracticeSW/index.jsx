import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import SpeakingWritingComponent from "../../../components/Learner/SpeakingWriting";
import "./style.css";

const PracticeSW = () => {
  // Initialize AOS
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      delay: 200,
    });
  }, []);

  return (
    <div data-aos="zoom-in">
      <div className="container">
        <div id="test">
          <h1 className="text-center mt-5">
            <span>Luyện thi Toeic Speaking Writing 2023 Online</span>
          </h1>
        </div>

        <div className="mb-5">
          <SpeakingWritingComponent />
        </div>

        <div className="row mb-5">
          <div className="d-flex justify-content-center mb-5">
            <img
              className="my-3"
              src="https://academic-englishuk.com/wp-content/uploads/2017/08/IPA-Chart-AEUK.png"
              alt="IPA Chart"
              loading="lazy"
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <div className="col-sm-6 mb-3 mb-sm-0">
            <div className="card card-background-1">
              <div className="card-body">
                <h5 className="card-title row-title">TỪ VỰNG</h5>
                <p className="card-text row-text fw-semibold">
                  Việc thực hành từ vựng của chúng tôi được chia thành nhiều chủ
                  đề và phần khác nhau sẽ hỗ trợ bạn nâng cao vốn từ vựng
                </p>
                <Link to="/learner/topics" className="btn btn-primary row-text">
                  LUYỆN TẬP
                </Link>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="card card-background-2">
              <div className="card-body">
                <h5 className="card-title row-title">NGỮ PHÁP</h5>
                <p className="card-text row-text fw-semibold">
                  Các bài tập ngữ pháp của chúng tôi bao gồm hơn 30 chủ đề ngữ
                  pháp chắc chắn sẽ giúp bạn nâng cao nền tảng tiếng Anh của
                  mình
                </p>
                <Link
                  to="/learner/grammar"
                  className="btn btn-primary row-text"
                >
                  LUYỆN TẬP
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSW;
