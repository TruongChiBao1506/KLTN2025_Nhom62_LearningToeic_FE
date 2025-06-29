import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestService from "../../../../services/testService";
import "./style.css";

const MAX_SELECTED = 30;

const Part5QuestionList = ({
    paginatedQuestions,
    currentPage,
    ITEMS_PER_PAGE,
    sectionId,
    testId,
    retrieveQuestions
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
        const totalQuestions = paginatedQuestions.length;
        if (totalQuestions < MAX_SELECTED) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Không đủ câu hỏi để random.",
            });
            return;
        }
        const randomIndexes = [];
        while (randomIndexes.length < MAX_SELECTED) {
            const randomIndex = Math.floor(Math.random() * totalQuestions);
            if (!randomIndexes.includes(randomIndex)) {
                randomIndexes.push(randomIndex);
            }
        }
        setSelectedQuestions(randomIndexes.map(idx => paginatedQuestions[idx]._id));
        setIsSubmitEnabled(true);
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
            <div className="d-flex justify-content-end mb-2">
                <div className="button" onClick={autoRandom}>
                    <div>RANDOM</div>
                </div>
                <div
                    className="button ms-1"
                    onClick={isSubmitEnabled ? submitQuestions : undefined}
                    style={{ opacity: isSubmitEnabled ? 1 : 0.5, pointerEvents: isSubmitEnabled ? "auto" : "none" }}
                >
                    <div>SUBMIT</div>
                </div>
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