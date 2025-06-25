import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../../services/questionService';
import QuestionGroupService from '../../../../../services/questionGroupService';
import './style.css';

const QuestionAddNo8To10 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // State cho 3 questions
    const [questions, setQuestions] = useState([
        {
            questionContent: '',
            suggestedAnswer: ''
        },
        {
            questionContent: '',
            suggestedAnswer: ''
        },
        {
            questionContent: '',
            suggestedAnswer: ''
        }
    ]);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        // groupImage validation (commented out like Vue component)
        // groupImage: Yup
        //     .mixed()
        //     .required("Vui lòng chọn một tệp ảnh.")
        //     .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
        //         if (!value) return true;
        //         const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        //         return allowedFormats.includes(value.type);
        //     })
        //     .test("fileSize", "Tệp ảnh quá lớn", (value) => {
        //         if (!value) return true;
        //         return value.size <= 1024 * 1024; // 1 MB
        //     }),

        questionContent0: Yup
            .string()
            .required("questionContent phải có giá trị.")
            .min(2, "questionContent phải ít nhất 2 ký tự.")
            .max(500, "questionContent có nhiều nhất 500 ký tự."),
        questionContent1: Yup
            .string()
            .required("questionContent phải có giá trị.")
            .min(2, "questionContent phải ít nhất 2 ký tự.")
            .max(500, "questionContent có nhiều nhất 500 ký tự."),
        questionContent2: Yup
            .string()
            .required("questionContent phải có giá trị.")
            .min(2, "questionContent phải ít nhất 2 ký tự.")
            .max(500, "questionContent có nhiều nhất 500 ký tự."),

        suggestedAnswer0: Yup
            .string()
            .required("suggestedAnswer phải có giá trị.")
            .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
            .max(500, "suggestedAnswer có nhiều nhất 500 ký tự."),
        suggestedAnswer1: Yup
            .string()
            .required("suggestedAnswer phải có giá trị.")
            .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
            .max(500, "suggestedAnswer có nhiều nhất 500 ký tự."),
        suggestedAnswer2: Yup
            .string()
            .required("suggestedAnswer phải có giá trị.")
            .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
            .max(500, "suggestedAnswer có nhiều nhất 500 ký tự."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            questionContent0: '',
            questionContent1: '',
            questionContent2: '',
            suggestedAnswer0: '',
            suggestedAnswer1: '',
            suggestedAnswer2: ''
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
        console.log('Selected file:', file);
    };

    // Update questions state khi formik values thay đổi
    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
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

            // Validate group text
            if (!editorData || editorData.trim() === '') {
                toast.error('Question Group Text phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Tạo thông tin nhóm câu hỏi trước
            const groupFormData = new FormData();
            groupFormData.append("sectionId", sectionId);
            groupFormData.append("groupText", editorData);
            
            // Add image if selected (optional)
            if (selectedFile) {
                groupFormData.append("groupImage", selectedFile, selectedFile.name);
            }

            console.log('Creating question group...');
            
            // Gửi dữ liệu nhóm câu hỏi lên server và lấy groupId
            const response = await QuestionGroupService.create(groupFormData);
            console.log('Group response:', response);
            
            const groupId = response.groupId;
            console.log('Group ID:', groupId);

            // Gửi dữ liệu từng câu hỏi con lên server
            for (let i = 0; i < 3; i++) {
                const questionContent = values[`questionContent${i}`];
                const suggestedAnswer = values[`suggestedAnswer${i}`];
                
                const formData = new FormData();
                formData.append("sectionId", sectionId);
                formData.append("groupId", groupId);
                formData.append("questionContent", questionContent);
                formData.append("suggestedAnswer", suggestedAnswer);
                
                console.log(`Creating question ${i + 1}...`);
                await QuestionService.create(formData);
            }

            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setSelectedFile(null);
            setEditorData('');
            setQuestions([
                { questionContent: '', suggestedAnswer: '' },
                { questionContent: '', suggestedAnswer: '' },
                { questionContent: '', suggestedAnswer: '' }
            ]);
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
        setQuestions([
            { questionContent: '', suggestedAnswer: '' },
            { questionContent: '', suggestedAnswer: '' },
            { questionContent: '', suggestedAnswer: '' }
        ]);
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onClose) onClose();
    };

    return (
        <div className='question-add-no8to10-page page'>
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    {/* Question Group Image Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="groupImage">
                            Question Group Image<span className="required-field">*</span>
                        </label>
                        <input
                            ref={fileInputRef}
                            name="groupImage"
                            id="groupImage"
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            className="form-control border-secondary custom-font"
                            onChange={onImageChange}
                        />
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

                    {/* Question Group Text với CKEditor */}
                    <div className="form-group mb-3">
                        <label htmlFor="groupText" className="form-label">
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
                                    placeholder: 'Nhập nội dung nhóm câu hỏi cho part 8-10...',
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

                    <hr />

                    {/* 3 Questions trong row */}
                    <div className="row">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="col-md-4 mb-4">
                                {/* Question Content */}
                                <div className="form-group mb-3">
                                    <label htmlFor={`questionContent${index}`}>
                                        Question Content {index + 1}<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`questionContent${index}`}
                                        type="text"
                                        id={`questionContent${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`questionContent${index}`] && formik.errors[`questionContent${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`questionContent${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'questionContent', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder={`Nhập nội dung câu hỏi ${index + 1}`}
                                    />
                                    {formik.touched[`questionContent${index}`] && formik.errors[`questionContent${index}`] && (
                                        <div className="error-feedback">{formik.errors[`questionContent${index}`]}</div>
                                    )}
                                </div>

                                {/* Suggested Answer */}
                                <div className="form-group mb-3">
                                    <label htmlFor={`suggestedAnswer${index}`}>
                                        Suggested Answer<span className="required-field">*</span>
                                    </label>
                                    <textarea
                                        name={`suggestedAnswer${index}`}
                                        id={`suggestedAnswer${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`suggestedAnswer${index}`] && formik.errors[`suggestedAnswer${index}`] ? 'is-invalid' : ''
                                        }`}
                                        style={{ height: '150px', resize: 'none' }}
                                        value={formik.values[`suggestedAnswer${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'suggestedAnswer', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder={`Nhập gợi ý trả lời ${index + 1}`}
                                    />
                                    {formik.touched[`suggestedAnswer${index}`] && formik.errors[`suggestedAnswer${index}`] && (
                                        <div className="error-feedback">{formik.errors[`suggestedAnswer${index}`]}</div>
                                    )}
                                </div>
                            </div>
                        ))}
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

export default QuestionAddNo8To10;