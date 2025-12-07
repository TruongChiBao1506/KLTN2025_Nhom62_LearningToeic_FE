import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TestService from '../../../../services/testService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './index.css';

const TableSectionNo5To7 = ({ paginatedQuestions, currentPage, ITEMS_PER_PAGE, sectionId, testId, retrieveQuestions }) => {
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

    const groupedQuestionMap = useMemo(() => {
        const groups = {};
        paginatedQuestions.forEach(question => {
            const groupId = question.questionGroup.groupId;
            if (!groups[groupId]) {
                groups[groupId] = [];
            }
            groups[groupId].push(question);
        });
        return groups;
    }, [paginatedQuestions]);

    const isGroupSelected = (groupedQuestions) => {
        return groupedQuestions.every(q => selectedQuestions.includes(q._id)); // ✅ Sử dụng ._id
    };

    const selectGroup = (groupedQuestions) => {
        const groupQuestionIds = groupedQuestions.map(q => q._id); // ✅ Sử dụng ._id
        setSelectedQuestions(prev => {
            const allSelected = groupQuestionIds.every(id => prev.includes(id));
            let newSelected;
            if (allSelected) {
                newSelected = prev.filter(id => !groupQuestionIds.includes(id));
            } else {
                newSelected = [...prev, ...groupQuestionIds.filter(id => !prev.includes(id))]; // Avoid duplicates
            }
            // Update isSubmitEnabled based on new length
            setIsSubmitEnabled(newSelected.length >= 3);
            return newSelected;
        });
    };

    const autoRandom = () => {
        const maxSelected = 3;
        const totalGroups = Object.keys(groupedQuestionMap).length;

        if (totalGroups < 1) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không đủ nhóm câu hỏi để random.',
            });
            return;
        }

        const randomGroups = [];
        while (randomGroups.length < 1) {
            const randomGroupIndex = Math.floor(Math.random() * totalGroups);
            const randomGroupId = Object.keys(groupedQuestionMap)[randomGroupIndex];

            if (!randomGroups.includes(randomGroupId)) {
                randomGroups.push(randomGroupId);
            }
        }

        const randomQuestions = [];
        for (const groupId of randomGroups) {
            const groupQuestions = groupedQuestionMap[groupId];
            const randomIndexes = [];

            while (randomIndexes.length < Math.ceil(maxSelected / 1)) {
                const randomIndex = Math.floor(Math.random() * groupQuestions.length);
                if (!randomIndexes.includes(randomIndex)) {
                    randomIndexes.push(randomIndex);
                }
            }

            for (const randomIndex of randomIndexes) {
                randomQuestions.push(groupQuestions[randomIndex]._id); // ✅ Sử dụng ._id
            }
        }

        setSelectedQuestions(randomQuestions);
        setIsSubmitEnabled(true);
        console.log('🎲 Auto random completed, selectedQuestions:', randomQuestions);
    };

    const submitQuestions = async () => {
        console.log('🔍 Submit triggered, selectedQuestions:', selectedQuestions);
        console.log('🔍 Selected questions count:', selectedQuestions.length);
        
        if (selectedQuestions.length < 3) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng chọn đủ 3 câu hỏi trước khi submit.',
            });
            return;
        }
        
        console.log('🚀 Calling API with testId:', testId, 'and questionIds:', selectedQuestions);
        
        try {
            const response = await TestService.addOrUpdateQuestionToTest(testId, selectedQuestions);
            console.log('✅ API call successful, response:', response);
            toast.success('Chỉ định câu hỏi Speaking (5-7) thành công ', {
                autoClose: 1000
            });
        } catch (error) {
            console.log('❌ API call failed, error:', error);
            toast.error('Chỉ định câu hỏi Speaking (5-7) thất bại ', {
                autoClose: 1000
            });
        }
        setSelectedQuestions([]);
        setIsSubmitEnabled(false);
        retrieveQuestions();
        fetchQuestions();
    };

    const getLimitedPassage = (groupText) => {
        const MAX_PASSAGE_LENGTH = 200;
        if (groupText.length > MAX_PASSAGE_LENGTH) {
            return groupText.slice(0, MAX_PASSAGE_LENGTH) + '...';
        } else {
            return groupText;
        }
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
            <table className="table text-center table-bordered shadow">
                <thead className="shadow">
                    <tr className="align-middle">
                        <th><button className="btn btn-primary rounded-5 disabled">USED</button></th>
                        <th>SELECTED {selectedQuestions.length}/3</th>
                        <th>No.</th>
                        <th>PASSAGE</th>
                        <th>CONTENT</th>
                        <th>CORRECT ANS</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedQuestionMap).map(([groupId, groupedQuestions], groupIndex) =>
                        groupedQuestions.map((question, index) => (
                            <tr key={question._id} className="table-row shadow-on-hover align-middle">
                                {index === 0 && (
                                    <td rowSpan={groupedQuestions.length}>
                                        <button style={{ fontSize: '12px' }} className="btn btn-success rounded-5 disabled">
                                            {question.usage}
                                        </button>
                                    </td>
                                )}
                                {index === 0 && (
                                    <td rowSpan={groupedQuestions.length}>
                                        <input
                                            type="checkbox"
                                            id={`checkbox_${question._id}`}
                                            checked={isGroupSelected(groupedQuestions)}
                                            onChange={() => selectGroup(groupedQuestions)}
                                            disabled={selectedQuestions.length >= 3 && !isGroupSelected(groupedQuestions)}
                                        />
                                    </td>
                                )}
                                {index === 0 && (
                                    <td rowSpan={groupedQuestions.length}>
                                        {groupIndex + 1}
                                    </td>
                                )}
                                {index === 0 && (
                                    <td rowSpan={groupedQuestions.length}>
                                        <div
                                            title={question.questionGroup.groupText}
                                            dangerouslySetInnerHTML={{ __html: getLimitedPassage(question.questionGroup.groupText) }}
                                        />
                                    </td>
                                )}
                                <td>{question.questionContent}</td>
                                <td>{question.suggestedAnswer}</td>
                            </tr>
                        ))
                    )}
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

export default TableSectionNo5To7;