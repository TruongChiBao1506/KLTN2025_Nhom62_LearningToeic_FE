import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestService from "../../../../services/testService";
import "./style.css";

const MAX_SELECTED = 29;
const GROUP_COUNT = 4;

const Part7SinglePassageList = ({
    paginatedQuestions,
    currentPage,
    ITEMS_PER_PAGE,
    sectionId,
    testId,
    getImageUrl,
    retrieveQuestions
}) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    // Group questions by groupId
    const groupedQuestionMap = useMemo(() => {
        const groups = {};
        for (const question of paginatedQuestions) {
            const groupId = question.questionGroup._id;
            if (!groups[groupId]) {
                groups[groupId] = [question];
            } else {
                groups[groupId].push(question);
            }
        }
        return groups;
    }, [paginatedQuestions]);

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

    // (Auto random đã bị ẩn, nếu muốn dùng thì mở comment bên dưới)
    // const autoRandom = () => {
    //     const allGroups = Object.keys(groupedQuestionMap);
    //     const groupCounts = {};
    //     for (const groupId of allGroups) {
    //         const groupQuestions = groupedQuestionMap[groupId];
    //         groupCounts[groupId] = groupQuestions.length;
    //     }
    //     const eligibleGroups = allGroups.filter(groupId => groupCounts[groupId] >= MAX_SELECTED);
    //     if (eligibleGroups.length < GROUP_COUNT) {
    //         alert("Không có đủ nhóm câu hỏi có ít nhất " + MAX_SELECTED + " câu hỏi để random.");
    //         return;
    //     }
    //     const randomGroups = [];
    //     while (randomGroups.length < GROUP_COUNT) {
    //         const randomGroupIndex = Math.floor(Math.random() * eligibleGroups.length);
    //         const randomGroupId = eligibleGroups[randomGroupIndex];
    //         if (!randomGroups.includes(randomGroupId)) {
    //             randomGroups.push(randomGroupId);
    //         }
    //     }
    //     const randomQuestions = [];
    //     for (const groupId of randomGroups) {
    //         const groupQuestions = groupedQuestionMap[groupId];
    //         const randomIndexes = [];
    //         while (randomIndexes.length < Math.ceil(MAX_SELECTED / GROUP_COUNT)) {
    //             const randomIndex = Math.floor(Math.random() * groupQuestions.length);
    //             if (!randomIndexes.includes(randomIndex)) {
    //                 randomIndexes.push(randomIndex);
    //             }
    //         }
    //         for (const randomIndex of randomIndexes) {
    //             randomQuestions.push(groupQuestions[randomIndex].questionId);
    //         }
    //     }
    //     setSelectedQuestions(randomQuestions);
    //     setIsSubmitEnabled(true);
    // };

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
            toast.success("Chỉ định câu hỏi Phần 7 đoạn đơn thành công", { autoClose: 1000 });
        } catch {
            toast.error("Chỉ định câu hỏi Phần 7 đoạn đơn thất bại", { autoClose: 1000 });
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
            <div className="d-flex justify-content-end mb-2">
                {/* <div className="button" onClick={autoRandom}>
                    <div>RANDOM</div>
                </div> */}
                <div
                    className="button ms-1"
                    onClick={isSubmitEnabled ? submitQuestions : undefined}
                    style={{ opacity: isSubmitEnabled ? 1 : 0.5, pointerEvents: isSubmitEnabled ? "auto" : "none" }}
                >
                    <div>SUBMIT</div>
                </div>
            </div>
            <table className="table text-center table-bordered shadow">
                <thead className="shadow">
                    <tr className="align-middle">
                        <th>
                            <button className="btn btn-primary rounded-5 disabled">USED</button>
                        </th>
                        <th>SELECTED {selectedQuestions.length}/29</th>
                        <th>No.</th>
                        <th>CONTENT</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>CORRECT ANS</th>
                        <th>IMAGE</th>
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
                                    {index === 0 && (
                                        <td rowSpan={groupedQuestions.length} className="question-image">
                                            <img
                                                src={getImageUrl(question.questionGroup.groupImage) || " "}
                                                alt=""
                                                style={{ width: 100 }}
                                            />
                                        </td>
                                    )}
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

export default Part7SinglePassageList;