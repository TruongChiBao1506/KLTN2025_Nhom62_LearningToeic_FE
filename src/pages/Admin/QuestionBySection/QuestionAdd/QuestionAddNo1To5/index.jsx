import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddNo1To5 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        questionContent: Yup
            .string()
            .required("questionContent phải có giá trị.")
            .min(2, "questionContent phải ít nhất 2 ký tự.")
            .max(500, "questionContent có nhiều nhất 500 ký tự."),
        questionImage: Yup
            .mixed()
            .required("Vui lòng chọn một tệp ảnh.")
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                if (!value) return true;
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Tệp ảnh quá lớn", (value) => {
                if (!value) return true;
                return value.size <= 1024 * 1024; // 1 MB
            }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            questionContent: '',
            questionImage: null
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    // File change handler
    const onImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        formik.setFieldValue('questionImage', file);
        formik.setFieldTouched('questionImage', true);
        
        console.log('Selected file:', file);
    };

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
            console.log('Form values:', values);
            console.log('Editor data:', editorData);
            console.log('Selected file:', selectedFile);

            // Validate required fields
            if (!values.questionContent || values.questionContent.trim() === '') {
                toast.error('Question Content phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            if (!editorData || editorData.trim() === '') {
                toast.error('Suggested Answer phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            if (!selectedFile) {
                toast.error('Vui lòng chọn một tệp ảnh', {
                    autoClose: 1000,
                });
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionContent", values.questionContent);
            formData.append("suggestedAnswer", editorData);
            
            if (selectedFile) {
                formData.append("questionImage", selectedFile, selectedFile.name);
            }

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setSelectedFile(null);
            setEditorData('');
            if (editorRef.current) {
                editorRef.current.setData('');
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
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
        setSelectedFile(null);
        setEditorData('');
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onClose) onClose();
    };

    return (
        <div className="question-add-no1to5-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        <div className="col">
                            {/* Question Image Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionImage" className="form-label">
                                    Question Image<span className="required-field">*</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    name="questionImage"
                                    id="questionImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.questionImage && formik.errors.questionImage ? 'is-invalid' : ''
                                    }`}
                                    onChange={onImageChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.questionImage && formik.errors.questionImage && (
                                    <div className="error-feedback">{formik.errors.questionImage}</div>
                                )}
                                
                                {/* File preview */}
                                {selectedFile && (
                                    <div className="file-preview mt-2">
                                        <small className="text-muted">
                                            Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                        </small>
                                        {selectedFile.type.startsWith('image/') && (
                                            <div className="image-preview mt-2">
                                                <img 
                                                    src={URL.createObjectURL(selectedFile)} 
                                                    alt="Preview" 
                                                    className="img-thumbnail"
                                                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Question Content Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionContent" className="form-label">
                                    Question Content<span className="required-field">*</span>
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
                                    placeholder="Nhập nội dung câu hỏi cho part 1-5"
                                />
                                {formik.touched.questionContent && formik.errors.questionContent && (
                                    <div className="error-feedback">{formik.errors.questionContent}</div>
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
                                        data={editorData}
                                        onReady={onEditorReady}
                                        onChange={onEditorChange}
                                        onBlur={onEditorBlur}
                                        onFocus={onEditorFocus}
                                        config={{
                                            placeholder: 'Nhập gợi ý trả lời cho part 1-5...',
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

export default QuestionAddNo1To5;