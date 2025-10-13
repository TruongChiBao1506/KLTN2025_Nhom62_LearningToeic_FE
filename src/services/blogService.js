import axiosClient from "./axiosClient";

const BlogService = {
    // Get user's blogs
    getUserBlogs: async () => {
        try {
            console.log("Fetching user blogs..."); // Debug
            const response = await axiosClient.get('/blogs/my-blogs');
            console.log("User blogs response:", response); // Debug
            console.log("Response data type:", typeof response.data, Array.isArray(response.data)); // Debug
            console.log("Response structure:", Object.keys(response.data || {})); // Debug
            return response;
        } catch (error) {
            console.error("Error fetching user blogs:", error);
            console.error("Error response:", error.response); // Debug error response
            throw error;
        }
    },

    // Get specific blog
    getBlog: async (blogId) => {
        try {
            console.log("Fetching blog with ID:", blogId); // Debug
            const response = await axiosClient.get(`/blogs/${blogId}`);
            console.log("Blog response:", response); // Debug
            return response;
        } catch (error) {
            console.error(`Error fetching blog ${blogId}:`, error);
            throw error;
        }
    },

    // Create draft
    createDraft: async (blogData) => {
        try {
            console.log("Creating blog draft:", blogData); // Debug
            const response = await axiosClient.post('/blogs/draft', blogData);
            console.log("Draft creation response:", response); // Debug
            return response;
        } catch (error) {
            console.error("Error creating blog draft:", error);
            console.error("Error response:", error.response); // Debug error response
            throw error;
        }
    },

    // Request AI generation
    requestAIGeneration: async (blogId) => {
        try {
            console.log("Requesting AI generation for blog:", blogId); // Debug
            const response = await axiosClient.post(`/blogs/${blogId}/generate`);
            console.log("AI generation request response:", response); // Debug
            return response;
        } catch (error) {
            console.error(`Error requesting AI generation for blog ${blogId}:`, error);
            throw error;
        }
    },

    // Update content
    updateContent: async (blogId, contentData) => {
        try {
            console.log("Updating blog content:", blogId, contentData); // Debug
            const response = await axiosClient.put(`/blogs/${blogId}/content`, contentData);
            console.log("Content update response:", response); // Debug
            return response;
        } catch (error) {
            console.error(`Error updating content for blog ${blogId}:`, error);
            throw error;
        }
    },

    // Publish blog
    publishBlog: async (blogId) => {
        try {
            console.log("Publishing blog:", blogId); // Debug
            const response = await axiosClient.put(`/blogs/${blogId}/publish`);
            console.log("Publish response:", response); // Debug
            return response;
        } catch (error) {
            console.error(`Error publishing blog ${blogId}:`, error);
            throw error;
        }
    },

    // Delete blog
    deleteBlog: async (blogId) => {
        try {
            console.log("Deleting blog:", blogId); // Debug
            const response = await axiosClient.delete(`/blogs/${blogId}`);
            console.log("Delete response:", response); // Debug
            return response;
        } catch (error) {
            console.error(`Error deleting blog ${blogId}:`, error);
            throw error;
        }
    },

    // Get published blogs (public)
    getPublishedBlogs: async () => {
        try {
            console.log("Fetching published blogs..."); // Debug
            const response = await axiosClient.get('/blogs/published');
            console.log("Published blogs response:", response); // Debug
            return response;
        } catch (error) {
            console.error("Error fetching published blogs:", error);
            throw error;
        }
    },

    // Get blog by slug (public)
    getBlogBySlug: async (slug) => {
        try {
            console.log("Fetching blog by slug:", slug); // Debug
            const response = await axiosClient.get(`/blogs/slug/${slug}`);
            console.log("Blog by slug response:", response); // Debug
            return response;
        } catch (error) {
            console.error(`Error fetching blog by slug ${slug}:`, error);
            throw error;
        }
    }
};

export default BlogService;