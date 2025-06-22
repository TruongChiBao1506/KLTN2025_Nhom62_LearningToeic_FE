import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import QuestionService from '../../../../services/questionService';
import './style.css';

const QuestionAddNo1To2 = ({ sectionId, retrieveQuestions, onClose }) => {
    // Validation schema
    const questionFormSchema = Yup.object().shape({
        questionText: Yup
            .string()
            .required("questionText phải có giá trị.")
            .min(2, "questionText phải ít nhất 2 ký tự.")
            .max(500, "questionText có nhiều nhất 500 ký tự."),
        suggestedAnswer: Yup
            .string()
            .required("suggestedAnswer phải có giá trị.")
            .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
            .max(2000, "suggestedAnswer có nhiều nhất 2000 ký tự."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            questionText: '',
            suggestedAnswer: ''
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    const addQuestion = async (values, resetForm) => {
        try {
            console.log('Section ID:', sectionId);
            console.log('Form values:', values);

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionText", values.questionText);
            formData.append("suggestedAnswer", values.suggestedAnswer);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form
            resetForm();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm câu hỏi thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('Error adding question:', error);
            let errorMessage = 'Lỗi khi thêm câu hỏi';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.request?.response) {
                try {
                    const jsonResponse = JSON.parse(error.request.response);
                    errorMessage = jsonResponse.message;
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
            }

            toast.error(errorMessage, {
                autoClose: 1000,
                position: 'top-right',
            });
        }
    };

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        <div className="col">
                            {/* Question Text Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionText" className="form-label">
                                    Text<span className="required-field">*</span>
                                </label>
                                <input
                                    name="questionText"
                                    type="text"
                                    id="questionText"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.questionText && formik.errors.questionText ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.questionText}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập nội dung câu hỏi"
                                />
                                {formik.touched.questionText && formik.errors.questionText && (
                                    <div className="error-feedback">{formik.errors.questionText}</div>
                                )}
                            </div>

                            {/* Suggested Answer Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="suggestedAnswer" className="form-label">
                                    Suggested Answer<span className="required-field">*</span>
                                </label>
                                <textarea
                                    name="suggestedAnswer"
                                    id="suggestedAnswer"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.suggestedAnswer && formik.errors.suggestedAnswer ? 'is-invalid' : ''
                                    }`}
                                    style={{ height: '150px', resize: 'none' }}
                                    value={formik.values.suggestedAnswer}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập gợi ý trả lời"
                                />
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
                        className="btn btn-secondary" 
                        onClick={() => {
                            formik.resetForm();
                            if (onClose) onClose();
                        }}
                    >
                        Đóng
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionAddNo1To2;