import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestService from "../../../../services/testService";
import "./style.css";

const MAX_SELECTED = 30;
const GROUP_COUNT = 10;

const Part4QuestionList = ({
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

    // Random 10 groups, mỗi group lấy hết câu hỏi trong group (hoặc random trong group nếu muốn)
    const autoRandom = () => {
        const groupIds = Object.keys(groupedQuestionMap);
        if (groupIds.length < GROUP_COUNT) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Không đủ nhóm câu hỏi để random.",
            });
            return;
        }
        // Random group ids
        const randomGroups = [];
        while (randomGroups.length < GROUP_COUNT) {
            const idx = Math.floor(Math.random() * groupIds.length);
            const groupId = groupIds[idx];
            if (!randomGroups.includes(groupId)) {
                randomGroups.push(groupId);
            }
        }
        // Lấy tất cả questionId của các group random (hoặc random trong group nếu muốn)
        const randomQuestions = [];
        for (const groupId of randomGroups) {
            const groupQuestions = groupedQuestionMap[groupId];
            // Nếu muốn random trong group, có thể lấy 3 câu mỗi group:
            // const randomIndexes = [];
            // while (randomIndexes.length < 3) {
            //     const randomIndex = Math.floor(Math.random() * groupQuestions.length);
            //     if (!randomIndexes.includes(randomIndex)) {
            //         randomIndexes.push(randomIndex);
            //     }
            // }
            // for (const randomIndex of randomIndexes) {
            //     randomQuestions.push(groupQuestions[randomIndex].questionId);
            // }
            // Nếu lấy hết câu hỏi trong group:
            randomQuestions.push(...groupQuestions.map(q => q._id));
        }
        setSelectedQuestions(randomQuestions.slice(0, MAX_SELECTED));
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
            toast.success("Chỉ định câu hỏi Phần 4 thành công", { autoClose: 1000 });
        } catch {
            toast.error("Chỉ định câu hỏi Phần 4 thất bại", { autoClose: 1000 });
        }
        setSelectedQuestions([]);
        setIsSubmitEnabled(false);
        if (retrieveQuestions) retrieveQuestions();
    };

    const getLimitedScript = (script) => {
        const MAX_SCRIPT_LENGTH = 200;
        if (!script) return "";
        return script.length > MAX_SCRIPT_LENGTH ? script.slice(0, MAX_SCRIPT_LENGTH) + "..." : script;
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
            <table className="table text-center table-bordered shadow">
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
                        <th>CORRECT ANS</th>
                        <th>IMAGE</th>
                        <th>AUDIO</th>
                        <th>SCRIPT</th>
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
                                        <>
                                            <td rowSpan={groupedQuestions.length} className="question-image">
                                                <img
                                                    src={getImageUrl(question.questionGroup.groupImage) || " "}
                                                    alt=""
                                                    style={{ width: 100 }}
                                                />
                                            </td>
                                            <td rowSpan={groupedQuestions.length}>
                                                <audio controls src={getAudioUrl(question.questionGroup.groupAudio)}>
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </td>
                                            <td rowSpan={groupedQuestions.length}>
                                                <div
                                                    title={question.questionGroup.groupScript}
                                                    dangerouslySetInnerHTML={{
                                                        __html: getLimitedScript(question.questionGroup.groupScript)
                                                    }}
                                                />
                                            </td>
                                        </>
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

export default Part4QuestionList;