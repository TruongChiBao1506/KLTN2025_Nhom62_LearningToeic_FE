import React from "react";
import SpeakingWriting from "../../../components/Learner/SpeakingWriting";

const SpeakingWritingPage = () => {
  return (
    <div className="container-fluid py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="text-center mb-5">
            <h1 className="display-4 mb-3 fw-bold" style={{
              // background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              // WebkitBackgroundClip: 'text',
              // WebkitTextFillColor: 'transparent',
              // backgroundClip: 'text'
            }}>
              <span className="text" style={{color:'var(--color-primary)'}}>Luyện thi TOEIC</span>{" "}
              <span className="text" style={{color:'var(--color-primary)'}}>Speaking & Writing</span>
            </h1>
            <p className="lead text-muted mb-4" style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
              Nâng cao kỹ năng nói và viết tiếng Anh với các bài luyện tập chuyên sâu,
              được thiết kế đặc biệt cho kỳ thi TOEIC
            </p>
            <div className="d-flex justify-content-center gap-3 mb-4">
              <span className="badge bg-primary px-3 py-2 fs-6">🎯 Speaking Practice</span>
              <span className="badge bg-info px-3 py-2 fs-6">✍️ Writing Practice</span>
              <span className="badge bg-success px-3 py-2 fs-6">📚 TOEIC Focused</span>
            </div>
          </div>
          <SpeakingWriting />
        </div>
      </div>
    </div>
  );
};

export default SpeakingWritingPage;
