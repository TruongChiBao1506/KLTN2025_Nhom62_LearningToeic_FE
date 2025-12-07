import React, { useState, useEffect, useCallback } from 'react';
import TestService from '../../../../services/testService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './index.css';

const TableSectionNo6To7 = ({ paginatedQuestions, currentPage, ITEMS_PER_PAGE, sectionId, testId, retrieveQuestions }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    const fetchQuestions = useCallback(async () => {
        try {
            const questions = await TestService.getQuestionsByTestId(testId);
            console.log(questions);
            setSelectedQuestions(questions.map(question => question._id)); // ✅ Sử dụng ._id
            // await fetchQuestionUsageCounts(); // Placeholder, function not defined in original
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }, [testId]);

    const autoRandom = () => {
        const maxSelected = 2;
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
        const newSelected = randomIndexes.map(index => paginatedQuestions[index]._id);
        setSelectedQuestions(newSelected);
        setIsSubmitEnabled(true);
        console.log(newSelected);
    };

    const submitQuestions = async () => {
        if (selectedQuestions.length < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng chọn đủ 2 câu hỏi trước khi submit.',
            });
            return;
        }
        try {
            const response = await TestService.addOrUpdateQuestionToTest(testId, selectedQuestions);
            console.log(response);
            toast.success('Chỉ định câu hỏi Speaking (6-7) thành công ', {
                autoClose: 1000
            });
        } catch (error) {
            console.log(error);
            toast.error('Chỉ định câu hỏi Speaking (6-7) thất bại ', {
                autoClose: 1000
            });
        }
        setSelectedQuestions([]);
        setIsSubmitEnabled(false);
        retrieveQuestions();
        fetchQuestions();
    };

    const handleCheckboxChange = (questionId) => {
        if (selectedQuestions.includes(questionId)) {
            setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
        } else if (selectedQuestions.length < 2) {
            setSelectedQuestions([...selectedQuestions, questionId]);
        }
        // Update isSubmitEnabled based on length
        setIsSubmitEnabled(selectedQuestions.length >= 2);
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
                        <th><button className="btn btn-primary rounded-5 disabled">USED</button></th>
                        <th>SELECTED {selectedQuestions.length}/2</th>
                        <th>No.</th>
                        <th>TEXT</th>
                        <th>SUGGESTED ANSWER</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedQuestions.map((question, index) => (
                        <tr key={question.questionId} className="table-row shadow-on-hover align-middle">
                            <td><button style={{ fontSize: '12px' }} className="btn btn-success rounded-5 disabled">{question.usage}</button></td>
                            <td>
                                <input
                                    type="checkbox"
                                    id={`checkbox_${question._id}`}
                                    checked={selectedQuestions.includes(question._id)}
                                    onChange={() => handleCheckboxChange(question._id)}
                                    disabled={selectedQuestions.length >= 2 && !selectedQuestions.includes(question._id)}
                                />
                            </td>
                            <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                            <td>{question.questionText}</td>
                            <td>{question.suggestedAnswer}</td>
                        </tr>
                    ))}
                    {paginatedQuestions.length === 0 && (
                        <tr>
                            <td colSpan="5">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableSectionNo6To7;