import React, { useState, useEffect, useCallback } from 'react';
import TestService from '../../../../services/testService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './index.css';

const TableSectionNo11 = ({ paginatedQuestions, currentPage, ITEMS_PER_PAGE, getImageUrl, sectionId, testId, retrieveQuestions }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    const fetchQuestions = useCallback(async () => {
        try {
            const questions = await TestService.getQuestionsByTestId(testId);
            console.log('📥 Fetched questions for test', testId, ':', questions);
            const questionIds = questions.map(question => question._id); // ✅ Sử dụng ._id
            console.log('📋 Setting selectedQuestions to:', questionIds);
            setSelectedQuestions(questionIds);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }, [testId]);

    const autoRandom = () => {
        const maxSelected = 1;
        const totalQuestions = paginatedQuestions.length;
        if (totalQuestions < maxSelected) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không đủ câu hỏi để random.',
            });
            return;
        }
        const randomIndexes = [];
        while (randomIndexes.length < maxSelected) {
            const randomIndex = Math.floor(Math.random() * totalQuestions);
            if (!randomIndexes.includes(randomIndex)) {
                randomIndexes.push(randomIndex);
            }
        }
        const newSelected = randomIndexes.map(index => paginatedQuestions[index]._id); // ✅ Sử dụng ._id
        setSelectedQuestions(newSelected);
        setIsSubmitEnabled(true);
        console.log('🎲 Auto random completed, selectedQuestions:', newSelected);
    };

    const submitQuestions = async () => {
        console.log('🔍 Submit triggered, selectedQuestions:', selectedQuestions);
        console.log('🔍 Selected questions count:', selectedQuestions.length);

        if (selectedQuestions.length < 1) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng chọn câu hỏi trước khi submit.',
            });
            return;
        }

        console.log('🚀 Calling API with testId:', testId, 'and questionIds:', selectedQuestions);

        try {
            const response = await TestService.addOrUpdateQuestionToTest(testId, selectedQuestions);
            console.log('✅ API call successful, response:', response);
            toast.success('Chỉ định câu hỏi Phần 5 thành công ', {
                autoClose: 1000
            });
        } catch (error) {
            console.log('❌ API call failed, error:', error);
            toast.error('Chỉ định câu hỏi Phần 5 thất bại ', {
                autoClose: 1000
            });
        }
        setSelectedQuestions([]);
        setIsSubmitEnabled(false);
        retrieveQuestions();
        fetchQuestions();
    };

    const handleCheckboxChange = (questionId) => {
        setSelectedQuestions(prev => {
            let newSelected;
            if (prev.includes(questionId)) {
                newSelected = prev.filter(id => id !== questionId);
            } else if (prev.length < 1) {
                newSelected = [...prev, questionId];
            } else {
                return prev; // Prevent adding more than 1
            }
            // Update isSubmitEnabled based on new length
            setIsSubmitEnabled(newSelected.length >= 1);
            return newSelected;
        });
    };

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    return (
        <div>
            <div className="d-flex justify-content-end mb-3 gap-3">
                <button
                    className="btn-custom btn-random d-flex align-items-center"
                    onClick={autoRandom}
                    type="button"
                >
                    <FontAwesomeIcon icon={faRandom} className="me-2" />
                    RANDOM
                </button>
                <button
                    className="btn-custom btn-submit d-flex align-items-center"
                    onClick={isSubmitEnabled ? submitQuestions : undefined}
                    type="button"
                    disabled={!isSubmitEnabled}
                >
                    <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                    SUBMIT
                </button>
            </div>
            <table className="table text-center table-hover shadow">
                <thead className="shadow">
                    <tr className="align-middle">
                        <th>
                            <button className="btn btn-primary rounded-5 disabled">USED</button>
                        </th>
                        <th>SELECTED {selectedQuestions.length}/1</th>
                        <th>No.</th>
                        <th>IMAGE</th>
                        <th>TEXT</th>
                        <th>CORRECT OPT</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedQuestions.map((question, index) => (
                        <tr key={question._id} className="table-row shadow-on-hover align-middle">
                            <td><button style={{ fontSize: '12px' }} className="btn btn-success rounded-5 disabled">{question.usage}</button></td>
                            <td>
                                <input
                                    type="checkbox"
                                    id={`checkbox_${question._id}`}
                                    checked={selectedQuestions.includes(question._id)}
                                    onChange={() => handleCheckboxChange(question._id)}
                                    disabled={selectedQuestions.length >= 1 && !selectedQuestions.includes(question._id)}
                                />
                            </td>
                            <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                            <td>
                                <img src={getImageUrl(question.questionImage)} alt="Question" className="question-image" />
                            </td>
                            <td>{question.questionText}</td>
                            <td>{question.suggestedAnswer}</td>
                        </tr>
                    ))}
                    {paginatedQuestions.length === 0 && (
                        <tr>
                            <td colSpan="6">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableSectionNo11;