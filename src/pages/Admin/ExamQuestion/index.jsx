import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faClipboardQuestion } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import ExamQuestionService from '../../../services/examQuestionService';
import ExamQuestionList from '../../../components/Admin/ExamQuestionList';
import '../../../assets/breadcrumb.css';

const ExamQuestion = () => {
    const { examId } = useParams();
    const [examQuestions, setExamQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    useEffect(() => {
        document.title = "Admin - Exam Question";
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

    const retrieveExamQuestions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('🔍 Fetching exam questions for Exam ID:', examId);
            
            // Gọi API để lấy danh sách exam questions dựa trên examId
            const result = await ExamQuestionService.getQuestionsByExamId(examId);
            
            console.log('🔍 Raw API response:', result);
            
            // ✅ Handle different response structures
            if (result && typeof result === 'object') {
                // Check if result has examQuestions array (object response)
                if (result.examQuestions && Array.isArray(result.examQuestions)) {
                    // Server returns: { examQuestions: [...], currentPage: 1, totalPages: 1, total: 1 }
                    const questions = result.examQuestions;
                    
                    const mappedQuestions = questions.map(question => ({
                        // Map các field từ server response
                        questionId: question._id || question.questionId,
                        id: question._id || question.id,
                        _id: question._id,
                        
                        // Content fields
                        questionContent: question.examQuestionContent || question.questionContent,
                        examQuestionContent: question.examQuestionContent,
                        
                        // Question type and parts
                        questionType: question.questionType,
                        partNumber: question.partNumber,
                        
                        // Options (if multiple choice)
                        optionA: question.optionA,
                        optionB: question.optionB,
                        optionC: question.optionC,
                        optionD: question.optionD,
                        
                        // Correct answer
                        correctAnswer: question.correctAnswer,
                        correctOption: question.correctOption || question.correctAnswer,
                        
                        // Explanation
                        questionExplanation: question.explanation || question.questionExplanation,
                        explanation: question.explanation,
                        
                        // Audio/Image paths
                        audioPath: question.audioPath,
                        imagePath: question.imagePath,
                        
                        // Status
                        questionStatus: question.examQuestionStatus || question.questionStatus,
                        examQuestionStatus: question.examQuestionStatus,
                        status: question.examQuestionStatus || question.questionStatus,
                        
                        // Exam info
                        exam: question.exam,
                        examId: question.exam?._id || examId,
                        examName: question.exam?.examName,
                        
                        // Timestamps
                        createdAt: question.createdAt,
                        updatedAt: question.updatedAt,
                        
                        // Keep original for debugging
                        _original: question
                    }));
                    
                    setExamQuestions(mappedQuestions);
                    setPagination({
                        currentPage: result.currentPage || 1,
                        totalPages: result.totalPages || 1,
                        totalItems: result.total || 0,
                        itemsPerPage: Math.ceil((result.total || 0) / (result.totalPages || 1))
                    });
                    
                    console.log('✅ Exam Questions mapped:', mappedQuestions);
                    console.log('✅ Pagination info:', {
                        currentPage: result.currentPage,
                        totalPages: result.totalPages,
                        totalItems: result.total
                    });
                    
                } else if (Array.isArray(result)) {
                    // Direct array response (Vue style)
                    const mappedQuestions = result.map(question => ({
                        questionId: question._id || question.questionId,
                        id: question._id || question.id,
                        questionContent: question.examQuestionContent || question.questionContent,
                        questionType: question.questionType,
                        partNumber: question.partNumber,
                        optionA: question.optionA,
                        optionB: question.optionB,
                        optionC: question.optionC,
                        optionD: question.optionD,
                        correctAnswer: question.correctAnswer,
                        questionExplanation: question.explanation || question.questionExplanation,
                        audioPath: question.audioPath,
                        imagePath: question.imagePath,
                        questionStatus: question.examQuestionStatus || question.questionStatus || 1,
                        examId: examId,
                        createdAt: question.createdAt,
                        updatedAt: question.updatedAt,
                        _original: question
                    }));
                    
                    setExamQuestions(mappedQuestions);
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: result.length,
                        itemsPerPage: result.length || 10
                    });
                    console.log('✅ Exam Questions (direct array):', mappedQuestions);
                } else {
                    // Empty or unexpected response
                    setExamQuestions([]);
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 0,
                        itemsPerPage: 10
                    });
                    console.log('📝 No exam questions found or unexpected response structure');
                }
            } else {
                // Null or undefined result
                setExamQuestions([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                console.log('📝 No exam questions found');
            }
            
        } catch (error) {
            console.log('❌ Error fetching exam questions:', error);
            
            // Check if it's a 404 (no data) vs real error
            if (error.response?.status === 404) {
                console.log('📝 Exam chưa có questions - hiển thị empty state');
                setExamQuestions([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                setError(null); // Don't show error for empty data
            } else {
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
                setExamQuestions([]);
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

    // Load data when component mounts or examId changes
    useEffect(() => {
        if (examId) {
            retrieveExamQuestions();
        }
    }, [examId]);

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
                            <FontAwesomeIcon icon={faFile} />
                            <Link to="/admin/exam">
                                <button className="btn btn-link text-decoration-none text-dark fw-bolder">
                                    Exam
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faClipboardQuestion} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Exam Question ({pagination.totalItems} questions)
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>
            {/* ExamQuestionList with AOS */}
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
                            Đang tải dữ liệu exam questions cho exam {examId}...
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
                            <FontAwesomeIcon icon={faClipboardQuestion} size="2x" className="mb-3" />
                            <h5>Lỗi tải dữ liệu</h5>
                            <p>{error}</p>
                            <button 
                                className="btn btn-outline-danger"
                                onClick={retrieveExamQuestions}
                            >
                                <FontAwesomeIcon icon={faClipboardQuestion} className="me-2" />
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        /* Exam Question List */
                        <ExamQuestionList
                            examQuestions={examQuestions}
                            examId={examId}
                            retrieveExamQuestions={retrieveExamQuestions}
                            isLoading={isLoading}
                            pagination={pagination}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default ExamQuestion;