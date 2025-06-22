import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import ExamList from '../../components/ExamList';
import ExamService from '../../services/examService';
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
            duration: 150,
            delay: 0,
            easing: 'ease-in-out',
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
        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="800"
                data-aos-delay="100"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li className="current">
                            <FontAwesomeIcon icon={faFile} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Exam
                            </button>
                        </li>
                    </ol>
                </nav>
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
                data-aos-duration="1000"
                data-aos-delay="400"
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
                    />
                )}
            </div>
        </div>
    );
};

export default Exam;