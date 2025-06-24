import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

import GrammarQuestionService from '../../../../services/grammarQuestionService';
import './style.css';

const GrammarQuestionAdd = ({ grammarId, retrieveGrammarQuestions, onClose }) => {
    const [explanationEditorData, setExplanationEditorData] = useState('');

    // Validation schema
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
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            addGrammarQuestion(values, resetForm);
        }
    });

    // Add grammar question function
    const addGrammarQuestion = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addGrammarQuestion with values:', values);
            console.log('🚀 Grammar ID:', grammarId);

            // Create JSON object instead of FormData
            const questionData = {
                grammarId: grammarId,
                questionContent: values.questionContent.trim(),
                optionA: values.optionA.trim(),
                optionB: values.optionB.trim(),
                optionC: values.optionC.trim(),
                optionD: values.optionD.trim(),
                correctOption: values.correctOption, // Send letter directly (A, B, C, D)
                questionExplanation: values.questionExplanation
            };

            console.log('📤 JSON data to send:', questionData);

            await GrammarQuestionService.create(questionData);
            console.log('  Grammar question created successfully');

            retrieveGrammarQuestions();

            // Reset form và states
            resetForm();
            setExplanationEditorData('');

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm câu hỏi ngữ pháp thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error creating grammar question:', error);

            let errorMessage = 'Lỗi khi thêm câu hỏi ngữ pháp';

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

    // CKEditor configuration
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

    // Handle explanation editor
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

    // Sync editor data with formik
    useEffect(() => {
        formik.setFieldValue('questionExplanation', explanationEditorData);
    }, [explanationEditorData]);

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Modal.Body className="text-start">
                    {/* Question Content Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="questionContent" className="form-label">
                            Question Content<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="questionContent"
                            name="questionContent"
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

                    {/* Option A Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionA" className="form-label">
                            Option A<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionA"
                            name="optionA"
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

                    {/* Option B Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionB" className="form-label">
                            Option B<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionB"
                            name="optionB"
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

                    {/* Option C Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionC" className="form-label">
                            Option C<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionC"
                            name="optionC"
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

                    {/* Option D Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="optionD" className="form-label">
                            Option D<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="optionD"
                            name="optionD"
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
                                    checked={formik.values.correctOption === 'A'}
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
                                    checked={formik.values.correctOption === 'B'}
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
                                    checked={formik.values.correctOption === 'C'}
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
                                    checked={formik.values.correctOption === 'D'}
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
                    </div>

                    {/* Question Explanation Field with CKEditor */}
                    <div className="form-group mb-3">
                        <label className="form-label">
                            Question Explanation<span className="required-field">*</span>
                        </label>
                        <div className={`ckeditor-wrapper ${formik.touched.questionExplanation && formik.errors.questionExplanation ? 'is-invalid' : ''
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

export default GrammarQuestionAdd;