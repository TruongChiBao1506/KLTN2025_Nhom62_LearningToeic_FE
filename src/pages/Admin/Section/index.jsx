import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSection } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

import SectionService from '../../services/sectionsService';
import SectionList from '../../components/Admin/SectionList';
import '../../assets/breadcrumb.css';

const Section = () => {
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Section";
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

    const retrieveSections = async () => {
        try {
            setIsLoading(true);
            const result = await SectionService.all();
            setSections(result);
            console.log(result);
        } catch (error) {
            console.log(error);
            setSections([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        retrieveSections();
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
                            <FontAwesomeIcon icon={faSection} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Section
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* SectionList with AOS */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu sections...</p>
                    </div>
                ) : (
                    <SectionList
                        sections={sections}
                        retrieveSections={retrieveSections}
                    />
                )}
            </div>
        </div>
    );
};

export default Section;