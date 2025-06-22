import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFolder, faPen } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import QuestionService from '../../services/questionService';
import QuestionList from '../../components/IndicateQuestionList';
import '../../assets/breadcrumb.css';

const IndicateQuestion = () => {
    const { sectionId, testId } = useParams(); // Lấy sectionId và testId từ URL params
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Indicate Question";
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

    const retrieveQuestions = async () => {
        try {
            setIsLoading(true);
            console.log('Section ID:', sectionId);
            console.log('Test ID:', testId);
            
            const result = await QuestionService.getQuestionsBySection(sectionId);
            setQuestions(result);
            console.log('Questions:', result);
        } catch (error) {
            console.log('Error fetching questions:', error);
            setQuestions([]); // Set empty array on error
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
                        <li>
                            <FontAwesomeIcon icon={faHouse} />
                            <Link to="/admin/section">
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Section
                                </button>
                            </Link>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faFolder} />
                            <Link to={`/admin/section/${sectionId}/test`}>
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Test
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faPen} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Indicate Question
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* QuestionList with AOS */}
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