import React from "react";
import SpeakingWriting from "../../components/Learner/SpeakingWriting";

const SpeakingWritingPage = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="mb-4">
            <h1 className="display-5 text-center mb-2">
              <span className="text-primary">Luyện thi TOEIC</span>{" "}
              <span className="text-info">Speaking & Writing</span>
            </h1>
            <p className="text-center text-muted mb-4">
              Nâng cao kỹ năng nói và viết tiếng Anh với các bài luyện tập chuyên sâu
            </p>
          </div>
          <SpeakingWriting />
        </div>
      </div>
    </div>
  );
};

export default SpeakingWritingPage;
