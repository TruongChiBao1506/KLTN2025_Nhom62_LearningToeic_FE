import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import LessonService from '../../../../services/lessonService';
import './style.css';

const LessonAdd = ({ sectionId, retrieveLessons, onClose }) => {
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
        onSubmit: async (values, { resetForm }) => {
            await addLesson(values, resetForm);
        }
    });

    const addLesson = async (values, resetForm) => {
        try {
            const lessonData = {
                lessonName: values.lessonName
            };

            await LessonService.create(sectionId, lessonData);
            retrieveLessons();
            
            // Reset form
            resetForm();
            
            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm bài học thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log(error);
            let errorMessage = 'Lỗi khi thêm bài học';
            
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

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    {/* Lesson Name Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="lessonName" className="form-label">
                            Lesson Name<span className="required-field">*</span>
                        </label>
                        <input
                            name="lessonName"
                            type="text"
                            id="lessonName"
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

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                            formik.resetForm();
                            if (onClose) onClose();
                        }}
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

export default LessonAdd;