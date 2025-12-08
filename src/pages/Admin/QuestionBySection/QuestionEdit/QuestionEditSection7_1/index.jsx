import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import QuestionGroupService from "../../../../../services/questionGroupService";
import CKEditorOptimized from "../../../../../components/Admin/EditorOptimized";
import "./style.css";

const EditQuestionSection7_1 = ({ sectionId, groupId, retrieveQuestions, onClose }) => {
  const [group, setGroup] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editorData, setEditorData] = useState('');
  const imageInputRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [initialValues, setInitialValues] = useState({ groupImage: null });

  // Dynamic validation schema for group and questions
  const questionFormSchema = Yup.object().shape({
    groupImage: Yup.mixed()
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
    // groupPassage sẽ kiểm tra thủ công
    ...questions.reduce((acc, q, idx) => {
      acc[`questionContent${idx}`] = Yup.string()
        .required("questionContent phải có giá trị.")
        .min(2, "questionContent phải ít nhất 2 ký tự.")
        .max(500, "questionContent có nhiều nhất 500 ký tự.");
      ["A", "B", "C", "D"].forEach((opt) => {
        acc[`option${opt}${idx}`] = Yup.string()
          .required(`Option${opt} phải có giá trị.`)
          .min(2, `Option${opt} phải ít nhất 2 ký tự.`)
          .max(500, `Option${opt} có nhiều nhất 500 ký tự.`);
      });
      acc[`correctOption${idx}`] = Yup.string().required("CorrectOption phải có giá trị.");
      acc[`questionType${idx}`] = Yup.string().required("Loại phải được chọn.");
      acc[`questionExplanation${idx}`] = Yup.string()
        .required("questionExplanation phải có giá trị.")
        .min(2, "questionExplanation phải ít nhất 2 ký tự.")
        .max(1000, "questionExplanation có nhiều nhất 1000 ký tự.");
      return acc;
    }, {}),
  });

  const formik = useFormik({
    initialValues,
    validationSchema: questionFormSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      await updateGroupAndQuestions(values, { setSubmitting });
    }
  });

  useEffect(() => {
    const getGroupAndQuestions = async () => {
      try {
        const data = await QuestionService.getQuestionsByQuestionGroup(groupId);
        setQuestions(data);
        setGroup(data[0]?.questionGroup || null);

        // Tạo initialValues mới từ data
        const newInitialValues = {
          groupImage: null,
          ...data.reduce((acc, q, idx) => {
            acc[`questionContent${idx}`] = q.questionContent || "";
            acc[`optionA${idx}`] = q.optionA || "";
            acc[`optionB${idx}`] = q.optionB || "";
            acc[`optionC${idx}`] = q.optionC || "";
            acc[`optionD${idx}`] = q.optionD || "";
            acc[`correctOption${idx}`] = getCorrectOptionLetter(q);
            acc[`questionType${idx}`] = q.questionSubType || "";
            acc[`questionExplanation${idx}`] = q.questionExplanation || "";
            return acc;
          }, {}),
        };
        setInitialValues(newInitialValues);
        setEditorData(data[0]?.questionGroup?.groupPassage || "");
      } catch (error) {
        toast.error("Lỗi khi tải thông tin nhóm câu hỏi", { autoClose: 1000 });
      }
    };
    if (groupId) getGroupAndQuestions();
  }, [groupId]);

  function getCorrectOptionLetter(item) {
    return item.correctOption || "";
  }

  // File change handlers
  const onImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    formik.setFieldValue('groupImage', file);
    formik.setFieldTouched('groupImage', true);
  };

  // CKEditorOptimized event handler
  const handlePassageChange = (data) => {
    setEditorData(data);
  };

  const updateGroupAndQuestions = async (values, { setSubmitting }) => {
    try {
      // Validate groupPassage
      if (!editorData || editorData.trim() === '') {
        toast.error('Question Group Passage phải có giá trị', { autoClose: 1000 });
        setSubmitting(false);
        return;
      }

      // Update group
      const groupFormData = new FormData();
      if (selectedImage) {
        groupFormData.append("groupImage", selectedImage, selectedImage.name);
      }
      groupFormData.append("groupPassage", editorData);
      await QuestionGroupService.update(groupId, groupFormData);

      // Update each question
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const formData = new FormData();
        formData.append("sectionId", sectionId);
        formData.append("questionId", q._id || q.questionId);
        formData.append("questionContent", values[`questionContent${idx}`]);
        formData.append("optionA", values[`optionA${idx}`]);
        formData.append("optionB", values[`optionB${idx}`]);
        formData.append("optionC", values[`optionC${idx}`]);
        formData.append("optionD", values[`optionD${idx}`]);
        
        // ✅ Lưu correctOption là chữ cái A/B/C/D (KHÔNG phải nội dung đầy đủ)
        formData.append("correctOption", values[`correctOption${idx}`]);
        
        formData.append("questionType", "reading"); // ✅ Set questionType là "reading" cho Part 7
        formData.append("questionSubType", values[`questionType${idx}`]); // ✅ Thêm questionSubType từ form (như "[Part 7] Câu hỏi tìm thông tin")
        formData.append("questionExplanation", values[`questionExplanation${idx}`]);
        await QuestionService.update(q._id || q.questionId, formData);
      }

      retrieveQuestions();
      if (onClose) onClose();
      toast.success("Chỉnh sửa nhóm và câu hỏi thành công", { autoClose: 1000 });
    } catch (error) {
      let errorMessage = 'Lỗi khi chỉnh sửa nhóm/câu hỏi';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request?.response) {
        try {
          const jsonResponse = JSON.parse(error.request.response);
          errorMessage = jsonResponse.message;
        } catch { }
      }
      toast.error(errorMessage, { autoClose: 1000, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (imageName) =>
    imageName ? `http://localhost:9004/images/${imageName}` : "https://demofree.sirv.com/nope-not-here.jpg";

  if (!questions.length) return <div>Đang tải...</div>;

  return (
    <div className="edit-question-section7-1-page">
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <div className="modal-body text-start p-4">
          <div className="form-group mb-3">
            <label htmlFor="groupImage">
              Hình ảnh nhóm câu hỏi<span className="required-field">*</span>
            </label>
            <input
              ref={imageInputRef}
              name="groupImage"
              id="groupImage"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className={`form-control border-secondary custom-font ${formik.touched.groupImage && formik.errors.groupImage ? 'is-invalid' : ''
                }`}
              onChange={onImageChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.groupImage && formik.errors.groupImage && (
              <div className="error-feedback">{formik.errors.groupImage}</div>
            )}
            {/* Current Image */}
            {group?.groupImage && (
              <div className="mt-2">
                <img
                  src={getImageUrl(group.groupImage)}
                  alt="Current Group"
                  className="img-thumbnail"
                  style={{ maxWidth: '200px', maxHeight: '150px' }}
                />
              </div>
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
          </div>
          <div className="form-group mb-3">
            <label className="form-label">
              Đoạn văn nhóm câu hỏi<span className="required-field">*</span>
            </label>
            <div className="ckeditor-container">
              <CKEditorOptimized
                data={editorData}
                onChange={handlePassageChange}
                placeholder="Nhập passage cho part 7..."
                height="250px"
              />
            </div>
            {!editorData && formik.submitCount > 0 && (
              <div className="error-feedback">Question Group Passage phải có giá trị.</div>
            )}
          </div>
          <hr />
          <div className="row">
            {questions.map((q, idx) => (
              <div key={q._id || q.questionId} className="col-md-6 mb-4">
                <div className="form-group mb-3">
                  <label htmlFor={`questionContent${idx}`}>
                    Question Content {idx + 1}<span className="required-field">*</span>
                  </label>
                  <input
                    name={`questionContent${idx}`}
                    type="text"
                    id={`questionContent${idx}`}
                    className={`form-control border-secondary custom-font ${formik.touched[`questionContent${idx}`] && formik.errors[`questionContent${idx}`] ? 'is-invalid' : ''
                      }`}
                    value={formik.values[`questionContent${idx}`]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={`Nhập nội dung câu hỏi ${idx + 1}`}
                  />
                  {formik.touched[`questionContent${idx}`] && formik.errors[`questionContent${idx}`] && (
                    <div className="error-feedback">{formik.errors[`questionContent${idx}`]}</div>
                  )}
                </div>
                {["A", "B", "C", "D"].map((opt) => (
                  <div className="form-group mb-3" key={opt}>
                    <label htmlFor={`option${opt}${idx}`}>
                      Option {opt}<span className="required-field">*</span>
                    </label>
                    <input
                      name={`option${opt}${idx}`}
                      type="text"
                      id={`option${opt}${idx}`}
                      className={`form-control border-secondary custom-font ${formik.touched[`option${opt}${idx}`] && formik.errors[`option${opt}${idx}`] ? 'is-invalid' : ''
                        }`}
                      value={formik.values[`option${opt}${idx}`]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={`Nhập option ${opt} cho câu hỏi ${idx + 1}`}
                    />
                    {formik.touched[`option${opt}${idx}`] && formik.errors[`option${opt}${idx}`] && (
                      <div className="error-feedback">{formik.errors[`option${opt}${idx}`]}</div>
                    )}
                  </div>
                ))}
                <div className="form-group mb-3">
                  <label>
                    Correct Option<span className="required-field">*</span>
                  </label>
                  <div className="d-flex">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div className="form-check me-2" key={opt}>
                        <input
                          className="form-check-input"
                          type="radio"
                          id={`correctOption${opt}${idx}`}
                          name={`correctOption${idx}`}
                          value={opt}
                          checked={formik.values[`correctOption${idx}`] === opt}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className="form-check-label" htmlFor={`correctOption${opt}${idx}`}>{opt}</label>
                      </div>
                    ))}
                  </div>
                  {formik.touched[`correctOption${idx}`] && formik.errors[`correctOption${idx}`] && (
                    <div className="error-feedback">{formik.errors[`correctOption${idx}`]}</div>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor={`questionType${idx}`} className="form-label">
                    Loại<span className="required-field">*</span>
                  </label>
                  <input
                    name={`questionType${idx}`}
                    type="text"
                    id={`questionType${idx}`}
                    className={`form-control border-secondary custom-font ${formik.touched[`questionType${idx}`] && formik.errors[`questionType${idx}`] ? 'is-invalid' : ''
                      }`}
                    value={formik.values[`questionType${idx}`]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập loại câu hỏi"
                  />
                  {formik.touched[`questionType${idx}`] && formik.errors[`questionType${idx}`] && (
                    <div className="error-feedback">{formik.errors[`questionType${idx}`]}</div>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor={`questionExplanation${idx}`}>
                    Question Explanation {idx + 1}
                    <span className="required-field">*</span>
                  </label>
                  <input
                    name={`questionExplanation${idx}`}
                    type="text"
                    id={`questionExplanation${idx}`}
                    className={`form-control border-secondary custom-font ${formik.touched[`questionExplanation${idx}`] && formik.errors[`questionExplanation${idx}`] ? 'is-invalid' : ''
                      }`}
                    value={formik.values[`questionExplanation${idx}`]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched[`questionExplanation${idx}`] && formik.errors[`questionExplanation${idx}`] && (
                    <div className="error-feedback">{formik.errors[`questionExplanation${idx}`]}</div>
                  )}
                </div>
              </div>
            ))}
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

export default EditQuestionSection7_1;