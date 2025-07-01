import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./style.css";

const QuestionListSection5 = ({
  paginatedQuestions,
  currentPage,
  ITEMS_PER_PAGE,
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
    <div className="table-section5">
      <table className="table text-center table-hover shadow">
        <thead className="shadow">
          <tr className="align-middle">
            <th>
              <button className="btn btn-primary rounded-5 disabled">No.</button>
            </th>
            <th>CONTENT</th>
            <th>OPT A</th>
            <th>OPT B</th>
            <th>OPT C</th>
            <th>OPT D</th>
            <th>CORRECT OPT</th>
            <th>TYPE</th>
            <th>EXPLANATION</th>
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
              <td>{question.questionContent}</td>
              <td>{question.optionA}</td>
              <td>{question.optionB}</td>
              <td>{question.optionC}</td>
              <td>{question.optionD}</td>
              <td>{question.correctOption}</td>
              <td>{question.questionType}</td>
              <td>
                <div
                  dangerouslySetInnerHTML={{
                    __html: question.questionExplanation,
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
                  <button
                    type="button"
                    className="btn btn-white border-0"
                    onClick={() => handleShowEditModal(question._id)}
                    title="Chỉnh sửa câu hỏi"
                  >
                    <FontAwesomeIcon icon={faEdit} style={{ color: "rgb(192, 129, 13)" }} />
                  </button>
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

export default QuestionListSection5;