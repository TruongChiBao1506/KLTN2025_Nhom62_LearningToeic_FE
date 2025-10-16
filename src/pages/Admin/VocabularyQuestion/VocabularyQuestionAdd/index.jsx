import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import VocabularyQuestionService from '../../../../services/vocabularyQuestionService';
import './style.css';

const VocabularyQuestionAdd = ({ topicId, retrieveVocabularyQuestions, onClose }) => {
    const [editorData, setEditorData] = useState('');

    // Validation schema
    const vocabularyQuestionFormSchema = Yup.object().shape({
        questionContent: Yup
            .string()
            .required("Question Content phải có giá trị.")
            .min(2, "Question Content phải ít nhất 2 ký tự.")
            .max(500, "Question Content có nhiều nhất 500 ký tự."),
        optionA: Yup
            .string()
            .required("Option A phải có giá trị.")
            .min(2, "Option A phải ít nhất 2 ký tự.")
            .max(500, "Option A có nhiều nhất 500 ký tự."),
        optionB: Yup
            .string()
            .required("Option B phải có giá trị.")
            .min(2, "Option B phải ít nhất 2 ký tự.")
            .max(500, "Option B có nhiều nhất 500 ký tự."),
        optionC: Yup
            .string()
            .required("Option C phải có giá trị.")
            .min(2, "Option C phải ít nhất 2 ký tự.")
            .max(500, "Option C có nhiều nhất 500 ký tự."),
        optionD: Yup
            .string()
            .required("Option D phải có giá trị.")
            .min(2, "Option D phải ít nhất 2 ký tự.")
            .max(500, "Option D có nhiều nhất 500 ký tự."),
        correctOption: Yup
            .string()
            .required("Correct Option phải có giá trị.")
            .oneOf(['A', 'B', 'C', 'D'], "Vui lòng chọn đáp án đúng."),
        questionExplanation: Yup
            .string()
            .required("Question Explanation phải có giá trị.")
            .min(2, "Question Explanation phải ít nhất 2 ký tự.")
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
            questionExplanation: ''
        },
        validationSchema: vocabularyQuestionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addVocabularyQuestion(values, resetForm);
        }
    });

    // Handle CKEditor change
    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
        formik.setFieldValue('questionExplanation', data);
    };

    // Handle CKEditor ready
    const onEditorReady = (editor) => {
        // Set initial height
        editor.editing.view.change(writer => {
            writer.setStyle('height', '250px', editor.editing.view.document.getRoot());
        });
    };

    const addVocabularyQuestion = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addVocabularyQuestion with values:', values);
            console.log('🚀 Topic ID:', topicId);

            // Determine correct option value based on selected radio button
            let correctOptionValue = '';
            switch (values.correctOption) {
                case "A":
                    correctOptionValue = "A";
                    break;
                case "B":
                    correctOptionValue = "B";
                    break;
                case "C":
                    correctOptionValue = "C";
                    break;
                case "D":
                    correctOptionValue = "D";
                    break;
                default:
                    correctOptionValue = "";
            }

            // Create JSON payload instead of FormData
            const payload = {
                topicId: topicId,
                questionContent: values.questionContent,
                optionA: values.optionA,
                optionB: values.optionB,
                optionC: values.optionC,
                optionD: values.optionD,
                correctOption: correctOptionValue,
                questionExplanation: values.questionExplanation
            };

            console.log('📤 Sending create request to server...');
            console.log('JSON Payload:', JSON.stringify(payload, null, 2));

            await VocabularyQuestionService.create(payload);
            console.log('✅ Vocabulary question created successfully');

            // Wait for list to refresh before closing modal
            await retrieveVocabularyQuestions();

            // Reset form and states
            resetForm();
            setEditorData('');

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm câu hỏi từ vựng thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error creating vocabulary question:', error);
            let errorMessage = 'Lỗi khi thêm câu hỏi từ vựng';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.request?.response) {
                try {
                    const jsonResponse = JSON.parse(error.request.response);
                    errorMessage = jsonResponse.message;
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                autoClose: 2000,
                position: 'top-right',
            });
        }
    };

    // Handle close
    const handleClose = () => {
        formik.resetForm();
        setEditorData('');

        if (onClose) {
            onClose();
        }
    };

    // Handle submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                questionContent: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctOption: true,
                questionExplanation: true
            });
            return;
        }

        console.log('  Validation passed, submitting...');
        // Submit form
        await addVocabularyQuestion(formik.values, formik.resetForm);
    };

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="questionContent" className="form-label">
                        Question Content<span className="required-field">*</span>
                    </label>
                    <input
                        name="questionContent"
                        type="text"
                        id="questionContent"
                        className={`form-control border-secondary custom-font ${formik.touched.questionContent && formik.errors.questionContent ? 'is-invalid' : ''
                            }`}
                        value={formik.values.questionContent}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập nội dung câu hỏi..."
                    />
                    {formik.touched.questionContent && formik.errors.questionContent && (
                        <div className="error-feedback">{formik.errors.questionContent}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="optionA" className="form-label">
                        Option A<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionA"
                        type="text"
                        id="optionA"
                        className={`form-control border-secondary custom-font ${formik.touched.optionA && formik.errors.optionA ? 'is-invalid' : ''
                            }`}
                        value={formik.values.optionA}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập lựa chọn A..."
                    />
                    {formik.touched.optionA && formik.errors.optionA && (
                        <div className="error-feedback">{formik.errors.optionA}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="optionB" className="form-label">
                        Option B<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionB"
                        type="text"
                        id="optionB"
                        className={`form-control border-secondary custom-font ${formik.touched.optionB && formik.errors.optionB ? 'is-invalid' : ''
                            }`}
                        value={formik.values.optionB}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập lựa chọn B..."
                    />
                    {formik.touched.optionB && formik.errors.optionB && (
                        <div className="error-feedback">{formik.errors.optionB}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="optionC" className="form-label">
                        Option C<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionC"
                        type="text"
                        id="optionC"
                        className={`form-control border-secondary custom-font ${formik.touched.optionC && formik.errors.optionC ? 'is-invalid' : ''
                            }`}
                        value={formik.values.optionC}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập lựa chọn C..."
                    />
                    {formik.touched.optionC && formik.errors.optionC && (
                        <div className="error-feedback">{formik.errors.optionC}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="optionD" className="form-label">
                        Option D<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionD"
                        type="text"
                        id="optionD"
                        className={`form-control border-secondary custom-font ${formik.touched.optionD && formik.errors.optionD ? 'is-invalid' : ''
                            }`}
                        value={formik.values.optionD}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập lựa chọn D..."
                    />
                    {formik.touched.optionD && formik.errors.optionD && (
                        <div className="error-feedback">{formik.errors.optionD}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">
                        Correct Option<span className="required-field">*</span>
                    </label>
                    <div className="d-flex">
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="correctOptionA"
                                name="correctOption"
                                value="A"
                                checked={formik.values.correctOption === 'A'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="correctOptionA">
                                A
                            </label>
                        </div>
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="correctOptionB"
                                name="correctOption"
                                value="B"
                                checked={formik.values.correctOption === 'B'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="correctOptionB">
                                B
                            </label>
                        </div>
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="correctOptionC"
                                name="correctOption"
                                value="C"
                                checked={formik.values.correctOption === 'C'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="correctOptionC">
                                C
                            </label>
                        </div>
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="correctOptionD"
                                name="correctOption"
                                value="D"
                                checked={formik.values.correctOption === 'D'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="correctOptionD">
                                D
                            </label>
                        </div>
                    </div>
                    {formik.touched.correctOption && formik.errors.correctOption && (
                        <div className="error-feedback">{formik.errors.correctOption}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">
                        Question Explanation<span className="required-field">*</span>
                    </label>
                    <div className={`ckeditor-wrapper ${formik.touched.questionExplanation && formik.errors.questionExplanation ? 'is-invalid' : ''
                        }`}>
                        <CKEditor
                            editor={ClassicEditor}
                            data={editorData}
                            onChange={handleEditorChange}
                            onReady={onEditorReady}
                            config={{
                                placeholder: 'Nhập giải thích câu hỏi...',
                                toolbar: [
                                    'heading', '|',
                                    'bold', 'italic', 'underline', '|',
                                    'bulletedList', 'numberedList', '|',
                                    'insertTable', '|',
                                    'undo', 'redo'
                                ]
                            }}
                        />
                    </div>
                    {formik.touched.questionExplanation && formik.errors.questionExplanation && (
                        <div className="error-feedback">{formik.errors.questionExplanation}</div>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary rounded-5"
                    onClick={handleClose}
                >
                    Đóng
                </button>
                <button
                    type="button"
                    className="btn btn-primary rounded-5"
                    disabled={formik.isSubmitting}
                    onClick={handleSubmit}
                >
                    {formik.isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang lưu...
                        </>
                    ) : (
                        'Lưu'
                    )}
                </button>
            </div>
        </>
    );
};

export default VocabularyQuestionAdd;