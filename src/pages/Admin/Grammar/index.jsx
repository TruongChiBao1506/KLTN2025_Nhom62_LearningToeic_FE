import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpellCheck } from '@fortawesome/free-solid-svg-icons';
import GrammarList from '../../../components/Admin/GammarList';
import GrammarService from '../../../services/grammarService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const Grammar = () => {
    const [grammars, setGrammars] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Grammar";
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

    const retrieveGrammars = async () => {
        try {
            setIsLoading(true);
            const data = await GrammarService.all();
            // Kiểm tra nếu data có cấu trúc pagination như Topic
            if (data && data.grammars && Array.isArray(data.grammars)) {
                setGrammars(data.grammars);
            } else if (Array.isArray(data)) {
                setGrammars(data);
            } else {
                setGrammars([]);
            }
            console.log(data);
        } catch (error) {
            console.log(error);
            setGrammars([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        retrieveGrammars();
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
                            <FontAwesomeIcon icon={faSpellCheck} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Grammar
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* GrammarList with AOS */}
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
                        <p className="mt-2 text-muted">Đang tải dữ liệu grammars...</p>
                    </div>
                ) : (
                    <GrammarList
                        grammars={grammars}
                        retrieveGrammars={retrieveGrammars}
                    />
                )}
            </div>
        </div>
    );
};

export default Grammar;