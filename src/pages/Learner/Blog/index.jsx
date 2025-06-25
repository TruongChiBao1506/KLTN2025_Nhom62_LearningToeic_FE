import React from "react";
import "./style.css";

const Blog = () => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center mb-4">BLOG TOEIC</h2>
          <div className="alert alert-info text-center" role="alert">
            <i className="fas fa-info-circle me-2"></i> Chúng tôi đang cập nhật nội dung blog. Vui lòng quay lại sau!
          </div>
          
          {/* Bài viết mẫu - sẽ được thay thế bằng dữ liệu thực từ API */}
          <div className="card mb-4 blog-card">
            <div className="card-body">
              <h3 className="card-title">Bí quyết học từ vựng TOEIC hiệu quả</h3>
              <div className="card-subtitle mb-2 text-muted">Đăng ngày: 25/06/2023</div>
              <p className="card-text">
                Từ vựng là một trong những yếu tố quan trọng nhất để đạt điểm cao trong bài thi TOEIC. 
                Trong bài viết này, chúng ta sẽ tìm hiểu các phương pháp học từ vựng TOEIC hiệu quả để 
                cải thiện kỹ năng nghe và đọc.
              </p>
              <button className="btn btn-primary">Đọc thêm</button>
            </div>
          </div>
          
          <div className="card mb-4 blog-card">
            <div className="card-body">
              <h3 className="card-title">5 phương pháp làm bài thi TOEIC Part 7</h3>
              <div className="card-subtitle mb-2 text-muted">Đăng ngày: 20/06/2023</div>
              <p className="card-text">
                Part 7 (Reading Comprehension) là phần thi chiếm số lượng câu hỏi lớn nhất trong bài thi TOEIC 
                với 54 câu hỏi. Để làm tốt phần này, bạn cần có chiến lược làm bài phù hợp và kỹ năng đọc hiểu 
                nhanh chóng.
              </p>
              <button className="btn btn-primary">Đọc thêm</button>
            </div>
          </div>
          
          <div className="card mb-4 blog-card">
            <div className="card-body">
              <h3 className="card-title">Luyện nghe TOEIC: Từ cơ bản đến nâng cao</h3>
              <div className="card-subtitle mb-2 text-muted">Đăng ngày: 15/06/2023</div>
              <p className="card-text">
                Kỹ năng nghe là một trong những kỹ năng quan trọng trong bài thi TOEIC. Bài viết này sẽ 
                hướng dẫn bạn cách luyện nghe TOEIC từ cơ bản đến nâng cao, giúp bạn cải thiện điểm số 
                phần Listening một cách đáng kể.
              </p>
              <button className="btn btn-primary">Đọc thêm</button>
            </div>
          </div>
          
          {/* Phân trang */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className="page-item disabled">
                <a className="page-link" href="#" tabIndex="-1">Trước</a>
              </li>
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item">
                <a className="page-link" href="#">Sau</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Blog;
