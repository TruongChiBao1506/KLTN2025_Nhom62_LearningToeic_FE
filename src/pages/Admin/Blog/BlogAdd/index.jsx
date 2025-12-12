import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import BlogService from '../../../../services/blogService';
import { notification } from 'antd';
import { getBlogId } from '../../../../utils/blogUtils';

const AddBlog = ({ retrieveBlogs, onClose }) => {
    const navigate = useNavigate();
    // Remove AI generation states - not needed in create form
    // const [isGenerating, setIsGenerating] = useState(false);
    // const [generationProgress, setGenerationProgress] = useState(0);
    // const [currentContent, setCurrentContent] = useState('');

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
        keywords: Yup
            .string()
            .required("Keywords are required.")
            .min(3, "Keywords must be at least 3 characters."),
        audience: Yup
            .string()
            .required("Target audience is required.")
            .min(3, "Audience must be at least 3 characters."),
        tags: Yup
            .array()
            .of(Yup.string()),
        language: Yup
            .string()
            .oneOf(['vi', 'en'], 'Language must be Vietnamese or English'),
        tone: Yup
            .string()
            .oneOf(['friendly', 'professional', 'casual', 'formal', 'encouraging'], 'Invalid tone'),
        wordCount: Yup
            .number()
            .min(100, "Minimum word count is 100")
            .max(5000, "Maximum word count is 5000"),

    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            title: '',
            category: '',
            keywords: '',
            audience: '',
            tags: [],
            language: 'vi',
            tone: 'friendly',
            wordCount: 1000,

        },
        validationSchema: blogFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addBlog(values, resetForm);
        }
    });



    // Add blog function - only create draft with metadata
    const addBlog = async (values, resetForm) => {
        try {
            console.log('🚀 Creating blog draft with values:', values);
            
            const blogData = {
                title: values.title,
                keywords: values.keywords,
                audience: values.audience,
                language: values.language || 'vi',
                tone: values.tone || 'friendly',
                wordCount: values.wordCount || 1000,
                category: values.category,
                tags: values.tags || []
                // No content field - will be empty initially
            };

            const response = await BlogService.createDraft(blogData);
            console.log('📥 Create blog response:', response);
            
            const createdBlog = response.data || response;
            console.log('📊 Created blog data:', createdBlog);
            
            const blogId = getBlogId(createdBlog);
            console.log('🆔 Blog ID for navigation:', blogId);
            
            if (!blogId) {
                console.error('❌ No valid blog ID in response');
                throw new Error('No blog ID returned from server');
            }
            
            notification.success({
                message: 'Blog Draft Created',
                description: 'Redirecting to blog detail page for content generation.'
            });

            // Reset form and close modal
            resetForm();
            
            // Refresh blog list - wait for it to complete
            if (retrieveBlogs) {
                await retrieveBlogs();
            }
            
            // Close modal
            if (onClose) {
                onClose();
            }
            
            // Navigate to blog detail page
            console.log('🚀 Navigating to:', `/admin/blog/${blogId}`); // Debug
            navigate(`/admin/blog/${blogId}`);

        } catch (error) {
            console.error('Error creating blog draft:', error);
            notification.error({
                message: 'Create Failed',
                description: error.response?.data?.message || 'Failed to create blog draft. Please try again.'
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

    // Handle submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);


        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form validation failed:', errors);
            formik.setTouched({
                title: true,
                category: true,
                keywords: true,
                audience: true,
                language: true,
                tone: true,
                wordCount: true,

            });
            return;
        }

        console.log('✅ Validation passed, submitting...');
        await addBlog(formik.values, formik.resetForm);
    };



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
                        className={`form-control border-secondary custom-font ${
                            formik.touched.title && formik.errors.title ? 'is-invalid' : ''
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
                                Keywords<span className="required-field">*</span>
                            </label>
                            <input
                                name="keywords"
                                type="text"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.keywords && formik.errors.keywords ? 'is-invalid' : ''
                                }`}
                                value={formik.values.keywords}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter keywords for AI content generation..."
                            />
                            {formik.touched.keywords && formik.errors.keywords && (
                                <div className="error-feedback">{formik.errors.keywords}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">
                                Target Audience<span className="required-field">*</span>
                            </label>
                            <input
                                name="audience"
                                type="text"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.audience && formik.errors.audience ? 'is-invalid' : ''
                                }`}
                                value={formik.values.audience}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="e.g., TOEIC students, beginners, professionals..."
                            />
                            {formik.touched.audience && formik.errors.audience && (
                                <div className="error-feedback">{formik.errors.audience}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">
                                Category<span className="required-field">*</span>
                            </label>
                            <select
                                name="category"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.category && formik.errors.category ? 'is-invalid' : ''
                                }`}
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
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

                <div className="row">
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                            <label className="form-label">Language</label>
                            <select
                                name="language"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.language && formik.errors.language ? 'is-invalid' : ''
                                }`}
                                value={formik.values.language}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="vi">Vietnamese</option>
                                <option value="en">English</option>
                            </select>
                            {formik.touched.language && formik.errors.language && (
                                <div className="error-feedback">{formik.errors.language}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                            <label className="form-label">Writing Tone</label>
                            <select
                                name="tone"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.tone && formik.errors.tone ? 'is-invalid' : ''
                                }`}
                                value={formik.values.tone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="friendly">Friendly</option>
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="formal">Formal</option>
                                <option value="encouraging">Encouraging</option>
                            </select>
                            {formik.touched.tone && formik.errors.tone && (
                                <div className="error-feedback">{formik.errors.tone}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                            <label className="form-label">Word Count</label>
                            <input
                                name="wordCount"
                                type="number"
                                min="100"
                                max="5000"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.wordCount && formik.errors.wordCount ? 'is-invalid' : ''
                                }`}
                                value={formik.values.wordCount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="1000"
                            />
                            {formik.touched.wordCount && formik.errors.wordCount && (
                                <div className="error-feedback">{formik.errors.wordCount}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Information about content generation */}
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Next Step:</strong> After creating this blog draft, you can edit it to generate AI content and publish it.
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
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-primary rounded-5"
                    disabled={formik.isSubmitting}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }}
                >
                    {formik.isSubmitting ? 'Creating...' : 'Create Blog Draft'}
                </button>
            </div>
        </>
    );
};

export default AddBlog;