import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

import GrammarQuestionService from '../../../../services/grammarQuestionService';
import './style.css';

const GrammarQuestionEdit = ({ grammarQuestionId, grammarId, retrieveGrammarQuestions, onClose }) => {
    const [grammarQuestion, setGrammarQuestion] = useState(null);
    const [explanationEditorData, setExplanationEditorData] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Validation schema
    const validationSchema = Yup.object().shape({
        questionContent: Yup.string()
            .required('Question Content phải có giá trị.')
            .min(2, 'Question Content phải ít nhất 2 ký tự.')
            .max(500, 'Question Content có nhiều nhất 500 ký tự.'),
        optionA: Yup.string()
            .required('Option A phải có giá trị.')
            .min(1, 'Option A phải ít nhất 1 ký tự.')
            .max(500, 'Option A có nhiều nhất 500 ký tự.'),
        optionB: Yup.string()
            .required('Option B phải có giá trị.')
            .min(1, 'Option B phải ít nhất 1 ký tự.')
            .max(500, 'Option B có nhiều nhất 500 ký tự.'),
        optionC: Yup.string()
            .required('Option C phải có giá trị.')
            .min(1, 'Option C phải ít nhất 1 ký tự.')
            .max(500, 'Option C có nhiều nhất 500 ký tự.'),
        optionD: Yup.string()
            .required('Option D phải có giá trị.')
            .min(1, 'Option D phải ít nhất 1 ký tự.')
            .max(500, 'Option D có nhiều nhất 500 ký tự.'),
        correctOption: Yup.string()
            .required('Correct Option phải có giá trị.')
            .oneOf(['A', 'B', 'C', 'D'], 'Correct Option phải là A, B, C hoặc D'),
        questionExplanation: Yup.string()
            .required('Question Explanation phải có giá trị.')
            .min(5, 'Question Explanation phải ít nhất 5 ký tự.')
    });

    // ✅ Formik setup
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
        validationSchema,
        enableReinitialize: true, // ✅ Important for editing
        onSubmit: (values) => {
            updateGrammarQuestion(values);
        }
    });

    // ✅ Get grammar question data
    const getGrammarQuestion = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Getting grammar question with ID:', grammarQuestionId);
            
            const data = await GrammarQuestionService.get(grammarQuestionId);
            console.log('✅ Grammar question data:', data);
            
            setGrammarQuestion(data);
            
            // ✅ Determine correct option letter based on correctOption value
            let correctOptionLetter = '';
            if (data.correctOption === data.optionA) {
                correctOptionLetter = 'A';
            } else if (data.correctOption === data.optionB) {
                correctOptionLetter = 'B';
            } else if (data.correctOption === data.optionC) {
                correctOptionLetter = 'C';
            } else if (data.correctOption === data.optionD) {
                correctOptionLetter = 'D';
            }

            // ✅ Set form values
            formik.setValues({
                questionContent: data.questionContent || '',
                optionA: data.optionA || '',
                optionB: data.optionB || '',
                optionC: data.optionC || '',
                optionD: data.optionD || '',
                correctOption: correctOptionLetter,
                questionExplanation: data.questionExplanation || ''
            });

            // ✅ Set editor data
            setExplanationEditorData(data.questionExplanation || '');
            
        } catch (error) {
            console.log('❌ Error getting grammar question:', error);
            toast.error('Lỗi khi tải dữ liệu câu hỏi', {
                autoClose: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateGrammarQuestion = async (values) => {
        try {
            console.log('🚀 Starting updateGrammarQuestion with values:', values);
            console.log('🚀 Grammar ID:', grammarId);
            console.log('🚀 Grammar Question ID:', grammarQuestionId);

            // ✅ Create FormData like Vue version
            const formData = new FormData();
            formData.append("grammarId", grammarId);
            formData.append("questionContent", values.questionContent.trim());
            formData.append("optionA", values.optionA.trim());
            formData.append("optionB", values.optionB.trim());
            formData.append("optionC", values.optionC.trim());
            formData.append("optionD", values.optionD.trim());

            // ✅ Determine correct option value like Vue version
            let correctOptionValue = '';
            switch (values.correctOption) {
                case "A":
                    correctOptionValue = values.optionA.trim();
                    break;
                case "B":
                    correctOptionValue = values.optionB.trim();
                    break;
                case "C":
                    correctOptionValue = values.optionC.trim();
                    break;
                case "D":
                    correctOptionValue = values.optionD.trim();
                    break;
                default:
                    correctOptionValue = values.correctOption || "";
            }

            formData.append("correctOption", correctOptionValue);
            formData.append("questionExplanation", values.questionExplanation);

            console.log('📤 FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            await GrammarQuestionService.update(grammarQuestionId, formData);
            console.log('✅ Grammar question updated successfully');
            
            retrieveGrammarQuestions();
            
            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa câu hỏi ngữ pháp thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error updating grammar question:', error);
            
            let errorMessage = 'Lỗi khi chỉnh sửa câu hỏi ngữ pháp';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join(', ');
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                autoClose: 2000,
                position: 'top-right',
            });
        }
    };

    // ✅ CKEditor configuration
    const editorConfiguration = {
        toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo'
        ],
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
            ]
        }
    };

    // ✅ Handle explanation editor
    const handleExplanationEditorReady = (editor) => {
        console.log('📝 Explanation CKEditor is ready to use!', editor);
        editor.editing.view.change(writer => {
            writer.setStyle('height', '250px', editor.editing.view.document.getRoot());
        });
    };

    const handleExplanationEditorChange = (event, editor) => {
        const data = editor.getData();
        setExplanationEditorData(data);
        formik.setFieldValue('questionExplanation', data);
    };

    const handleExplanationEditorBlur = () => {
        formik.setFieldTouched('questionExplanation', true);
    };

    // ✅ Load data on mount
    useEffect(() => {
        if (grammarQuestionId) {
            getGrammarQuestion();
        }
    }, [grammarQuestionId]);

    // ✅ Sync editor data with formik
    useEffect(() => {
        formik.setFieldValue('questionExplanation', explanationEditorData);
    }, [explanationEditorData]);

    // ✅ Helper function to check if correct option matches current option value
    const isCorrectOptionChecked = (optionLetter) => {
        return formik.values.correctOption === optionLetter;
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Đang tải dữ liệu câu hỏi...</p>
            </div>
        );
    }

    if (!grammarQuestion) {
        return (
            <div className="alert alert-danger text-center">
                <h5>Không tìm thấy câu hỏi</h5>
                <p>Câu hỏi với ID {grammarQuestionId} không tồn tại.</p>
                <button className="btn btn-secondary" onClick={onClose}>
                    Đóng
                </button>
            </div>
        );
    }

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Modal.Body className="text-start">
                    {/* Debug info - Remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="alert alert-info small mb-3">
                            <strong>Debug Info:</strong> 
                            Grammar Question ID: {grammarQuestionId}, 
                            Grammar ID: {grammarId},
                            Correct Option: {formik.values.correctOption}
                        </div>
                    )}

                    {/* Question Content Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="questionContent" className="form-label">
                            Question Content<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="questionContent"
                            name="questionContent"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.questionContent && formik.errors.questionContent ? 'is-invalid' : ''
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

                    {/* Option A Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionA" className="form-label">
                            Option A<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionA"
                            name="optionA"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.optionA && formik.errors.optionA ? 'is-invalid' : ''
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

                    {/* Option B Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionB" className="form-label">
                            Option B<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionB"
                            name="optionB"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.optionB && formik.errors.optionB ? 'is-invalid' : ''
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

                    {/* Option C Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionC" className="form-label">
                            Option C<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionC"
                            name="optionC"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.optionC && formik.errors.optionC ? 'is-invalid' : ''
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

                    {/* Option D Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionD" className="form-label">
                            Option D<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionD"
                            name="optionD"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.optionD && formik.errors.optionD ? 'is-invalid' : ''
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

                    {/* Correct Option Field */}
                    <div className="form-group mb-3">
                        <label className="form-label">
                            Correct Option<span className="required-field">*</span>
                        </label>
                        <div className="d-flex">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="correctOptionA"
                                    name="correctOption"
                                    value="A"
                                    checked={isCorrectOptionChecked('A')}
                                    onChange={formik.handleChange}
                                />
                                <label className="form-check-label me-3" htmlFor="correctOptionA">
                                    A
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="correctOptionB"
                                    name="correctOption"
                                    value="B"
                                    checked={isCorrectOptionChecked('B')}
                                    onChange={formik.handleChange}
                                />
                                <label className="form-check-label me-3" htmlFor="correctOptionB">
                                    B
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="correctOptionC"
                                    name="correctOption"
                                    value="C"
                                    checked={isCorrectOptionChecked('C')}
                                    onChange={formik.handleChange}
                                />
                                <label className="form-check-label me-3" htmlFor="correctOptionC">
                                    C
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="correctOptionD"
                                    name="correctOption"
                                    value="D"
                                    checked={isCorrectOptionChecked('D')}
                                    onChange={formik.handleChange}
                                />
                                <label className="form-check-label me-3" htmlFor="correctOptionD">
                                    D
                                </label>
                            </div>
                        </div>
                        {formik.touched.correctOption && formik.errors.correctOption && (
                            <div className="error-feedback">{formik.errors.correctOption}</div>
                        )}
                        
                        {/* Show current correct answer preview */}
                        {formik.values.correctOption && (
                            <div className="correct-option-preview mt-2">
                                <strong>Current Correct Answer:</strong> 
                                <span className="ms-1">
                                    {formik.values.correctOption} - {
                                        formik.values.correctOption === 'A' ? formik.values.optionA :
                                        formik.values.correctOption === 'B' ? formik.values.optionB :
                                        formik.values.correctOption === 'C' ? formik.values.optionC :
                                        formik.values.correctOption === 'D' ? formik.values.optionD : ''
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Question Explanation Field with CKEditor */}
                    <div className="form-group mb-3">
                        <label className="form-label">
                            Question Explanation<span className="required-field">*</span>
                        </label>
                        <div className={`ckeditor-wrapper ${
                            formik.touched.questionExplanation && formik.errors.questionExplanation ? 'is-invalid' : ''
                        }`}>
                            <CKEditor
                                editor={ClassicEditor}
                                config={editorConfiguration}
                                data={explanationEditorData}
                                onReady={handleExplanationEditorReady}
                                onChange={handleExplanationEditorChange}
                                onBlur={handleExplanationEditorBlur}
                            />
                        </div>
                        {formik.touched.questionExplanation && formik.errors.questionExplanation && (
                            <div className="error-feedback">{formik.errors.questionExplanation}</div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
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
                        disabled={formik.isSubmitting || !formik.isValid}
                    >
                        {formik.isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-1"></i>
                                Lưu
                            </>
                        )}
                    </button>
                </Modal.Footer>
            </form>
        </div>
    );
};

export default GrammarQuestionEdit;