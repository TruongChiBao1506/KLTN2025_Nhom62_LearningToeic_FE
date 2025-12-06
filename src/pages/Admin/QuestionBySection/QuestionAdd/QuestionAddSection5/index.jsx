import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import CKEditorOptimized from '../../../../../components/Admin/EditorOptimized';

import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddSection5 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        questionContent: Yup
            .string()
            .required("questionContent phải có giá trị.")
            .min(2, "questionContent phải ít nhất 2 ký tự.")
            .max(500, "questionContent có nhiều nhất 500 ký tự."),
        optionA: Yup
            .string()
            .required("OptionA phải có giá trị.")
            .min(2, "OptionA phải ít nhất 2 ký tự.")
            .max(500, "OptionA có nhiều nhất 500 ký tự."),
        optionB: Yup
            .string()
            .required("OptionB phải có giá trị.")
            .min(2, "OptionB phải ít nhất 2 ký tự.")
            .max(500, "OptionB có nhiều nhất 500 ký tự."),
        optionC: Yup
            .string()
            .required("OptionC phải có giá trị.")
            .min(2, "OptionC phải ít nhất 2 ký tự.")
            .max(500, "OptionC có nhiều nhất 500 ký tự."),
        optionD: Yup
            .string()
            .required("OptionD phải có giá trị.")
            .min(2, "OptionD phải ít nhất 2 ký tự.")
            .max(500, "OptionD có nhiều nhất 500 ký tự."),
        correctOption: Yup
            .string()
            .required("correctOption phải có giá trị."),
        questionType: Yup.string().required("Loại phải được chọn."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            questionContent: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '',
            questionType: ''
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    // CKEditorOptimized event handlers
    const onEditorReady = (editor) => {
        editorRef.current = editor;
    };

    const onEditorBlur = () => {};

    const addQuestion = async (values, resetForm) => {
        try {
            if (!editorData || editorData.trim() === '') {
                toast.error('Question Explanation phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionContent", values.questionContent);
            formData.append("optionA", values.optionA);
            formData.append("optionB", values.optionB);
            formData.append("optionC", values.optionC);
            formData.append("optionD", values.optionD);

            // ✅ Lưu correctOption là chữ cái A/B/C/D (KHÔNG phải nội dung đầy đủ)
            formData.append("correctOption", values.correctOption);

            formData.append("questionType", values.questionType);
            formData.append("questionExplanation", editorData);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetFormAndState(resetForm);

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm câu hỏi thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            let errorMessage = 'Lỗi khi thêm câu hỏi';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.request?.response) {
                try {
                    const jsonResponse = JSON.parse(error.request.response);
                    errorMessage = jsonResponse.message;
                } catch (parseError) {}
            }
            toast.error(errorMessage, {
                autoClose: 1000,
                position: 'top-right',
            });
        }
    };

    const resetFormAndState = (resetForm) => {
        resetForm();
        setEditorData('');
        if (editorRef.current) {
            editorRef.current.setData('');
        }
    };

    return (
        <div className="question-add-section5-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start p-4">
                    <div className="row">
                        <div className="col">
                            {/* Question Content */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionContent" className="form-label">
                                    Nội dung câu hỏi<span className="required-field">*</span>
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
                                    placeholder="Nhập nội dung câu hỏi Part 5"
                                />
                                {formik.touched.questionContent && formik.errors.questionContent && (
                                    <div className="error-feedback">{formik.errors.questionContent}</div>
                                )}
                            </div>

                            {/* Option A */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionA" className="form-label">
                                    Option A<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionA"
                                    type="text"
                                    id="optionA"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionA && formik.errors.optionA ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.optionA}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập option A"
                                />
                                {formik.touched.optionA && formik.errors.optionA && (
                                    <div className="error-feedback">{formik.errors.optionA}</div>
                                )}
                            </div>

                            {/* Option B */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionB" className="form-label">
                                    Option B<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionB"
                                    type="text"
                                    id="optionB"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionB && formik.errors.optionB ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.optionB}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập option B"
                                />
                                {formik.touched.optionB && formik.errors.optionB && (
                                    <div className="error-feedback">{formik.errors.optionB}</div>
                                )}
                            </div>

                            {/* Option C */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionC" className="form-label">
                                    Option C<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionC"
                                    type="text"
                                    id="optionC"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionC && formik.errors.optionC ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.optionC}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập option C"
                                />
                                {formik.touched.optionC && formik.errors.optionC && (
                                    <div className="error-feedback">{formik.errors.optionC}</div>
                                )}
                            </div>

                            {/* Option D */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionD" className="form-label">
                                    Option D<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionD"
                                    type="text"
                                    id="optionD"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionD && formik.errors.optionD ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.optionD}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập option D"
                                />
                                {formik.touched.optionD && formik.errors.optionD && (
                                    <div className="error-feedback">{formik.errors.optionD}</div>
                                )}
                            </div>

                            {/* Correct Option Radio Buttons */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Đáp án đúng<span className="required-field">*</span>
                                </label>
                                <div className="d-flex">
                                    {['A', 'B', 'C', 'D'].map((option) => (
                                        <div key={option} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id={`correctOption${option}`}
                                                name="correctOption"
                                                value={option}
                                                checked={formik.values.correctOption === option}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <label className="form-check-label me-3" htmlFor={`correctOption${option}`}>
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {formik.touched.correctOption && formik.errors.correctOption && (
                                    <div className="error-feedback">{formik.errors.correctOption}</div>
                                )}
                            </div>

                            {/* Question Type */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionType" className="form-label">
                                    Loại<span className="required-field">*</span>
                                </label>
                                <select
                                    name="questionType"
                                    id="questionType"
                                    className={`form-select border-secondary custom-font ${
                                        formik.touched.questionType && formik.errors.questionType ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.questionType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="" disabled>Chọn một tùy chọn</option>
                                    <option value="[Part 5] Câu hỏi ngữ pháp">[Part 5] Câu hỏi ngữ pháp</option>
                                    <option value="[Part 5] Câu hỏi từ vựng">[Part 5] Câu hỏi từ vựng</option>
                                    <option value="[Part 5] Câu hỏi từ loại">[Part 5] Câu hỏi từ loại</option>
                                </select>
                                {formik.touched.questionType && formik.errors.questionType && (
                                    <div className="error-feedback">{formik.errors.questionType}</div>
                                )}
                            </div>

                            {/* Question Explanation với CKEditorOptimized */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Giải thích câu hỏi<span className="required-field">*</span>
                                </label>
                                <div className="ckeditor-container">
                                    <CKEditorOptimized
                                        data={editorData}
                                        onChange={setEditorData}
                                        onReady={onEditorReady}
                                        onBlur={onEditorBlur}
                                        placeholder="Nhập giải thích chi tiết cho câu hỏi Part 5..."
                                        height="250px"
                                    />
                                </div>
                                {/* Custom validation error display */}
                                {!editorData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Question Explanation phải có giá trị.</div>
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
                            formik.resetForm();
                            resetFormAndState(() => {});
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
                        {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionAddSection5;