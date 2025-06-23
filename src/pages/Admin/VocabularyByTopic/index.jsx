import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faBraille } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import VocabularyService from '../../../services/vocabularyService';
import VocabularyList from '../../../components/Admin/VocabularyByTopicList';
import '../../../assets/breadcrumb.css';

const VocabularyByTopic = () => {
    const { topicId } = useParams(); // Lấy topicId từ URL params
    const [vocabularies, setVocabularies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Vocabulary";
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

    const retrieveVocabularies = async () => {
        try {
            setIsLoading(true);
            console.log('Topic ID:', topicId);
            
            // Gọi API để lấy danh sách từ vựng dựa trên topicId
            const result = await VocabularyService.getVocabularyByTopic(topicId);
            setVocabularies(result);
            console.log('Vocabularies:', result);
        } catch (error) {
            console.log('Error fetching vocabularies:', error);
            setVocabularies([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (topicId) {
            retrieveVocabularies();
        }
    }, [topicId]);

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
                            <FontAwesomeIcon icon={faFileAlt} />
                            <Link to="/admin/topic">
                                <button className="btn btn-link text-decoration-none fw-bolder">
                                    Topic
                                </button>
                            </Link>
                        </li>
                        <li className="current">
                            <FontAwesomeIcon icon={faBraille} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Vocabulary
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* VocabularyList with AOS */}
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
                            Đang tải dữ liệu vocabularies cho topic {topicId}...
                        </p>
                    </div>
                ) : (
                    <VocabularyList
                        vocabularies={vocabularies}
                        topicId={topicId}
                        retrieveVocabularies={retrieveVocabularies}
                    />
                )}
            </div>
        </div>
    );
};

export default VocabularyByTopic;