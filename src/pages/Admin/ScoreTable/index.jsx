import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMarker } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

import ScoreTableService from '../../../services/scoreTableService';
import ScoreTableList from '../../../components/Admin/ScoreTableList';
import './style.css';

const ScoreTable = () => {
    const [tableScores, setTableScores] = useState([]);
    const [showListeningScore, setShowListeningScore] = useState(true);
    const [isLoading, setIsLoading] = useState(true); // ✅ Add loading state

    // Set document title
    useEffect(() => {
        document.title = "Admin - Score Table";
    }, []);

    // Initialize AOS (giống Section)
    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    // Get table scores with loading state (giống Section)
    const getTableScores = async () => {
        try {
            setIsLoading(true);
            if (showListeningScore) {
                const scores = await ScoreTableService.getListeningScores();
                setTableScores(scores);
                console.log('Listening scores:', scores);
            } else {
                const scores = await ScoreTableService.getReadingScores();
                setTableScores(scores);
                console.log('Reading scores:', scores);
            }
        } catch (error) {
            console.log('Error fetching scores:', error);
            setTableScores([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Switch to listening score
    const switchToListeningScore = () => {
        if (!showListeningScore) {
            setShowListeningScore(true);
        }
    };

    // Switch to reading score
    const switchToReadingScore = () => {
        if (showListeningScore) {
            setShowListeningScore(false);
        }
    };

    // Fetch scores when component mounts or score type changes
    useEffect(() => {
        getTableScores();
    }, [showListeningScore]);

    return (
        // Container AOS giống Section
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS giống Section */}
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li className="current">
                            <FontAwesomeIcon icon={faMarker} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Score Table
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Content with AOS wrapper giống Section */}
            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
            >
                {isLoading ? (
                    // Loading state giống Section
                    <div
                        className="text-center py-5"
                        data-aos="zoom-in"
                        data-aos-duration="600"
                    >
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Đang tải bảng điểm...</p>
                    </div>
                ) : (
                    <div 
                        className="row d-flex justify-content-center mx-2"
                        style={{
                            backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20211001/pngtree-background-xanh-%C4%91%E1%BA%B9p-image_908804.png')"
                        }}
                    >
                        {/* Button Container */}
                        <div className="button-container mt-3">
                            <button 
                                type="button" 
                                className={showListeningScore ? 'active' : ''}
                                onClick={switchToListeningScore}
                            >
                                LISTENING SCORE
                            </button>
                            <button 
                                type="button" 
                                className={!showListeningScore ? 'active' : ''}
                                onClick={switchToReadingScore}
                            >
                                READING SCORE
                            </button>
                        </div>

                        {/* Score Table List */}
                        <div className="w-75">
                            <ScoreTableList 
                                tableScores={tableScores} 
                                getTableScores={getTableScores}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreTable;