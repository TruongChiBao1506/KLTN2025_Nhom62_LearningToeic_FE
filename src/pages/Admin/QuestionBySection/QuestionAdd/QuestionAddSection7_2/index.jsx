import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import QuestionService from '../../../../../services/questionService';
import QuestionGroupService from '../../../../../services/questionGroupService';
import './style.css';

const QuestionAddSection7_2 = ({ sectionId, retrieveQuestions }) => {
  const [questionLocal, setQuestionLocal] = useState({
    groupImage: null,
    groupPassage: "",
    questions: Array.from({ length: 5 }, () => ({
      questionContent: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "",
      questionType: "",
      questionExplanation: "",
    }))
  });

  // Validation schema
  const questionFormSchema = yup.object().shape({
    groupImage: yup
      .mixed()
      .required("Vui lòng chọn một tệp ảnh.")
      .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
        if (!value) return true;
        const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        return allowedFormats.includes(value.type);
      })
      .test("fileSize", "Tệp ảnh quá lớn", (value) => {
        if (!value) return true;
        return value.size <= 1024 * 1024;
      }),
    
    // Dynamic validation for questions
    ...Array.from({ length: 5 }, (_, index) => ({
      [`questionContent${index}`]: yup
        .string()
        .required("questionContent phải có giá trị.")
        .min(2, "questionContent phải ít nhất 2 ký tự.")
        .max(500, "questionContent có nhiều nhất 500 ký tự."),
      
      [`optionA${index}`]: yup
        .string()
        .required("OptionA phải có giá trị.")
        .min(2, "OptionA phải ít nhất 2 ký tự.")
        .max(500, "OptionA có nhiều nhất 500 ký tự."),
      
      [`optionB${index}`]: yup
        .string()
        .required("OptionB phải có giá trị.")
        .min(2, "OptionB phải ít nhất 2 ký tự.")
        .max(500, "OptionB có nhiều nhất 500 ký tự."),
      
      [`optionC${index}`]: yup
        .string()
        .required("OptionC phải có giá trị.")
        .min(2, "OptionC phải ít nhất 2 ký tự.")
        .max(500, "OptionC có nhiều nhất 500 ký tự."),
      
      [`optionD${index}`]: yup
        .string()
        .required("OptionD phải có giá trị.")
        .min(2, "OptionD phải ít nhất 2 ký tự.")
        .max(500, "OptionD có nhiều nhất 500 ký tự."),
      
      [`correctOption${index}`]: yup
        .string()
        .required("correctOption phải có giá trị."),
      
      [`questionType${index}`]: yup
        .string()
        .required("Loại phải được chọn."),
      
      [`questionExplanation${index}`]: yup
        .string()
        .required("questionExplanation phải có giá trị.")
        .min(2, "questionExplanation phải ít nhất 2 ký tự.")
        .max(1000, "questionExplanation có nhiều nhất 1000 ký tự."),
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(questionFormSchema),
    defaultValues: {
      groupImage: null,
      ...questionLocal.questions.reduce((acc, _, index) => ({
        ...acc,
        [`questionContent${index}`]: "",
        [`optionA${index}`]: "",
        [`optionB${index}`]: "",
        [`optionC${index}`]: "",
        [`optionD${index}`]: "",
        [`correctOption${index}`]: "",
        [`questionType${index}`]: "",
        [`questionExplanation${index}`]: "",
      }), {})
    }
  });

  // Handle image change
  const onImageChange = (event) => {
    const file = event.target.files[0];
    setQuestionLocal(prev => ({ ...prev, groupImage: file }));
    setValue('groupImage', file);
  };

  // Handle question field changes
  const handleQuestionChange = (index, field, value) => {
    setQuestionLocal(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
    setValue(`${field}${index}`, value);
  };

  // Handle passage change
  const handlePassageChange = (data) => {
    setQuestionLocal(prev => ({ ...prev, groupPassage: data }));
  };

  // Submit form
  const addQuestion = async (data) => {
    try {
      // Create question group
      const groupFormData = new FormData();
      groupFormData.append("sectionId", sectionId);
      if (questionLocal.groupImage) {
        groupFormData.append("groupImage", questionLocal.groupImage, questionLocal.groupImage.name);
      }
      groupFormData.append("groupPassage", questionLocal.groupPassage);

      const response = await QuestionGroupService.create(groupFormData);
      const groupId = response.groupId;

      // Create individual questions
      for (const question of questionLocal.questions) {
        const formData = new FormData();
        formData.append("sectionId", sectionId);
        formData.append("groupId", groupId);
        formData.append("questionContent", question.questionContent);
        formData.append("optionA", question.optionA);
        formData.append("optionB", question.optionB);
        formData.append("optionC", question.optionC);
        formData.append("optionD", question.optionD);
        
        // Set correct option based on selection
        switch (question.correctOption) {
          case "A":
            formData.append("correctOption", question.optionA);
            break;
          case "B":
            formData.append("correctOption", question.optionB);
            break;
          case "C":
            formData.append("correctOption", question.optionC);
            break;
          case "D":
            formData.append("correctOption", question.optionD);
            break;
          default:
            formData.append("correctOption", "");
        }
        
        formData.append("questionType", question.questionType);
        formData.append("questionExplanation", question.questionExplanation);
        
        await QuestionService.create(formData);
      }

      toast.success('Thêm câu hỏi thành công', {
        autoClose: 1000,
      });
      retrieveQuestions();

    } catch (error) {
      console.log(error);
      toast.error('Lỗi khi thêm câu hỏi', {
        autoClose: 1000,
      });
    }
  };

  const questionTypeOptions = [
    { value: "", label: "Select an option", disabled: true },
    { value: "[Part 7] Câu hỏi điền câu", label: "[Part 7] Câu hỏi điền câu" },
    { value: "[Part 7] Câu hỏi suy luận", label: "[Part 7] Câu hỏi suy luận" },
    { value: "[Part 7] Câu hỏi tìm thông tin", label: "[Part 7] Câu hỏi tìm thông tin" },
    { value: "[Part 7] Câu hỏi tìm chi tiết sai", label: "[Part 7] Câu hỏi tìm chi tiết sai" },
    { value: "[Part 7] Câu hỏi tìm từ đồng nghĩa", label: "[Part 7] Câu hỏi tìm từ đồng nghĩa" },
    { value: "[Part 7] Câu hỏi về chủ đề, mục đích", label: "[Part 7] Câu hỏi về chủ đề, mục đích" },
    { value: "[Part 7] Câu hỏi về hàm ý câu nói", label: "[Part 7] Câu hỏi về hàm ý câu nói" }
  ];

  return (
    <div className='question-add-section7-2-page page'>
      <form onSubmit={handleSubmit(addQuestion)} encType="multipart/form-data">
        <div className="modal-body text-start">
          {/* Group Image */}
          <div className="form-group mb-3">
            <label htmlFor="groupImage">
              Question Group Image<span className="required-field">*</span>
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
          </div>

          {/* Group Passage */}
          <div className="form-group mb-3">
            <label htmlFor="groupPassage" className="form-label">
              Question Group Passage<span className="required-field">*</span>
            </label>
            <CKEditor
              editor={ClassicEditor}
              data={questionLocal.groupPassage}
              onChange={(event, editor) => {
                const data = editor.getData();
                handlePassageChange(data);
              }}
              onReady={(editor) => {
                editor.editing.view.change(writer => {
                  writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
                });
              }}
              config={{
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo']
              }}
            />
          </div>

          <hr />

          {/* Questions */}
          <div className="row">
            {questionLocal.questions.map((question, index) => (
              <div key={index} className="col-md-4 mb-5">
                {/* Question Content */}
                <div className="form-group">
                  <label htmlFor={`questionContent${index}`}>
                    Question Content {index + 1}<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    value={question.questionContent}
                    onChange={(e) => handleQuestionChange(index, 'questionContent', e.target.value)}
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
                    value={question.optionA}
                    onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)}
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
                    value={question.optionB}
                    onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)}
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
                    value={question.optionC}
                    onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)}
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
                    value={question.optionD}
                    onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)}
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
                          checked={question.correctOption === option}
                          onChange={(e) => handleQuestionChange(index, 'correctOption', e.target.value)}
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

                {/* Question Type */}
                <div className="form-group mb-3">
                  <label htmlFor={`questionType${index}`} className="form-label">
                    Type<span className="required-field">*</span>
                  </label>
                  <select
                    className="form-select border-secondary custom-font"
                    value={question.questionType}
                    onChange={(e) => handleQuestionChange(index, 'questionType', e.target.value)}
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

                {/* Question Explanation */}
                <div className="form-group">
                  <label htmlFor={`questionExplanation${index}`}>
                    Question Explanation {index + 1}<span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary custom-font"
                    value={question.questionExplanation}
                    onChange={(e) => handleQuestionChange(index, 'questionExplanation', e.target.value)}
                    {...register(`questionExplanation${index}`)}
                  />
                  {errors[`questionExplanation${index}`] && (
                    <div className="error-feedback">{errors[`questionExplanation${index}`].message}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
            Đóng
          </button>
          <button type="submit" className="btn btn-primary">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionAddSection7_2;