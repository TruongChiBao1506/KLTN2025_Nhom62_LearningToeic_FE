import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { faRandom, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestService from "../../../../services/testService";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IndicateQuestionList = ({
    paginatedQuestions,
    currentPage,
    ITEMS_PER_PAGE,
    getImageUrl,
    getAudioUrl,
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
            } catch (error) {
                setSelectedQuestions([]);
            }
        };
        fetchQuestions();
    }, [testId]);

    // Enable submit if enough questions are selected
    useEffect(() => {
        setIsSubmitEnabled(selectedQuestions.length === 6);
    }, [selectedQuestions]);

    const handleCheckboxChange = (questionId) => {
        if (selectedQuestions.includes(questionId)) {
            setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
        } else if (selectedQuestions.length < 6) {
            setSelectedQuestions([...selectedQuestions, questionId]);
        }
    };

    const autoRandom = () => {
        const maxSelected = 6;
        // ✅ Use allQuestions (all questions, not paginated) for random selection
        const totalQuestions = allQuestions.length || paginatedQuestions.length;
        const questionsToRandomFrom = allQuestions.length > 0 ? allQuestions : paginatedQuestions;
        
        if (totalQuestions < maxSelected) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: `Không đủ câu hỏi để random. Cần ít nhất ${maxSelected} câu hỏi, hiện có ${totalQuestions} câu.`,
            });
            return;
        }
        
        // ✅ Fisher-Yates shuffle algorithm for better randomization
        const shuffledIndexes = Array.from({ length: totalQuestions }, (_, i) => i);
        for (let i = shuffledIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
        }
        
        // ✅ Take first maxSelected items from shuffled array
        const selectedIndexes = shuffledIndexes.slice(0, maxSelected);
        setSelectedQuestions(selectedIndexes.map(idx => questionsToRandomFrom[idx]._id));
        setIsSubmitEnabled(true);
        
        // ✅ Show success message
        Swal.fire({
            icon: "success",
            title: "Thành công",
            text: `Đã random ${maxSelected} câu hỏi từ tổng số ${totalQuestions} câu hỏi.`,
            timer: 2000,
            showConfirmButton: false
        });
    };

    const submitQuestions = async () => {
        if (selectedQuestions.length < 6) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Vui lòng chọn đủ 6 câu hỏi trước khi submit.",
            });
            return;
        }
        try {
            await TestService.addOrUpdateQuestionToTest(testId, selectedQuestions);
            toast.success("Chỉ định câu hỏi Phần 1 thành công", { autoClose: 1000 });
        } catch (error) {
            toast.error("Chỉ định câu hỏi Phần 1 thất bại", { autoClose: 1000 });
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
                        <th>SELECTED {selectedQuestions.length}/6</th>
                        <th>No.</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>CORRECT ANS</th>
                        <th>IMAGE</th>
                        <th>AUDIO</th>
                        <th>SCRIPT</th>
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
                                            selectedQuestions.length >= 6 &&
                                            !selectedQuestions.includes(question._id)
                                        }
                                    />
                                </td>
                                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td>{question.optionA}</td>
                                <td>{question.optionB}</td>
                                <td>{question.optionC}</td>
                                <td>{question.optionD}</td>
                                <td>{question.correctOption}</td>
                                <td>
                                    <img
                                        src={getImageUrl(question.questionImage)}
                                        alt="Topic"
                                        className="question-image"
                                    />
                                </td>
                                <td>
                                    <audio controls src={getAudioUrl(question.questionAudio)}>
                                        Your browser does not support the audio element.
                                    </audio>
                                </td>
                                <td dangerouslySetInnerHTML={{ __html: question.questionScript }} />
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

export default IndicateQuestionList;