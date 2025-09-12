import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined, FolderOpenOutlined, EditOutlined } from '@ant-design/icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

import QuestionService from '../../../services/questionService';
import QuestionList from '../../../components/Admin/IndicateQuestionList';
import '../../../assets/breadcrumb.css';

const IndicateQuestion = () => {
    const { sectionId, testId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Indicate Question";
    }, []);

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
            const result = await QuestionService.getQuestionsBySection(sectionId);
            setQuestions(result);
        } catch (error) {
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
                            <FolderOpenOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <Link to={`/admin/section/${sectionId}/test`} style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Test</Link>
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
                            <EditOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Indicate Question</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* QuestionList with AOS */}
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
                            Đang tải dữ liệu questions cho section {sectionId}...
                        </p>
                    </div>
                ) : (
                    <QuestionList
                        questions={questions}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                )}
            </div>
        </div>
    );
};

export default IndicateQuestion;