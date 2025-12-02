import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';

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
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    // Fix the mapping logic
    const retrieveExamQuestions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('🔍 Fetching exam questions for Exam ID:', examId);

            const result = await ExamQuestionService.getQuestionsByExamId(examId);
            console.log('🔍 Raw API response:', result);

            if (result && typeof result === 'object') {
                if (result.examQuestions && Array.isArray(result.examQuestions)) {
                    const mappedQuestions = result.examQuestions.map(question => ({
                        // Map các field từ server response
                        questionId: question._id || question.questionId,
                        id: question._id || question.id,
                        _id: question._id,
                        examQuestionId: question._id,

                        // Content fields
                        questionContent: question.questionContent || question.examQuestionContent,
                        examQuestionContent: question.examQuestionContent || question.questionContent,

                        // Question type and parts
                        questionType: question.questionType,
                        questionPart: question.questionPart || question.partNumber,
                        partNumber: question.partNumber || question.questionPart,

                        // Options (if multiple choice)
                        optionA: question.optionA,
                        optionB: question.optionB,
                        optionC: question.optionC,
                        optionD: question.optionD,

                        // Correct answer
                        correctAnswer: question.correctAnswer || question.correctOption,
                        correctOption: question.correctOption || question.correctAnswer,

                        // Media fields
                        questionImage: question.questionImage || question.imagePath || '',
                        questionAudio: question.questionAudio || question.audioPath || '',
                        questionScript: question.questionScript || question.script || '',
                        questionPassage: question.questionPassage || question.passage || '',

                        // Explanation
                        questionExplanation: question.questionExplanation || question.explanation || '',
                        explanation: question.explanation || question.questionExplanation,

                        // Status
                        questionStatus: question.questionStatus !== undefined ? question.questionStatus :
                            (question.examQuestionStatus !== undefined ? question.examQuestionStatus : 1),
                        examQuestionStatus: question.examQuestionStatus || question.questionStatus,
                        status: question.questionStatus || question.examQuestionStatus || 1,

                        // Exam info
                        exam: question.exam,
                        examId: question.exam?._id || question.examId || examId,
                        examName: question.exam?.examName,

                        // Order number for pagination
                        orderNumber: question.orderNumber,

                        // Timestamps
                        createdAt: question.createdAt,
                        updatedAt: question.updatedAt,

                        // Keep original for debugging
                        _original: question
                    }));

                    console.log('  Mapped questions sample:', mappedQuestions[0]);
                    console.log('  Question part value:', mappedQuestions[0]?.questionPart);

                    setExamQuestions(mappedQuestions);
                    setPagination({
                        currentPage: result.currentPage || 1,
                        totalPages: result.totalPages || 1,
                        totalItems: result.total || mappedQuestions.length,
                        itemsPerPage: Math.ceil((result.total || mappedQuestions.length) / (result.totalPages || 1))
                    });

                } else if (Array.isArray(result)) {
                    // Direct array response
                    const mappedQuestions = result.map((question, index) => ({
                        questionId: question._id || question.questionId,
                        id: question._id || question.id,
                        _id: question._id,
                        examQuestionId: question._id,

                        // Content
                        questionContent: question.questionContent || question.examQuestionContent,

                        // Parts - Important fix here
                        questionPart: question.questionPart || question.partNumber,
                        partNumber: question.partNumber || question.questionPart,

                        // Options
                        optionA: question.optionA || '',
                        optionB: question.optionB || '',
                        optionC: question.optionC || '',
                        optionD: question.optionD || '',

                        // Correct answer
                        correctOption: question.correctOption || question.correctAnswer,

                        // Media
                        questionImage: question.questionImage || question.imagePath || '',
                        questionAudio: question.questionAudio || question.audioPath || '',
                        questionScript: question.questionScript || question.script || '',
                        questionPassage: question.questionPassage || question.passage || '',
                        questionExplanation: question.questionExplanation || question.explanation || '',

                        // Status
                        questionStatus: question.questionStatus !== undefined ? question.questionStatus : 1,

                        // Order number
                        orderNumber: index + 1,

                        // Exam info
                        examId: examId,
                        exam: question.exam,

                        // Timestamps
                        createdAt: question.createdAt,
                        updatedAt: question.updatedAt,

                        _original: question
                    }));

                    console.log('  Direct array mapped questions:', mappedQuestions[0]);

                    setExamQuestions(mappedQuestions);
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: result.length,
                        itemsPerPage: result.length || 10
                    });
                } else {
                    // Empty response
                    setExamQuestions([]);
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 0,
                        itemsPerPage: 10
                    });
                    console.log('📝 No exam questions found');
                }
            } else {
                setExamQuestions([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                console.log('📝 No result data');
            }

        } catch (error) {
            console.log('❌ Error fetching exam questions:', error);

            if (error.response?.status === 404) {
                console.log('📝 Exam chưa có questions - hiển thị empty state');
                setExamQuestions([]);
                setError(null);
            } else {
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
                setExamQuestions([]);
            }

            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10
            });
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
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with solid colors */}
            <div
                style={{
                    background: '#2C5F8D',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 4px 8px rgba(44, 95, 141, 0.12)',
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
                            background: '#3498DB',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(44, 95, 141, 0.15)'
                        }}>
                            <FileTextOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Exam</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span style={{
                            background: '#3498DB',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(44, 95, 141, 0.15)'
                        }}>
                            <QuestionCircleOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Exam Question</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* ExamQuestionList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
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
                            <QuestionCircleOutlined style={{ fontSize: 32, color: 'var(--color-danger)', marginBottom: 12 }} />
                            <h5>Lỗi tải dữ liệu</h5>
                            <p>{error}</p>
                            <button
                                className="btn btn-outline-danger"
                                onClick={retrieveExamQuestions}
                            >
                                <QuestionCircleOutlined style={{ marginRight: 8 }} />
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