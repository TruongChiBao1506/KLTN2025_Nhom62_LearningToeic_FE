import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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

    const retrieveQuestions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await QuestionService.getQuestionsBySection(sectionId);
            setQuestions(data);
            console.log("Retrieved questions:", data);
        } catch (error) {
            console.log(error);
            setQuestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [sectionId]);

    useEffect(() => {
        if (sectionId) {
            retrieveQuestions();
        }
    }, [sectionId, retrieveQuestions]);

    useEffect(() => {
        document.title = "Admin - Questions";
    }, []);

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
                            <HomeOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <Link to="/admin/section" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Section</Link>
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
                            <QuestionCircleOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Question</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
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