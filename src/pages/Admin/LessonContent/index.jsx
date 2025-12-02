import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
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
            {/* Breadcrumb Ant Design + Gradient */}
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
                <Breadcrumb separator={null} style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-bg-primary)' }}>
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
                            <HomeOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 20 }} />
                        </span>
                        <Link to="/admin/section" style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Section</Link>
                    </Breadcrumb.Item>
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
                            <BookOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 20 }} />
                        </span>
                        <Link to={`/admin/section/${sectionId}/lesson`} style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Lesson</Link>
                    </Breadcrumb.Item>
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
                            <FileTextOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 20 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 18 }}>Lesson Content</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
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