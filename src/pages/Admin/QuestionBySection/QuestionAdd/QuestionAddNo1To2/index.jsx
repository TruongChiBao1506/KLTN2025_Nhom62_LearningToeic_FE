import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../services/questionService';
import './style.css';

const QuestionAddNo3To4 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);

    // Validation schema - không validate questionText vì dùng CKEditor
    const questionFormSchema = Yup.object().shape({
        // Có thể thêm validation khác nếu cần
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            questionText: ''
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    // CKEditor event handlers
    const onEditorReady = (editor) => {
        console.log('Editor is ready to use!', editor);
        editorRef.current = editor;
        
        // Set height của editor
        editor.editing.view.change(writer => {
            writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
        });
    };

    const onEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
        console.log('Editor data:', data);
    };

    const onEditorBlur = (event, editor) => {
        console.log('Blur.', editor);
    };

    const onEditorFocus = (event, editor) => {
        console.log('Focus.', editor);
    };

    const addQuestion = async (values, resetForm) => {
        try {
            console.log('Section ID:', sectionId);
            console.log('Editor data:', editorData);

            // Validate editor data
            if (!editorData || editorData.trim() === '') {
                toast.error('Question Group Text phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionText", editorData);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và editor
            resetForm();
            setEditorData('');
            if (editorRef.current) {
                editorRef.current.setData('');
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
        setEditorData('');
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (onClose) onClose();
    };

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        <div className="col">
                            {/* Question Group Text với CKEditor */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionText" className="form-label">
                                    Question Group Text<span className="required-field">*</span>
                                </label>
                                <div className="ckeditor-container">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={editorData}
                                        onReady={onEditorReady}
                                        onChange={onEditorChange}
                                        onBlur={onEditorBlur}
                                        onFocus={onEditorFocus}
                                        config={{
                                            placeholder: 'Nhập nội dung câu hỏi nhóm...',
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
                                {!editorData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Question Group Text phải có giá trị.</div>
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

export default QuestionAddNo3To4;