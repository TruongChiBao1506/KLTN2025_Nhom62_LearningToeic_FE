import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import ExamList from '../../../components/Admin/ExamList';
import ExamService from '../../../services/examService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const Exam = () => {
    const [exams, setExams] = useState([]);
    const [showFullTest, setShowFullTest] = useState(true);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Exam";
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

    const retrieveExams = async () => {
        try {
            setIsLoading(true);
            let data;
            if (showFullTest) {
                data = await ExamService.getFullTest();
            } else {
                data = await ExamService.getMiniTest();
            }
            console.log(data);

            // Handle response structure
            if (data && Array.isArray(data)) {
                setExams(data);
            } else if (data && data.exams && Array.isArray(data.exams)) {
                setExams(data.exams);
            } else {
                setExams([]);
            }
        } catch (error) {
            console.log(error);
            setExams([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const switchToFullTest = () => {
        if (!showFullTest) {
            setShowFullTest(true);
        }
    };

    const switchToMiniTest = () => {
        if (showFullTest) {
            setShowFullTest(false);
        }
    };

    // Retrieve exams when showFullTest changes
    useEffect(() => {
        retrieveExams();
    }, [showFullTest]);

    // Initial load
    useEffect(() => {
        retrieveExams();
    }, []);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS */}
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
                <Breadcrumb separator={null} style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-bg-primary)' }}>
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
                            <FileTextOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Exam</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* Button Container */}
            <div
                className="button-container"
                data-aos="fade-in"
                data-aos-duration="800"
                data-aos-delay="300"
            >
                <button
                    type="button"
                    className={showFullTest ? 'active' : ''}
                    onClick={switchToFullTest}
                >
                    FullTest
                </button>
                <button
                    type="button"
                    className={!showFullTest ? 'active' : ''}
                    onClick={switchToMiniTest}
                >
                    MiniTest
                </button>
            </div>

            {/* ExamList with AOS */}
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
                            Đang tải dữ liệu {showFullTest ? 'FullTest' : 'MiniTest'}...
                        </p>
                    </div>
                ) : (
                    <ExamList
                        exams={exams}
                        retrieveExams={retrieveExams}
                        showFullTest={showFullTest}
                        setShowFullTest={setShowFullTest}
                    />
                )}
            </div>
        </div>
    );
};

export default Exam;