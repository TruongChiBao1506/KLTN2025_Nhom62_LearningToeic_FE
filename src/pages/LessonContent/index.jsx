import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPersonChalkboard, faBook } from '@fortawesome/free-solid-svg-icons';
import LessonContentList from '../../components/LessonContentList';
import LessonContentService from '../../services/lessonContentService';
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
            duration: 150,
            delay: 0,
            easing: 'ease-in-out',
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
            console.log('✅ Lesson contents loaded:', data);
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
                        <li>
                            <FontAwesomeIcon icon={faPersonChalkboard} />
                            <Link to={`/admin/section/${sectionId}/lesson`}>
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Lesson
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faBook} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Lesson Content
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* LessonContentList with AOS */}
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