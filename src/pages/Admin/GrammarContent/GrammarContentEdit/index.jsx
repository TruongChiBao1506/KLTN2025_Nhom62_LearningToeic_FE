import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

import GrammarContentService from '../../../../services/grammarContentService';
import './style.css';

const GrammarContentEdit = ({ grammarContentId, grammarId, retrieveGrammarContents, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const [grammarContent, setGrammarContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Validation schema using Yup
    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .required('Tiêu đề phải có giá trị.')
            .min(2, 'Tiêu đề phải ít nhất 2 ký tự.')
            .max(50, 'Tiêu đề có nhiều nhất 50 ký tự.'),
        content: Yup.string()
            .required('Content không được để trống.')
            .min(10, 'Content phải ít nhất 10 ký tự.')
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            title: '',
            content: ''
        },
        validationSchema,
        enableReinitialize: true, // Important for loading existing data
        onSubmit: (values) => {
            updateGrammarContent(values);
        }
    });

    // Get grammar content data
    const getGrammarContent = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Getting grammar content with ID:', grammarContentId);
            
            const data = await GrammarContentService.get(grammarContentId);
            console.log('✅ Grammar content retrieved:', data);
            
            setGrammarContent(data);
            
            // Set form values
            formik.setValues({
                title: data.title || '',
                content: data.content || ''
            });
            
            // Set editor data
            setEditorData(data.content || '');
            
        } catch (error) {
            console.error('❌ Error getting grammar content:', error);
            toast.error('Lỗi khi tải dữ liệu grammar content', {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Update grammar content function
    const updateGrammarContent = async (values) => {
        try {
            console.log('🚀 Starting updateGrammarContent with values:', values);
            console.log('🚀 Grammar Content ID:', grammarContentId);
            console.log('🚀 Grammar ID:', grammarId);

            // Create JSON payload
            const payload = {
                grammarId: grammarId,
                title: values.title.trim(),
                content: values.content
            };

            console.log('📤 Sending update request to server...');
            console.log('JSON Payload:', JSON.stringify(payload, null, 2));

            await GrammarContentService.update(grammarContentId, payload);
            console.log('✅ Grammar content updated successfully');
            
            retrieveGrammarContents();
            
            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa Grammar Content thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error updating grammar content:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa Grammar Content';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                autoClose: 2000,
                position: 'top-right',
            });
        }
    };

    // CKEditor configuration
    const editorConfiguration = {
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
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:full',
                'imageStyle:side'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
            ]
        }
    };

    // Handle editor ready
    const handleEditorReady = (editor) => {
        console.log('📝 CKEditor is ready to use!', editor);
        
        // Set custom height
        editor.editing.view.change(writer => {
            writer.setStyle('height', '250px', editor.editing.view.document.getRoot());
        });
    };

    // Handle editor data change
    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
        formik.setFieldValue('content', data);
    };

    // Handle editor blur for validation
    const handleEditorBlur = () => {
        formik.setFieldTouched('content', true);
    };

    // Load grammar content on component mount
    useEffect(() => {
        if (grammarContentId) {
            getGrammarContent();
        }
    }, [grammarContentId]);

    // Sync editor data with formik when editor data changes
    useEffect(() => {
        formik.setFieldValue('content', editorData);
    }, [editorData]);

    // Loading state
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Đang tải dữ liệu grammar content...</p>
            </div>
        );
    }

    // Error state - if no grammar content found
    if (!grammarContent && !isLoading) {
        return (
            <div className="alert alert-danger text-center">
                <i className="fas fa-exclamation-triangle mb-2"></i>
                <h5>Không tìm thấy Grammar Content</h5>
                <p>Grammar Content với ID {grammarContentId} không tồn tại.</p>
                <button className="btn btn-secondary" onClick={onClose}>
                    Đóng
                </button>
            </div>
        );
    }

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Modal.Body className="text-start">
                    {/* Title Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="title" className="form-label">
                            Title<span className="required-field">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.title && formik.errors.title ? 'is-invalid' : ''
                            }`}
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Nhập tiêu đề grammar content..."
                        />
                        {formik.touched.title && formik.errors.title && (
                            <div className="error-feedback">{formik.errors.title}</div>
                        )}
                    </div>

                    {/* Content Field with CKEditor */}
                    <div className="form-group mb-3">
                        <label className="form-label">
                            Content<span className="required-field">*</span>
                        </label>
                        <div className={`ckeditor-wrapper ${
                            formik.touched.content && formik.errors.content ? 'is-invalid' : ''
                        }`}>
                            <CKEditor
                                editor={ClassicEditor}
                                config={editorConfiguration}
                                data={editorData}
                                onReady={handleEditorReady}
                                onChange={handleEditorChange}
                                onBlur={handleEditorBlur}
                            />
                        </div>
                        {formik.touched.content && formik.errors.content && (
                            <div className="error-feedback">{formik.errors.content}</div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={formik.isSubmitting || !formik.isValid}
                    >
                        {formik.isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu'
                        )}
                    </button>
                </Modal.Footer>
            </form>
        </div>
    );
};

export default GrammarContentEdit;