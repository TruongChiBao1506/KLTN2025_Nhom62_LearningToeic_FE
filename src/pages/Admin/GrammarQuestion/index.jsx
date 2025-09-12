import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import GrammarQuestionService from '../../../services/grammarQuestionService';
import GrammarQuestionList from '../../../components/Admin/GrammarQuestionList';
import '../../../assets/breadcrumb.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const GrammarQuestion = () => {
    const { grammarId } = useParams();
    const [grammarQuestions, setGrammarQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Set document title
    useEffect(() => {
        document.title = "Admin - Grammar Question";
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

    const retrieveGrammarQuestions = async () => {
        try {
            setIsLoading(true);
            console.log('Grammar ID:', grammarId);
            const result = await GrammarQuestionService.getGrammarQuestionsByGrammar(grammarId);

            setGrammarQuestions(result);
        } catch (error) {
            console.log(error);
            setGrammarQuestions([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (grammarId) {
            retrieveGrammarQuestions();
        }
    }, [grammarId]);

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
                        <Link to="/admin/grammar" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Grammar</Link>
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
                            <BookOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Grammar Question</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* GrammarQuestionList with AOS and loading state - matching Learner page */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu grammar questions...</p>
                    </div>
                ) : (
                    <GrammarQuestionList
                        grammarQuestions={grammarQuestions}
                        grammarId={grammarId}
                        retrieveGrammarQuestions={retrieveGrammarQuestions}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default GrammarQuestion;