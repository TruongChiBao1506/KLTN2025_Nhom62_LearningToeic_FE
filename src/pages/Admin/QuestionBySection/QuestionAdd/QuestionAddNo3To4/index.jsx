import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddNo3To4 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        suggestedAnswer: Yup
            .string()
            .required("suggestedAnswer phải có giá trị.")
            .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
            .max(1000, "suggestedAnswer có nhiều nhất 1000 ký tự."),
        questionImage: Yup
            .mixed()
            // .required("Vui lòng chọn một tệp ảnh.") // Optional - không bắt buộc
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                if (!value) return true; // Bỏ qua nếu không có tệp
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Tệp ảnh quá lớn", (value) => {
                if (!value) return true; // Bỏ qua nếu không có tệp
                return value.size <= 1024 * 1024; // 1 MB
            }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            suggestedAnswer: '',
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

    const addQuestion = async (values, resetForm) => {
        try {
            console.log('Section ID:', sectionId);
            console.log('Form values:', values);
            console.log('Selected file:', selectedFile);

            // Validate required fields
            if (!values.suggestedAnswer || values.suggestedAnswer.trim() === '') {
                toast.error('Suggested Answer phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("suggestedAnswer", values.suggestedAnswer);
            
            // Add image if selected (optional)
            if (selectedFile) {
                formData.append("questionImage", selectedFile, selectedFile.name);
            }

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setSelectedFile(null);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onClose) onClose();
    };

    return (
        <div className="question-add-no3to4-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        <div className="col">
                            {/* Question Image Field - Optional */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionImage" className="form-label">
                                    Question Image<span className="optional-field">(Optional)</span>
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

                            {/* Suggested Answer Field */}
                            <div className="form-group mb-3">
                                <label htmlFor="suggestedAnswer" className="form-label">
                                    Suggested Answer<span className="required-field">*</span>
                                </label>
                                <textarea
                                    name="suggestedAnswer"
                                    id="suggestedAnswer"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.suggestedAnswer && formik.errors.suggestedAnswer ? 'is-invalid' : ''
                                    }`}
                                    style={{ height: '150px', resize: 'none' }}
                                    value={formik.values.suggestedAnswer}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập gợi ý trả lời cho part 3-4"
                                />
                                {formik.touched.suggestedAnswer && formik.errors.suggestedAnswer && (
                                    <div className="error-feedback">{formik.errors.suggestedAnswer}</div>
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