import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import VocabularyQuestionService from '../../../../services/vocabularyQuestionService';
import './style.css';

const VocabularyQuestionEdit = ({ vocabularyQuestionId, topicId, retrieveVocabularyQuestions, onClose }) => {
    const [vocabularyQuestion, setVocabularyQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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
        enableReinitialize: true, // Important: Allow form to reinitialize when vocabulary question data loads
        onSubmit: async (values, { resetForm }) => {
            await updateVocabularyQuestion(values, resetForm);
        }
    });

    // Get vocabulary question data
    const getVocabularyQuestion = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Fetching vocabulary question with ID:', vocabularyQuestionId);

            const data = await VocabularyQuestionService.get(vocabularyQuestionId);
            console.log('📄 Vocabulary question data received:', data);

            setVocabularyQuestion(data);

            // Determine which radio button should be checked based on correctOption
            let selectedOption = '';
            if (data.correctOption === data.optionA) {
                selectedOption = 'A';
            } else if (data.correctOption === data.optionB) {
                selectedOption = 'B';
            } else if (data.correctOption === data.optionC) {
                selectedOption = 'C';
            } else if (data.correctOption === data.optionD) {
                selectedOption = 'D';
            }

            // Update formik values
            formik.setValues({
                questionContent: data.questionContent || '',
                optionA: data.optionA || '',
                optionB: data.optionB || '',
                optionC: data.optionC || '',
                optionD: data.optionD || '',
                correctOption: selectedOption, // Set radio button value (A, B, C, or D)
                questionExplanation: data.questionExplanation || ''
            });

            // Set editor data
            setEditorData(data.questionExplanation || '');

            console.log('  Vocabulary question data loaded successfully');
            console.log('Selected option:', selectedOption);

        } catch (error) {
            console.log('❌ Error fetching vocabulary question:', error);
            toast.error('Lỗi khi tải dữ liệu câu hỏi từ vựng', {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

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

    // Update vocabulary question function
    const updateVocabularyQuestion = async (values, resetForm) => {
        try {
            console.log('🚀 Starting updateVocabularyQuestion with values:', values);
            console.log('🚀 Vocabulary Question ID:', vocabularyQuestionId);
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
                    correctOptionValue = values.correctOption; // fallback to original value
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

            console.log('📤 Sending update request to server...');
            console.log('Payload:', payload);

            await VocabularyQuestionService.update(vocabularyQuestionId, payload);
            console.log('  Vocabulary question updated successfully');

            retrieveVocabularyQuestions();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa câu hỏi từ vựng thành công', {
                autoClose: 1000,
            });

        } catch (error) {
            console.log('❌ Error updating vocabulary question:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa câu hỏi từ vựng';

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
        await updateVocabularyQuestion(formik.values, formik.resetForm);
    };

    // Load vocabulary question data when component mounts or vocabularyQuestionId changes
    useEffect(() => {
        if (vocabularyQuestionId) {
            getVocabularyQuestion();
        }
    }, [vocabularyQuestionId]);

    // Show loading while fetching vocabulary question data
    if (isLoading) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu câu hỏi từ vựng...</p>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Đóng
                    </button>
                </div>
            </>
        );
    }

    // Show error if vocabulary question not found
    if (!vocabularyQuestion) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Không thể tải dữ liệu câu hỏi từ vựng
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Đóng
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="edit-questionContent" className="form-label">
                        Nội dung câu hỏi<span className="required-field">*</span>
                    </label>
                    <input
                        name="questionContent"
                        type="text"
                        id="edit-questionContent"
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
                    <label htmlFor="edit-optionA" className="form-label">
                        Lựa chọn A<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionA"
                        type="text"
                        id="edit-optionA"
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
                    <label htmlFor="edit-optionB" className="form-label">
                        Lựa chọn B<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionB"
                        type="text"
                        id="edit-optionB"
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
                    <label htmlFor="edit-optionC" className="form-label">
                        Lựa chọn C<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionC"
                        type="text"
                        id="edit-optionC"
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
                    <label htmlFor="edit-optionD" className="form-label">
                        Lựa chọn D<span className="required-field">*</span>
                    </label>
                    <input
                        name="optionD"
                        type="text"
                        id="edit-optionD"
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
                        Đáp án đúng<span className="required-field">*</span>
                    </label>
                    <div className="d-flex">
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="edit-correctOptionA"
                                name="correctOption"
                                value="A"
                                checked={formik.values.correctOption === 'A'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="edit-correctOptionA">
                                A
                            </label>
                        </div>
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="edit-correctOptionB"
                                name="correctOption"
                                value="B"
                                checked={formik.values.correctOption === 'B'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="edit-correctOptionB">
                                B
                            </label>
                        </div>
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="edit-correctOptionC"
                                name="correctOption"
                                value="C"
                                checked={formik.values.correctOption === 'C'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="edit-correctOptionC">
                                C
                            </label>
                        </div>
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="edit-correctOptionD"
                                name="correctOption"
                                value="D"
                                checked={formik.values.correctOption === 'D'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label" htmlFor="edit-correctOptionD">
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
                        Giải thích câu hỏi<span className="required-field">*</span>
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
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClose();
                    }}
                >
                    Đóng
                </button>
                <button
                    type="button"
                    className="btn btn-primary rounded-5"
                    disabled={formik.isSubmitting || isLoading}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }}
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

export default VocabularyQuestionEdit;