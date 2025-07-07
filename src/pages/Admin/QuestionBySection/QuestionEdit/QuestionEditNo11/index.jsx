import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import CKEditorOptimized from "../../../../../components/Admin/EditorOptimized";
import "./style.css";

const EditQuestionNo11 = ({ sectionId, questionId, retrieveQuestions, onClose }) => {
  const [question, setQuestion] = useState(null);
  const [editorData, setEditorData] = useState('');
  const editorRef = useRef(null);

  const questionFormSchema = Yup.object().shape({
    questionText: Yup.string()
      .required("questionText phải có giá trị.")
      .min(2, "questionText phải ít nhất 2 ký tự.")
      .max(500, "questionText có nhiều nhất 500 ký tự."),
    suggestedAnswer: Yup.string()
      .required("suggestedAnswer phải có giá trị.")
      .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
      .max(2000, "suggestedAnswer có nhiều nhất 2000 ký tự."),
  });

  const formik = useFormik({
    initialValues: {
      questionText: "",
      suggestedAnswer: "",
    },
    validationSchema: questionFormSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      await updateQuestion(values, { setSubmitting });
    }
  });

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        formik.setValues({
          questionText: data.questionText || "",
          suggestedAnswer: data.suggestedAnswer || "",
        });
        setEditorData(data.suggestedAnswer || "");
        setQuestion(data);
      } catch (error) {
        toast.error("Lỗi khi tải thông tin câu hỏi", { autoClose: 1000 });
      }
    };
    if (questionId) getQuestion();
    // eslint-disable-next-line
  }, [questionId]);

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("questionText", values.questionText);
      formData.append("suggestedAnswer", editorData);
      await QuestionService.update(questionId, formData);
      retrieveQuestions && retrieveQuestions();
      if (onClose) onClose();
      toast.success("Chỉnh sửa câu hỏi thành công", { autoClose: 1000 });
    } catch (error) {
      let errorMessage = 'Lỗi khi chỉnh sửa câu hỏi';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request?.response) {
        try {
          const jsonResponse = JSON.parse(error.request.response);
          errorMessage = jsonResponse.message;
        } catch {}
      }
      toast.error(errorMessage, { autoClose: 1000, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) return <div>Đang tải...</div>;

  return (
    <div className="question-edit-no11-page">
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <div className="modal-body text-start p-4">
          <div className="row">
            <div className="col">
              <div className="form-group mb-3">
                <label htmlFor="questionText" className="form-label">
                  Text<span className="required-field">*</span>
                </label>
                <input
                  name="questionText"
                  id="questionText"
                  type="text"
                  className={`form-control border-secondary custom-font ${
                    formik.touched.questionText && formik.errors.questionText ? 'is-invalid' : ''
                  }`}
                  value={formik.values.questionText}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.questionText && formik.errors.questionText && (
                  <div className="error-feedback">{formik.errors.questionText}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <label htmlFor="suggestedAnswer" className="form-label">
                  Suggested Answer<span className="required-field">*</span>
                </label>
                <div className="ckeditor-container">
                  <CKEditorOptimized
                    data={editorData}
                    onChange={setEditorData}
                    onReady={(editor) => { editorRef.current = editor; }}
                    placeholder="Nhập đáp án gợi ý..."
                    height="170px"
                  />
                </div>
                {!editorData && formik.submitCount > 0 && (
                  <div className="error-feedback">suggestedAnswer phải có giá trị.</div>
                )}
                {formik.touched.suggestedAnswer && formik.errors.suggestedAnswer && (
                  <div className="error-feedback">{formik.errors.suggestedAnswer}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary rounded-5"
            onClick={() => {
              if (onClose) onClose();
            }}
          >
            Đóng
          </button>
          <button
            type="submit"
            className="btn btn-primary rounded-5"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuestionNo11;