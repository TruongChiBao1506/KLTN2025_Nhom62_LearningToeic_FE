import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestService from "../../../../services/testService";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRandom } from "@fortawesome/free-solid-svg-icons";

const MAX_SELECTED = 16;
const GROUP_COUNT = 4;

const Part6QuestionList = ({
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

    // Group questions by groupId
    const groupedQuestionMap = useMemo(() => {
        const groups = {};
        // ✅ Use allQuestions if available, otherwise fallback to paginatedQuestions
        const questionsToGroup = allQuestions.length > 0 ? allQuestions : paginatedQuestions;
        for (const question of questionsToGroup) {
            const groupId = question.questionGroup._id;
            if (!groups[groupId]) {
                groups[groupId] = [question];
            } else {
                groups[groupId].push(question);
            }
        }
        return groups;
    }, [paginatedQuestions, allQuestions]);

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

    // Select/deselect a group
    const selectGroup = (groupedQuestions) => {
        const groupQuestionIds = groupedQuestions.map(q => q._id);
        const allSelected = groupQuestionIds.every(id => selectedQuestions.includes(id));
        if (allSelected) {
            setSelectedQuestions(selectedQuestions.filter(id => !groupQuestionIds.includes(id)));
        } else {
            setSelectedQuestions([...selectedQuestions, ...groupQuestionIds.filter(id => !selectedQuestions.includes(id))]);
        }
    };

    // Random 4 groups, mỗi group lấy hết câu hỏi trong group (hoặc random trong group nếu muốn)
    const autoRandom = () => {
        const groupIds = Object.keys(groupedQuestionMap);
        const allQuestions = Object.values(groupedQuestionMap).flat();

        // Nếu tổng số câu hỏi < MAX_SELECTED thì báo lỗi ngay
        if (allQuestions.length < MAX_SELECTED) {
            Swal.fire({
                icon: "warning",
                title: "Không đủ câu hỏi",
                text: `Hiện chỉ có ${allQuestions.length}/${MAX_SELECTED} câu hỏi. Vui lòng bổ sung thêm câu hỏi để đủ số lượng.`,
            });
            setSelectedQuestions([]);
            setIsSubmitEnabled(false);
            return;
        }

        // Nếu không đủ nhóm thì báo lỗi
        if (groupIds.length < GROUP_COUNT) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: `Không đủ nhóm câu hỏi để random. Cần ${GROUP_COUNT} nhóm, hiện có ${groupIds.length} nhóm.`,
            });
            setSelectedQuestions([]);
            setIsSubmitEnabled(false);
            return;
        }

        // ✅ Fisher-Yates shuffle for group selection
        const shuffledGroupIds = [...groupIds];
        for (let i = shuffledGroupIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledGroupIds[i], shuffledGroupIds[j]] = [shuffledGroupIds[j], shuffledGroupIds[i]];
        }
        
        // ✅ Take first GROUP_COUNT groups
        const selectedGroupIds = shuffledGroupIds.slice(0, GROUP_COUNT);
        
        // Lấy tất cả câu hỏi của các nhóm random
        const randomQuestions = [];
        for (const groupId of selectedGroupIds) {
            const groupQuestions = groupedQuestionMap[groupId];
            randomQuestions.push(...groupQuestions.map(q => q._id));
        }
        
        if (randomQuestions.length >= MAX_SELECTED) {
            setSelectedQuestions(randomQuestions.slice(0, MAX_SELECTED));
            setIsSubmitEnabled(true);
            
            // ✅ Show success message
            Swal.fire({
                icon: "success",
                title: "Thành công",
                text: `Đã random ${GROUP_COUNT} nhóm với tổng ${randomQuestions.length} câu hỏi (chọn ${MAX_SELECTED} câu).`,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Không thể random đủ câu hỏi",
                text: `${GROUP_COUNT} nhóm được chọn chỉ có ${randomQuestions.length}/${MAX_SELECTED} câu hỏi. Vui lòng kiểm tra lại dữ liệu.`,
            });
            setSelectedQuestions([]);
            setIsSubmitEnabled(false);
        }
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
            toast.success("Chỉ định câu hỏi Phần 6 thành công", { autoClose: 1000 });
        } catch {
            toast.error("Chỉ định câu hỏi Phần 6 thất bại", { autoClose: 1000 });
        }
        setSelectedQuestions([]);
        setIsSubmitEnabled(false);
        if (retrieveQuestions) retrieveQuestions();
    };

    const getLimitedPassage = (groupPassage) => {
        const MAX_PASSAGE_LENGTH = 200;
        if (!groupPassage) return "";
        return groupPassage.length > MAX_PASSAGE_LENGTH ? groupPassage.slice(0, MAX_PASSAGE_LENGTH) + "..." : groupPassage;
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
            <table className="table text-center table-bordered shadow">
                <thead className="shadow">
                    <tr className="align-middle">
                        <th>
                            <button className="btn btn-primary rounded-5 disabled">USED</button>
                        </th>
                        <th>SELECTED {selectedQuestions.length}/16</th>
                        <th>No.</th>
                        <th>CONTENT</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>CORRECT ANS</th>
                        <th>EXPLANATION</th>
                        <th>PASSAGE</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedQuestionMap).length > 0 ? (
                        Object.entries(groupedQuestionMap).map(([groupId, groupedQuestions], groupIndex) =>
                            groupedQuestions.map((question, index) => (
                                <tr key={question._id} className="table-row shadow-on-hover align-middle">
                                    {index === 0 && (
                                        <>
                                            <td rowSpan={groupedQuestions.length}>
                                                <button style={{ fontSize: 12 }} className="btn btn-success rounded-5 disabled">
                                                    {question.usage}
                                                </button>
                                            </td>
                                            <td rowSpan={groupedQuestions.length}>
                                                <input
                                                    type="checkbox"
                                                    id={`checkbox_${question._id}`}
                                                    checked={groupedQuestions.every(q => selectedQuestions.includes(q._id))}
                                                    onChange={() => selectGroup(groupedQuestions)}
                                                    disabled={
                                                        selectedQuestions.length >= MAX_SELECTED &&
                                                        !groupedQuestions.every(q => selectedQuestions.includes(q._id))
                                                    }
                                                />
                                            </td>
                                            <td rowSpan={groupedQuestions.length}>{groupIndex + 1}</td>
                                        </>
                                    )}
                                    <td>{question.questionContent}</td>
                                    <td>{question.optionA}</td>
                                    <td>{question.optionB}</td>
                                    <td>{question.optionC}</td>
                                    <td>{question.optionD}</td>
                                    <td>{question.correctOption}</td>
                                    <td>{question.questionExplanation}</td>
                                    {index === 0 && (
                                        <td rowSpan={groupedQuestions.length}>
                                            <div
                                                title={question.questionGroup.groupPassage}
                                                dangerouslySetInnerHTML={{
                                                    __html: getLimitedPassage(question.questionGroup.groupPassage)
                                                }}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))
                        )
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

export default Part6QuestionList;