import React from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import QuestionEditSection2 from "../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection2";
import "./style.css";

const QuestionListSection2 = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
  getAudioUrl,
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
    <div className="table-section2">
      <table className="table text-center table-hover shadow">
        <thead className="shadow">
          <tr className="align-middle">
            <th>
              <button className="btn btn-success rounded-5 disabled">No.</button>
            </th>
            <th>OPT A</th>
            <th>OPT B</th>
            <th>OPT C</th>
            <th>CORRECT OPT</th>
            <th>TYPE</th>
            <th>AUDIO</th>
            <th>SCRIPT</th>
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
            <tr
              key={question._id}
              className="table-row shadow-on-hover align-middle"
            >
              <td>
                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
              </td>
              <td>{question.optionA}</td>
              <td>{question.optionB}</td>
              <td>{question.optionC}</td>
              <td>{question.correctOption}</td>
              <td>{question.questionType}</td>
              <td>
                <audio controls src={getAudioUrl(question.questionAudio)}>
                  Your browser does not support the audio element.
                </audio>
              </td>
              <td>
                <div
                  dangerouslySetInnerHTML={{
                    __html: question.questionScript || "No script available",
                  }}
                />
              </td>
              <td>
                {question.questionStatus === 1 ? (
                  <span
                    onClick={() => toggleStatus(question._id, 0)}
                    className="btn badge text-bg-success"
                    style={{ cursor: "pointer" }}
                  >
                    Enable
                  </span>
                ) : (
                  <span
                    onClick={() => toggleStatus(question._id, 1)}
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
                    data-bs-target={`#editQuestionModal-${question._id}`}
                  >
                    <i
                      className="fas fa-edit"
                      style={{ color: "rgb(192, 129, 13)" }}
                    ></i>
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
                            <i
                              className="fas fa-edit"
                              style={{ color: "rgb(192, 129, 13)" }}
                            ></i>{" "}
                            Edit Question Section 2
                          </h1>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <QuestionEditSection2
                          questionId={question._id}
                          sectionId={sectionId}
                          retrieveQuestions={retrieveQuestions}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteQuestion(question._id)}
                    className="btn btn-white ms-3 border-0"
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

export default QuestionListSection2;