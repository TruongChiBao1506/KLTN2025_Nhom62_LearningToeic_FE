import React, { useState, useEffect, useRef, useCallback } from 'react';
import TestService from '../../../services/testService';
import '../../../assets/test.css';

const No1To2 = ({ testId }) => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState([]);
    const [isReadyToTest, setIsReadyToTest] = useState(false);
    const [recordedAudios, setRecordedAudios] = useState([]);
    const [recordedText, setRecordedText] = useState([]);

    const mediaRecorderRef = useRef(null);
    const speechRecognition = useRef(null);
    const currentTranscript = useRef('');

    const retrieveQuestions = useCallback(async () => {
        try {
            const fetchedQuestions = await TestService.getQuestionsByTestId(testId);
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
        if (speechRecognition.current) speechRecognition.current.stop();
        setIsRecording(prev => {
            const newRecording = [...prev];
            newRecording[currentIndex] = null;
            return newRecording;
        });
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            const stream = mediaRecorderRef.current.stream;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        }
    };

    const startSpeechToTextRecognition = () => {
        // If not supported, skip creating recognition
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

        try {
            speechRecognition.current.start();
        } catch (error) {
            console.error('Speech recognition start error:', error);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            if (speechRecognition.current) {
                try { speechRecognition.current.stop(); } catch (e) { /* ignore */ }
            }
            currentTranscript.current = '';
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
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
            if (speechRecognition.current) {
                try { speechRecognition.current.stop(); } catch (e) { /* ignore */ }
            }
            currentTranscript.current = '';
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
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

    useEffect(() => {
        retrieveQuestions();
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
                const tracks = mediaRecorderRef.current.stream.getTracks();
                tracks.forEach(track => track.stop());
            }
            if (speechRecognition.current) {
                try { speechRecognition.current.stop(); } catch (e) { /* ignore */ }
            }
        };
    }, [retrieveQuestions]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card mt-3" style={{ transform: 'none', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <div className="d-flex justify-content-center">
                                <img src="https://www.vividsites.com/mm/images/Voice-UI.png" alt="" width="100px" height="100px" />
                            </div>
                            <h2 className="text-center my-3">Speaking: Đọc to một đoạn văn</h2>
                            <h5 className="card-title text-primary">Directions:</h5>
                            <p className="card-text">
                                Trong phần kiểm tra này, bạn sẽ đọc to văn bản trên màn hình. Hãy nhấn nút ghi âm để bắt đầu, dừng khi hoàn thành.
                            </p>
                            <h5 className="card-title text-primary">Tiêu chí đánh giá:</h5>
                            <span className="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill">Phát âm, ngữ điệu, trọng âm.</span>
                        </div>
                    </div>

                    <div className="card mt-3" style={{ transform: 'none', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <button className="button" onClick={() => setIsReadyToTest(true)} style={{ display: isReadyToTest ? 'none' : 'block' }}>
                                Sẵn sàng luyện tập
                            </button>
                            {isReadyToTest && (
                                <div>
                                    <button className="button bg-primary" onClick={() => {
                                        // Reset states and questions
                                        if (isRecording[currentIndex] === true) {
                                            try { stopRecording(); } catch (e) { /* ignore */ }
                                        }
                                        setIsReadyToTest(false);
                                        setCurrentIndex(0);
                                        retrieveQuestions();
                                    }}>
                                        Làm lại
                                    </button>
                                    <div>
                                        <div className="word-item">
                                            <div className="mb-5">
                                                <div className="word-info">
                                                    <button className="btn button5 my-2 me-3" style={{ backgroundColor: '#e8f2ff', color: '#35509a', width: '40px' }}>
                                                        {currentIndex + 1}
                                                    </button>
                                                    <strong>Text:</strong>
                                                    <div className="ms-3" dangerouslySetInnerHTML={{ __html: questions[currentIndex]?.questionText }}></div>
                                                </div>

                                                <div className="d-flex justify-content-center">
                                                    <audio className="my-3" key={recordedAudios[currentIndex]} src={recordedAudios[currentIndex]} preload="metadata" controls></audio>
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
                                                            opacity: currentIndex >= questions.length - 1 ? 0.7 : 1,
                                                            cursor: currentIndex >= questions.length - 1 ? 'not-allowed' : 'pointer',
                                                            transition: 'background 0.3s, box-shadow 0.3s',
                                                        }}
                                                        onClick={nextQuestion}
                                                        disabled={currentIndex >= questions.length - 1}
                                                    >
                                                        Next <i className="fas fa-arrow-right ms-2"></i>
                                                    </button>
                                                </div>
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

export default No1To2;

