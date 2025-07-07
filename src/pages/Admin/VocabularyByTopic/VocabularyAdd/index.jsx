import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import VocabularyService from '../../../../services/vocabularyService';
import './style.css';

const VocabularyAdd = ({ topicId, retrieveVocabularies, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // Validation schema
    const vocabularyFormSchema = Yup.object().shape({
        word: Yup
            .string()
            .required("Từ vựng phải có giá trị.")
            .min(2, "Từ vựng phải ít nhất 2 ký tự.")
            .max(50, "Từ vựng có nhiều nhất 50 ký tự."),
        ipa: Yup
            .string()
            .required("Vui lòng nhập phiên âm"),
        meaning: Yup
            .string()
            .required("Ý nghĩa phải có giá trị.")
            .min(2, "Ý nghĩa phải ít nhất 2 ký tự.")
            .max(100, "Ý nghĩa có nhiều nhất 100 ký tự."),
        exampleSentence: Yup
            .string()
            .required("Câu ví dụ phải có giá trị.")
            .min(2, "Câu ví dụ phải ít nhất 2 ký tự.")
            .max(150, "Câu ví dụ có nhiều nhất 150 ký tự."),
        image: Yup
            .mixed()
            .required("Please select an image.")
            .test("fileType", "Only accept jpeg, png, or gif image", (value) => {
                if (!value) return true;
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Image file is too large (max 1MB)", (value) => {
                if (!value) return true;
                return value.size <= 1024 * 1024; // 1MB
            }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            word: '',
            ipa: '',
            meaning: '',
            exampleSentence: '',
            image: null
        },
        validationSchema: vocabularyFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addVocabulary(values, resetForm);
        }
    });

    // Handle file change
    const onFileChange = (event) => {
        const file = event.target.files[0];
        
        if (file) {
            // Validate file before setting
            const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
            const maxSize = 1024 * 1024; // 1MB
            
            if (!allowedFormats.includes(file.type)) {
                toast.error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc GIF', {
                    autoClose: 2000,
                });
                event.target.value = ''; // Clear the input
                return;
            }
            
            if (file.size > maxSize) {
                toast.error('Kích thước file quá lớn (tối đa 1MB)', {
                    autoClose: 2000,
                });
                event.target.value = ''; // Clear the input
                return;
            }

            setSelectedFile(file);
            formik.setFieldValue('image', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setFilePreview(null);
            formik.setFieldValue('image', null);
        }
    };

    const addVocabulary = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addVocabulary with values:', values);
            console.log('🚀 Topic ID:', topicId);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("topicId", topicId);
            formData.append("word", values.word);
            formData.append("ipa", values.ipa);
            formData.append("meaning", values.meaning);
            formData.append("exampleSentence", values.exampleSentence);
            
            if (selectedFile) {
                formData.append("image", selectedFile, selectedFile.name);
            }

            console.log('📤 Sending request to server...');
            
            // Log FormData contents for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`FormData ${key}:`, value);
            }

            await VocabularyService.create(formData);
            console.log('  Vocabulary created successfully');
            
            retrieveVocabularies();
            
            // Reset form and file states
            resetForm();
            setSelectedFile(null);
            setFilePreview(null);
            
            // Clear file input
            const fileInput = document.getElementById('image');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm từ vựng thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error creating vocabulary:', error);
            let errorMessage = 'Lỗi khi thêm từ vựng';
            
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
                autoClose: 2000,
                position: 'top-right',
            });
        }
    };

    // Handle close
    const handleClose = () => {
        formik.resetForm();
        setSelectedFile(null);
        setFilePreview(null);
        
        // Clear file input
        const fileInput = document.getElementById('image');
        if (fileInput) {
            fileInput.value = '';
        }
        
        if (onClose) {
            onClose();
        }
    };

    // Handle submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);
        console.log('Selected file:', selectedFile);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                word: true,
                ipa: true,
                meaning: true,
                exampleSentence: true,
                image: true
            });
            return;
        }

        console.log('  Validation passed, submitting...');
        // Submit form
        await addVocabulary(formik.values, formik.resetForm);
    };

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="word" className="form-label">
                        Word<span className="required-field">*</span>
                    </label>
                    <input
                        name="word"
                        type="text"
                        id="word"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.word && formik.errors.word ? 'is-invalid' : ''
                        }`}
                        value={formik.values.word}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập từ vựng..."
                    />
                    {formik.touched.word && formik.errors.word && (
                        <div className="error-feedback">{formik.errors.word}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="ipa" className="form-label">
                        IPA<span className="required-field">*</span>
                    </label>
                    <input
                        name="ipa"
                        type="text"
                        id="ipa"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.ipa && formik.errors.ipa ? 'is-invalid' : ''
                        }`}
                        value={formik.values.ipa}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập phiên âm IPA..."
                    />
                    {formik.touched.ipa && formik.errors.ipa && (
                        <div className="error-feedback">{formik.errors.ipa}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="meaning" className="form-label">
                        Meaning<span className="required-field">*</span>
                    </label>
                    <input
                        name="meaning"
                        type="text"
                        id="meaning"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.meaning && formik.errors.meaning ? 'is-invalid' : ''
                        }`}
                        value={formik.values.meaning}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập ý nghĩa..."
                    />
                    {formik.touched.meaning && formik.errors.meaning && (
                        <div className="error-feedback">{formik.errors.meaning}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="exampleSentence" className="form-label">
                        Example Sentence<span className="required-field">*</span>
                    </label>
                    <textarea
                        name="exampleSentence"
                        id="exampleSentence"
                        rows="3"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.exampleSentence && formik.errors.exampleSentence ? 'is-invalid' : ''
                        }`}
                        value={formik.values.exampleSentence}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập câu ví dụ..."
                    />
                    {formik.touched.exampleSentence && formik.errors.exampleSentence && (
                        <div className="error-feedback">{formik.errors.exampleSentence}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="image" className="form-label">
                        Image<span className="required-field">*</span>
                    </label>
                    <input
                        name="image"
                        type="file"
                        id="image"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.image && formik.errors.image ? 'is-invalid' : ''
                        }`}
                        onChange={onFileChange}
                        onBlur={formik.handleBlur}
                        accept="image/jpeg,image/png,image/gif"
                    />
                    {formik.touched.image && formik.errors.image && (
                        <div className="error-feedback">{formik.errors.image}</div>
                    )}
                    
                    {/* File info */}
                    {selectedFile && (
                        <div className="mt-2">
                            <small className="text-muted">
                                📁 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </small>
                        </div>
                    )}
                    
                    {/* Image preview */}
                    {filePreview && (
                        <div className="mt-3">
                            <label className="form-label">Image Preview:</label>
                            <div className="image-preview-container">
                                <img 
                                    src={filePreview} 
                                    alt="Preview" 
                                    className="image-preview"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Display topic info */}
                <div className="alert alert-info">
                    <small>
                        <strong>📚 Topic ID:</strong> {topicId}
                    </small>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
                <button 
                    type="button" 
                    className="btn btn-secondary rounded-5" 
                    onClick={handleClose}
                >
                    Đóng
                </button>
                <button 
                    type="button" 
                    className="btn btn-primary rounded-5"
                    disabled={formik.isSubmitting}
                    onClick={handleSubmit}
                >
                    {formik.isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang lưu...
                        </>
                    ) : (
                        'Lưu'
                    )}
                </button>
            </div>
        </>
    );
};

export default VocabularyAdd;