import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import LearnerList from '../../../components/Admin/LearnerList';
import UserService from '../../../services/userService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const Learner = () => {
    const [learners, setLearners] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Learner";
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

    const getAllLearners = async () => {
        try {
            setIsLoading(true);
            const data = await UserService.getAllLearners();
            console.log(data);

            // Handle response structure similar to Topic
            if (data && Array.isArray(data)) {
                setLearners(data);
            } else if (data && data.learners && Array.isArray(data.learners)) {
                setLearners(data.learners);
            } else {
                setLearners([]);
            }
        } catch (error) {
            console.log(error);
            setLearners([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAllLearners();
    }, []);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS */}
                <div
                    style={{
                        background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)',
                        minHeight: 70,
                        border: 'none',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px rgba(80,120,255,0.10)',
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
                                background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                            }}>
                                <TeamOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                            </span>
                            <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Learner</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>

            {/* LearnerList with AOS */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu learners...</p>
                    </div>
                ) : (
                    <LearnerList
                        learners={learners}
                        getAllLearners={getAllLearners}
                    />
                )}
            </div>
        </div>
    );
};

export default Learner;