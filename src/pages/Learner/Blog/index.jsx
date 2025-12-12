import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTags, faEye } from '@fortawesome/free-solid-svg-icons';
import BlogService from "../../../services/blogService";
import "./style.css";

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Blog";
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await BlogService.getPublishedBlogs();
        console.log('Published blogs response:', response);
        console.log('Response data:', response.data);
        console.log('Is array:', Array.isArray(response.data));
        setBlogs(Array.isArray(response.data) ? response.data : (response.data?.blogs || []));
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Không thể tải danh sách blog. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReadMore = (slug) => {
    navigate(`/learner/blog/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải danh sách blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center mb-4" style={{ color: "var(--color-primary)" }}>BLOG TOEIC</h2>

          {Array.isArray(blogs) && blogs.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              <i className="fas fa-info-circle me-2"></i> Chưa có bài viết nào được xuất bản. Vui lòng quay lại sau!
            </div>
          ) : (
            Array.isArray(blogs) && blogs.map((blog) => (
              <div key={blog._id} className="card mb-4 blog-card">
                <div className="card-body">
                  <h3 className="card-title" style={{ color: "var(--color-primary)" }}>{blog.title}</h3>
                  <div className="card-subtitle mb-2 text-muted d-flex flex-wrap align-items-center gap-3">
                    <div>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                      {blog.publishDate ? formatDate(blog.publishDate) : formatDate(blog.createdAt)}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faEye} className="me-1" />
                      {blog.views || 0} lượt xem
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faTags} className="me-1" />
                      {blog.category}
                    </div>
                  </div>
                  <p className="card-text">
                    {blog.excerpt || 'Không có tóm tắt.'}
                  </p>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark">
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="badge bg-light text-dark">
                            +{blog.tags.length - 3} tags
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={() => handleReadMore(blog.slug)}
                    style={{
                      borderRadius: "8px",
                      background: "var(--color-primary)",
                      borderColor: "var(--color-primary)",
                      color: "#fff"
                    }}
                  >
                    Đọc thêm
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Phân trang - có thể thêm sau nếu cần */}
        </div>
      </div>
    </div>
  );
};

export default Blog;
