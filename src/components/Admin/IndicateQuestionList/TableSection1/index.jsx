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
        const totalQuestions = paginatedQuestions.length;
        if (totalQuestions < maxSelected) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Không đủ câu hỏi để random.",
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
        setSelectedQuestions(randomIndexes.map(idx => paginatedQuestions[idx]._id));
        setIsSubmitEnabled(true);
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