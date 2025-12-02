import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import BlogList from '../../../components/Admin/BlogList';
import BlogService from '../../../services/blogService';
import { extractBlogsFromResponse } from '../../../utils/blogUtils';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Blog Management";
    }, []);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    const retrieveBlogs = async () => {
        try {
            setIsLoading(true);
            const response = await BlogService.getUserBlogs();
            console.log('API Response:', response); // Debug log
            
            // Use utility function to extract and normalize blogs
            const blogsData = extractBlogsFromResponse(response);
            
            console.log('Processed blogs data:', blogsData); // Debug log
            setBlogs(blogsData);
        } catch (error) {
            console.log('Error fetching blogs:', error);
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        retrieveBlogs();
    }, []);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(102,126,234,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    marginBottom: 16,
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <Breadcrumb separator={null} style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-bg-primary)' }}>
                    <Breadcrumb.Item>
                        <span style={{
                            background: 'linear-gradient(135deg, #667eea 60%, #764ba2 100%)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(102,126,234,0.10)'
                        }}>
                            <EditOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Blog Management</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* Blog List */}
            <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
                {isLoading ? (
                    <div className="text-center py-5" data-aos="zoom-in" data-aos-duration="600">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading blogs...</p>
                    </div>
                ) : (
                    <BlogList 
                        blogs={blogs} 
                        retrieveBlogs={retrieveBlogs}
                    />
                )}
            </div>
        </div>
    );
};

export default Blog;