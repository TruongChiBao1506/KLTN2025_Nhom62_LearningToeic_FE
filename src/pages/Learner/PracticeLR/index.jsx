import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import ListeningReadingComponent from "../../../components/Learner/ListeningReading";
import "./style.css";

const PracticeLR = () => {
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
            <span>Luyện thi TOEIC online 2023 có đáp án</span>
          </h1>
        </div>

        <div className="mb-5">
          <ListeningReadingComponent />
        </div>

        <div className="row mb-5">
          <div className="col-sm-6 mb-3 mb-sm-0">
            <div className="card card-background-1">
              <div className="card-body">
                <h5 className="card-title row-title">TỪ VỰNG</h5>
                <p className="card-text row-text fw-semibold">
                  Bài tập từ vựng của chúng tôi được chia thành nhiều chủ đề và
                  phần sẽ giúp bạn nâng cao vốn từ vựng của mình
                </p>
                <Link to="/learner/topics" className="btn btn-primary row-text">
                  Từ vựng
                </Link>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="card card-background-2">
              <div className="card-body">
                <h5 className="card-title row-title">NGỮ PHÁP</h5>
                <p className="card-text row-text fw-semibold">
                  Bài tập ngữ pháp của chúng tôi bao gồm hơn 30 chủ đề ngữ pháp
                  chắc chắn sẽ giúp bạn nâng cao nền tảng tiếng Anh
                </p>
                <Link
                  to="/learner/grammar"
                  className="btn btn-primary row-text"
                >
                  Ngữ Pháp
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLR;
