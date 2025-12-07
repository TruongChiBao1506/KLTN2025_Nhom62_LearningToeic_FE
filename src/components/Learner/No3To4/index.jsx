import React, { useState, useEffect, useRef, useCallback } from 'react';
import TestService from '../../../services/testService';
import '../../../assets/test.css';

const No3To4 = ({ testId }) => {
    const [questions, setQuestions] = useState([]);
    // Removed countdown/TTS states and replaced with simple ready/recording state
    const [isRecording, setIsRecording] = useState([]);
    const [recordedAudios, setRecordedAudios] = useState([]);
    const [recordedText, setRecordedText] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isReadyToTest, setIsReadyToTest] = useState(false);

    const mediaRecorderRef = useRef(null);
    const speechRecognition = useRef(null);
    const currentTranscript = useRef('');

    const retrieveQuestions = useCallback(async () => {
        try {
            const fetchedQuestions = await TestService.getQuestionsByTestId(testId);
            console.log('Fetched questions:', fetchedQuestions);
            setQuestions(fetchedQuestions);
            setIsRecording(fetchedQuestions.map(() => false));
            setRecordedAudios(fetchedQuestions.map(() => null));
            setRecordedText(fetchedQuestions.map(() => ''));
        } catch (error) {
            console.log(error);
        }
    }, [testId]);

    const setupMediaRecorder = () => {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                const recorder = new MediaRecorder(stream);
                recorder.addEventListener("dataavailable", (event) => {
                    if (event.data.size > 0) {
                        setRecordedAudios(prev => {
                            const newAudios = [...prev];
                            newAudios[currentIndex] = URL.createObjectURL(event.data);
                            return newAudios;
                        });
                    }
                });
                resolve(recorder);
            }).catch(reject);
        });
    };

    // Removed TTS reading helpers - we don't use speechSynthesis in the simplified flow

    const startRecording = async () => {
        if (isRecording[currentIndex]) return;
        setIsRecording(prev => {
            const newRecording = [...prev];
            newRecording[currentIndex] = true;
            return newRecording;
        });
        mediaRecorderRef.current = await setupMediaRecorder();
        mediaRecorderRef.current.start();
        startSpeechToTextRecognition();
    };

    const stopRecording = () => {
        if (!isRecording[currentIndex]) return;
        if (speechRecognition.current) {
            try { speechRecognition.current.stop(); } catch (e) { /* ignore */ }
        }
        setIsRecording(prev => {
            const newRecording = [...prev];
            newRecording[currentIndex] = null;
            return newRecording;
        });
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        const stream = mediaRecorderRef.current.stream;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    // Removed countdown helpers

    const [isStarting, setIsStarting] = useState(false);

    const handleStartTest = async () => {
        if (isStarting) return;
        setIsStarting(true);
        try {
            if (testId) await TestService.incrementParticipants(testId);
        } catch (err) {
            console.warn('Could not increment test participants:', err);
        } finally {
            setIsStarting(false);
        }
        setIsReadyToTest(true);
    };

    const startSpeechToTextRecognition = () => {
        // Create a new SpeechRecognition instance on each start to avoid event leaks
        if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) return;
        speechRecognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        speechRecognition.current.lang = "en-US";
        speechRecognition.current.continuous = true;
        speechRecognition.current.interimResults = true;

        speechRecognition.current.addEventListener("result", (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (transcript !== currentTranscript.current) {
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[currentIndex] = transcript;
                    return newText;
                });
                currentTranscript.current = transcript;
            }
        });

        speechRecognition.current.addEventListener("end", () => {
            try { speechRecognition.current.stop(); } catch (e) { /* ignore */ }
        });

        try { speechRecognition.current.start(); } catch (e) { console.error('Speech recognition start error:', e); }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            // Dừng speech recognition và reset transcript trước khi chuyển
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
            currentTranscript.current = '';
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            // Reset recordedAudios và recordedText nếu chưa ghi âm
            if (isRecording[newIndex] === false) {
                setRecordedAudios(prev => {
                    const newAudios = [...prev];
                    newAudios[newIndex] = null;
                    return newAudios;
                });
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[newIndex] = '';
                    return newText;
                });
            }
            if (speechRecognition.current) { try { speechRecognition.current.stop(); } catch (e) {} }
            currentTranscript.current = '';
            if (isRecording[newIndex] === false) {
                setRecordedAudios(prev => {
                    const newAudios = [...prev];
                    newAudios[newIndex] = null;
                    return newAudios;
                });
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[newIndex] = '';
                    return newText;
                });
            }
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            // Dừng speech recognition và reset transcript trước khi chuyển
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
            currentTranscript.current = '';
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            // Reset recordedAudios và recordedText nếu chưa ghi âm
            if (isRecording[newIndex] === false) {
                setRecordedAudios(prev => {
                    const newAudios = [...prev];
                    newAudios[newIndex] = null;
                    return newAudios;
                });
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[newIndex] = '';
                    return newText;
                });
            }
            if (speechRecognition.current) { try { speechRecognition.current.stop(); } catch (e) {} }
            currentTranscript.current = '';
            if (isRecording[newIndex] === false) {
                setRecordedAudios(prev => {
                    const newAudios = [...prev];
                    newAudios[newIndex] = null;
                    return newAudios;
                });
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[newIndex] = '';
                    return newText;
                });
            }
        }
    };

    const refreshAllQuestions = () => {
        // Dừng tất cả processes
        if (speechRecognition.current) {
            speechRecognition.current.stop();
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            const stream = mediaRecorderRef.current.stream;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        }
        currentTranscript.current = '';
        setCurrentIndex(0);
        // Clear any intervals - no countdown usage in simplified flow
        retrieveQuestions();
        handleStartTest();
    };

    const getImageUrl = (imageName) => {
        console.log('Image name:', imageName);
        if (imageName) {
            // Nếu là URL đầy đủ (bắt đầu bằng http), dùng trực tiếp
            if (imageName.startsWith('http')) {
                console.log('Using full URL:', imageName);
                return imageName;
            } else {
                // Nếu là tên file, tạo URL local
                const url = `${process.env.REACT_APP_URL}/images/${imageName}`;
                console.log('Image URL:', url);
                return url;
            }
        }
        return "";
    };

    useEffect(() => {
        retrieveQuestions();

        return () => {
            // Cleanup
            if (speechRecognition.current) {
                try { speechRecognition.current.stop(); } catch (e) { /* ignore */ }
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
                const tracks = mediaRecorderRef.current.stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [retrieveQuestions]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card specific-card mt-3" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <div className="d-flex justify-content-center">
                                <img src="https://www.vividsites.com/mm/images/Voice-UI.png" alt="" width="100px" height="100px" />
                            </div>
                            <h2 className="text-center my-3">Speaking: Miêu tả một bức tranh</h2>
                            <h5 className="card-title text-primary">Directions:</h5>
                            <p className="card-text">
                                Trong phần kiểm tra này, bạn sẽ mô tả hình ảnh trên màn hình càng chi tiết càng tốt.
                                Có thể. Bạn sẽ có <strong>45</strong> giây để chuẩn bị phản hồi. Sau đó, bạn sẽ có
                                <strong>30</strong> giây để nói về bức tranh.
                            </p>
                            <h5 className="card-title text-primary">Tiêu chí đánh giá:</h5>
                            <span className="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill">Phát âm, ngữ điệu, trọng âm.</span>
                            <span className="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill mx-3">Từ vựng, ngữ pháp, và các tính liên kết.</span>
                            <span className="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill">Sự tương thích nội dung.</span>
                        </div>
                    </div>

                    <div className="card specific-card mt-3" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <button className="button" onClick={handleStartTest} style={{ display: isReadyToTest ? 'none' : 'block' }} disabled={isStarting}>
                                Sẵn sàng luyện tập
                            </button>
                            {isReadyToTest && (
                                <div>
                                    <button className="button bg-primary" onClick={refreshAllQuestions}>
                                        Làm lại
                                    </button>

                                    <div className="word-item">
                                        <div className="mb-5">
                                            {/* Simple controls: removed countdown and read-aloud */}

                                            <div className="word-info d-flex justify-content-center">
                                                <img src={getImageUrl(questions[currentIndex]?.questionImage)} alt={questions[currentIndex]?.questionContent || ''} style={{ width: '300px' }} />
                                            </div>

                                            <div className="word-info">
                                                <button className="btn button5 my-2 me-3" style={{ backgroundColor: '#e8f2ff', color: '#35509a', width: '40px' }}>
                                                    {currentIndex + 1}
                                                </button>
                                                <br />
                                                {/* Hide hint until user has completed recording */}
                                                {isRecording[currentIndex] === null && (
                                                    <>
                                                        <strong className="ms-3 text-success">Hint to answer:</strong> {questions[currentIndex]?.suggestedAnswer}
                                                    </>
                                                )}
                                            </div>

                                            <div className="d-flex justify-content-center">
                                                <audio className="my-3" src={recordedAudios[currentIndex]} controls></audio>
                                            </div>

                                            <div className="word-actions d-flex justify-content-center">
                                                {isRecording[currentIndex] === false && (
                                                    <button className="btn" style={{ backgroundColor: '#052649' }} onClick={startRecording}>
                                                        <i className="fas fa-microphone text-white"></i>
                                                    </button>
                                                )}
                                                {isRecording[currentIndex] === true && (
                                                    <button className="btn" style={{ backgroundColor: '#052649' }} onClick={stopRecording}>
                                                        <i className="fas fa-stop text-danger"></i>
                                                    </button>
                                                )}
                                                {isRecording[currentIndex] === null && (
                                                    <button className="p-2 badge bg-info-subtle border border-info-subtle text-info-emphasis rounded-pill ms-3">
                                                        Đã hoàn thành <i className="fa-solid fa-circle-check text-success"></i>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <div className="alert alert-light text-primary" role="alert">
                                                    <strong className="ms-3" style={{ color: '#052649' }}>Kết quả:</strong> {recordedText[currentIndex]}
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
                                                    }}
                                                    onClick={prevQuestion}
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
                                                        opacity: (isRecording[currentIndex] !== null || currentIndex >= questions.length - 1) ? 0.7 : 1,
                                                        cursor: (isRecording[currentIndex] !== null || currentIndex >= questions.length - 1) ? 'not-allowed' : 'pointer',
                                                        transition: 'background 0.3s, box-shadow 0.3s',
                                                    }}
                                                    onClick={nextQuestion}
                                                    disabled={isRecording[currentIndex] !== null || currentIndex >= questions.length - 1}
                                                    onMouseEnter={e => {
                                                        if (!(isRecording[currentIndex] !== null || currentIndex >= questions.length - 1)) e.currentTarget.style.boxShadow = '0 4px 16px rgba(67,206,162,0.15)';
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default No3To4;