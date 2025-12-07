import React, { useState, useEffect, useRef, useCallback } from 'react';
import TestService from '../../../services/testService';
import '../../../assets/test.css';
import Swal from 'sweetalert2';

const No1To5 = ({ testId }) => {
    const [questions, setQuestions] = useState([]);
    const [isReadyToTest, setIsReadyToTest] = useState(false);
    const [totalTime, setTotalTime] = useState(480);
    const timerRef = useRef(null);
    const [isTestSubmitted, setIsTestSubmitted] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const retrieveQuestions = useCallback(async () => {
        try {
            const fetchedQuestions = await TestService.getQuestionsByTestId(testId);
            setQuestions(fetchedQuestions);
            setUserAnswers(fetchedQuestions.map(() => ''));
            console.log(fetchedQuestions);
        } catch (error) {
            console.log(error);
        }
    }, [testId]);

    useEffect(() => {
        retrieveQuestions();
    }, [retrieveQuestions]);

    const startTest = () => {
        setIsReadyToTest(true);
        timerRef.current = setInterval(() => {
            setTotalTime(prev => {
                if (prev <= 1) {
                    submitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const confirmSubmit = async () => {
        const shouldSubmit = await Swal.fire({
            icon: 'question',
            title: 'Bạn thực sự muốn nộp',
            text: 'Bạn thực sự muốn nộp?',
            showCancelButton: true,
            confirmButtonText: 'Nộp',
            cancelButtonText: 'Quay lại',
        });
        if (shouldSubmit.isConfirmed) {
            submitTest();
        }
    };

    const submitTest = () => {
        console.log('submit');
        setIsTestSubmitted(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        if (hours > 0) {
            return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
        } else if (minutes > 0) {
            return `${padZero(minutes)}:${padZero(seconds)}`;
        } else {
            return `${padZero(seconds)}`;
        }
    };

    const padZero = (number) => {
        return number.toString().padStart(2, "0");
    };

    const showNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const showPreviousQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const getImageUrl = (imageName) => {
        if (!imageName) return '';
        // If it's already a full URL (starts with http/https or protocol-less //) or data URI, use it as is
        const isFullUrl = /^(https?:)?\/\//i.test(imageName) || /^data:/i.test(imageName);
        if (isFullUrl) return imageName;
        // Otherwise, treat as internal image name and serve from local image endpoint
        const base = process.env.REACT_APP_URL || 'http://localhost:9004';
        return `${base.replace(/\/$/, '')}/images/${imageName}`;
    };

    const refreshAllQuestions = () => {
        setIsTestSubmitted(false);
        setUserAnswers(questions.map(() => ''));
        setCurrentIndex(0);
        setTotalTime(480);
        startTest();
    };

    const handleAnswerChange = (index, value) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[index] = value;
            return newAnswers;
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card specific-card mt-3" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <div className="d-flex justify-content-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/10101/10101901.png" alt="" width="100px" height="100px" />
                            </div>
                            <h2 className="text-center my-3">Writing: Viết câu dựa vào một bức tranh</h2>
                            <h5 className="card-title">Directions:</h5>
                            <p className="card-text">
                                Trong phần kiểm tra này, bạn sẽ viết MỘT câu dựa trên một bức tranh. Với mỗi bức tranh, bạn sẽ
                                được cung cấp HAI từ hoặc cụm từ mà bạn phải sử dụng trong câu của mình. Bạn có thể thay đổi
                                hình thức của từ và bạn có thể sử dụng các từ theo bất kỳ thứ tự nào.
                            </p>
                            <h5 className="card-title">Tiêu chí đánh giá:</h5>
                            <span className="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill">Ngữ pháp</span>
                            <span className="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill mx-3">Sự liên quan của các câu viết với bức tranh</span>
                        </div>
                    </div>

                    <div className="card specific-card mt-3" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <button className="button" onClick={startTest} style={{ display: isReadyToTest ? 'none' : 'block' }}>
                                Sẵn sàng luyện tập
                            </button>

                            <div style={{ display: isReadyToTest ? 'block' : 'none' }}>
                                <button type="button" className="button mt-3" onClick={confirmSubmit}
                                    style={{ display: isReadyToTest && !isTestSubmitted ? 'block' : 'none' }}>
                                    Submit
                                </button>

                                <button className="button bg-danger" onClick={refreshAllQuestions} style={{ display: isTestSubmitted ? 'block' : 'none' }}>
                                    Làm lại
                                </button>

                                <div className="word-item">
                                    <div className="mb-5">
                                        <div className="text-end" style={{ fontSize: '20px' }}>
                                            <span className="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill">
                                                <i className="fa-solid fa-clock me-3"></i>Remaining: {formatTime(totalTime)}
                                            </span>
                                        </div>

                                        <div className="word-info d-flex justify-content-center">
                                            <img
                                                src={getImageUrl(questions[currentIndex]?.questionImage)}
                                                alt={questions[currentIndex]?.questionExplanation || ''}
                                                style={{ width: '300px', maxWidth: '100%', height: 'auto' }}
                                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+image'; }}
                                            />
                                        </div>

                                        <div className="word-info">
                                            <button className="btn button5 my-2 me-3"
                                                style={{ backgroundColor: '#e8f2ff', color: '#35509a', width: '40px' }}>{currentIndex + 1}</button>
                                            <strong>Key:</strong> {questions[currentIndex]?.questionContent}
                                            <br />
                                        </div>

                                        <div className="word-info mb-3" style={{ display: isTestSubmitted ? 'block' : 'none' }}>
                                            <strong className="ms-3 text-success">Hint to answer:</strong>
                                            <div dangerouslySetInnerHTML={{ __html: questions[currentIndex]?.suggestedAnswer }}></div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="form-floating">
                                                <textarea className="form-control" value={userAnswers[currentIndex]}
                                                    onChange={(e) => handleAnswerChange(currentIndex, e.target.value)}
                                                    placeholder="Leave a comment here" id="floatingTextarea"
                                                    style={{ height: '100px' }} readOnly={isTestSubmitted}></textarea>
                                                <label htmlFor="floatingTextarea">Your answer</label>
                                            </div>
                                        </div>

                                        <div className="mt-5 d-flex justify-content-center">
                                            <button
                                                className="btn d-flex align-items-center justify-content-center fw-bold px-4 py-2 me-3"
                                                style={{
                                                    borderRadius: '30px',
                                                    background: 'var(--color-primary)',
                                                    color: '#fff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    border: '2px solid var(--color-primary)',
                                                    opacity: currentIndex === 0 ? 0.7 : 1,
                                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                                    transition: 'background 0.3s, box-shadow 0.3s',
                                                    display: currentIndex !== 0 ? 'block' : 'none',
                                                }}
                                                onClick={showPreviousQuestion}
                                                disabled={currentIndex === 0}
                                                onMouseEnter={e => {
                                                    if (currentIndex !== 0) e.currentTarget.style.boxShadow = '0 4px 16px rgba(102,126,234,0.15)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                                }}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i> Previous
                                            </button>
                                            <button
                                                className="btn d-flex align-items-center justify-content-center fw-bold px-4 py-2"
                                                style={{
                                                    borderRadius: '30px',
                                                    background: 'var(--color-primary)',
                                                    color: '#fff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                    border: '2px solid var(--color-primary)',
                                                    opacity: (currentIndex >= questions.length - 1) ? 0.7 : 1,
                                                    cursor: (currentIndex >= questions.length - 1) ? 'not-allowed' : 'pointer',
                                                    transition: 'background 0.3s, box-shadow 0.3s',
                                                    display: currentIndex < questions.length - 1 ? 'block' : 'none',
                                                }}
                                                onClick={showNextQuestion}
                                                disabled={currentIndex >= questions.length - 1}
                                                onMouseEnter={e => {
                                                    if (!(currentIndex >= questions.length - 1)) e.currentTarget.style.boxShadow = '0 4px 16px rgba(67,206,162,0.15)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                                }}
                                            >
                                                Next <i className="fas fa-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default No1To5;