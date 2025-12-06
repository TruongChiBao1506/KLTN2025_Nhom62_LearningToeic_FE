import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CKEditorOptimized from '../../../../../components/Admin/EditorOptimized';
import { toast } from 'react-toastify';
import QuestionService from '../../../../../services/questionService';
import QuestionGroupService from '../../../../../services/questionGroupService';
import './style.css';

const QuestionAddSection7_1 = ({ sectionId, retrieveQuestions, onClose }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(2);
  const [groupPassage, setGroupPassage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Generate dynamic validation schema based on number of questions
  const generateValidationSchema = (numQuestions) => {
    const baseSchema = {
      groupImage: yup
        .mixed()
        .nullable()
        .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
          const file = value && value.length ? value[0] : value;
          if (!file) return true;
          const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
          return allowedFormats.includes(file.type);
        })
        .test("fileSize", "Tệp ảnh quá lớn", (value) => {
          const file = value && value.length ? value[0] : value;
          if (!file) return true;
          return file.size <= 1024 * 1024;
        }),
    };

    for (let i = 0; i < numQuestions; i++) {
      baseSchema[`questionContent${i}`] = yup
        .string()
        .required("questionContent phải có giá trị.")
        .min(2, "questionContent phải ít nhất 2 ký tự.")
        .max(500, "questionContent có nhiều nhất 500 ký tự.");

      baseSchema[`optionA${i}`] = yup
        .string()
        .required("OptionA phải có giá trị.")
        .min(2, "OptionA phải ít nhất 2 ký tự.")
        .max(500, "OptionA có nhiều nhất 500 ký tự.");

      baseSchema[`optionB${i}`] = yup
        .string()
        .required("OptionB phải có giá trị.")
        .min(2, "OptionB phải ít nhất 2 ký tự.")
        .max(500, "OptionB có nhiều nhất 500 ký tự.");

      baseSchema[`optionC${i}`] = yup
        .string()
        .required("OptionC phải có giá trị.")
        .min(2, "OptionC phải ít nhất 2 ký tự.")
        .max(500, "OptionC có nhiều nhất 500 ký tự.");

      baseSchema[`optionD${i}`] = yup
        .string()
        .required("OptionD phải có giá trị.")
        .min(2, "OptionD phải ít nhất 2 ký tự.")
        .max(500, "OptionD có nhiều nhất 500 ký tự.");

      baseSchema[`correctOption${i}`] = yup
        .string()
        .required("correctOption phải có giá trị.");

      baseSchema[`questionType${i}`] = yup
        .string()
        .required("Loại phải được chọn.");

      baseSchema[`questionExplanation${i}`] = yup
        .string()
        .required("questionExplanation phải có giá trị.")
        .min(2, "questionExplanation phải ít nhất 2 ký tự.")
        .max(1000, "questionExplanation có nhiều nhất 1000 ký tự.");
    }

    return yup.object().shape(baseSchema);
  };

  const questionFormSchema = generateValidationSchema(numberOfQuestions);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(questionFormSchema),
  });

  // Handle number of questions change
  const handleSetNumberOfQuestions = (count) => {
    setNumberOfQuestions(count);
    reset();
  };

  // Handle image change
  const onImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setValue('groupImage', file);
  };

  // Handle passage change (CKEditorOptimized)
  const handlePassageChange = (data) => {
    setGroupPassage(data);
  };

  // Reset all form and state
  const resetFormAndState = () => {
    setSelectedImage(null);
    setGroupPassage("");
    reset();
  };

  // Submit form
  const addQuestion = async (data) => {
    try {
      if (!groupPassage || groupPassage.trim() === "") {
        toast.error('Question Group Passage phải có giá trị', { autoClose: 1000 });
        return;
      }

      // Create question group
      const groupFormData = new FormData();
      groupFormData.append("sectionId", sectionId);
      if (selectedImage) {
        groupFormData.append("groupImage", selectedImage, selectedImage.name);
      }
      groupFormData.append("groupPassage", groupPassage);

      const response = await QuestionGroupService.create(groupFormData);
      const groupId = response.groupId;

      // Build questions từ data react-hook-form
      const questions = [];
      for (let i = 0; i < numberOfQuestions; i++) {
        questions.push({
          questionContent: data[`questionContent${i}`],
          optionA: data[`optionA${i}`],
          optionB: data[`optionB${i}`],
          optionC: data[`optionC${i}`],
          optionD: data[`optionD${i}`],
          correctOption: data[`correctOption${i}`],
          questionType: data[`questionType${i}`],
          questionExplanation: data[`questionExplanation${i}`],
        });
      }

      // Create individual questions
      for (const question of questions) {
        const formData = new FormData();
        formData.append("sectionId", sectionId);
        formData.append("groupId", groupId);
        formData.append("questionContent", question.questionContent);
        formData.append("optionA", question.optionA);
        formData.append("optionB", question.optionB);
        formData.append("optionC", question.optionC);
        formData.append("optionD", question.optionD);

        // ✅ Lưu correctOption là chữ cái A/B/C/D (KHÔNG phải nội dung đầy đủ)
        formData.append("correctOption", question.correctOption);

        // ✅ Thêm questionSubType (giá trị chi tiết)
        formData.append("questionSubType", question.questionType);
        // ✅ Tự động set questionType là "reading" cho Part 7
        formData.append("questionType", "reading");
        formData.append("questionExplanation", question.questionExplanation);

        await QuestionService.create(formData);
      }

      toast.success('Thêm Questions thành công', { autoClose: 1000 });
      retrieveQuestions();

      // Reset form và các state
      resetFormAndState();

      // Close modal nếu có
      if (onClose) onClose();

    } catch (error) {
      toast.error('Lỗi khi thêm Questions', { autoClose: 1000 });
    }
  };

  const questionTypeOptions = [
    { value: "", label: "Chọn một tùy chọn", disabled: true },
    { value: "[Part 7] Câu hỏi tìm thông tin", label: "[Part 7] Câu hỏi tìm thông tin" },
    { value: "[Part 7] Câu hỏi tìm chi tiết sai", label: "[Part 7] Câu hỏi tìm chi tiết sai" },
    { value: "[Part 7] Câu hỏi về chủ đề, mục đích", label: "[Part 7] Câu hỏi về chủ đề, mục đích" },
    { value: "[Part 7] Câu hỏi suy luận", label: "[Part 7] Câu hỏi suy luận" },
    { value: "[Part 7] Câu hỏi điền câu", label: "[Part 7] Câu hỏi điền câu" },
    { value: "[Part 7] Cấu trúc: một đoạn", label: "[Part 7] Cấu trúc: một đoạn" },
    { value: "[Part 7] Cấu trúc: nhiều đoạn", label: "[Part 7] Cấu trúc: nhiều đoạn" },
    { value: "[Part 7] Dạng bài: Email/ Letter: Thư điện tử/ Thư tay", label: "[Part 7] Dạng bài: Email/ Letter: Thư điện tử/ Thư tay" },
    { value: "[Part 7] Dạng bài: Form - Đơn từ, biểu mẫu", label: "[Part 7] Dạng bài: Form - Đơn từ, biểu mẫu" },
    { value: "[Part 7] Dạng bài: Article/ Review: Bài báo/ Bài đánh giá", label: "[Part 7] Dạng bài: Article/ Review: Bài báo/ Bài đánh giá" },
    { value: "[Part 7] Dạng bài: Advertisement - Quảng cáo", label: "[Part 7] Dạng bài: Advertisement - Quảng cáo" },
    { value: "[Part 7] Dạng bài: Announcement/ Notice: Thông báo", label: "[Part 7] Dạng bài: Announcement/ Notice: Thông báo" },
    { value: "[Part 7] Dạng bài: Text message chain - Chuỗi tin nhắn", label: "[Part 7] Dạng bài: Text message chain - Chuỗi tin nhắn" },
    { value: "[Part 7] Câu hỏi tìm từ đồng nghĩa", label: "[Part 7] Câu hỏi tìm từ đồng nghĩa" },
    { value: "[Part 7] Câu hỏi về hàm ý câu nói", label: "[Part 7] Câu hỏi về hàm ý câu nói" }
  ];

  return (
    <div className="question-add-section7-1-page page">
      {/* Number of Questions Selection */}
      <div className="question-count-selector-sticky d-flex justify-content-center mt-0">
        <button
          type="button"
          className={`button${numberOfQuestions === 2 ? ' active' : ''}`}
          onClick={() => handleSetNumberOfQuestions(2)}
        >
          2 Câu Hỏi
        </button>
        <button
          type="button"
          className={`button mx-2${numberOfQuestions === 3 ? ' active' : ''}`}
          onClick={() => handleSetNumberOfQuestions(3)}
        >
          3 Câu Hỏi
        </button>
        <button
          type="button"
          className={`button mx-2${numberOfQuestions === 4 ? ' active' : ''}`}
          onClick={() => handleSetNumberOfQuestions(4)}
        >
          4 Câu Hỏi
        </button>
        <button
          type="button"
          className={`button${numberOfQuestions === 5 ? ' active' : ''}`}
          onClick={() => handleSetNumberOfQuestions(5)}
        >
          5 Câu Hỏi
        </button>
      </div>

      <form onSubmit={handleSubmit(addQuestion)} encType="multipart/form-data">
        <div className="modal-body text-start p-4">
          {/* Group Image */}
          <div className="form-group mb-3">
            <label htmlFor="groupImage">
              Hình ảnh nhóm câu hỏi<span className="required-field">*</span>
            </label>
            <input
              type="file"
              className="form-control border-secondary custom-font"
              onChange={onImageChange}
              {...register('groupImage')}
            />
            {errors.groupImage && (
              <div className="error-feedback">{errors.groupImage.message}</div>
            )}
            {selectedImage && (
              <div className="file-preview mt-2">
                <small className="text-muted">
                  Đã chọn: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                </small>
                <div className="image-preview mt-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Group Passage với CKEditorOptimized */}
          <div className="form-group mb-3">
            <label htmlFor="groupPassage" className="form-label">
              Đoạn văn nhóm câu hỏi<span className="required-field">*</span>
            </label>
            <div className="ckeditor-container">
              <CKEditorOptimized
                data={groupPassage}
                onChange={handlePassageChange}
                placeholder="Nhập passage cho Part 7..."
                height="250px"
              />
            </div>
            {!groupPassage && (
              <div className="error-feedback">Question Group Passage phải có giá trị.</div>
            )}
          </div>

          <hr />

          {/* Questions */}
          <div className="row">
            {Array.from({ length: numberOfQuestions }).map((_, index) => (
              <div key={index} className="col-md-6 mb-4">
                {/* Question Content */}
                <div className="form-group">
                  <label htmlFor={`questionContent${index}`}>
                    Question Content {index + 1}<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    {...register(`questionContent${index}`)}
                  />
                  {errors[`questionContent${index}`] && (
                    <div className="error-feedback">{errors[`questionContent${index}`].message}</div>
                  )}
                </div>

                {/* Option A */}
                <div className="form-group">
                  <label htmlFor={`optionA${index}`}>
                    Option A<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    {...register(`optionA${index}`)}
                  />
                  {errors[`optionA${index}`] && (
                    <div className="error-feedback">{errors[`optionA${index}`].message}</div>
                  )}
                </div>

                {/* Option B */}
                <div className="form-group">
                  <label htmlFor={`optionB${index}`}>
                    Option B<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    {...register(`optionB${index}`)}
                  />
                  {errors[`optionB${index}`] && (
                    <div className="error-feedback">{errors[`optionB${index}`].message}</div>
                  )}
                </div>

                {/* Option C */}
                <div className="form-group">
                  <label htmlFor={`optionC${index}`}>
                    Option C<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    {...register(`optionC${index}`)}
                  />
                  {errors[`optionC${index}`] && (
                    <div className="error-feedback">{errors[`optionC${index}`].message}</div>
                  )}
                </div>

                {/* Option D */}
                <div className="form-group">
                  <label htmlFor={`optionD${index}`}>
                    Option D<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    {...register(`optionD${index}`)}
                  />
                  {errors[`optionD${index}`] && (
                    <div className="error-feedback">{errors[`optionD${index}`].message}</div>
                  )}
                </div>

                {/* Correct Answer Radio Buttons */}
                <div className="form-group">
                  <label>Correct Answer<span className="required-field">*</span></label>
                  <div>
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div key={option} className="form-check form-check-inline">
                        <input
                          type="radio"
                          className="form-check-input"
                          id={`option${option}${index}`}
                          value={option}
                          {...register(`correctOption${index}`)}
                        />
                        <label className="form-check-label" htmlFor={`option${option}${index}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors[`correctOption${index}`] && (
                    <div className="error-feedback">{errors[`correctOption${index}`].message}</div>
                  )}
                </div>

                {/* Question Explanation */}
                <div className="form-group">
                  <label htmlFor={`questionExplanation${index}`}>
                    Question Explanation {index + 1}<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    {...register(`questionExplanation${index}`)}
                  />
                  {errors[`questionExplanation${index}`] && (
                    <div className="error-feedback">{errors[`questionExplanation${index}`].message}</div>
                  )}
                </div>

                {/* Question Type */}
                <div className="form-group mb-3">
                  <label htmlFor={`questionType${index}`} className="form-label">
                    Type<span className="required-field">*</span>
                  </label>
                  <select
                    className="form-select border-secondary custom-font"
                    {...register(`questionType${index}`)}
                  >
                    {questionTypeOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[`questionType${index}`] && (
                    <div className="error-feedback">{errors[`questionType${index}`].message}</div>
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
              resetFormAndState();
              if (onClose) onClose();
            }}
          >
            Đóng
          </button>
          <button type="submit" className="btn btn-primary rounded-5">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionAddSection7_1;