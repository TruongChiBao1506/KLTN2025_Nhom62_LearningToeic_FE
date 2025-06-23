import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import TopicList from '../../../components/Admin/TopicList';
import TopicService from '../../../services/topicService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const Topic = () => {
    const [topics, setTopics] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Topic";
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
                            <FontAwesomeIcon icon={faFileAlt} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Topic
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* TopicList with AOS */}
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