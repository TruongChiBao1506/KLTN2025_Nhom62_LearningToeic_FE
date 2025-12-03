import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import FeedbackList from '../../../components/Admin/FeedbackList';
import FeedbackService from '../../../services/feedbackService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Feedback";
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

    const retrieveFeedbacks = async () => {
        try {
            setIsLoading(true);
            const data = await FeedbackService.all();
            console.log(data);

            // Handle response structure
            if (data && Array.isArray(data)) {
                setFeedbacks(data);
            } else if (data && data.feedbacks && Array.isArray(data.feedbacks)) {
                setFeedbacks(data.feedbacks);
            } else {
                setFeedbacks([]);
            }
        } catch (error) {
            console.log(error);
            setFeedbacks([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        retrieveFeedbacks();
    }, []);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS */}
            <div
                style={{
                    background: 'var(--color-primary)',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
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
                            background: 'var(--color-primary-light)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <MessageOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Feedback</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* FeedbackList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
            >
                {isLoading ? (
                    <div
                        className="text-center py-5"
                        data-aos="zoom-in"
                        data-aos-duration="600"
                    >
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Đang tải dữ liệu feedbacks...</p>
                    </div>
                ) : (
                    <FeedbackList
                        feedbacks={feedbacks}
                        retrieveFeedbacks={retrieveFeedbacks}
                    />
                )}
            </div>
        </div>
    );
};

export default Feedback;