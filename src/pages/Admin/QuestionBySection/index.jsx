import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import QuestionList from '../../../components/Admin/QuestionBySectionList';
import QuestionService from '../../../services/questionService';
import './style.css';

// Thêm import AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

const QuestionBySection = () => {
    const sectionId = useParams().sectionId;
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Khởi tạo AOS
    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    const retrieveQuestions = async () => {
        try {
            setIsLoading(true);
            const data = await QuestionService.getQuestionsBySection(sectionId);
            setQuestions(data || []);
            console.log("Retrieved questions:", data);
        } catch (error) {
            console.log(error);
            setQuestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sectionId) {
            retrieveQuestions();
        }
    }, [sectionId]);

    useEffect(() => {
        document.title = "Admin - Questions";
    }, []);

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
                                <FontAwesomeIcon icon={faHouse} color="#fff" />
                            </span>
                            <Link to="/admin/section" className="fw-bold text-decoration-none" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Section
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
                                <FontAwesomeIcon icon={faCircleQuestion} color="#fff" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Question
                            </span>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Question List */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu questions...</p>
                    </div>
                ) : (
                    <QuestionList
                        questions={questions}
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionBySection;