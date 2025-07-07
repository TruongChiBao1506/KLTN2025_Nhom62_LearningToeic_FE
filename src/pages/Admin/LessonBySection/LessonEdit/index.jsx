import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LessonService from '../../../../services/lessonService';
import './style.css';

const LessonEdit = ({ lessonId, sectionId, retrieveLessons, onClose }) => {
    const [lesson, setLesson] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Validation schema
    const lessonFormSchema = Yup.object().shape({
        lessonName: Yup
            .string()
            .required("Tên bài học phải có giá trị.")
            .min(2, "Tên bài học phải ít nhất 2 ký tự.")
            .max(100, "Tên bài học có nhiều nhất 100 ký tự."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            lessonName: ''
        },
        validationSchema: lessonFormSchema,
        enableReinitialize: true, // Important: Allow form to reinitialize when lesson data loads
        onSubmit: async (values, { resetForm }) => {
            await updateLesson(values, resetForm);
        }
    });

    // Get lesson data
    const getLesson = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching lesson with ID:', lessonId);
            
            const data = await LessonService.get(lessonId);
            console.log('Lesson data received:', data);
            
            setLesson(data);
            
            // Update formik values
            formik.setValues({
                lessonName: data.lessonName || ''
            });
            
        } catch (error) {
            console.log('Error fetching lesson:', error);
            toast.error('Lỗi khi tải dữ liệu bài học', {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Update lesson function
    const updateLesson = async (values, resetForm) => {
        try {
            console.log('Updating lesson with values:', values);
            
            const updateData = {
                lessonName: values.lessonName,
                sectionId: sectionId
            };
            
            await LessonService.update(lessonId, updateData);
            retrieveLessons();
            
            // Close modal
            if (onClose) {
                onClose();
            }
            
            toast.success('Chỉnh sửa bài học thành công', {
                autoClose: 1000,
            });
            
        } catch (error) {
            console.log('Error updating lesson:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa bài học';
            
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
        if (onClose) {
            onClose();
        }
    };

    // Handle submit function (copy pattern từ SectionEdit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                lessonName: true
            });
            return;
        }

        // Submit form
        await updateLesson(formik.values, formik.resetForm);
    };

    // Load lesson data when component mounts or lessonId changes
    useEffect(() => {
        if (lessonId) {
            getLesson();
        }
    }, [lessonId]);

    // Show loading while fetching lesson data
    if (isLoading) {
        return (
            <>
                <div className="modal-body text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu bài học...</p>
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

    // Show error if lesson not found
    if (!lesson) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Không thể tải dữ liệu bài học
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
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="lessonName" className="form-label">
                        Lesson Name<span className="required-field">*</span>
                    </label>
                    <input
                        name="lessonName"
                        id="lessonName"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.lessonName && formik.errors.lessonName ? 'is-invalid' : ''
                        }`}
                        value={formik.values.lessonName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập tên bài học"
                    />
                    {formik.touched.lessonName && formik.errors.lessonName && (
                        <div className="error-feedback">{formik.errors.lessonName}</div>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary rounded-5"
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
                    className="btn btn-primary rounded-5"
                    disabled={formik.isSubmitting || isLoading}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }}
                >
                    {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </>
    );
};

export default LessonEdit;