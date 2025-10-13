// Utility functions for blog data handling

/**
 * Normalize blog object to ensure consistent ID field
 * MongoDB returns _id, but frontend expects id
 * @param {Object} blog - Blog object from API
 * @returns {Object} - Normalized blog object with id field
 */
export const normalizeBlogData = (blog) => {
    if (!blog) return null;
    
    // Create a copy to avoid mutating original object
    const normalizedBlog = { ...blog };
    
    // Ensure id field exists (convert _id to id if needed)
    if (normalizedBlog._id && !normalizedBlog.id) {
        normalizedBlog.id = normalizedBlog._id;
    }
    
    return normalizedBlog;
};

/**
 * Get blog ID from blog object (handles both id and _id)
 * @param {Object} blog - Blog object
 * @returns {string|null} - Blog ID or null if not found
 */
export const getBlogId = (blog) => {
    if (!blog) return null;
    return blog.id || blog._id || null;
};

/**
 * Normalize array of blogs
 * @param {Array} blogs - Array of blog objects
 * @returns {Array} - Array of normalized blog objects
 */
export const normalizeBlogsArray = (blogs) => {
    if (!Array.isArray(blogs)) return [];
    return blogs.map(normalizeBlogData).filter(Boolean);
};

/**
 * Extract blogs array from API response (handles different response formats)
 * @param {Object|Array} response - API response
 * @returns {Array} - Normalized array of blogs
 */
export const extractBlogsFromResponse = (response) => {
    let blogsData = [];
    
    if (Array.isArray(response)) {
        blogsData = response;
    } else if (response && Array.isArray(response.data)) {
        blogsData = response.data;
    } else if (response && response.data && Array.isArray(response.data.blogs)) {
        blogsData = response.data.blogs;
    } else if (response && Array.isArray(response.blogs)) {
        blogsData = response.blogs;
    }
    
    return normalizeBlogsArray(blogsData);
};

/**
 * Validate blog object has required fields
 * @param {Object} blog - Blog object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidBlogData = (blog) => {
    if (!blog || typeof blog !== 'object') return false;
    
    // Check for required fields
    const hasId = blog.id || blog._id;
    const hasTitle = blog.title && typeof blog.title === 'string';
    
    return Boolean(hasId && hasTitle);
};

/**
 * Get formatted status text for display
 * @param {string} status - Blog status
 * @param {string} generationStatus - Generation status  
 * @returns {string} - Formatted status text
 */
export const getFormattedStatus = (status, generationStatus) => {
    if (status === 'generating' || generationStatus === 'processing') {
        return 'AI Generating...';
    }
    if (generationStatus === 'failed') {
        return 'Generation Failed';
    }
    if (status === 'ready' || (status === 'draft' && generationStatus === 'completed')) {
        return 'Ready to Publish';
    }
    return status === 'published' ? 'Published' : 'Draft';
};

/**
 * Get status color for display
 * @param {string} status - Blog status
 * @param {string} generationStatus - Generation status
 * @returns {string} - Color name for status display
 */
export const getStatusColor = (status, generationStatus) => {
    if (status === 'generating' || generationStatus === 'processing') {
        return 'blue';
    }
    switch (status) {
        case 'published': return 'green';
        case 'ready': return 'cyan';
        case 'draft': return 'orange';
        default: return 'default';
    }
};