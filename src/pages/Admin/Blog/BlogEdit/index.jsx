import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import BlogService from '../../../../services/blogService';
import { notification } from 'antd';

const EditBlog = ({ blogId, retrieveBlogs, onClose }) => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationError, setGenerationError] = useState(null);
    const generationPollRef = useRef(null);
    const generationTimeoutRef = useRef(null);
    const [currentContent, setCurrentContent] = useState('');

    // Validation schema
    const blogFormSchema = Yup.object().shape({
        title: Yup
            .string()
            .required("Title is required.")
            .min(5, "Title must be at least 5 characters.")
            .max(200, "Title must be at most 200 characters."),
        category: Yup
            .string()
            .required("Category is required."),
        tags: Yup
            .array()
            .of(Yup.string()),
        content: Yup
            .string()
            .min(10, "Content must be at least 10 characters.")
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            title: '',
            category: '',
            tags: [],
            content: ''
        },
        validationSchema: blogFormSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateBlog(values);
        }
    });

    // Get blog data
    const getBlog = async () => {
        try {
            setLoading(true);
            const response = await BlogService.getBlog(blogId);
            const blogData = response.data || response;

            setBlog(blogData);
            setCurrentContent(blogData.content || '');

            // Set form values
            formik.setValues({
                title: blogData.title || '',
                category: blogData.category || '',
                tags: blogData.tags || [],
                content: blogData.content || ''
            });

        } catch (error) {
            console.error('Error fetching blog:', error);
            notification.error({
                message: 'Load Failed',
                description: 'Failed to load blog data.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Load blog data on component mount
    useEffect(() => {
        if (blogId) {
            getBlog();
        }
    }, [blogId]);

    // Cleanup generation polls on unmount
    useEffect(() => {
        return () => {
            if (generationPollRef.current) {
                clearInterval(generationPollRef.current);
                generationPollRef.current = null;
            }
            if (generationTimeoutRef.current) {
                clearTimeout(generationTimeoutRef.current);
                generationTimeoutRef.current = null;
            }
        };
    }, []);

    // Handle AI content generation
    const handleGenerateContent = async () => {
        try {
            // Validate required fields using Formik
            const errors = await formik.validateForm();
            if (errors.title || errors.category) {
                notification.error({
                    message: 'Validation Failed',
                    description: 'Please fill Title and Category before generating.'
                });
                return;
            }

            // Reset any previous error and clear previous polls
            setGenerationError(null);
            if (generationPollRef.current) {
                clearInterval(generationPollRef.current);
                generationPollRef.current = null;
            }
            if (generationTimeoutRef.current) {
                clearTimeout(generationTimeoutRef.current);
                generationTimeoutRef.current = null;
            }

            setIsGenerating(true);
            setGenerationProgress(10);

            // Request AI generation
            await BlogService.requestAIGeneration(blogId, { force: Boolean(generationError) });

            // Start polling for progress
            pollGenerationStatus(blogId);

        } catch (error) {
            console.error('Generation error:', error);
            const msg = error.response?.data?.message || error.message || 'Please check your inputs and try again.';
            setGenerationError(msg);
            notification.error({
                message: 'Generation Failed',
                description: msg
            });
            setIsGenerating(false);
            setGenerationProgress(0);
        }
    };

    // Poll generation status
    const pollGenerationStatus = async (blogId) => {
        // Clear any existing polling timers
        if (generationPollRef.current) {
            clearInterval(generationPollRef.current);
            generationPollRef.current = null;
        }
        if (generationTimeoutRef.current) {
            clearTimeout(generationTimeoutRef.current);
            generationTimeoutRef.current = null;
        }

        const pollInterval = setInterval(async () => {
            try {
                const response = await BlogService.getBlog(blogId);
                const blogData = response.data || response;

                if (blogData.generationStatus === 'completed') {
                    setCurrentContent(blogData.content);
                    formik.setFieldValue('content', blogData.content);
                    setIsGenerating(false);
                    setGenerationProgress(100);
                    setGenerationError(null);
                    if (generationPollRef.current) {
                        clearInterval(generationPollRef.current);
                        generationPollRef.current = null;
                    }
                    if (generationTimeoutRef.current) {
                        clearTimeout(generationTimeoutRef.current);
                        generationTimeoutRef.current = null;
                    }

                    notification.success({
                        message: 'AI Generation Complete',
                        description: 'Blog content has been generated successfully!'
                    });
                } else if (blogData.generationStatus === 'failed') {
                    setIsGenerating(false);
                    setGenerationProgress(0);
                    setGenerationError('AI content generation failed. Please try again.');
                    setGenerationError('AI content generation failed. Please try again.');
                    if (generationPollRef.current) {
                        clearInterval(generationPollRef.current);
                        generationPollRef.current = null;
                    }
                    if (generationTimeoutRef.current) {
                        clearTimeout(generationTimeoutRef.current);
                        generationTimeoutRef.current = null;
                    }

                    notification.error({
                        message: 'Generation Failed',
                        description: 'AI content generation failed. Please try again.'
                    });
                } else if (blogData.generationStatus === 'processing') {
                    const backendProgress = blogData.generationProgress || 0;
                    setGenerationProgress(backendProgress > 0 ? backendProgress : prev => Math.min(prev + 10, 90));
                }
            } catch (error) {
                if (generationPollRef.current) {
                    clearInterval(generationPollRef.current);
                    generationPollRef.current = null;
                }
                setIsGenerating(false);
                setGenerationProgress(0);
                notification.error({
                    message: 'Generation Error',
                    description: 'Failed to check generation status.'
                });
            }
        }, 2000);

        generationPollRef.current = pollInterval;

        // Clear interval after 5 minutes timeout
        generationTimeoutRef.current = setTimeout(() => {
            if (generationPollRef.current) {
                clearInterval(generationPollRef.current);
                generationPollRef.current = null;
            }
            setIsGenerating(false);
            setGenerationProgress(0);
            notification.warning({
                message: 'Generation Timeout',
                description: 'AI generation is taking longer than expected.'
            });
        }, 300000);
    };

    // Update blog
    const updateBlog = async (values) => {
        try {
            console.log('🚀 Starting updateBlog with values:', values);

            // Update content
            await BlogService.updateContent(blogId, {
                content: currentContent || values.content
            });

            notification.success({
                message: 'Blog Updated Successfully',
                description: 'Blog has been updated successfully.'
            });

            // Refresh blog list
            if (retrieveBlogs) {
                retrieveBlogs();
            }

            // Close modal
            if (onClose) {
                onClose();
            }

        } catch (error) {
            console.error('Error updating blog:', error);
            notification.error({
                message: 'Update Failed',
                description: error.response?.data?.message || 'Failed to update blog. Please try again.'
            });
        }
    };

    const handleClose = () => {
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
        console.log('Current content:', currentContent);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form validation failed:', errors);
            formik.setTouched({
                title: true,
                category: true,
                tags: true,
                content: true
            });
            return;
        }

        console.log('✅ Validation passed, submitting...');
        await updateBlog(formik.values);
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Validate form first
            const errors = await formik.validateForm();
            if (Object.keys(errors).length > 0) {
                notification.error({
                    message: 'Validation Failed',
                    description: 'Please fill all required fields first.'
                });
                return;
            }

            // Update content first
            await BlogService.updateContent(blogId, {
                content: currentContent || formik.values.content
            });

            // Publish the blog
            await BlogService.publishBlog(blogId);

            notification.success({
                message: 'Blog Published',
                description: 'Your blog has been published successfully!'
            });

            if (retrieveBlogs) retrieveBlogs();
            if (onClose) onClose();

        } catch (error) {
            notification.error({
                message: 'Publish Failed',
                description: error.response?.data?.message || 'Failed to publish blog.'
            });
        }
    };

    if (loading) {
        return (
            <div className="modal-body text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading blog data...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="modal-body text-center">
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Blog not found or failed to load.
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label className="form-label">
                        Blog Title<span className="required-field">*</span>
                    </label>
                    <input
                        name="title"
                        type="text"
                        className={`form-control border-secondary custom-font ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''
                            }`}
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter blog title..."
                    />
                    {formik.touched.title && formik.errors.title && (
                        <div className="error-feedback">{formik.errors.title}</div>
                    )}
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">
                                Category<span className="required-field">*</span>
                            </label>
                            <select
                                name="category"
                                className={`form-control border-secondary custom-font ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''
                                    }`}
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="">Select category</option>
                                <option value="TOEIC Tips">TOEIC Tips</option>
                                <option value="Grammar">Grammar</option>
                                <option value="Vocabulary">Vocabulary</option>
                                <option value="Study Guide">Study Guide</option>
                                <option value="Practice Tests">Practice Tests</option>
                            </select>
                            {formik.touched.category && formik.errors.category && (
                                <div className="error-feedback">{formik.errors.category}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">Tags</label>
                            <input
                                name="tags"
                                type="text"
                                className="form-control border-secondary custom-font"
                                placeholder="Enter tags separated by commas"
                                value={formik.values.tags?.join(', ') || ''}
                                onChange={(e) => {
                                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                    formik.setFieldValue('tags', tags);
                                }}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">
                        Status:
                        <span className={`ms-2 badge ${blog.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                            {blog.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        {blog.generationStatus === 'processing' && (
                            <span className="ms-2 badge bg-info">AI Generating...</span>
                        )}
                    </label>
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">Content</label>

                    {!currentContent && !isGenerating && (
                        <div className="text-center p-4 border border-2 border-dashed rounded">
                            <i className="fas fa-robot fa-3x text-primary mb-3"></i>
                            <p className="mb-3 text-muted">
                                No content available. Generate AI content!
                            </p>
                            <div>
                                {generationError && (
                                    <div className="alert alert-danger" role="alert">
                                        {generationError}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleGenerateContent}
                                    disabled={!formik.values.title || !formik.values.category}
                                >
                                    <i className="fas fa-magic me-2"></i>
                                    Generate AI Content
                                </button>
                            </div>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="text-center p-4 border border-primary border-2 border-dashed rounded">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                                <>
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mb-3">AI is generating your blog content...</p>
                                    <div className="progress mb-3">
                                        <div
                                            className="progress-bar progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: `${generationProgress}%` }}
                                        >
                                            {generationProgress}%
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        This may take a few moments. Please don't close this window.
                                    </small>
                                </>
                                {currentContent && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            setGenerationError(blogData.generationMetadata?.errorMessage || 'AI content generation failed. Please try again.');
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm p-0"
                                                onClick={handleGenerateContent}
                                                disabled={isGenerating}
                                            >
                                                <i className="fas fa-redo me-1"></i>
                                                Regenerate
                                            </button>
                                        </div>
                                        <textarea
                                            name="content"
                                            className={`form-control border-secondary custom-font ${formik.touched.content && formik.errors.content ? 'is-invalid' : ''
                                                const backendProgress= blogData.generationProgress || 0;
                                }`}
                                        rows="15"
                                        value={currentContent}
                                        onChange={(e) => setCurrentContent(e.target.value)}
                                        onBlur={formik.handleBlur}
                                        placeholder="Your blog content will appear here..."
                            />
                                        {formik.touched.content && formik.errors.content && (
                                            <div className="error-feedback">{formik.errors.content}</div>
                                        )}
                                    </div>
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
                            disabled={isGenerating}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-info rounded-5"
                            disabled={formik.isSubmitting || isGenerating}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSubmit(e);
                            }}
                        >
                            {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        {blog.status !== 'published' && (
                            <button
                                type="button"
                                className="btn btn-success rounded-5"
                                disabled={!currentContent || formik.isSubmitting || isGenerating}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePublish(e);
                                }}
                            >
                                {formik.isSubmitting ? 'Publishing...' : 'Publish Blog'}
                            </button>
                        )}
                    </div>
                </>
                );
};

                export default EditBlog;