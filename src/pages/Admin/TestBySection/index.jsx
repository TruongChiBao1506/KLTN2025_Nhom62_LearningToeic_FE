import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFolder } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import TestService from '../../../services/testService';
import TestList from '../../../components/Admin/TestBySectionList';
import '../../../assets/breadcrumb.css';

const Test = () => {
    const { sectionId } = useParams(); // Lấy sectionId từ URL params
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Test";
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

    const retrieveTests = async () => {
        try {
            setIsLoading(true);
            console.log('Section ID:', sectionId);
            const result = await TestService.getTestsBySection(sectionId);
            setTests(result);
            console.log('Tests:', result);
        } catch (error) {
            console.log('Error fetching tests:', error);
            setTests([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sectionId) {
            retrieveTests();
        }
    }, [sectionId]);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li>
                            <FontAwesomeIcon icon={faHouse} />
                            <Link to="/admin/section">
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Section
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faFolder} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Test
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* TestList with AOS */}
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
                        <p className="mt-2 text-muted">
                            Đang tải dữ liệu tests cho section {sectionId}...
                        </p>
                    </div>
                ) : (
                    <TestList
                        tests={tests}
                        sectionId={sectionId}
                        retrieveTests={retrieveTests}
                    />
                )}
            </div>
        </div>
    );
};

export default Test;