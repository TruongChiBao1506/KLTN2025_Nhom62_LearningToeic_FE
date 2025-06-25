import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import QuestionList from '../../../components/Admin/QuestionBySectionList';
import QuestionService from '../../../services/questionService';
import './style.css';

const QuestionBySection = () => {
    const sectionId = useParams().sectionId;
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        <div>
            {/* Breadcrumb */}
            <div className="mt-2 bg-white shadow-lg rounded-1">
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li>
                            <FontAwesomeIcon icon={faHouse} />
                            <Link to="/admin/sections">
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Section
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faCircleQuestion} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Question
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Question List */}
            {isLoading ? (
                <div className="text-center py-5">
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
    );
};

export default QuestionBySection;