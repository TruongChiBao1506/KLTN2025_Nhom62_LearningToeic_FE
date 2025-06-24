import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faImage, faVolumeUp, faFileExcel } from '@fortawesome/free-solid-svg-icons';

import ExamQuestionService from '../../../../services/examQuestionService';
import './style.css';

const ExamQuestionAdd = ({ examId, retrieveExamQuestions, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs for file inputs
    const imageInputRef = useRef(null);
    const audioInputRef = useRef(null);
    const excelInputRef = useRef(null);

    // Validation schema - Có thể uncomment các rules khi cần
    const validationSchema = Yup.object().shape({
        // Hiện tại không có validation, có thể thêm sau
        // questionImage: Yup.mixed()
        //     .required("Vui lòng chọn tệp ảnh")
        //     .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
        //         if (!value || value.length === 0) return true;
        //         const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
        //         return Array.from(value).every(file => allowedFormats.includes(file.type));
        //     })
        //     .test("fileSize", "Tệp ảnh quá lớn (max 1MB)", (value) => {
        //         if (!value || value.length === 0) return true;
        //         return Array.from(value).every(file => file.size <= 1024 * 1024);
        //     }),
        // questionAudio: Yup.mixed()
        //     .required("Vui lòng chọn tệp âm thanh"),
        // file: Yup.mixed()
        //     .required("Vui lòng chọn tệp Excel")
        //     .test("fileType", "Chỉ chấp nhận tệp Excel (.xlsx, .xls)", (value) => {
        //         if (!value) return true;
        //         const allowedFormats = [
        //             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //             "application/vnd.ms-excel"
        //         ];
        //         return allowedFormats.includes(value.type);
        //     })
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            questionImage: null,
            questionAudio: null,
            file: null
        },
        validationSchema,
        onSubmit: (values) => {
            addExamQuestion(values);
        }
    });

    const addExamQuestion = async (values) => {
        try {
            setIsLoading(true);
            console.log('🚀 Starting addExamQuestion with examId:', examId);

            // Lấy tệp tin từ refs
            const imageFiles = imageInputRef.current?.files;
            const audioFiles = audioInputRef.current?.files;
            const excelFile = excelInputRef.current?.files?.[0];

            console.log('📁 Files selected:', {
                imageFiles: imageFiles?.length || 0,
                audioFiles: audioFiles?.length || 0,
                excelFile: !!excelFile
            });

            // Kiểm tra xem đã chọn ít nhất một tệp trong mỗi loại
            if (!imageFiles || imageFiles.length === 0) {
                toast.error('Vui lòng chọn ít nhất một tệp hình ảnh', {
                    autoClose: 2000
                });
                return;
            }

            if (!audioFiles || audioFiles.length === 0) {
                toast.error('Vui lòng chọn ít nhất một tệp âm thanh', {
                    autoClose: 2000
                });
                return;
            }

            if (!excelFile) {
                toast.error('Vui lòng chọn tệp Excel để import', {
                    autoClose: 2000
                });
                return;
            }

            // Upload tất cả hình ảnh
            console.log('📸 Processing image files...');
            const imageUploadPromises = Array.from(imageFiles).map(async (imageFile, index) => {
                console.log(`📸 Uploading image ${index + 1}:`, imageFile.name);
                try {
                    const imageResponse = await ExamQuestionService.uploadExamQuestionImages(imageFile);
                    console.log(`  Image ${index + 1} uploaded:`, imageResponse);
                    return imageResponse;
                } catch (error) {
                    console.error(`❌ Error uploading image ${index + 1}:`, error);
                    throw error;
                }
            });

            // Upload tất cả âm thanh
            console.log('🔊 Processing audio files...');
            const audioUploadPromises = Array.from(audioFiles).map(async (audioFile, index) => {
                console.log(`🔊 Uploading audio ${index + 1}:`, audioFile.name);
                try {
                    const audioResponse = await ExamQuestionService.uploadExamQuestionAudios(audioFile);
                    console.log(`  Audio ${index + 1} uploaded:`, audioResponse);
                    return audioResponse;
                } catch (error) {
                    console.error(`❌ Error uploading audio ${index + 1}:`, error);
                    throw error;
                }
            });

            // Chờ tất cả upload hoàn thành
            const [imageResults, audioResults] = await Promise.all([
                Promise.all(imageUploadPromises),
                Promise.all(audioUploadPromises)
            ]);

            console.log('  All uploads completed:', {
                images: imageResults.length,
                audios: audioResults.length
            });

            // Import Excel
            console.log('📋 Importing Excel file:', excelFile.name);
            const excelResponse = await ExamQuestionService.importTemplate(excelFile, examId);
            console.log('  Excel import completed:', excelResponse);

            // Refresh data
            if (retrieveExamQuestions) {
                retrieveExamQuestions();
            }

            // Clear form
            resetForm();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Import exam questions thành công!', {
                autoClose: 1000,
            });

        } catch (error) {
            console.error('❌ Error in addExamQuestion:', error);
            
            let errorMessage = 'Lỗi khi import exam questions';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join(', ');
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form function
    const resetForm = () => {
        formik.resetForm();
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (audioInputRef.current) audioInputRef.current.value = '';
        if (excelInputRef.current) excelInputRef.current.value = '';
    };

    // Handle file selection
    const handleFileChange = (fieldName, files) => {
        formik.setFieldValue(fieldName, files);
        formik.setFieldTouched(fieldName, true);
    };

    return (
        <div className="exam-question-add">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Modal.Body className="text-start">
                    {/* Debug info - Remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="alert alert-info small mb-3">
                            <strong>Debug Info:</strong> 
                            Exam ID: {examId}
                        </div>
                    )}

                    {/* Image Upload Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="image" className="form-label">
                            <FontAwesomeIcon icon={faImage} className="me-2" />
                            Image<span className="required-field">*</span>
                        </label>
                        <input
                            name="questionImage"
                            id="image"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.questionImage && formik.errors.questionImage ? 'is-invalid' : ''
                            }`}
                            type="file"
                            ref={imageInputRef}
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileChange('questionImage', e.target.files)}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.questionImage && formik.errors.questionImage && (
                            <div className="error-feedback">{formik.errors.questionImage}</div>
                        )}
                        <div className="form-text">
                            Chọn nhiều hình ảnh cho exam questions. Chấp nhận: .jpg, .png, .gif
                        </div>
                    </div>

                    {/* Audio Upload Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="audio" className="form-label">
                            <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                            Audio<span className="required-field">*</span>
                        </label>
                        <input
                            name="questionAudio"
                            id="audio"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.questionAudio && formik.errors.questionAudio ? 'is-invalid' : ''
                            }`}
                            type="file"
                            ref={audioInputRef}
                            multiple
                            accept="audio/*"
                            onChange={(e) => handleFileChange('questionAudio', e.target.files)}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.questionAudio && formik.errors.questionAudio && (
                            <div className="error-feedback">{formik.errors.questionAudio}</div>
                        )}
                        <div className="form-text">
                            Chọn nhiều tệp âm thanh cho exam questions. Chấp nhận: .mp3, .wav, .ogg
                        </div>
                    </div>

                    {/* Excel Import Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="excelInput" className="form-label">
                            <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                            Import Excel<span className="required-field">*</span>
                        </label>
                        <input
                            name="file"
                            id="excelInput"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.file && formik.errors.file ? 'is-invalid' : ''
                            }`}
                            type="file"
                            ref={excelInputRef}
                            accept=".xlsx,.xls"
                            onChange={(e) => handleFileChange('file', e.target.files?.[0])}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.file && formik.errors.file && (
                            <div className="error-feedback">{formik.errors.file}</div>
                        )}
                        <div className="form-text">
                            Chọn tệp Excel chứa danh sách exam questions để import. Chấp nhận: .xlsx, .xls
                        </div>
                    </div>

                    {/* File Selection Summary */}
                    <div className="file-selection-summary mt-3 p-3 bg-light rounded">
                        <h6 className="mb-2">Tệp đã chọn:</h6>
                        <div className="row">
                            <div className="col-md-4">
                                <small className="text-muted">Hình ảnh:</small>
                                <div className="fw-bold">
                                    {imageInputRef.current?.files?.length || 0} tệp
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">Âm thanh:</small>
                                <div className="fw-bold">
                                    {audioInputRef.current?.files?.length || 0} tệp
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">Excel:</small>
                                <div className="fw-bold">
                                    {excelInputRef.current?.files?.length || 0} tệp
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Đóng
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang import...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faFileImport} className="me-2" />
                                Import
                            </>
                        )}
                    </button>
                </Modal.Footer>
            </form>
        </div>
    );
};

export default ExamQuestionAdd;