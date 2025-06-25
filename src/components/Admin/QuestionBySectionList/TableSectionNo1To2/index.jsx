import React from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import QuestionEditNo1To2 from "../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo1To2";
import "./style.css";

const TableSection1To2 = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
  sectionId,
  retrieveQuestions,
  QuestionService,
}) => {
  const deleteQuestion = async (questionId) => {
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
        await QuestionService.delete(questionId);
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

  const toggleStatus = async (questionId, newStatus) => {
    try {
      await QuestionService.updateStatus(questionId, newStatus);
      retrieveQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="table-section1-to-2">
      <table className="table text-center table-hover shadow">
        <thead className="shadow">
          <tr>
            <th>
              <button className="btn btn-success rounded-5 disabled">No.</button>
            </th>
            <th>TEXT</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {paginatedQuestions.length === 0 && (
            <tr>
              <td colSpan={12}>No data available</td>
            </tr>
          )}
          {paginatedQuestions.map((question, index) => (
            <tr key={question.questionId} className="table-row shadow-on-hover align-middle">
              <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
              <td>{question.questionText}</td>
              <td>
                {question.questionStatus === 1 ? (
                  <span
                    onClick={() => toggleStatus(question.questionId, 0)}
                    className="btn badge text-bg-success"
                    style={{ cursor: "pointer" }}
                  >
                    Enable
                  </span>
                ) : (
                  <span
                    onClick={() => toggleStatus(question.questionId, 1)}
                    className="btn badge text-bg-danger"
                    style={{ cursor: "pointer" }}
                  >
                    Disable
                  </span>
                )}
              </td>
              <td>
                <div className="d-flex justify-content-center">
                  {/* Edit Modal Trigger */}
                  <button
                    type="button"
                    className="btn btn-white border-0"
                    data-bs-toggle="modal"
                    data-bs-target={`#editQuestionModal-${question.questionId}`}
                  >
                    <i
                      className="fas fa-edit"
                      style={{ color: "rgb(192, 129, 13)" }}
                    ></i>
                  </button>
                  {/* Modal */}
                  <div
                    id={`editQuestionModal-${question.questionId}`}
                    className="modal zoom"
                    tabIndex="-1"
                    aria-labelledby={`editQuestionModalLabel-${question.questionId}`}
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-xl">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h1
                            className="modal-title fs-5"
                            id={`editQuestionModalLabel-${question.questionId}`}
                          >
                            <i
                              className="fas fa-edit"
                              style={{ color: "rgb(192, 129, 13)" }}
                            ></i>{" "}
                            Edit Speaking Question (No 1 to 2)
                          </h1>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <QuestionEditNo1To2
                          questionId={question.questionId}
                          sectionId={sectionId}
                          retrieveQuestions={retrieveQuestions}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteQuestion(question.questionId)}
                    className="btn btn-white border-0"
                  >
                    <i className="fas fa-trash text-danger"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSection1To2;