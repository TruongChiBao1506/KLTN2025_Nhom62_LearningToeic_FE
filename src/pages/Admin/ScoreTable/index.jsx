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
    const [isLoading, setIsLoading] = useState(true); //   Add loading state

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
                className="mt-2 shadow-lg rounded-4 px-2 py-1"
                style={{
                    background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                    minHeight: 70,
                    border: 'none'
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
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
                                <FontAwesomeIcon icon={faMarker} color="var(--color-bg-primary)" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 22 }}>
                                Score Table
                            </span>
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
                        className="row d-flex justify-content-center mx-2 mt-3 p-3 rounded-4 shadow-lg"
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