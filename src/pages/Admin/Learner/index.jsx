import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
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
                className="mt-2 shadow-lg rounded-4 px-2 py-1"
                style={{
                    background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                    minHeight: 70,
                    border: 'none'
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
                        <li className="current d-flex align-items-center">
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                }}
                            >
                                <FontAwesomeIcon icon={faUsers} color="#fff" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 22 }}>
                                Learner
                            </span>
                        </li>
                    </ol>
                </nav>
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