import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import TopicList from '../../../components/Admin/TopicList';
import TopicService from '../../../services/topicService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const Topic = () => {
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Chủ đề từ vựng";
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

    const retrieveTopics = async () => {
        try {
            setIsLoading(true);
            const data = await TopicService.all();
            setTopics(data);
        } catch (error) {
            console.log(error);
            setTopics([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        retrieveTopics();
    }, []);


    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with solid colors */}
            <div
                style={{
                    background: 'var(--color-primary)',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 4px 8px rgba(44, 95, 141, 0.12)',
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
                            boxShadow: '0 2px 8px rgba(44, 95, 141, 0.15)'
                        }}>
                            <FileTextOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Chủ đề từ vựng</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* TopicList with AOS */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu topics...</p>
                    </div>
                ) : (
                    <TopicList
                        topics={topics}
                        retrieveTopics={retrieveTopics}
                    />
                )}
            </div>
        </div>
    );
};

export default Topic;