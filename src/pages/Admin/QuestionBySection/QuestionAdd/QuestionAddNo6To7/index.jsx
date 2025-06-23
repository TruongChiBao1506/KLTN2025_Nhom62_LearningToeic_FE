import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../services/questionService';
import './style.css';

const QuestionAddNo6To7 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [questionTextData, setQuestionTextData] = useState('');
    const [suggestedAnswerData, setSuggestedAnswerData] = useState('');
    const questionTextEditorRef = useRef(null);
    const suggestedAnswerEditorRef = useRef(null);

    // Validation schema - Empty như Vue component
    const questionFormSchema = Yup.object().shape({
        // No validation rules như trong Vue component
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

    // CKEditor event handlers cho questionText
    const onQuestionTextEditorReady = (editor) => {
        console.log('Question Text Editor is ready to use!', editor);
        questionTextEditorRef.current = editor;
        
        // Set height của editor
        editor.editing.view.change(writer => {
            writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
        });
    };

    const onQuestionTextEditorChange = (event, editor) => {
        const data = editor.getData();
        setQuestionTextData(data);
        console.log('Question Text Editor data:', data);
    };

    const onQuestionTextEditorBlur = (event, editor) => {
        console.log('Question Text Blur.', editor);
    };

    const onQuestionTextEditorFocus = (event, editor) => {
        console.log('Question Text Focus.', editor);
    };

    // CKEditor event handlers cho suggestedAnswer
    const onSuggestedAnswerEditorReady = (editor) => {
        console.log('Suggested Answer Editor is ready to use!', editor);
        suggestedAnswerEditorRef.current = editor;
        
        // Set height của editor
        editor.editing.view.change(writer => {
            writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
        });
    };

    const onSuggestedAnswerEditorChange = (event, editor) => {
        const data = editor.getData();
        setSuggestedAnswerData(data);
        console.log('Suggested Answer Editor data:', data);
    };

    const onSuggestedAnswerEditorBlur = (event, editor) => {
        console.log('Suggested Answer Blur.', editor);
    };

    const onSuggestedAnswerEditorFocus = (event, editor) => {
        console.log('Suggested Answer Focus.', editor);
    };

    const addQuestion = async (values, resetForm) => {
        try {
            console.log('Section ID:', sectionId);
            console.log('Question Text data:', questionTextData);
            console.log('Suggested Answer data:', suggestedAnswerData);

            // Validate required fields
            if (!questionTextData || questionTextData.trim() === '') {
                toast.error('Text phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            if (!suggestedAnswerData || suggestedAnswerData.trim() === '') {
                toast.error('Suggested Answer phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionText", questionTextData);
            formData.append("suggestedAnswer", suggestedAnswerData);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setQuestionTextData('');
            setSuggestedAnswerData('');
            if (questionTextEditorRef.current) {
                questionTextEditorRef.current.setData('');
            }
            if (suggestedAnswerEditorRef.current) {
                suggestedAnswerEditorRef.current.setData('');
            }

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

    const handleClose = () => {
        formik.resetForm();
        setQuestionTextData('');
        setSuggestedAnswerData('');
        if (questionTextEditorRef.current) {
            questionTextEditorRef.current.setData('');
        }
        if (suggestedAnswerEditorRef.current) {
            suggestedAnswerEditorRef.current.setData('');
        }
        if (onClose) onClose();
    };

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        <div className="col">
                            {/* Question Text Field với CKEditor */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionText" className="form-label">
                                    Text<span className="required-field">*</span>
                                </label>
                                <div className="ckeditor-container">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={questionTextData}
                                        onReady={onQuestionTextEditorReady}
                                        onChange={onQuestionTextEditorChange}
                                        onBlur={onQuestionTextEditorBlur}
                                        onFocus={onQuestionTextEditorFocus}
                                        config={{
                                            placeholder: 'Nhập nội dung câu hỏi cho part 6-7...',
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
                                                'imageUpload',
                                                'blockQuote',
                                                'insertTable',
                                                'mediaEmbed',
                                                'undo',
                                                'redo'
                                            ],
                                            language: 'vi',
                                            image: {
                                                toolbar: [
                                                    'imageTextAlternative',
                                                    'imageStyle:full',
                                                    'imageStyle:side'
                                                ]
                                            },
                                            table: {
                                                contentToolbar: [
                                                    'tableColumn',
                                                    'tableRow',
                                                    'mergeTableCells'
                                                ]
                                            }
                                        }}
                                    />
                                </div>
                                {/* Custom validation error display */}
                                {!questionTextData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Text phải có giá trị.</div>
                                )}
                            </div>

                            {/* Suggested Answer Field với CKEditor */}
                            <div className="form-group mb-3">
                                <label htmlFor="suggestedAnswer" className="form-label">
                                    Suggested Answer<span className="required-field">*</span>
                                </label>
                                <div className="ckeditor-container">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={suggestedAnswerData}
                                        onReady={onSuggestedAnswerEditorReady}
                                        onChange={onSuggestedAnswerEditorChange}
                                        onBlur={onSuggestedAnswerEditorBlur}
                                        onFocus={onSuggestedAnswerEditorFocus}
                                        config={{
                                            placeholder: 'Nhập gợi ý trả lời cho part 6-7...',
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
                                                'imageUpload',
                                                'blockQuote',
                                                'insertTable',
                                                'mediaEmbed',
                                                'undo',
                                                'redo'
                                            ],
                                            language: 'vi',
                                            image: {
                                                toolbar: [
                                                    'imageTextAlternative',
                                                    'imageStyle:full',
                                                    'imageStyle:side'
                                                ]
                                            },
                                            table: {
                                                contentToolbar: [
                                                    'tableColumn',
                                                    'tableRow',
                                                    'mergeTableCells'
                                                ]
                                            }
                                        }}
                                    />
                                </div>
                                {/* Custom validation error display */}
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
                        className="btn btn-secondary" 
                        onClick={handleClose}
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

export default QuestionAddNo6To7;