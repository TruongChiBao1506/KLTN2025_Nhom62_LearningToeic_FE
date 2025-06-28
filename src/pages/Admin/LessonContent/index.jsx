import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPersonChalkboard, faBook } from '@fortawesome/free-solid-svg-icons';
import LessonContentList from '../../../components/Admin/LessonContentList';
import LessonContentService from '../../../services/lessonContentService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const LessonContent = () => {
    const { sectionId, lessonId } = useParams();
    const [lessonContents, setLessonContents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Lesson Content";
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

    const retrieveLessonContents = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Fetching lesson contents for:');
            console.log('Lesson ID:', lessonId);
            console.log('Section ID:', sectionId);

            if (!lessonId) {
                console.error('❌ No lessonId provided');
                setLessonContents([]);
                return;
            }

            const data = await LessonContentService.getLessonContentsByLesson(lessonId);
            console.log('  Lesson contents loaded:', data);
            setLessonContents(data);
        } catch (error) {
            console.error('❌ Error loading lesson contents:', error);
            setLessonContents([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId && sectionId) {
            retrieveLessonContents();
        } else {
            console.error('❌ Missing required params:', { lessonId, sectionId });
            setIsLoading(false);
        }
    }, [lessonId, sectionId]);

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
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
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
                                <FontAwesomeIcon icon={faPersonChalkboard} color="#fff" />
                            </span>
                            <Link to={`/admin/section/${sectionId}/lesson`} className="fw-bold text-decoration-none" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Lesson
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
                                <FontAwesomeIcon icon={faBook} color="#fff" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 18 }}>
                                Lesson Content
                            </span>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* LessonContentList with AOS */}
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
                            Đang tải dữ liệu lesson contents cho lesson {lessonId}...
                        </p>
                    </div>
                ) : (
                    <LessonContentList
                        lessonContents={lessonContents}
                        sectionId={sectionId}
                        lessonId={lessonId}
                        retrieveLessonContents={retrieveLessonContents}
                    />
                )}
            </div>
        </div>
    );
};

export default LessonContent;