import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import QuestionEditNo3To4 from "../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo3To4";
import "./style.css";

const TableSection3To4 = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
  getImageUrl,
  sectionId,
  retrieveQuestions,
  QuestionService,
  handleShowEditModal,
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
    <div className="table-section3-to-4">
      <table className="table text-center table-hover shadow">
        <thead className="shadow">
          <tr className="align-middle">
            <th>
              <button className="btn btn-success rounded-5 disabled">No.</button>
            </th>
            <th>IMAGE</th>
            <th>SUGGESTED ANSWER</th>
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
            <tr key={question._id} className="table-row shadow-on-hover align-middle">
              <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
              <td>
                <img
                  src={getImageUrl(question.questionImage)}
                  alt="Topic Image"
                  className="question-image"
                />
              </td>
              <td>
                <div
                  dangerouslySetInnerHTML={{
                    __html: question.suggestedAnswer,
                  }}
                />
              </td>
              <td>
                {question.questionStatus === 1 ? (
                  <span
                    onClick={() => toggleStatus(question._id, 0)}
                    className="btn badge text-bg-success rounded-5"
                    style={{ cursor: "pointer" }}
                  >
                    Enable
                  </span>
                ) : (
                  <span
                    onClick={() => toggleStatus(question._id, 1)}
                    className="btn badge text-bg-danger rounded-5"
                    style={{ cursor: "pointer" }}
                  >
                    Disable
                  </span>
                )}
              </td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  {/* Edit Button */}
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
                    <>
                      <button
                        type="button"
                        className="btn btn-white border-0"
                        data-bs-toggle="modal"
                        data-bs-target={`#editQuestionModal-${question._id}`}
                        title="Chỉnh sửa câu hỏi"
                      >
                        <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />
                      </button>
                      {/* Modal */}
                      <div
                        id={`editQuestionModal-${question._id}`}
                        className="modal zoom"
                        tabIndex="-1"
                        aria-labelledby={`editQuestionModalLabel-${question._id}`}
                        aria-hidden="true"
                      >
                        <div className="modal-dialog modal-xl">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h1
                                className="modal-title fs-5"
                                id={`editQuestionModalLabel-${question._id}`}
                              >
                                <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />{" "}
                                Edit Speaking Question (No 3 - 4)
                              </h1>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <QuestionEditNo3To4
                              questionId={question._id}
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
                    onClick={() => deleteQuestion(question._id)}
                    className="btn btn-white border-0"
                    title="Xóa câu hỏi"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
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

export default TableSection3To4;