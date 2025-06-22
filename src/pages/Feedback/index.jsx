import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import FeedbackList from '../../components/FeedbackList';
import FeedbackService from '../../services/feedbackService';
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
            duration: 150,
            delay: 0,
            easing: 'ease-in-out',
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
        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="800"
                data-aos-delay="100"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li className="current">
                            <FontAwesomeIcon icon={faComment} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Feedback
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* FeedbackList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="400"
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