import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import VocabularyService from '../../../services/vocabularyService';
import './style.css';

const VocabularyEdit = ({ vocabularyId, topicId, retrieveVocabularies, onClose }) => {
    const [vocabulary, setVocabulary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

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
            .nullable()
            // Image is optional for edit - only validate if new file is selected
            .test("fileType", "Only accept jpeg, png, or gif image", (value) => {
                if (!value) return true; // Allow empty for edit
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Image file is too large (max 1MB)", (value) => {
                if (!value) return true; // Allow empty for edit
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
        enableReinitialize: true, // Important: Allow form to reinitialize when vocabulary data loads
        onSubmit: async (values, { resetForm }) => {
            await updateVocabulary(values, resetForm);
        }
    });

    // Get vocabulary data
    const getVocabulary = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Fetching vocabulary with ID:', vocabularyId);
            
            const data = await VocabularyService.get(vocabularyId);
            console.log('📄 Vocabulary data received:', data);
            
            setVocabulary(data);
            setCurrentImage(data.imagePath || data.image);
            
            // Update formik values
            formik.setValues({
                word: data.word || '',
                ipa: data.ipa || '',
                meaning: data.meaning || '',
                exampleSentence: data.exampleSentence || '',
                image: null // Don't set existing image as file
            });
            
            console.log('✅ Vocabulary data loaded successfully');
            
        } catch (error) {
            console.log('❌ Error fetching vocabulary:', error);
            toast.error('Lỗi khi tải dữ liệu từ vựng', {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

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

    // Update vocabulary function
    const updateVocabulary = async (values, resetForm) => {
        try {
            console.log('🚀 Starting updateVocabulary with values:', values);
            console.log('🚀 Vocabulary ID:', vocabularyId);
            console.log('🚀 Topic ID:', topicId);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("topicId", topicId);
            formData.append("word", values.word);
            formData.append("ipa", values.ipa);
            formData.append("meaning", values.meaning);
            formData.append("exampleSentence", values.exampleSentence);
            
            // Only append image if a new file is selected
            if (selectedFile) {
                formData.append("image", selectedFile, selectedFile.name);
            }

            console.log('📤 Sending update request to server...');
            
            // Log FormData contents for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`FormData ${key}:`, value);
            }

            await VocabularyService.update(vocabularyId, formData);
            console.log('✅ Vocabulary updated successfully');
            
            retrieveVocabularies();
            
            // Close modal
            if (onClose) {
                onClose();
            }
            
            toast.success('Chỉnh sửa từ vựng thành công', {
                autoClose: 1000,
            });
            
        } catch (error) {
            console.log('❌ Error updating vocabulary:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa từ vựng';
            
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
        const fileInput = document.getElementById('edit-image');
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

        console.log('✅ Validation passed, submitting...');
        // Submit form
        await updateVocabulary(formik.values, formik.resetForm);
    };

    // Load vocabulary data when component mounts or vocabularyId changes
    useEffect(() => {
        if (vocabularyId) {
            getVocabulary();
        }
    }, [vocabularyId]);

    // Show loading while fetching vocabulary data
    if (isLoading) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu từ vựng...</p>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Đóng
                    </button>
                </div>
            </>
        );
    }

    // Show error if vocabulary not found
    if (!vocabulary) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Không thể tải dữ liệu từ vựng
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
                </div>
            </>
        );
    }

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start">
                <div className="form-group mb-3">
                    <label htmlFor="edit-word" className="form-label">
                        Word<span className="required-field">*</span>
                    </label>
                    <input
                        name="word"
                        type="text"
                        id="edit-word"
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
                    <label htmlFor="edit-ipa" className="form-label">
                        IPA<span className="required-field">*</span>
                    </label>
                    <input
                        name="ipa"
                        type="text"
                        id="edit-ipa"
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
                    <label htmlFor="edit-meaning" className="form-label">
                        Meaning<span className="required-field">*</span>
                    </label>
                    <input
                        name="meaning"
                        type="text"
                        id="edit-meaning"
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
                    <label htmlFor="edit-exampleSentence" className="form-label">
                        Example Sentence<span className="required-field">*</span>
                    </label>
                    <textarea
                        name="exampleSentence"
                        id="edit-exampleSentence"
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
                    <label htmlFor="edit-image" className="form-label">
                        Image <small className="text-muted">(Để trống nếu không muốn thay đổi)</small>
                    </label>
                    <input
                        name="image"
                        type="file"
                        id="edit-image"
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
                            <small className="text-success">
                                📁 New image: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </small>
                        </div>
                    )}
                </div>

                {/* Current image display */}
                <div className="form-group mb-3">
                    <label className="form-label">Current Image:</label>
                    <div className="current-image-container">
                        {filePreview ? (
                            // Show new image preview
                            <div>
                                <img 
                                    src={filePreview} 
                                    alt="New preview" 
                                    className="image-preview"
                                />
                                <small className="text-success d-block mt-1">New image preview</small>
                            </div>
                        ) : currentImage ? (
                            // Show current image
                            <div>
                                <img 
                                    src={currentImage} 
                                    alt={vocabulary.word} 
                                    className="image-preview"
                                />
                                <small className="text-muted d-block mt-1">Current image</small>
                            </div>
                        ) : (
                            <div className="no-image-placeholder">
                                <i className="fas fa-image fa-3x text-muted"></i>
                                <p className="text-muted mt-2">No image available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Display current vocabulary info */}
                <div className="alert alert-info">
                    <h6 className="alert-heading mb-2">📚 Thông tin Vocabulary</h6>
                    <small>
                        <strong>Vocabulary ID:</strong> {vocabulary.id || vocabulary.vocabularyId}<br />
                        <strong>Topic ID:</strong> {topicId}<br />
                        <strong>Ngày tạo:</strong> {new Date(vocabulary.createdAt).toLocaleDateString('vi-VN')}<br />
                        {vocabulary.updatedAt && (
                            <>
                                <strong>Cập nhật lần cuối:</strong> {new Date(vocabulary.updatedAt).toLocaleDateString('vi-VN')}
                            </>
                        )}
                    </small>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClose();
                    }}
                >
                    Đóng
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting || isLoading}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }}
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

export default VocabularyEdit;