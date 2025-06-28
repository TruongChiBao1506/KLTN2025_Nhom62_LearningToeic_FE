import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPersonChalkboard } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import LessonService from '../../../services/lessonService';
import LessonList from '../../../components/Admin/LessonBySectionList';
import '../../../assets/breadcrumb.css';

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
            duration: 100,
            delay: 0,
            easing: 'ease-out',
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
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 shadow-lg rounded-4 px-2 py-1"
                style={{
                    background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                    border: 'none'
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0">
                        <li>
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
                                <FontAwesomeIcon icon={faHouse} color="#fff" />
                            </span>
                            <Link to="/admin/section" className="fw-bold text-decoration-none" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Section
                            </Link>
                        </li>
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
                                <FontAwesomeIcon icon={faPersonChalkboard} color="#fff" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Lesson
                            </span>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* LessonList with AOS */}
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