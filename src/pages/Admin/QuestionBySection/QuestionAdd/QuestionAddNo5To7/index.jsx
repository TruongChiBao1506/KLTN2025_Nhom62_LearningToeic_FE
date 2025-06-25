import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../../services/questionService';
import QuestionGroupService from '../../../../../services/questionGroupService';
import './style.css';

const QuestionAddNo5To7 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);

    // State cho 3 questions
    const [questions, setQuestions] = useState([
        {
            questionContent: '',
            suggestedAnswer: '',
            questionExplanation: ''
        },
        {
            questionContent: '',
            suggestedAnswer: '',
            questionExplanation: ''
        },
        {
            questionContent: '',
            suggestedAnswer: '',
            questionExplanation: ''
        }
    ]);

    // Validation schema cho tất cả fields
    const questionFormSchema = Yup.object().shape({
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

    // Formik setup với initial values cho 3 questions
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
            console.log('Questions:', questions);

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
                formData.append("questionExplanation", questions[i].questionExplanation || '');
                
                console.log(`Creating question ${i + 1}...`);
                await QuestionService.create(formData);
            }

            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setEditorData('');
            setQuestions([
                { questionContent: '', suggestedAnswer: '', questionExplanation: '' },
                { questionContent: '', suggestedAnswer: '', questionExplanation: '' },
                { questionContent: '', suggestedAnswer: '', questionExplanation: '' }
            ]);
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
        setQuestions([
            { questionContent: '', suggestedAnswer: '', questionExplanation: '' },
            { questionContent: '', suggestedAnswer: '', questionExplanation: '' },
            { questionContent: '', suggestedAnswer: '', questionExplanation: '' }
        ]);
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (onClose) onClose();
    };

    return (
        <div className='question-add-no5to7-page page'>
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
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
                                    placeholder: 'Nhập nội dung nhóm câu hỏi cho part 5-7...',
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
                                <div className="form-group">
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

export default QuestionAddNo5To7;