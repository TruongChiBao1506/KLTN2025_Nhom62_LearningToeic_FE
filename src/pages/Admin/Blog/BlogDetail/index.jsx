import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faArrowLeft,
    faInfoCircle,
    faMagic,
    faSave,
    faTimes,
    faPaperPlane,
    faFileAlt,
    faSpinner,
    faExclamationTriangle,
    faRedo,
    faCheck,
    faEye, // Add this icon
    faCode // Add this icon
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import BlogService from '../../../../services/blogService';
import { normalizeBlogData, isValidBlogData } from '../../../../utils/blogUtils';

const BlogDetail = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();
    
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false); // Add preview mode state

    // ...existing code...

    // Load blog data
    useEffect(() => {
        const loadBlog = async () => {
            try {
                console.log('🔍 Loading blog with ID:', blogId); // Debug
                setIsLoading(true);
                
                if (!blogId) {
                    console.error('❌ No blogId provided');
                    throw new Error('Blog ID is required');
                }
                
                const response = await BlogService.getBlog(blogId);
                console.log('📥 Blog API Response:', response); // Debug
                
                const rawBlogData = response.data || response;
                console.log('📊 Raw blog data:', rawBlogData); // Debug
                
                // Normalize and validate blog data
                const blogData = normalizeBlogData(rawBlogData);
                console.log('📊 Normalized blog data:', blogData); // Debug
                
                if (!isValidBlogData(blogData)) {
                    console.error('❌ Invalid blog data received:', rawBlogData);
                    throw new Error('Invalid blog data');
                }
                
                setBlog(blogData);
                setContent(blogData.content || '');
                console.log('✅ Blog loaded successfully:', blogData.title); // Debug
            } catch (error) {
                console.error('❌ Error loading blog:', error); // Debug
                console.error('❌ Error details:', error.response); // Debug
                Swal.fire({
                    title: 'Load Failed',
                    text: `Failed to load blog details: ${error.message || 'Unknown error'}`,
                    icon: 'error'
                });
                navigate('/admin/blog');
            } finally {
                setIsLoading(false);
            }
        };

        if (blogId) {
            loadBlog();
        } else {
            console.error('❌ No blogId in URL params');
            navigate('/admin/blog');
        }
    }, [blogId, navigate]);

    // ...existing form validation and other methods...

    // Form validation for editing metadata
    const blogFormSchema = Yup.object().shape({
        title: Yup.string().required("Title is required.").min(5).max(200),
        keywords: Yup.string().required("Keywords are required.").min(3),
        audience: Yup.string().required("Target audience is required.").min(3),
        category: Yup.string().required("Category is required."),
        language: Yup.string().oneOf(['vi', 'en']),
        tone: Yup.string().oneOf(['friendly', 'professional', 'casual', 'formal', 'encouraging']),
        wordCount: Yup.number().min(100).max(5000),
        tags: Yup.array().of(Yup.string())
    });

    const formik = useFormik({
        initialValues: {
            title: blog?.title || '',
            keywords: blog?.keywords || '',
            audience: blog?.audience || '',
            category: blog?.category || '',
            language: blog?.language || 'vi',
            tone: blog?.tone || 'friendly',
            wordCount: blog?.wordCount || 1000,
            tags: blog?.tags || []
        },
        enableReinitialize: true,
        validationSchema: blogFormSchema,
        onSubmit: async (values) => {
            await handleSaveMetadata(values);
        }
    });

    // Generate AI content
    const handleGenerateContent = async () => {
        try {
            setIsGenerating(true);
            setGenerationProgress(10);

            await BlogService.requestAIGeneration(blogId);
            pollGenerationStatus();

        } catch (error) {
            Swal.fire({
                title: 'Generation Failed',
                text: 'Failed to start AI content generation.',
                icon: 'error'
            });
            setIsGenerating(false);
            setGenerationProgress(0);
        }
    };

    // Poll generation status
    const pollGenerationStatus = () => {
        const interval = setInterval(async () => {
            try {
                const response = await BlogService.getBlog(blogId);
                const blogData = response.data || response;

                if (blogData.generationStatus === 'completed') {
                    setContent(blogData.content);
                    setBlog(blogData);
                    setIsGenerating(false);
                    setGenerationProgress(100);
                    clearInterval(interval);
                    
                    Swal.fire({
                        title: 'AI Generation Complete',
                        text: 'Content has been generated successfully!',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else if (blogData.generationStatus === 'failed') {
                    setIsGenerating(false);
                    setGenerationProgress(0);
                    clearInterval(interval);
                    Swal.fire({
                        title: 'Generation Failed',
                        text: blogData.generationMetadata?.errorMessage || 'AI content generation failed.',
                        icon: 'error'
                    });
                } else if (blogData.generationStatus === 'processing') {
                    // Use backend generationProgress field if available
                    const backendProgress = blogData.generationProgress || 0;
                    setGenerationProgress(backendProgress > 0 ? backendProgress : prev => Math.min(prev + 10, 90));
                } else if (blogData.generationStatus === 'pending') {
                    setGenerationProgress(10);
                }
            } catch (error) {
                clearInterval(interval);
                setIsGenerating(false);
                setGenerationProgress(0);
            }
        }, 2000);

        // Timeout after 5 minutes
        setTimeout(() => {
            clearInterval(interval);
            if (isGenerating) {
                setIsGenerating(false);
                setGenerationProgress(0);
                Swal.fire({
                    title: 'Generation Timeout',
                    text: 'AI generation is taking longer than expected.',
                    icon: 'warning'
                });
            }
        }, 300000);
    };

    // Save content changes
    const handleSaveContent = async () => {
        try {
            setIsSaving(true);
            await BlogService.updateContent(blogId, { content });
            setBlog({ ...blog, content });
            setIsEditing(false);
            
            Swal.fire({
                title: 'Content Saved',
                text: 'Blog content has been updated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                title: 'Save Failed',
                text: 'Failed to save content changes.',
                icon: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Save metadata changes
    const handleSaveMetadata = async (values) => {
        try {
            setIsSaving(true);
            const updateData = {
                title: values.title,
                keywords: values.keywords,
                audience: values.audience,
                category: values.category,
                language: values.language,
                tone: values.tone,
                wordCount: values.wordCount,
                tags: values.tags
            };
            
            await BlogService.updateContent(blogId, updateData);
            setBlog({ ...blog, ...updateData });
            
            Swal.fire({
                title: 'Blog Updated',
                text: 'Blog metadata has been updated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                title: 'Update Failed',
                text: 'Failed to update blog metadata.',
                icon: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Publish blog
    const handlePublish = async () => {
        if (!content.trim()) {
            Swal.fire({
                title: 'No Content',
                text: 'Please generate or add content before publishing.',
                icon: 'error'
            });
            return;
        }

        try {
            setIsSaving(true);
            await BlogService.publishBlog(blogId);
            setBlog({ ...blog, status: 'published' });
            
            Swal.fire({
                title: 'Blog Published',
                text: 'Your blog is now live on the website!',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                title: 'Publish Failed',
                text: 'Failed to publish blog.',
                icon: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading blog details...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="text-center py-5">
                <h4>Blog not found</h4>
                <button className="btn btn-primary" onClick={() => navigate('/admin/blog')}>
                    Back to Blog List
                </button>
            </div>
        );
    }

    return (
        <div className="page-heading">
            <div className="section">
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 16,
                        padding: '24px 32px',
                        marginBottom: 24,
                        boxShadow: '0 4px 20px rgba(102,126,234,0.15)'
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16
                            }}>
                                <FontAwesomeIcon icon={faEdit} style={{ color: '#fff', fontSize: 20 }} />
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Edit Blog</h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 14 }}>
                                    {blog?.title || 'Loading...'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                            <span className={`badge ${blog?.status === 'published' ? 'bg-success' : 'bg-warning'} fs-6 px-3 py-2`}>
                                <FontAwesomeIcon icon={blog?.status === 'published' ? faCheck : faFileAlt} className="me-2" />
                                {blog?.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                            <button 
                                className="btn btn-light rounded-5"
                                onClick={() => navigate('/admin/blog')}
                                style={{ minWidth: 120 }}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blog Information Card */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom-0 pb-0">
                        <h5 className="mb-0 d-flex align-items-center">
                            <FontAwesomeIcon icon={faInfoCircle} className="text-primary me-2" />
                            Blog Information
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Title<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        name="title"
                                        type="text"
                                        className={`form-control rounded-3 ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        style={{ padding: '12px 16px' }}
                                    />
                                    {formik.touched.title && formik.errors.title && (
                                        <div className="invalid-feedback">{formik.errors.title}</div>
                                    )}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Category<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        className={`form-control rounded-3 ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                                        value={formik.values.category}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        style={{ padding: '12px 16px' }}
                                    >
                                        <option value="">Select category</option>
                                        <option value="listening">Listening</option>
                                        <option value="reading">Reading</option>
                                        <option value="grammar">Grammar</option>
                                        <option value="vocabulary">Vocabulary</option>
                                        <option value="tips">Tips & Strategies</option>
                                        <option value="news">News & Updates</option>
                                        <option value="general">General</option>
                                    </select>
                                    {formik.touched.category && formik.errors.category && (
                                        <div className="invalid-feedback">{formik.errors.category}</div>
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Keywords<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        name="keywords"
                                        type="text"
                                        className={`form-control rounded-3 ${formik.touched.keywords && formik.errors.keywords ? 'is-invalid' : ''}`}
                                        value={formik.values.keywords}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Keywords for AI generation"
                                        style={{ padding: '12px 16px' }}
                                    />
                                    {formik.touched.keywords && formik.errors.keywords && (
                                        <div className="invalid-feedback">{formik.errors.keywords}</div>
                                    )}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Target Audience<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        name="audience"
                                        type="text"
                                        className={`form-control rounded-3 ${formik.touched.audience && formik.errors.audience ? 'is-invalid' : ''}`}
                                        value={formik.values.audience}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="e.g., TOEIC beginners"
                                        style={{ padding: '12px 16px' }}
                                    />
                                    {formik.touched.audience && formik.errors.audience && (
                                        <div className="invalid-feedback">{formik.errors.audience}</div>
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label className="form-label fw-semibold">Language</label>
                                    <select
                                        name="language"
                                        className="form-control rounded-3"
                                        value={formik.values.language}
                                        onChange={formik.handleChange}
                                        style={{ padding: '12px 16px' }}
                                    >
                                        <option value="vi">Vietnamese</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label fw-semibold">Tone</label>
                                    <select
                                        name="tone"
                                        className="form-control rounded-3"
                                        value={formik.values.tone}
                                        onChange={formik.handleChange}
                                        style={{ padding: '12px 16px' }}
                                    >
                                        <option value="friendly">Friendly</option>
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="formal">Formal</option>
                                        <option value="encouraging">Encouraging</option>
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label fw-semibold">Word Count</label>
                                    <input
                                        name="wordCount"
                                        type="number"
                                        min="100"
                                        max="5000"
                                        className="form-control rounded-3"
                                        value={formik.values.wordCount}
                                        onChange={formik.handleChange}
                                        style={{ padding: '12px 16px' }}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label fw-semibold">Tags</label>
                                    <input
                                        name="tags"
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Comma separated"
                                        value={formik.values.tags?.join(', ') || ''}
                                        onChange={(e) => {
                                            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                            formik.setFieldValue('tags', tags);
                                        }}
                                        style={{ padding: '12px 16px' }}
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary rounded-3 px-4"
                                    disabled={isSaving || formik.isSubmitting}
                                    style={{ padding: '12px 24px' }}
                                >
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    {isSaving ? 'Updating...' : 'Update Blog Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Content Management Card */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom-0 pb-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 d-flex align-items-center">
                                <FontAwesomeIcon icon={faFileAlt} className="text-primary me-2" />
                                Blog Content Management
                            </h5>
                            
                            {/* View Mode Toggle Buttons */}
                            {content && !isEditing && (
                                <div className="btn-group" role="group">
                                    <button 
                                        type="button" 
                                        className={`btn ${!isPreviewMode ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                        onClick={() => setIsPreviewMode(false)}
                                    >
                                        <FontAwesomeIcon icon={faCode} className="me-1" />
                                        Raw HTML
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn ${isPreviewMode ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                        onClick={() => setIsPreviewMode(true)}
                                    >
                                        <FontAwesomeIcon icon={faEye} className="me-1" />
                                        Preview
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="card-body">
                        {/* Action Buttons */}
                        <div className="d-flex gap-2 mb-4 flex-wrap">
                            <button 
                                className="btn btn-primary rounded-3"
                                onClick={handleGenerateContent}
                                disabled={isGenerating}
                                style={{ padding: '12px 20px' }}
                            >
                                <FontAwesomeIcon icon={faMagic} className="me-2" />
                                {isGenerating ? 'Generating...' : 'Generate AI Content'}
                            </button>
                            
                            {content && !isEditing && (
                                <>
                                    <button 
                                        className="btn btn-outline-primary rounded-3"
                                        onClick={() => setIsEditing(true)}
                                        style={{ padding: '12px 20px' }}
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                                        Edit Content
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary rounded-3"
                                        onClick={handleGenerateContent}
                                        disabled={isGenerating}
                                        style={{ padding: '12px 20px' }}
                                    >
                                        <FontAwesomeIcon icon={faRedo} className="me-2" />
                                        Regenerate
                                    </button>
                                </>
                            )}

                            {isEditing && (
                                <>
                                    <button 
                                        className="btn btn-success rounded-3"
                                        onClick={handleSaveContent}
                                        disabled={isSaving}
                                        style={{ padding: '12px 20px' }}
                                    >
                                        <FontAwesomeIcon icon={faSave} className="me-2" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary rounded-3"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setContent(blog.content || '');
                                        }}
                                        style={{ padding: '12px 20px' }}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                                        Cancel
                                    </button>
                                </>
                            )}

                            {content && blog?.status !== 'published' && !isEditing && (
                                <button 
                                    className="btn btn-success rounded-3"
                                    onClick={handlePublish}
                                    disabled={isSaving}
                                    style={{ padding: '12px 20px' }}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                    Publish Blog
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        {!content && !isGenerating && blog?.generationStatus !== 'processing' && (
                            <div className="text-center py-5 border border-2 border-dashed rounded-3" style={{ background: '#f8f9ff' }}>
                                <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '3rem' }} className="text-muted mb-3" />
                                <h6 className="text-muted mb-3">No content yet</h6>
                                <p className="text-muted mb-0">Generate AI content to get started with your blog post.</p>
                                <small className="text-muted d-block mt-2">
                                    Make sure to fill in the blog information above before generating content.
                                </small>
                            </div>
                        )}

                        {(isGenerating || blog?.generationStatus === 'processing') && (
                            <div className="text-center py-5" style={{ background: '#f8f9ff', borderRadius: '12px' }}>
                                <FontAwesomeIcon icon={faSpinner} className="fa-spin text-primary mb-3" style={{ fontSize: '2rem' }} />
                                <h6 className="mb-3">AI is generating your blog content...</h6>
                                <div className="progress mb-3" style={{ maxWidth: '400px', margin: '0 auto', height: '8px' }}>
                                    <div 
                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar"
                                        style={{ width: `${generationProgress}%` }}
                                    >
                                    </div>
                                </div>
                                <p className="mb-0 text-muted">{generationProgress}% complete</p>
                                <small className="text-muted d-block mt-2">
                                    This may take a few moments. Please don't close this window.
                                </small>
                            </div>
                        )}

                        {blog?.generationStatus === 'failed' && !content && (
                            <div className="text-center py-5 border border-2 border-dashed border-danger rounded-3" style={{ background: '#fff5f5' }}>
                                <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '3rem' }} className="text-danger mb-3" />
                                <h6 className="text-danger mb-3">AI content generation failed</h6>
                                {blog?.generationMetadata?.errorMessage && (
                                    <p className="text-muted mb-3">
                                        {blog.generationMetadata.errorMessage}
                                    </p>
                                )}
                                <button 
                                    className="btn btn-outline-danger rounded-3"
                                    onClick={handleGenerateContent}
                                    disabled={isGenerating}
                                    style={{ padding: '12px 20px' }}
                                >
                                    <FontAwesomeIcon icon={faRedo} className="me-2" />
                                    Try Again
                                </button>
                            </div>
                        )}

                        {content && (
                            <div className="mt-3">
                                {isEditing ? (
                                    <textarea
                                        className="form-control rounded-3"
                                        rows="20"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Edit your blog content here..."
                                        style={{ 
                                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', 
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            padding: '16px'
                                        }}
                                    />
                                ) : (
                                    <div className="border rounded-3 p-4" style={{ minHeight: '400px', background: '#fff' }}>
                                        {isPreviewMode ? (
                                            // Preview Mode - Render HTML
                                            <div 
                                                className="blog-preview-content" 
                                                dangerouslySetInnerHTML={{ __html: content }}
                                                style={{
                                                    fontFamily: 'Georgia, "Times New Roman", serif',
                                                    lineHeight: '1.7',
                                                    fontSize: '15px',
                                                    color: '#333'
                                                }}
                                            />
                                        ) : (
                                            // Raw HTML Mode - Show HTML source
                                            <pre 
                                                style={{ 
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                                    fontSize: '13px',
                                                    lineHeight: '1.5',
                                                    color: '#333',
                                                    margin: 0,
                                                    padding: 0,
                                                    background: 'transparent',
                                                    border: 'none'
                                                }}
                                            >
                                                {content}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add some CSS for better preview styling */}
            <style jsx>{`
                .blog-preview-content h1 {
                    color: #1a73e8;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    line-height: 1.3;
                }
                
                .blog-preview-content h2 {
                    color: #1a73e8;
                    font-size: 22px;
                    font-weight: 600;
                    margin-top: 24px;
                    margin-bottom: 8px;
                }
                
                .blog-preview-content h3 {
                    color: #1a73e8;
                    font-size: 18px;
                    font-weight: 600;
                    margin-top: 20px;
                    margin-bottom: 8px;
                }
                
                .blog-preview-content p {
                    margin: 12px 0;
                    text-align: justify;
                }
                
                .blog-preview-content ul, .blog-preview-content ol {
                    padding-left: 24px;
                    margin: 12px 0;
                }
                
                .blog-preview-content li {
                    margin-bottom: 8px;
                }
                
                .blog-preview-content strong, .blog-preview-content b {
                    font-weight: 600;
                    color: #1a73e8;
                }
                
                .blog-preview-content em, .blog-preview-content i {
                    font-style: italic;
                }
                
                .blog-preview-content code {
                    background-color: #f5f5f5;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                }
                
                .blog-preview-content blockquote {
                    border-left: 4px solid #1a73e8;
                    margin: 16px 0;
                    padding-left: 16px;
                    font-style: italic;
                    color: #666;
                }
                
                .blog-preview-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 16px 0;
                }
                
                .blog-preview-content th, .blog-preview-content td {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    text-align: left;
                }
                
                .blog-preview-content th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default BlogDetail;