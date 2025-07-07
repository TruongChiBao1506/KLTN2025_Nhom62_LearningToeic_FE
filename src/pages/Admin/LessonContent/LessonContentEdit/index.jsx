import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CKEditorOptimized from '../../../../components/Admin/EditorOptimized';
import LessonContentService from '../../../../services/lessonContentService';
import './style.css';

const EditLessonContent = ({ lessonContentId, lessonId, retrieveLessonContents, onClose }) => {
    const [lessonContent, setLessonContent] = useState(null);
    const [editorData, setEditorData] = useState('');
    const [loading, setLoading] = useState(true);
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
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateLessonContent(values);
        }
    });

    // Get lesson content data
    const getLessonContent = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching lesson content with ID:', lessonContentId);
            
            const data = await LessonContentService.get(lessonContentId);
            console.log('📄 Lesson content data:', data);

            // Set lesson content data
            setLessonContent(data);
            setEditorData(data.content || '');

            // Set form initial values
            formik.setValues({
                title: data.title || '',
                content: data.content || ''
            });

            console.log('  Lesson content loaded successfully');
        } catch (error) {
            console.log('❌ Error loading lesson content:', error);
            toast.error('Lỗi khi tải dữ liệu lesson content', {
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Load lesson content data on component mount
    useEffect(() => {
        if (lessonContentId) {
            getLessonContent();
        }
    }, [lessonContentId]);

    // Handle CKEditor change
    const handleEditorChange = (content) => {
        console.log('📝 Editor content changed:', content.length, 'characters');
        setEditorData(content);
        formik.setFieldValue('content', content);
        
        // Clear validation errors if content exists
        if (content.trim()) {
            formik.setFieldError('content', undefined);
        }
    };

    // Handle CKEditor ready
    const handleEditorReady = (editor) => {
        console.log('📝 CKEditor is ready for editing');
        setIsEditorReady(true);
    };

    // Update lesson content
    const updateLessonContent = async (values) => {
        try {
            console.log('🚀 Starting updateLessonContent with values:', values);
            console.log('🚀 Lesson ID:', lessonId);
            console.log('🚀 Lesson Content ID:', lessonContentId);

            const updateData = {
                title: values.title,
                content: values.content,
                lessonId: lessonId
            };

            console.log('📤 Sending update request to server...');
            await LessonContentService.update(lessonContentId, updateData);
            console.log('  Lesson content updated successfully');
            
            retrieveLessonContents();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa nội dung bài học thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error updating lesson content:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa nội dung bài học';

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
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);
        console.log('Editor data:', editorData);

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
        // Submit form
        await updateLessonContent(formik.values);
    };

    // Strip HTML tags for character count
    const stripHtmlTags = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Loading state
    if (loading) {
        return (
            <div className="modal-body text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Đang tải dữ liệu lesson content...</p>
            </div>
        );
    }

    // Error state
    if (!lessonContent) {
        return (
            <div className="modal-body text-center py-4">
                <div className="alert alert-danger">
                    <h5>⚠️ Không thể tải dữ liệu</h5>
                    <p>Lesson content không tồn tại hoặc đã bị xóa.</p>
                    <button
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="edit-title" className="form-label">
                        Title<span className="required-field">*</span>
                    </label>
                    <input
                        name="title"
                        id="edit-title"
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
                        placeholder="Chỉnh sửa nội dung bài học tại đây..."
                        height="250px"
                    />
                    
                    {formik.touched.content && formik.errors.content && (
                        <div className="error-feedback mt-2">{formik.errors.content}</div>
                    )}
                    
                    {editorData && (
                        <small className="text-info d-block mt-2">
                            📝 Nội dung hiện tại ({stripHtmlTags(editorData).length} ký tự)
                        </small>
                    )}
                </div>

                {/* Display current lesson content info */}
                <div className="alert alert-info">
                    <h6 className="alert-heading mb-2">📋 Thông tin Lesson Content</h6>
                    <small>
                        <strong>Content ID:</strong> {lessonContent.id || lessonContent.contentId}<br />
                        <strong>Lesson ID:</strong> {lessonId}<br />
                        <strong>Ngày tạo:</strong> {new Date(lessonContent.createdAt).toLocaleDateString('vi-VN')}<br />
                        {lessonContent.updatedAt && (
                            <>
                                <strong>Cập nhật lần cuối:</strong> {new Date(lessonContent.updatedAt).toLocaleDateString('vi-VN')}
                            </>
                        )}
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
                    disabled={formik.isSubmitting || !isEditorReady}
                    onClick={handleSubmit}
                >
                    {formik.isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang cập nhật...
                        </>
                    ) : (
                        'Cập nhật'
                    )}
                </button>
            </div>
        </>
    );
};

export default EditLessonContent;