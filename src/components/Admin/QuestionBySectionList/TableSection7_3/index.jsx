import React, { useMemo } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import QuestionEditSection7Triple from "../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection7_3";
import "./style.css";

const MAX_PASSAGE_LENGTH = 200;

const getLimitedPassage = (groupPassage) => {
  if (!groupPassage) return "";
  return groupPassage.length > MAX_PASSAGE_LENGTH
    ? groupPassage.slice(0, MAX_PASSAGE_LENGTH) + "..."
    : groupPassage;
};

const TableSection7Triple = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
  getImageUrl,
  sectionId,
  retrieveQuestions,
  QuestionService,
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
    <div className="table-section7-triple">
      <table className="table text-center table-bordered shadow">
        <thead className="shadow">
          <tr className="align-middle">
            <th>
              <button className="btn btn-success rounded-5 disabled">No.</button>
            </th>
            <th>CONTENT</th>
            <th>OPT A</th>
            <th>OPT B</th>
            <th>OPT C</th>
            <th>OPT D</th>
            <th>CORRECT OPT</th>
            <th>TYPE</th>
            <th>EXPLANATION</th>
            <th>IMAGE</th>
            <th>PASSAGE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {groupKeys.length === 0 && (
            <tr>
              <td colSpan={13}>No data available</td>
            </tr>
          )}
          {groupKeys.map((groupId, groupIndex) => {
            const groupedQuestions = groupedQuestionMap[groupId];
            return groupedQuestions.map((question, index) => (
              <tr key={question._id} className="table-row shadow-on-hover align-middle">
                {index === 0 && (
                  <td rowSpan={groupedQuestions.length}>{groupIndex + 1}</td>
                )}
                <td>{question.questionContent}</td>
                <td>{question.optionA}</td>
                <td>{question.optionB}</td>
                <td>{question.optionC}</td>
                <td>{question.optionD}</td>
                <td>{question.correctOption}</td>
                <td>{question.questionType}</td>
                <td>{question.questionExplanation}</td>
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
                      title={question.questionGroup.groupPassage}
                      dangerouslySetInnerHTML={{
                        __html: getLimitedPassage(question.questionGroup.groupPassage),
                      }}
                    />
                  </td>
                )}
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
                        className="btn badge text-bg-success"
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
                        className="btn badge text-bg-danger"
                        style={{ cursor: "pointer" }}
                      >
                        Disable
                      </span>
                    )}
                  </td>
                )}
                {index === 0 && (
                  <td rowSpan={groupedQuestions.length}>
                    <div className="d-flex justify-content-center">
                      {/* Edit Modal Trigger */}
                      <button
                        type="button"
                        className="btn btn-white border-0"
                        data-bs-toggle="modal"
                        data-bs-target={`#editQuestionModal-${question.questionGroup._id}`}
                      >
                        <i
                          className="fas fa-edit"
                          style={{ color: "rgb(192, 129, 13)" }}
                        ></i>
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
                                <i
                                  className="fas fa-edit"
                                  style={{ color: "rgb(192, 129, 13)" }}
                                ></i>{" "}
                                Edit Question Section 7 Triple
                              </h1>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <QuestionEditSection7Triple
                              groupId={question.questionGroup._id}
                              sectionId={sectionId}
                              retrieveQuestions={retrieveQuestions}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          deleteQuestions(
                            groupedQuestions.map((q) => q._id)
                          )
                        }
                        className="btn btn-white border-0"
                      >
                        <i className="fas fa-trash text-danger"></i>
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

export default TableSection7Triple;