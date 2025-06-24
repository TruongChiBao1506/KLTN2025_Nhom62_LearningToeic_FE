import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpellCheck, faBook } from '@fortawesome/free-solid-svg-icons';
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
            {/*Breadcrumb with AOS - matching Learner page */}
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li>
                            <FontAwesomeIcon icon={faSpellCheck} />
                            <Link to="/admin/grammar">
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Grammar
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faBook} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Grammar Question
                            </button>
                        </li>
                    </ol>
                </nav>
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