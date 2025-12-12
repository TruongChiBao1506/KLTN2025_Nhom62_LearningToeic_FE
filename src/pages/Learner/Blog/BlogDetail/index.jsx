import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faCalendarAlt, faTags } from '@fortawesome/free-solid-svg-icons';
import BlogService from '../../../../services/blogService';
import './style.css';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = slug ? `Blog - ${slug}` : 'Blog Detail';
        const fetchBlog = async () => {
            try {
                setIsLoading(true);
                const response = await BlogService.getBlogBySlug(slug);
                setBlog(response.data);
            } catch (err) {
                console.error('Error fetching blog:', err);
                setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) {
            fetchBlog();
        }
    }, [slug]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải bài viết...</p>
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
                <div className="text-center mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/learner/blog')}
                    >
                        Quay lại danh sách blog
                    </button>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    Không tìm thấy bài viết.
                </div>
                <div className="text-center mt-3">
                    <button
                        className="btn btn-back"
                        onClick={() => navigate('/learner/blog')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Quay lại danh sách blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    {/* Back button */}
                    <button
                        className="btn btn-back mb-4"
                        onClick={() => navigate('/learner/blog')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Quay lại
                    </button>

                    {/* Blog content */}
                    <article className="blog-detail">
                        {/* Title */}
                        <h1 className="blog-title mb-4">{blog.title}</h1>

                        {/* Meta information */}
                        <div className="blog-meta mb-4 d-flex flex-wrap align-items-center gap-3">
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-muted" />
                                <span className="text-muted">
                                    {blog.publishDate ? formatDate(blog.publishDate) : formatDate(blog.createdAt)}
                                </span>
                            </div>
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faEye} className="me-2 text-muted" />
                                <span className="text-muted">{blog.views || 0} lượt xem</span>
                            </div>
                            <div className="meta-item">
                                <FontAwesomeIcon icon={faTags} className="me-2 text-muted" />
                                <span className="text-muted">{blog.category}</span>
                            </div>
                        </div>

                        {/* Excerpt */}
                        {blog.excerpt && (
                            <div className="blog-excerpt mb-4">
                                <p className="lead">{blog.excerpt}</p>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {/* {blog.tags && blog.tags.length > 0 && (
                            <div className="blog-tags mt-5">
                                <h5>
                                    <FontAwesomeIcon icon={faTags} className="me-2" />
                                    Tags:
                                </h5>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {blog.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-secondary">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </article>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;