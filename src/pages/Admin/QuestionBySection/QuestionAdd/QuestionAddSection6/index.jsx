import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../../services/questionService';
import QuestionGroupService from '../../../../../services/questionGroupService';
import './style.css';

const QuestionAddSection6 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);

    // State cho 4 questions với explanations
    const [questions, setQuestions] = useState([
        {
            questionContent: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '',
            questionType: '',
            questionExplanation: ''
        },
        {
            questionContent: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '',
            questionType: '',
            questionExplanation: ''
        },
        {
            questionContent: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '',
            questionType: '',
            questionExplanation: ''
        },
        {
            questionContent: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '',
            questionType: '',
            questionExplanation: ''
        }
    ]);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        // Question Content validation for 4 questions
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
        questionContent3: Yup
            .string()
            .required("questionContent phải có giá trị.")
            .min(2, "questionContent phải ít nhất 2 ký tự.")
            .max(500, "questionContent có nhiều nhất 500 ký tự."),

        // Option A validation
        optionA0: Yup
            .string()
            .required("OptionA phải có giá trị.")
            .min(2, "OptionA phải ít nhất 2 ký tự.")
            .max(500, "OptionA có nhiều nhất 500 ký tự."),
        optionA1: Yup
            .string()
            .required("OptionA phải có giá trị.")
            .min(2, "OptionA phải ít nhất 2 ký tự.")
            .max(500, "OptionA có nhiều nhất 500 ký tự."),
        optionA2: Yup
            .string()
            .required("OptionA phải có giá trị.")
            .min(2, "OptionA phải ít nhất 2 ký tự.")
            .max(500, "OptionA có nhiều nhất 500 ký tự."),
        optionA3: Yup
            .string()
            .required("OptionA phải có giá trị.")
            .min(2, "OptionA phải ít nhất 2 ký tự.")
            .max(500, "OptionA có nhiều nhất 500 ký tự."),

        // Option B validation
        optionB0: Yup
            .string()
            .required("OptionB phải có giá trị.")
            .min(2, "OptionB phải ít nhất 2 ký tự.")
            .max(500, "OptionB có nhiều nhất 500 ký tự."),
        optionB1: Yup
            .string()
            .required("OptionB phải có giá trị.")
            .min(2, "OptionB phải ít nhất 2 ký tự.")
            .max(500, "OptionB có nhiều nhất 500 ký tự."),
        optionB2: Yup
            .string()
            .required("OptionB phải có giá trị.")
            .min(2, "OptionB phải ít nhất 2 ký tự.")
            .max(500, "OptionB có nhiều nhất 500 ký tự."),
        optionB3: Yup
            .string()
            .required("OptionB phải có giá trị.")
            .min(2, "OptionB phải ít nhất 2 ký tự.")
            .max(500, "OptionB có nhiều nhất 500 ký tự."),

        // Option C validation
        optionC0: Yup
            .string()
            .required("OptionC phải có giá trị.")
            .min(2, "OptionC phải ít nhất 2 ký tự.")
            .max(500, "OptionC có nhiều nhất 500 ký tự."),
        optionC1: Yup
            .string()
            .required("OptionC phải có giá trị.")
            .min(2, "OptionC phải ít nhất 2 ký tự.")
            .max(500, "OptionC có nhiều nhất 500 ký tự."),
        optionC2: Yup
            .string()
            .required("OptionC phải có giá trị.")
            .min(2, "OptionC phải ít nhất 2 ký tự.")
            .max(500, "OptionC có nhiều nhất 500 ký tự."),
        optionC3: Yup
            .string()
            .required("OptionC phải có giá trị.")
            .min(2, "OptionC phải ít nhất 2 ký tự.")
            .max(500, "OptionC có nhiều nhất 500 ký tự."),

        // Option D validation
        optionD0: Yup
            .string()
            .required("OptionD phải có giá trị.")
            .min(2, "OptionD phải ít nhất 2 ký tự.")
            .max(500, "OptionD có nhiều nhất 500 ký tự."),
        optionD1: Yup
            .string()
            .required("OptionD phải có giá trị.")
            .min(2, "OptionD phải ít nhất 2 ký tự.")
            .max(500, "OptionD có nhiều nhất 500 ký tự."),
        optionD2: Yup
            .string()
            .required("OptionD phải có giá trị.")
            .min(2, "OptionD phải ít nhất 2 ký tự.")
            .max(500, "OptionD có nhiều nhất 500 ký tự."),
        optionD3: Yup
            .string()
            .required("OptionD phải có giá trị.")
            .min(2, "OptionD phải ít nhất 2 ký tự.")
            .max(500, "OptionD có nhiều nhất 500 ký tự."),

        // Correct Option validation
        correctOption0: Yup.string().required("correctOption phải có giá trị."),
        correctOption1: Yup.string().required("correctOption phải có giá trị."),
        correctOption2: Yup.string().required("correctOption phải có giá trị."),
        correctOption3: Yup.string().required("correctOption phải có giá trị."),

        // Question Type validation
        questionType0: Yup.string().required("Loại phải được chọn."),
        questionType1: Yup.string().required("Loại phải được chọn."),
        questionType2: Yup.string().required("Loại phải được chọn."),
        questionType3: Yup.string().required("Loại phải được chọn."),

        // Question Explanation validation
        questionExplanation0: Yup
            .string()
            .required("questionExplanation phải có giá trị.")
            .min(2, "questionExplanation phải ít nhất 2 ký tự.")
            .max(1000, "questionExplanation có nhiều nhất 1000 ký tự."),
        questionExplanation1: Yup
            .string()
            .required("questionExplanation phải có giá trị.")
            .min(2, "questionExplanation phải ít nhất 2 ký tự.")
            .max(1000, "questionExplanation có nhiều nhất 1000 ký tự."),
        questionExplanation2: Yup
            .string()
            .required("questionExplanation phải có giá trị.")
            .min(2, "questionExplanation phải ít nhất 2 ký tự.")
            .max(1000, "questionExplanation có nhiều nhất 1000 ký tự."),
        questionExplanation3: Yup
            .string()
            .required("questionExplanation phải có giá trị.")
            .min(2, "questionExplanation phải ít nhất 2 ký tự.")
            .max(1000, "questionExplanation có nhiều nhất 1000 ký tự.")
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            // Dynamic initial values cho 4 questions
            questionContent0: '', questionContent1: '', questionContent2: '', questionContent3: '',
            optionA0: '', optionA1: '', optionA2: '', optionA3: '',
            optionB0: '', optionB1: '', optionB2: '', optionB3: '',
            optionC0: '', optionC1: '', optionC2: '', optionC3: '',
            optionD0: '', optionD1: '', optionD2: '', optionD3: '',
            correctOption0: '', correctOption1: '', correctOption2: '', correctOption3: '',
            questionType0: '', questionType1: '', questionType2: '', questionType3: '',
            questionExplanation0: '', questionExplanation1: '', questionExplanation2: '', questionExplanation3: ''
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
        
        // Set height của editor (170px)
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

            // Validate group passage
            if (!editorData || editorData.trim() === '') {
                toast.error('Question Group Passage phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Tạo thông tin nhóm câu hỏi trước
            const groupFormData = new FormData();
            groupFormData.append("sectionId", sectionId);
            groupFormData.append("groupPassage", editorData);

            console.log('Creating question group...');

            // Gửi dữ liệu nhóm câu hỏi lên server và lấy groupId
            const response = await QuestionGroupService.create(groupFormData);
            console.log('Group response:', response);
            
            const groupId = response.groupId;
            console.log('Group ID:', groupId);

            // Gửi dữ liệu từng câu hỏi con lên server
            for (let i = 0; i < 4; i++) {
                const questionContent = values[`questionContent${i}`];
                const optionA = values[`optionA${i}`];
                const optionB = values[`optionB${i}`];
                const optionC = values[`optionC${i}`];
                const optionD = values[`optionD${i}`];
                const correctOption = values[`correctOption${i}`];
                const questionType = values[`questionType${i}`];
                const questionExplanation = values[`questionExplanation${i}`];
                
                const formData = new FormData();
                formData.append("sectionId", sectionId);
                formData.append("groupId", groupId);
                formData.append("questionContent", questionContent);
                formData.append("optionA", optionA);
                formData.append("optionB", optionB);
                formData.append("optionC", optionC);
                formData.append("optionD", optionD);

                // Xác định đáp án được chọn và đặt giá trị cho correctOption
                switch (correctOption) {
                    case "A":
                        formData.append("correctOption", optionA);
                        break;
                    case "B":
                        formData.append("correctOption", optionB);
                        break;
                    case "C":
                        formData.append("correctOption", optionC);
                        break;
                    case "D":
                        formData.append("correctOption", optionD);
                        break;
                    default:
                        formData.append("correctOption", "");
                }
                
                formData.append("questionType", questionType);
                formData.append("questionExplanation", questionExplanation);
                
                console.log(`Creating question ${i + 1}...`);
                await QuestionService.create(formData);
            }

            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setEditorData('');
            setQuestions([
                { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' },
                { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' },
                { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' },
                { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' }
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
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' },
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' },
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' },
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '', questionExplanation: '' }
        ]);
        
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (onClose) onClose();
    };

    return (
        <div className="question-add-section6-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    {/* Group Passage với CKEditor */}
                    <div className="form-group mb-3">
                        <label htmlFor="groupPassage" className="form-label">
                            Question Group Passage<span className="required-field">*</span>
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
                                    placeholder: 'Nhập passage cho Part 6...',
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
                                    language: 'vi'
                                }}
                            />
                        </div>
                        {/* Custom validation error display */}
                        {!editorData && formik.submitCount > 0 && (
                            <div className="error-feedback">Question Group Passage phải có giá trị.</div>
                        )}
                    </div>

                    <hr />

                    {/* 4 Questions */}
                    <div className="row">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className={`col-md-6 mb-5 question-column-${index}`}>
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

                                {/* Option A */}
                                <div className="form-group">
                                    <label htmlFor={`optionA${index}`}>
                                        Option A<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionA${index}`}
                                        type="text"
                                        id={`optionA${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionA${index}`] && formik.errors[`optionA${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionA${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionA', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option A"
                                    />
                                    {formik.touched[`optionA${index}`] && formik.errors[`optionA${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionA${index}`]}</div>
                                    )}
                                </div>

                                {/* Option B */}
                                <div className="form-group">
                                    <label htmlFor={`optionB${index}`}>
                                        Option B<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionB${index}`}
                                        type="text"
                                        id={`optionB${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionB${index}`] && formik.errors[`optionB${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionB${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionB', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option B"
                                    />
                                    {formik.touched[`optionB${index}`] && formik.errors[`optionB${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionB${index}`]}</div>
                                    )}
                                </div>

                                {/* Option C */}
                                <div className="form-group">
                                    <label htmlFor={`optionC${index}`}>
                                        Option C<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionC${index}`}
                                        type="text"
                                        id={`optionC${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionC${index}`] && formik.errors[`optionC${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionC${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionC', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option C"
                                    />
                                    {formik.touched[`optionC${index}`] && formik.errors[`optionC${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionC${index}`]}</div>
                                    )}
                                </div>

                                {/* Option D */}
                                <div className="form-group">
                                    <label htmlFor={`optionD${index}`}>
                                        Option D<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionD${index}`}
                                        type="text"
                                        id={`optionD${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionD${index}`] && formik.errors[`optionD${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionD${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionD', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option D"
                                    />
                                    {formik.touched[`optionD${index}`] && formik.errors[`optionD${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionD${index}`]}</div>
                                    )}
                                </div>

                                {/* Correct Answer Radio Buttons */}
                                <div className="form-group">
                                    <label>Correct Answer<span className="required-field">*</span></label>
                                    <div>
                                        {['A', 'B', 'C', 'D'].map((option) => (
                                            <div key={option} className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    id={`option${option}${index}`}
                                                    name={`correctOption${index}`}
                                                    value={option}
                                                    checked={formik.values[`correctOption${index}`] === option}
                                                    onChange={(e) => {
                                                        formik.handleChange(e);
                                                        updateQuestion(index, 'correctOption', e.target.value);
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                />
                                                <label className="form-check-label" htmlFor={`option${option}${index}`}>
                                                    {option}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {formik.touched[`correctOption${index}`] && formik.errors[`correctOption${index}`] && (
                                        <div className="error-feedback">{formik.errors[`correctOption${index}`]}</div>
                                    )}
                                </div>

                                {/* Question Type với Part 6 options */}
                                <div className="form-group mb-3">
                                    <label htmlFor={`questionType${index}`} className="form-label">
                                        Type<span className="required-field">*</span>
                                    </label>
                                    <select
                                        name={`questionType${index}`}
                                        id={`questionType${index}`}
                                        className={`form-select border-secondary custom-font ${
                                            formik.touched[`questionType${index}`] && formik.errors[`questionType${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`questionType${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'questionType', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                    >
                                        <option value="" disabled>Select an option</option>
                                        <option value="[Part 6] Câu hỏi ngữ pháp">[Part 6] Câu hỏi ngữ pháp</option>
                                        <option value="[Part 6] Câu hỏi từ vựng">[Part 6] Câu hỏi từ vựng</option>
                                        <option value="[Part 6] Câu hỏi từ loại">[Part 6] Câu hỏi từ loại</option>
                                        <option value="[Part 6] Câu hỏi điền câu">[Part 6] Câu hỏi điền câu</option>
                                    </select>
                                    {formik.touched[`questionType${index}`] && formik.errors[`questionType${index}`] && (
                                        <div className="error-feedback">{formik.errors[`questionType${index}`]}</div>
                                    )}
                                </div>

                                {/* Question Explanation */}
                                <div className="form-group">
                                    <label htmlFor={`questionExplanation${index}`}>
                                        Question Explanation<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`questionExplanation${index}`}
                                        type="text"
                                        id={`questionExplanation${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`questionExplanation${index}`] && formik.errors[`questionExplanation${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`questionExplanation${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'questionExplanation', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder={`Nhập explanation cho câu hỏi ${index + 1}`}
                                    />
                                    {formik.touched[`questionExplanation${index}`] && formik.errors[`questionExplanation${index}`] && (
                                        <div className="error-feedback">{formik.errors[`questionExplanation${index}`]}</div>
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

export default QuestionAddSection6;