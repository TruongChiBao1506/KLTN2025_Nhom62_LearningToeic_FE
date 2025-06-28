import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CKEditorOptimized from '../../../../components/Admin/EditorOptimized';
import LessonContentService from '../../../../services/lessonContentService';
import './style.css';

const AddLessonContent = ({ lessonId, retrieveLessonContents, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const [isEditorReady, setIsEditorReady] = useState(false);

    // Validation schema
    const lessonContentFormSchema = Yup.object().shape({
        title: Yup
            .string()
            .required("Tiêu đề phải có giá trị.")
            .min(2, "Tiêu đề phải ít nhất 2 ký tự.")
            .max(50, "Tiêu đề có nhiều nhất 50 ký tự."),
        content: Yup
            .string()
            .required("Nội dung phải có giá trị.")
            .min(10, "Nội dung phải ít nhất 10 ký tự.")
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            title: '',
            content: ''
        },
        validationSchema: lessonContentFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addLessonContent(values, resetForm);
        }
    });

    // Handle CKEditor change
    const handleEditorChange = (content) => {
        console.log('📝 Editor content changed:', content.length, 'characters');
        setEditorData(content);
        formik.setFieldValue('content', content);
        
        if (content.trim()) {
            formik.setFieldError('content', undefined);
        }
    };

    // Handle CKEditor ready
    const handleEditorReady = (editor) => {
        console.log('📝 CKEditor is ready');
        setIsEditorReady(true);
    };

    // Add lesson content function
    const addLessonContent = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addLessonContent with values:', values);

            const lessonContentData = {
                title: values.title,
                content: values.content
            };

            await LessonContentService.create(lessonId, lessonContentData);
            console.log('  Lesson content created successfully');

            retrieveLessonContents();

            // Reset form
            resetForm();
            setEditorData('');

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm nội dung bài học thành công', {
                autoClose: 1000,
            });

        } catch (error) {
            console.log('❌ Error creating lesson content:', error);
            let errorMessage = 'Lỗi khi thêm nội dung bài học';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
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
        setEditorData('');
        setIsEditorReady(false);
        
        if (onClose) {
            onClose();
        }
    };

    // Handle submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                title: true,
                content: true
            });
            return;
        }

        console.log('  Validation passed, submitting...');
        await addLessonContent(formik.values, formik.resetForm);
    };

    // Strip HTML tags for character count
    const stripHtmlTags = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="title" className="form-label">
                        Title<span className="required-field">*</span>
                    </label>
                    <input
                        name="title"
                        id="title"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.title && formik.errors.title ? 'is-invalid' : ''
                        }`}
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập tiêu đề bài học..."
                    />
                    {formik.touched.title && formik.errors.title && (
                        <div className="error-feedback">{formik.errors.title}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">
                        Content<span className="required-field">*</span>
                    </label>
                    
                    {/* Optimized CKEditor */}
                    <CKEditorOptimized
                        data={editorData}
                        onChange={handleEditorChange}
                        onReady={handleEditorReady}
                        onBlur={() => {
                            formik.setFieldTouched('content', true);
                        }}
                        placeholder="Nhập nội dung bài học của bạn tại đây..."
                        height="250px"
                    />
                    
                    {formik.touched.content && formik.errors.content && (
                        <div className="error-feedback mt-2">{formik.errors.content}</div>
                    )}
                    
                    {editorData && (
                        <small className="text-success d-block mt-2">
                            📝 Nội dung đã được nhập ({stripHtmlTags(editorData).length} ký tự)
                        </small>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                >
                    Đóng
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting || !isEditorReady}
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

export default AddLessonContent;