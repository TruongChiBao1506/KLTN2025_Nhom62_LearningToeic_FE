import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import CKEditorOptimized from "../../../../../components/Admin/EditorOptimized";
import "./style.css";

const QuestionEditNo1To5 = ({ sectionId, questionId, retrieveQuestions, onClose }) => {
  const [question, setQuestion] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editorData, setEditorData] = useState('');
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const questionFormSchema = Yup.object().shape({
    questionContent: Yup.string()
      .required("questionContent phải có giá trị.")
      .min(2, "questionContent phải ít nhất 2 ký tự.")
      .max(500, "questionContent có nhiều nhất 500 ký tự."),
    questionImage: Yup.mixed()
      .nullable()
      .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
        if (!value) return true;
        const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        return allowedFormats.includes(value.type);
      })
      .test("fileSize", "Tệp ảnh quá lớn", (value) => {
        if (!value) return true;
        return value.size <= 1024 * 1024;
      }),
  });

  const formik = useFormik({
    initialValues: {
      questionImage: null,
      questionContent: "",
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
          questionImage: null,
          questionContent: data.questionContent || "",
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

  const onImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    formik.setFieldValue('questionImage', file);
    formik.setFieldTouched('questionImage', true);
  };

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("questionContent", values.questionContent);
      formData.append("suggestedAnswer", editorData);
      if (selectedImage) {
        formData.append("questionImage", selectedImage, selectedImage.name);
      }
      await QuestionService.update(questionId, formData);
      retrieveQuestions();
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

  const getImageUrl = (imageName) =>
    imageName ? `http://localhost:9004/images/${imageName}` : "https://demofree.sirv.com/nope-not-here.jpg";

  if (!question) return <div>Đang tải...</div>;

  return (
    <div className="question-edit-no1to5-page">
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <div className="modal-body text-start p-4">
          <div className="row">
            <div className="col">
              <div className="form-group mb-3">
                <label htmlFor="questionImage" className="form-label">
                  Question Image<span className="required-field">*</span>
                </label>
                <input
                  ref={imageInputRef}
                  id="questionImage"
                  name="questionImage"
                  type="file"
                  className={`form-control border-secondary custom-font ${
                    formik.touched.questionImage && formik.errors.questionImage ? 'is-invalid' : ''
                  }`}
                  onChange={onImageChange}
                  onBlur={formik.handleBlur}
                  accept="image/jpeg,image/png,image/gif"
                />
                {formik.touched.questionImage && formik.errors.questionImage && (
                  <div className="error-feedback">{formik.errors.questionImage}</div>
                )}
                {/* New Image preview */}
                {selectedImage && (
                  <div className="file-preview mt-2">
                    <small className="text-success">
                      File mới: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                    </small>
                    <div className="image-preview mt-2">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="New Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                      />
                    </div>
                  </div>
                )}
                {/* Current Image preview */}
                {question?.questionImage && (
                  <div className="mt-2">
                    <label className="form-label">Current Image</label>
                    <img
                      src={getImageUrl(question.questionImage)}
                      alt="Current Question"
                      className="img-thumbnail"
                      style={{ maxWidth: '200px', maxHeight: '150px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group mb-3">
                <label htmlFor="questionContent" className="form-label">
                  Question Content<span className="required-field">*</span>
                </label>
                <input
                  name="questionContent"
                  type="text"
                  id="questionContent"
                  className={`form-control border-secondary custom-font ${
                    formik.touched.questionContent && formik.errors.questionContent ? 'is-invalid' : ''
                  }`}
                  value={formik.values.questionContent}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập nội dung câu hỏi"
                />
                {formik.touched.questionContent && formik.errors.questionContent && (
                  <div className="error-feedback">{formik.errors.questionContent}</div>
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

export default QuestionEditNo1To5;