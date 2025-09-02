import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpellCheck, faBook } from '@fortawesome/free-solid-svg-icons';
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
                {/* Breadcrumb */}
                <div
                    className="mt-2 shadow-lg rounded-4 px-2 py-1"
                    style={{
                        background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                        border: 'none'
                    }}
                    data-aos="fade-down"
                    data-aos-duration="400"
                    data-aos-delay="50"
                >
                    <nav>
                        <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
                            <li>
                                <span
                                    style={{
                                        background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8,
                                        boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faSpellCheck} color="#fff" />
                                </span>
                                <Link to="/admin/vocabulary" className="fw-bold text-decoration-none" style={{ color: '#4f8cff', fontSize: 18 }}>
                                    Vocabulary
                                </Link>
                            </li>
                            <li className="current d-flex align-items-center">
                                <span
                                    style={{
                                        background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8,
                                        boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faBook} color="#fff" />
                                </span>
                                <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 18 }}>
                                    Vocabulary Question
                                </span>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Error message */}
                <div
                    className="alert alert-danger mt-3"
                    role="alert"
                    data-aos="zoom-in"
                    data-aos-duration="600"
                >
                    <h4 className="alert-heading">
                        <FontAwesomeIcon icon={faBook} className="me-2" />
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
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 shadow-lg rounded-4 px-2 py-1"
                style={{
                    background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                    border: 'none'
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
                        <li>
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                }}
                            >
                                <FontAwesomeIcon icon={faSpellCheck} color="#fff" />
                            </span>
                            <Link to="/admin/vocabulary" className="fw-bold text-decoration-none" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Vocabulary
                            </Link>
                        </li>
                        <li className="current d-flex align-items-center">
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                }}
                            >
                                <FontAwesomeIcon icon={faBook} color="#fff" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Vocabulary Question
                            </span>
                        </li>
                    </ol>
                </nav>
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