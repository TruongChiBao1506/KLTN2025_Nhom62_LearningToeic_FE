import React, { useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import QuestionEditNo8To10 from "../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo8To10";
import "./style.css";

const TableSection8To10 = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
  getImageUrl,
  sectionId,
  retrieveQuestions,
  QuestionService,
  handleShowEditModal,
}) => {
  // Group questions by groupId
  const groupedQuestionMap = useMemo(() => {
    const groups = {};
    paginatedQuestions.forEach((question) => {
      const groupId = question.questionGroup._id;
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
      title: "Bạn muốn xóa câu hỏi này?",
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
    <div className="table-section8-to-10">
      <table className="table text-center table-bordered shadow">
        <thead className="text-center shadow">
          <tr className="align-middle">
            <th>
              <button className="btn btn-primary rounded-5 disabled">No.</button>
            </th>
            <th>IMAGE</th>
            <th>TEXT</th>
            <th>CONTENT</th>
            <th>CORRECT OPT</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {groupKeys.length === 0 && (
            <tr>
              <td colSpan={12}>No data available</td>
            </tr>
          )}
          {groupKeys.map((groupId, groupIndex) => {
            const groupedQuestions = groupedQuestionMap[groupId];
            return groupedQuestions.map((question, index) => (
              <tr key={question._id} className="table-row shadow-on-hover align-middle">
                {index === 0 && (
                  <td rowSpan={groupedQuestions.length}>{groupIndex + 1}</td>
                )}
                {index === 0 && (
                  <td className="question-image" rowSpan={groupedQuestions.length}>
                    <img
                      src={getImageUrl(question.questionGroup.groupImage) || " "}
                      style={{ width: "100px" }}
                      alt=""
                    />
                  </td>
                )}
                {index === 0 && (
                  <td rowSpan={groupedQuestions.length}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: question.questionGroup.groupText,
                      }}
                    />
                  </td>
                )}
                <td>{question.questionContent}</td>
                <td>{question.suggestedAnswer}</td>
                {index === 0 && (
                  <td rowSpan={groupedQuestions.length}>
                    {question.questionStatus === 1 ? (
                      <span
                        onClick={() =>
                          toggleStatus(
                            groupedQuestions.map((q) => q._id),
                            0
                          )
                        }
                        className="btn badge text-bg-success rounded-5"
                        style={{ cursor: "pointer" }}
                      >
                        Enable
                      </span>
                    ) : (
                      <span
                        onClick={() =>
                          toggleStatus(
                            groupedQuestions.map((q) => q._id),
                            1
                          )
                        }
                        className="btn badge text-bg-danger rounded-5"
                        style={{ cursor: "pointer" }}
                      >
                        Disable
                      </span>
                    )}
                  </td>
                )}
                {index === 0 && (
                  <td rowSpan={groupedQuestions.length}>
                    <div className="d-flex justify-content-center gap-2">
                      {/* Edit Button */}
                      {handleShowEditModal ? (
                        <button
                          type="button"
                          className="btn btn-white border-0"
                          onClick={() => handleShowEditModal(question.questionGroup._id)}
                          title="Chỉnh sửa nhóm câu hỏi"
                        >
                          <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-white border-0"
                            data-bs-toggle="modal"
                            data-bs-target={`#editQuestionModal-${question.questionGroup._id}`}
                            title="Chỉnh sửa nhóm câu hỏi"
                          >
                            <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />
                          </button>
                          {/* Modal */}
                          <div
                            id={`editQuestionModal-${question.questionGroup._id}`}
                            className="modal zoom"
                            tabIndex="-1"
                            aria-labelledby={`editQuestionModalLabel-${question.questionGroup._id}`}
                            aria-hidden="true"
                          >
                            <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h1
                                    className="modal-title fs-5"
                                    id={`editQuestionModalLabel-${question.questionGroup._id}`}
                                  >
                                    <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />{" "}
                                    Edit Speaking Question (No 8 To 10)
                                  </h1>
                                  <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <QuestionEditNo8To10
                                  groupId={question.questionGroup._id}
                                  sectionId={sectionId}
                                  retrieveQuestions={retrieveQuestions}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          deleteQuestions(
                            groupedQuestions.map((q) => q._id)
                          )
                        }
                        className="btn btn-white border-0"
                        title="Xóa nhóm câu hỏi"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-danger" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableSection8To10;