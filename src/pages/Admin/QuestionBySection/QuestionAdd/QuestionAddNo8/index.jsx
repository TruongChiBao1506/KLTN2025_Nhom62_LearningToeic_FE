import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../services/questionService';
import './style.css';

const QuestionAddNo8 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [suggestedAnswerData, setSuggestedAnswerData] = useState('');
    const editorRef = useRef(null);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        questionText: Yup
            .string()
            .required("questionText phải có giá trị.")
            .min(2, "questionText phải ít nhất 2 ký tự.")
            .max(1000, "questionText có nhiều nhất 1000 ký tự."),
        // suggestedAnswer sẽ validate riêng với CKEditor data
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

    // CKEditor event handlers
    const onEditorReady = (editor) => {
        console.log('Editor is ready to use!', editor);
        editorRef.current = editor;
        
        // Set height của editor lớn hơn (250px)
        editor.editing.view.change(writer => {
            writer.setStyle('height', '250px', editor.editing.view.document.getRoot());
        });
    };

    const onEditorChange = (event, editor) => {
        const data = editor.getData();
        setSuggestedAnswerData(data);
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
            console.log('Form values:', values);
            console.log('Suggested Answer data:', suggestedAnswerData);

            // Validate questionText
            if (!values.questionText || values.questionText.trim() === '') {
                toast.error('Text phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Validate suggestedAnswer từ CKEditor
            if (!suggestedAnswerData || suggestedAnswerData.trim() === '') {
                toast.error('Suggested Answer phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Additional validation cho CKEditor content
            const plainText = suggestedAnswerData.replace(/<[^>]*>/g, '').trim();
            if (plainText.length < 2) {
                toast.error('Suggested Answer phải ít nhất 2 ký tự', {
                    autoClose: 1000,
                });
                return;
            }

            if (plainText.length > 2000) {
                toast.error('Suggested Answer có nhiều nhất 2000 ký tự', {
                    autoClose: 1000,
                });
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionText", values.questionText);
            formData.append("suggestedAnswer", suggestedAnswerData);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setSuggestedAnswerData('');
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
        setSuggestedAnswerData('');
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
                                    placeholder="Nhập nội dung câu hỏi cho part 8"
                                />
                                {formik.touched.questionText && formik.errors.questionText && (
                                    <div className="error-feedback">{formik.errors.questionText}</div>
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
                                        onReady={onEditorReady}
                                        onChange={onEditorChange}
                                        onBlur={onEditorBlur}
                                        onFocus={onEditorFocus}
                                        config={{
                                            placeholder: 'Nhập gợi ý trả lời chi tiết cho part 8...',
                                            toolbar: [
                                                'heading',
                                                '|',
                                                'bold',
                                                'italic',
                                                'underline',
                                                'strikethrough',
                                                '|',
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
                                                '|',
                                                'fontFamily',
                                                'fontSize',
                                                'fontColor',
                                                'fontBackgroundColor',
                                                '|',
                                                'alignment',
                                                'horizontalLine',
                                                '|',
                                                'undo',
                                                'redo'
                                            ],
                                            language: 'vi',
                                            fontSize: {
                                                options: [
                                                    9, 11, 13, 'default', 17, 19, 21
                                                ]
                                            },
                                            fontFamily: {
                                                options: [
                                                    'default',
                                                    'Arial, Helvetica, sans-serif',
                                                    'Courier New, Courier, monospace',
                                                    'Georgia, serif',
                                                    'Lucida Sans Unicode, Lucida Grande, sans-serif',
                                                    'Tahoma, Geneva, sans-serif',
                                                    'Times New Roman, Times, serif',
                                                    'Trebuchet MS, Helvetica, sans-serif',
                                                    'Verdana, Geneva, sans-serif'
                                                ]
                                            },
                                            image: {
                                                toolbar: [
                                                    'imageTextAlternative',
                                                    'imageStyle:full',
                                                    'imageStyle:side',
                                                    'imageStyle:alignLeft',
                                                    'imageStyle:alignCenter',
                                                    'imageStyle:alignRight'
                                                ]
                                            },
                                            table: {
                                                contentToolbar: [
                                                    'tableColumn',
                                                    'tableRow',
                                                    'mergeTableCells',
                                                    'tableCellProperties',
                                                    'tableProperties'
                                                ]
                                            }
                                        }}
                                    />
                                </div>
                                {/* Custom validation error display */}
                                {!suggestedAnswerData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Suggested Answer phải có giá trị.</div>
                                )}
                                
                                {/* Character counter */}
                                {suggestedAnswerData && (
                                    <div className={`character-counter ${
                                        suggestedAnswerData.replace(/<[^>]*>/g, '').length > 1800 ? 
                                        (suggestedAnswerData.replace(/<[^>]*>/g, '').length > 2000 ? 'over-limit' : 'near-limit') : ''
                                    }`}>
                                        {suggestedAnswerData.replace(/<[^>]*>/g, '').length} / 2000 ký tự
                                    </div>
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

export default QuestionAddNo8;