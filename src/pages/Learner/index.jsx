import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import LearnerList from '../../components/LearnerList';
import UserService from '../../services/userService';
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
            duration: 150,
            delay: 0,
            easing: 'ease-in-out',
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
                            <FontAwesomeIcon icon={faUsers} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Learner
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* LearnerList with AOS */}
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