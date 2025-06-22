import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPersonChalkboard } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import LessonService from '../../services/lessonService';
import LessonList from '../../components/LessonBySectionList';
import '../../assets/breadcrumb.css';

const Lesson = () => {
    const { sectionId } = useParams(); // Lấy sectionId từ URL params
    const [lessons, setLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Lesson";
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

    const retrieveLessons = async () => {
        try {
            setIsLoading(true);
            console.log('Section ID:', sectionId);
            const result = await LessonService.getLessonsBySection(sectionId);
            setLessons(result);
            console.log('Lessons:', result);
        } catch (error) {
            console.log('Error fetching lessons:', error);
            setLessons([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sectionId) {
            retrieveLessons();
        }
    }, [sectionId]);

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
                        <li>
                            <FontAwesomeIcon icon={faHouse} />
                            <Link to="/admin/section">
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Section
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faPersonChalkboard} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Lesson
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* LessonList with AOS */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu lessons...</p>
                    </div>
                ) : (
                    <LessonList
                        lessons={lessons}
                        sectionId={sectionId}
                        retrieveLessons={retrieveLessons}
                    />
                )}
            </div>
        </div>
    );
};

export default Lesson;