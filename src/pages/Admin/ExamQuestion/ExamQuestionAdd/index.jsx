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

    // Validation schema
    const validationSchema = Yup.object().shape({
        // Có thể thêm validation sau nếu cần
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
            console.log('ExamQuestionAdd: start import, examId=', examId);

            // Lấy tệp tin từ formik values thay vì refs
            const imageFiles = formik.values.questionImage;
            const audioFiles = formik.values.questionAudio;
            const excelFile = formik.values.file;

            console.log('ExamQuestionAdd: selected counts', {
                images: imageFiles?.length || 0,
                audios: audioFiles?.length || 0,
                hasExcel: !!excelFile
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
            // start image uploads
            const imageUploadPromises = Array.from(imageFiles).map(async (imageFile, index) => {
                try {
                    const imageResponse = await ExamQuestionService.uploadExamQuestionImages(imageFile);
                    return imageResponse;
                } catch (error) {
                    console.error(`❌ Error uploading image ${index + 1}:`, error);
                    throw error;
                }
            });

            // Upload tất cả âm thanh
            // start audio uploads
            const audioUploadPromises = Array.from(audioFiles).map(async (audioFile, index) => {
                try {
                    const audioResponse = await ExamQuestionService.uploadExamQuestionAudios(audioFile);
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

            console.log('ExamQuestionAdd: uploads completed', { images: imageResults.length, audios: audioResults.length });

            // Import Excel
            console.log('ExamQuestionAdd: importing Excel', excelFile.name);
            await ExamQuestionService.importTemplate(excelFile, examId);
            console.log('ExamQuestionAdd: Excel import completed');

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

            // Thân thiện hơn với một số lỗi thường gặp khi import Excel
            // if (/questionScript.*required/i.test(errorMessage)) {
            //     errorMessage = 'File Excel thiếu cột bắt buộc "questionScript" hoặc có dòng trống. Vui lòng dùng đúng Template và đảm bảo cột này có dữ liệu cho mỗi câu hỏi.';
            // }
            if (error.code === 'ERR_UPLOAD_FILE_CHANGED' || /ERR_UPLOAD_FILE_CHANGED|Network Error/i.test(error.message)) {
                errorMessage = 'Không thể upload Excel do tệp bị thay đổi hoặc bị khóa bởi ứng dụng khác (ERR_UPLOAD_FILE_CHANGED). Hãy đóng file Excel nếu đang mở, chọn lại tệp và thử import lại.';
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

    // Handle file selection - Sửa lại để đồng bộ với formik
    const handleFileChange = (fieldName, files) => {
        // Convert FileList to Array cho multiple files
        const fileArray = files ? (fieldName === 'file' ? files : Array.from(files)) : null;
        formik.setFieldValue(fieldName, fileArray);
        formik.setFieldTouched(fieldName, true);
    };

    // Tải template Excel chuẩn từ server
    const handleDownloadTemplate = async () => {
        try {
            await ExamQuestionService.exportTemplate();
        } catch (err) {
            toast.error('Không thể tải template. Vui lòng thử lại.');
        }
    };

    return (
        <div className="exam-question-add">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Modal.Body className="text-start p-4">
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
                        <label htmlFor="excelInput" className="form-label d-flex align-items-center justify-content-between">
                            <span>
                                <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                                Import Excel<span className="required-field">*</span>
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary rounded-5"
                                onClick={handleDownloadTemplate}
                                disabled={isLoading}
                                title="Tải file mẫu đúng định dạng"
                            >
                                Tải template
                            </button>
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
                            Chọn tệp Excel đúng theo template. Bắt buộc có các cột: questionScript, questionType, partNumber, optionA–D, correctAnswer, v.v. (Tải mẫu ở nút "Tải template"). Chấp nhận: .xlsx, .xls
                        </div>
                    </div>

                    {/* File Selection Summary - Cập nhật để hiển thị từ formik values */}
                    <div className="file-selection-summary mt-3 p-3 bg-light rounded">
                        <h6 className="mb-2">Tệp đã chọn:</h6>
                        <div className="row">
                            <div className="col-md-4">
                                <small className="text-muted">Hình ảnh:</small>
                                <div className="fw-bold">
                                    {formik.values.questionImage?.length || 0} tệp
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">Âm thanh:</small>
                                <div className="fw-bold">
                                    {formik.values.questionAudio?.length || 0} tệp
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">Excel:</small>
                                <div className="fw-bold">
                                    {formik.values.file ? 1 : 0} tệp
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button 
                        type="button" 
                        className="btn btn-secondary rounded-5"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Đóng
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary rounded-5"
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