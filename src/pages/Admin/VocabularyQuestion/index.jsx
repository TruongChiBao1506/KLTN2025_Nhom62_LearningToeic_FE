import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import VocabularyQuestionService from '../../../services/vocabularyQuestionService';
import VocabularyQuestionList from '../../../components/Admin/VocabularyQuestionList';
import '../../../assets/breadcrumb.css';

const VocabularyQuestion = () => {
    const { topicId } = useParams(); // Lấy topicId từ URL params
    const [vocabularyQuestions, setVocabularyQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Admin - Vocabulary Question";
    }, []);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    const retrieveVocabularyQuestions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Topic ID:', topicId);

            const result = await VocabularyQuestionService.getVocabularyQuestionsByTopic(topicId);
            setVocabularyQuestions(result || []);
            console.log('Vocabulary Questions:', result);

        } catch (error) {
            console.log('Error fetching vocabulary questions:', error);

            // Check if it's a 404 (no data) vs real error
            if (error.response?.status === 404) {
                console.log('📝 Topic chưa có vocabulary questions - hiển thị empty state');
                setVocabularyQuestions([]);
                setError(null); // Don't show error for empty data
            } else {
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
                setVocabularyQuestions([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (topicId) {
            retrieveVocabularyQuestions();
        }
    }, [topicId]);

    // Error state
    if (error) {
        return (
            <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
                {/* Breadcrumb Ant Design + Gradient */}
                <div
                    style={{
                        background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)',
                        minHeight: 70,
                        border: 'none',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px rgba(80,120,255,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 32px',
                        marginBottom: 16,
                    }}
                    data-aos="fade-down"
                    data-aos-duration="400"
                    data-aos-delay="50"
                >
                    <Breadcrumb separator={null} style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                        <Breadcrumb.Item>
                            <span style={{
                                background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                            }}>
                                <BookOutlined style={{ color: '#fff', fontSize: 20 }} />
                            </span>
                            <Link to="/admin/vocabulary" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Vocabulary</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <span style={{
                                background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                            }}>
                                <FileTextOutlined style={{ color: '#fff', fontSize: 20 }} />
                            </span>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Vocabulary Question</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                {/* Error message */}
                <div
                    className="alert alert-danger mt-3"
                    role="alert"
                    data-aos="zoom-in"
                    data-aos-duration="600"
                >
                    <h4 className="alert-heading" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOutlined style={{ color: '#d32f2f', fontSize: 22 }} />
                        Lỗi tải dữ liệu
                    </h4>
                    <p className="mb-2">{error}</p>
                    <hr />
                    <button
                        className="btn btn-outline-danger"
                        onClick={retrieveVocabularyQuestions}
                    >
                        <i className="fas fa-redo me-2"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb Ant Design + Gradient */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 32px',
                    marginBottom: 16,
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <Breadcrumb separator={null} style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                    <Breadcrumb.Item>
                        <span style={{
                            background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                        }}>
                            <BookOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <Link to="/admin/vocabulary" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Vocabulary</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span style={{
                            background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                        }}>
                            <FileTextOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Vocabulary Question</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* VocabularyQuestionList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
            >
                {isLoading ? (
                    <div
                        className="text-center py-5"
                        data-aos="zoom-in"
                        data-aos-duration="600"
                    >
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">
                            Đang tải dữ liệu vocabulary questions cho topic {topicId}...
                        </p>
                    </div>
                ) : (
                    <VocabularyQuestionList
                        vocabularyQuestions={vocabularyQuestions}
                        topicId={topicId}
                        retrieveVocabularyQuestions={retrieveVocabularyQuestions}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default VocabularyQuestion;