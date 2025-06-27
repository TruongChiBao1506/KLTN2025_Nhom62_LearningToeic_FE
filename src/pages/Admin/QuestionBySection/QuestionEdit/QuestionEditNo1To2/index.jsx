import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import QuestionService from "../../../../../services/questionService";
import CKEditorOptimized from "../../../../../components/Admin/EditorOptimized";
import "./style.css";

const QuestionEditNo1To2 = ({ sectionId, questionId, retrieveQuestions, onClose }) => {
  const [question, setQuestion] = useState(null);
  const [editorData, setEditorData] = useState("");
  const editorRef = useRef(null);

  // Validation schema (bạn có thể mở rộng nếu muốn)
  const questionFormSchema = Yup.object().shape({
    questionText: Yup.string()
      .required("questionText phải có giá trị.")
      .min(2, "questionText phải ít nhất 2 ký tự."),
  });

  const formik = useFormik({
    initialValues: {
      questionText: "",
    },
    validationSchema: questionFormSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      await updateQuestion(values, { setSubmitting });
    },
  });

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        formik.setValues({
          questionText: data.questionText || "",
        });
        setEditorData(data.questionText || "");
        setQuestion(data);
      } catch (error) {
        toast.error("Lỗi khi tải thông tin câu hỏi", { autoClose: 1000 });
      }
    };
    if (questionId) getQuestion();
    // eslint-disable-next-line
  }, [questionId]);

  const onEditorReady = (editor) => {
    editorRef.current = editor;
    setTimeout(() => {
      if (editor && editor.editing && editor.editing.view) {
        editor.editing.view.change(writer => {
          writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
        });
      }
    }, 300);
  };

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      if (!editorData || editorData.trim() === "") {
        toast.error("questionText phải có giá trị.", { autoClose: 1000 });
        setSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("questionText", editorData);

      await QuestionService.update(questionId, formData);
      retrieveQuestions();
      toast.success("Chỉnh sửa câu hỏi thành công", { autoClose: 1000 });
      if (onClose) onClose();
    } catch (error) {
      toast.error("Lỗi khi chỉnh sửa câu hỏi", { autoClose: 1000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) return <div>Đang tải...</div>;

  return (
    <div className="question-edit-no1to2-page">
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <div className="modal-body text-start p-4">
          <div className="row">
            <div className="col">
              <div className="form-group mb-3">
                <label htmlFor="questionText" className="form-label">
                  Text<span className="required-field">*</span>
                </label>
                <div className="ckeditor-container">
                  <CKEditorOptimized
                    data={editorData}
                    onChange={setEditorData}
                    onReady={onEditorReady}
                    placeholder="Nhập nội dung câu hỏi..."
                    height="170px"
                  />
                </div>
                {/* Nếu muốn hiện lỗi khi submit */}
                {!editorData && formik.submitCount > 0 && (
                  <div className="error-feedback">questionText phải có giá trị.</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionEditNo1To2;