import React, { useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./style.css";

const TableSpeaking5To7 = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
  getAudioUrl,
  sectionId,
  retrieveQuestions,
  QuestionService,
  handleShowEditModal,
}) => {
  // Group questions by groupId
  const groupedQuestionMap = useMemo(() => {
    const groups = {};
    paginatedQuestions.forEach((question) => {
      const groupId = question.questionGroup?._id || question.questionGroup;
      if (!groupId) return;
      if (!groups[groupId]) {
        groups[groupId] = [question];
      } else {
        groups[groupId].push(question);
      }
    });
    return groups;
  }, [paginatedQuestions]);

  const deleteQuestions = async (questionIds) => {
    const result = await Swal.fire({
      title: "Bạn muốn xóa nhóm câu hỏi này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        for (const questionId of questionIds) {
          await QuestionService.delete(questionId);
        }
        retrieveQuestions();
        Swal.fire({
          title: "Xóa câu hỏi thành công!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          title: "Lỗi khi xóa câu hỏi",
          icon: "error",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    }
  };

  const toggleStatus = async (questionIds, newStatus) => {
    try {
      for (const questionId of questionIds) {
        await QuestionService.updateStatus(questionId, newStatus);
      }
      retrieveQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const groupKeys = Object.keys(groupedQuestionMap);

  return (
    <div className="table-speaking5to7">
      <table className="table text-center table-bordered shadow">
        <thead className="shadow">
          <tr className="align-middle">
            <th>
              <button className="btn btn-primary rounded-5 disabled">No.</button>
            </th>
            <th>AUDIO</th>
            <th>EXPLANATION</th>
            <th>QUESTIONS</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {groupKeys.length === 0 && (
            <tr>
              <td colSpan={6}>No data available</td>
            </tr>
          )}
          {groupKeys.map((groupId, groupIndex) => {
            const questions = groupedQuestionMap[groupId];
            const firstQuestion = questions[0];
            const questionIds = questions.map(q => q._id);
            const allEnabled = questions.every(q => q.questionStatus === 1);

            return (
              <React.Fragment key={groupId}>
                <tr className="table-row shadow-on-hover align-middle">
                  <td rowSpan={questions.length + 1}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + groupIndex + 1}
                  </td>
                  <td rowSpan={questions.length + 1}>
                    {firstQuestion.questionGroup?.groupAudio ? (
                      <audio controls src={getAudioUrl(firstQuestion.questionGroup.groupAudio)} style={{ width: "200px" }}>
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <span className="text-muted">No audio</span>
                    )}
                  </td>
                  <td rowSpan={questions.length + 1}>
                    <div style={{ maxWidth: "200px", textAlign: "left" }}>
                      {firstQuestion.questionGroup?.groupExplanation || firstQuestion.questionExplanation || "No explanation"}
                    </div>
                  </td>
                  <td colSpan={3}></td>
                </tr>
                {questions.map((question, qIndex) => (
                  <tr key={question._id} className="table-row shadow-on-hover align-middle">
                    <td>
                      <div style={{ maxWidth: "300px", textAlign: "left" }}>
                        <strong>Q{qIndex + 1}:</strong> {question.questionContent || "No content"}
                        <br />
                        <small><strong>Answer:</strong> {question.suggestedAnswer || "No answer"}</small>
                      </div>
                    </td>
                    <td>
                      {question.questionStatus === 1 ? (
                        <span
                          onClick={() => toggleStatus([question._id], 0)}
                          className="btn badge text-bg-success rounded-5"
                          style={{ cursor: "pointer" }}
                        >
                          Enable
                        </span>
                      ) : (
                        <span
                          onClick={() => toggleStatus([question._id], 1)}
                          className="btn badge text-bg-danger rounded-5"
                          style={{ cursor: "pointer" }}
                        >
                          Disable
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {handleShowEditModal ? (
                          <button
                            type="button"
                            className="btn btn-white border-0"
                            onClick={() => handleShowEditModal(question._id)}
                            title="Chỉnh sửa câu hỏi"
                          >
                            <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-white border-0"
                            onClick={() => handleShowEditModal(question._id)}
                            title="Chỉnh sửa câu hỏi"
                          >
                            <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteQuestions([question._id])}
                          className="btn btn-white border-0"
                          title="Xóa câu hỏi"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableSpeaking5To7;





