import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import CKEditorOptimized from '../../../../../components/Admin/EditorOptimized';
import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddNo11 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [questionTextData, setQuestionTextData] = useState('');
    const [suggestedAnswerData, setSuggestedAnswerData] = useState('');
    const questionTextEditorRef = useRef(null);
    const suggestedAnswerEditorRef = useRef(null);

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
            if (!questionTextData || questionTextData.trim() === '') {
                toast.error('Text phải có giá trị', { autoClose: 1000 });
                return;
            }
            if (!suggestedAnswerData || suggestedAnswerData.trim() === '') {
                toast.error('Suggested Answer phải có giá trị', { autoClose: 1000 });
                return;
            }

            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionText", questionTextData);
            formData.append("suggestedAnswer", suggestedAnswerData);

            await QuestionService.create(formData);
            retrieveQuestions();

            resetForm();
            setQuestionTextData('');
            setSuggestedAnswerData('');
            if (questionTextEditorRef.current) questionTextEditorRef.current.setData('');
            if (suggestedAnswerEditorRef.current) suggestedAnswerEditorRef.current.setData('');

            if (onClose) onClose();

            toast.success('Thêm câu hỏi thành công', { autoClose: 1000 });
        } catch (error) {
            let errorMessage = 'Lỗi khi thêm câu hỏi';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.request?.response) {
                try {
                    const jsonResponse = JSON.parse(error.request.response);
                    errorMessage = jsonResponse.message;
                } catch {}
            }
            toast.error(errorMessage, { autoClose: 1000, position: 'top-right' });
        }
    };

    const handleClose = () => {
        formik.resetForm();
        setQuestionTextData('');
        setSuggestedAnswerData('');
        if (questionTextEditorRef.current) questionTextEditorRef.current.setData('');
        if (suggestedAnswerEditorRef.current) suggestedAnswerEditorRef.current.setData('');
        if (onClose) onClose();
    };

    const onQuestionTextEditorReady = (editor) => {
        questionTextEditorRef.current = editor;
        setTimeout(() => {
            if (editor && editor.editing && editor.editing.view) {
                editor.editing.view.change(writer => {
                    writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
                });
            }
        }, 100);
    };

    const onSuggestedAnswerEditorReady = (editor) => {
        suggestedAnswerEditorRef.current = editor;
        setTimeout(() => {
            if (editor && editor.editing && editor.editing.view) {
                editor.editing.view.change(writer => {
                    writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
                });
            }
        }, 100);
    };

    return (
        <div className="question-add-no11-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start p-4">
                    <div className="row">
                        <div className="col">
                            {/* Question Text Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionText" className="form-label">
                                    Text<span className="required-field">*</span>
                                </label>
                                <div className={`ckeditor-container${!questionTextData && formik.submitCount > 0 ? ' is-invalid' : ''}`}>
                                    <CKEditorOptimized
                                        data={questionTextData}
                                        onChange={data => {
                                            setQuestionTextData(data);
                                            formik.setFieldValue('questionText', data);
                                        }}
                                        onReady={onQuestionTextEditorReady}
                                        placeholder="Nhập nội dung câu hỏi"
                                        height="170px"
                                    />
                                </div>
                                {!questionTextData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Text phải có giá trị.</div>
                                )}
                            </div>

                            {/* Suggested Answer Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="suggestedAnswer" className="form-label">
                                    Suggested Answer<span className="required-field">*</span>
                                </label>
                                <div className={`ckeditor-container${!suggestedAnswerData && formik.submitCount > 0 ? ' is-invalid' : ''}`}>
                                    <CKEditorOptimized
                                        data={suggestedAnswerData}
                                        onChange={data => {
                                            setSuggestedAnswerData(data);
                                            formik.setFieldValue('suggestedAnswer', data);
                                        }}
                                        onReady={onSuggestedAnswerEditorReady}
                                        placeholder="Nhập gợi ý trả lời"
                                        height="170px"
                                    />
                                </div>
                                {!suggestedAnswerData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Suggested Answer phải có giá trị.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-secondary rounded-5" 
                        onClick={handleClose}
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

export default QuestionAddNo11;