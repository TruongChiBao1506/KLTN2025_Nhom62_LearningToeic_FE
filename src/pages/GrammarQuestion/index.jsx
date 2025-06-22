import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpellCheck, faBook } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import GrammarQuestionService from '../../services/grammarQuestionService';
import GrammarQuestionList from '../../components/GrammarQuestionList';
import '../../assets/breadcrumb.css';

const GrammarQuestion = () => {
    const { grammarId } = useParams();
    const [grammarQuestions, setGrammarQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    useEffect(() => {
        document.title = "Admin - Grammar Question";
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

    const retrieveGrammarQuestions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('🔍 Fetching grammar questions for Grammar ID:', grammarId);
            
            // Gọi API để lấy danh sách grammar questions dựa trên grammarId
            const result = await GrammarQuestionService.getGrammarQuestionsByGrammar(grammarId);
            
            console.log('🔍 Raw API response:', result);
            
            // ✅ Handle the correct response structure from server
            if (result && typeof result === 'object') {
                // Server returns: { grammarQuestions: [...], currentPage: 1, totalPages: 1, total: 1 }
                const questions = result.grammarQuestions || [];
                
                // ✅ Map server response fields to component expected structure
                const mappedQuestions = questions.map(question => ({
                    // Map các field từ server response
                    questionId: question._id,
                    id: question._id,
                    _id: question._id,
                    
                    // Content fields - map từ server naming
                    questionContent: question.grammarQuestionContent,
                    grammarQuestionContent: question.grammarQuestionContent,
                    
                    // Options
                    optionA: question.optionA,
                    optionB: question.optionB,
                    optionC: question.optionC,
                    optionD: question.optionD,
                    
                    // Correct option - server trả về letter (C), cần map sang actual value
                    correctOption: question.correctOption, // Keep letter for radio selection
                    correctOptionValue: getCorrectOptionValue(question), // Get actual value
                    
                    // Explanation
                    questionExplanation: question.explanation,
                    explanation: question.explanation,
                    
                    // Status
                    questionStatus: question.grammarQuestionStatus,
                    grammarQuestionStatus: question.grammarQuestionStatus,
                    status: question.grammarQuestionStatus,
                    
                    // Grammar info
                    grammar: question.grammar,
                    grammarId: question.grammar?._id,
                    grammarName: question.grammar?.grammarName,
                    
                    // Timestamps
                    createdAt: question.createdAt,
                    updatedAt: question.updatedAt,
                    
                    // Keep original for debugging
                    _original: question
                }));
                
                setGrammarQuestions(mappedQuestions);
                setPagination({
                    currentPage: result.currentPage || 1,
                    totalPages: result.totalPages || 1,
                    totalItems: result.total || 0, // ✅ Server sử dụng 'total' thay vì 'totalItems'
                    itemsPerPage: Math.ceil((result.total || 0) / (result.totalPages || 1))
                });
                
                console.log('✅ Grammar Questions mapped:', mappedQuestions);
                console.log('✅ Pagination info:', {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalItems: result.total,
                    itemsPerPage: Math.ceil((result.total || 0) / (result.totalPages || 1))
                });
            } else if (Array.isArray(result)) {
                // Fallback: if result is directly an array (Vue style response)
                const mappedQuestions = result.map(question => ({
                    questionId: question._id || question.questionId,
                    id: question._id || question.id,
                    questionContent: question.grammarQuestionContent || question.questionContent,
                    optionA: question.optionA,
                    optionB: question.optionB,
                    optionC: question.optionC,
                    optionD: question.optionD,
                    correctOption: question.correctOption,
                    questionExplanation: question.explanation || question.questionExplanation,
                    questionStatus: question.grammarQuestionStatus || question.questionStatus || 1,
                    createdAt: question.createdAt,
                    updatedAt: question.updatedAt,
                    _original: question
                }));
                
                setGrammarQuestions(mappedQuestions);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: result.length,
                    itemsPerPage: result.length || 10
                });
                console.log('✅ Grammar Questions (direct array):', mappedQuestions);
            } else {
                // Empty or null result
                setGrammarQuestions([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                console.log('📝 No grammar questions found');
            }
            
        } catch (error) {
            console.log('❌ Error fetching grammar questions:', error);
            
            // Check if it's a 404 (no data) vs real error
            if (error.response?.status === 404) {
                console.log('📝 Grammar chưa có questions - hiển thị empty state');
                setGrammarQuestions([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                setError(null); // Don't show error for empty data
            } else {
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
                setGrammarQuestions([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Helper function để map correct option letter sang actual value
    const getCorrectOptionValue = (question) => {
        const { correctOption, optionA, optionB, optionC, optionD } = question;
        switch (correctOption) {
            case 'A':
                return optionA;
            case 'B':
                return optionB;
            case 'C':
                return optionC;
            case 'D':
                return optionD;
            default:
                return correctOption; // Fallback
        }
    };

    useEffect(() => {
        if (grammarId) {
            retrieveGrammarQuestions();
        }
    }, [grammarId]);

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
                                Grammar Question ({pagination.totalItems} questions)
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* GrammarQuestionList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="400"
            >
                {/* Loading State */}
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
                            Đang tải dữ liệu grammar questions cho grammar {grammarId}...
                        </p>
                    </div>
                ) : (
                    /* Error State */
                    error ? (
                        <div
                            className="alert alert-danger text-center"
                            data-aos="fade-in"
                            data-aos-duration="500"
                        >
                            <FontAwesomeIcon icon={faBook} size="2x" className="mb-3" />
                            <h5>Lỗi tải dữ liệu</h5>
                            <p>{error}</p>
                            <button 
                                className="btn btn-outline-danger"
                                onClick={retrieveGrammarQuestions}
                            >
                                <FontAwesomeIcon icon={faBook} className="me-2" />
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        /* Grammar Question List */
                        <GrammarQuestionList
                            grammarQuestions={grammarQuestions}
                            grammarId={grammarId}
                            retrieveGrammarQuestions={retrieveGrammarQuestions}
                            isLoading={isLoading}
                            pagination={pagination}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default GrammarQuestion;