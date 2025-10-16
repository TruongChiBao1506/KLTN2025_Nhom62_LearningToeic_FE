import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

import GrammarContentService from '../../../../services/grammarContentService';
import './style.css';

const GrammarContentAdd = ({ grammarId, retrieveGrammarContents, onClose }) => {
    const [editorData, setEditorData] = useState('');

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
        onSubmit: (values, { resetForm }) => {
            addGrammarContent(values, resetForm);
        }
    });

    // Add grammar content function
    const addGrammarContent = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addGrammarContent with values:', values);
            console.log('🚀 Grammar ID:', grammarId);

            // Create JSON payload
            const payload = {
                grammarId: grammarId,
                title: values.title.trim(),
                content: values.content
            };

            console.log('📤 Sending create request to server...');
            console.log('JSON Payload:', JSON.stringify(payload, null, 2));

            await GrammarContentService.create(payload);
            console.log('✅ Grammar content created successfully');
            
            // Wait for list to refresh before closing modal
            await retrieveGrammarContents();
            
            // Reset form and states
            resetForm();
            setEditorData('');
            
            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm Grammar Content thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error creating grammar content:', error);
            let errorMessage = 'Lỗi khi thêm Grammar Content';
            
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

    useEffect(() => {
        // Sync editor data with formik
        formik.setFieldValue('content', editorData);
    }, [editorData]);

    return (
        <div className="page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Modal.Body className="text-start p-4">
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
                        className="btn btn-secondary rounded-5"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary rounded-5"
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

export default GrammarContentAdd;