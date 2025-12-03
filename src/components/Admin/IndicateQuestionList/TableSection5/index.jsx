import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestService from "../../../../services/testService";
import "./style.css";
import { faRandom, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MAX_SELECTED = 30;

const Part5QuestionList = ({
    paginatedQuestions,
    currentPage,
    ITEMS_PER_PAGE,
    sectionId,
    testId,
    retrieveQuestions,
    allQuestions = [] // ✅ Add prop for all questions (not paginated)
}) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    // Fetch selected questions for this test
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const questions = await TestService.getQuestionsByTestId(testId);
                setSelectedQuestions(questions.map(q => q._id));
            } catch {
                setSelectedQuestions([]);
            }
        };
        fetchQuestions();
    }, [testId]);

    useEffect(() => {
        setIsSubmitEnabled(selectedQuestions.length === MAX_SELECTED);
    }, [selectedQuestions]);

    const handleCheckboxChange = (questionId) => {
        if (selectedQuestions.includes(questionId)) {
            setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
        } else if (selectedQuestions.length < MAX_SELECTED) {
            setSelectedQuestions([...selectedQuestions, questionId]);
        }
    };

    const autoRandom = () => {
        // ✅ Use allQuestions if available, otherwise fallback to paginatedQuestions
        const questionsToUse = allQuestions.length > 0 ? allQuestions : paginatedQuestions;
        const totalQuestions = questionsToUse.length;
        
        if (totalQuestions < MAX_SELECTED) {
            Swal.fire({
                icon: "warning",
                title: "Không đủ câu hỏi",
                text: `Hiện chỉ có ${totalQuestions}/${MAX_SELECTED} câu hỏi. Vui lòng bổ sung thêm câu hỏi để đủ số lượng.`,
            });
            setSelectedQuestions([]);
            setIsSubmitEnabled(false);
            return;
        }
        
        // ✅ Fisher-Yates shuffle
        const shuffled = [...questionsToUse];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // ✅ Take first MAX_SELECTED questions
        const randomQuestions = shuffled.slice(0, MAX_SELECTED).map(q => q._id);
        setSelectedQuestions(randomQuestions);
        setIsSubmitEnabled(true);
        
        // ✅ Show success message
        Swal.fire({
            icon: "success",
            title: "Thành công",
            text: `Đã random ${MAX_SELECTED} câu hỏi từ tổng ${totalQuestions} câu.`,
            timer: 2000,
            showConfirmButton: false
        });
    };

    const submitQuestions = async () => {
        if (selectedQuestions.length < MAX_SELECTED) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: `Vui lòng chọn đủ ${MAX_SELECTED} câu hỏi trước khi submit.`,
            });
            return;
        }
        try {
            await TestService.addOrUpdateQuestionToTest(testId, selectedQuestions);
            toast.success("Chỉ định câu hỏi Phần 5 thành công", { autoClose: 1000 });
        } catch {
            toast.error("Chỉ định câu hỏi Phần 5 thất bại", { autoClose: 1000 });
        }
        setSelectedQuestions([]);
        setIsSubmitEnabled(false);
        if (retrieveQuestions) retrieveQuestions();
    };

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
                        <th>SELECTED {selectedQuestions.length}/30</th>
                        <th>No.</th>
                        <th>CONTENT</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>CORRECT OPT</th>
                        <th>EXPLANATION</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedQuestions && paginatedQuestions.length > 0 ? (
                        paginatedQuestions.map((question, index) => (
                            <tr key={question._id} className="table-row shadow-on-hover align-middle">
                                <td>
                                    <button style={{ fontSize: 12 }} className="btn btn-success rounded-5 disabled">
                                        {question.usage}
                                    </button>
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        id={`checkbox_${question._id}`}
                                        checked={selectedQuestions.includes(question._id)}
                                        onChange={() => handleCheckboxChange(question._id)}
                                        disabled={
                                            selectedQuestions.length >= MAX_SELECTED &&
                                            !selectedQuestions.includes(question._id)
                                        }
                                    />
                                </td>
                                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td>{question.questionContent}</td>
                                <td>{question.optionA}</td>
                                <td>{question.optionB}</td>
                                <td>{question.optionC}</td>
                                <td>{question.optionD}</td>
                                <td>{question.correctOption}</td>
                                <td dangerouslySetInnerHTML={{ __html: question.questionExplanation }} />
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Part5QuestionList;