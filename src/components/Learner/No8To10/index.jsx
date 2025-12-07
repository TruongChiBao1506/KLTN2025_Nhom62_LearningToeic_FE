import React, { useState, useEffect, useRef, useCallback } from 'react';
import TestService from '../../../services/testService';
import '../../../assets/test.css';

const No8To10 = ({ testId }) => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState([]);
    const [recordedAudios, setRecordedAudios] = useState([]);
    const [recordedText, setRecordedText] = useState([]);
    const [isReadyToTest, setIsReadyToTest] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const recordingIndexRef = useRef(-1);
    const currentTranscript = useRef('');
    const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

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

    const handleStartTest = async () => {
        if (isStarting) return;
        setIsStarting(true);
        try {
            if (testId) await TestService.incrementParticipants(testId);
        } catch (err) {
            console.warn('Could not increment test participants:', err);
        }
        setIsReadyToTest(true);
        setIsStarting(false);
    };

    const setupMediaRecorder = (index) => {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                streamRef.current = stream;
                // pick a supported mime type
                let mimeType = '';
                try {
                    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
                    else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
                    else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) mimeType = 'audio/ogg;codecs=opus';
                } catch (e) { /* ignore */ }
                const options = mimeType ? { mimeType } : undefined;
                const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);

                const chunks = [];
                const assignedIndex = index;
                recorder.addEventListener('dataavailable', (event) => {
                    if (event.data && event.data.size > 0) {
                        chunks.push(event.data);
                    }
                });

                recorder.addEventListener('stop', () => {
                    try {
                        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                        setRecordedAudios(prev => {
                            const newAudios = [...prev];
                            const idx = assignedIndex;
                            if (idx >= 0) {
                                if (newAudios[idx]) {
                                    try { URL.revokeObjectURL(newAudios[idx]); } catch (e) { /* ignore */ }
                                }
                                newAudios[idx] = URL.createObjectURL(blob);
                            }
                            return newAudios;
                        });
                        console.log('[No8To10] Recorded audio created for index', assignedIndex, 'blob size', blob.size);
                    } catch (e) {
                        console.error('Error creating audio blob', e);
                    }
                    // mark the index as completed and clear recordingIndexRef
                    setIsRecording(prev => {
                        const newRec = [...prev];
                        newRec[assignedIndex] = null;
                        return newRec;
                    });
                    if (recordingIndexRef.current === assignedIndex) recordingIndexRef.current = -1;
                });

                resolve(recorder);
            }).catch(reject);
        });
    };

    const startSpeechToTextRecognition = () => {
        if (!speechSupported) return;
        // Create a fresh instance each time to avoid duplicate handlers
        try {
            speechRecognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            speechRecognitionRef.current.lang = 'en-US';
            speechRecognitionRef.current.continuous = true;
            speechRecognitionRef.current.interimResults = true;

            speechRecognitionRef.current.addEventListener('result', (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                if (transcript !== currentTranscript.current) {
                    setRecordedText(prev => {
                        const newText = [...prev];
                        const idx = recordingIndexRef.current;
                        if (idx >= 0) newText[idx] = transcript;
                        return newText;
                    });
                    currentTranscript.current = transcript;
                }
            });

            // When recognition ends unexpectedly, restart if still recording
            speechRecognitionRef.current.addEventListener('end', () => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    try { speechRecognitionRef.current.start(); } catch (e) { /* ignore */ }
                }
            });
            speechRecognitionRef.current.start();
        } catch (error) {
            console.error('Speech recognition start error:', error);
        }
    };

    const startRecording = async (index) => {
        // prevent starting if already recording or completed
        if (isRecording[index] === true) return;
        try {
            setIsRecording(prev => {
                const newRec = [...prev];
                newRec[index] = true;
                return newRec;
            });
            currentTranscript.current = '';
            recordingIndexRef.current = index;
            mediaRecorderRef.current = await setupMediaRecorder(index);
            mediaRecorderRef.current.start();
            if (speechSupported) startSpeechToTextRecognition();
        } catch (err) {
            console.error('startRecording error', err);
            setIsRecording(prev => {
                const newRec = [...prev];
                newRec[index] = false;
                return newRec;
            });
        }
    };

    const stopRecording = (index) => {
        // if not recording, don't do anything
        if (!isRecording[index]) return;
        // stop speech recognition
        if (speechRecognitionRef.current) {
            try { speechRecognitionRef.current.stop(); } catch (e) {}
            speechRecognitionRef.current = null;
        }

        // stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try { mediaRecorderRef.current.stop(); } catch (e) { /* ignore */ }
        }

        // Defer stopping stream tracks a little, so 'stop' event and dataavailable handlers can run and create blob
        setTimeout(() => {
            if (streamRef.current) {
                try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (e) { /* ignore */ }
                streamRef.current = null;
            }
        }, 200);

        setIsRecording(prev => {
            const newRec = [...prev];
            newRec[index] = null; // completed
            return newRec;
        });
        recordingIndexRef.current = -1;
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            // if currently recording, stop it first
            if (isRecording[currentIndex] === true) {
                stopRecording(currentIndex);
            }
            currentTranscript.current = '';
            setCurrentIndex(prev => prev + 1);
            // Reset recorded values for the new index if not recorded
            if (isRecording[currentIndex + 1] === false) {
                setRecordedAudios(prev => {
                    const newAudios = [...prev];
                    newAudios[currentIndex + 1] = null;
                    return newAudios;
                });
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[currentIndex + 1] = '';
                    return newText;
                });
            }
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            if (isRecording[currentIndex] === true) {
                stopRecording(currentIndex);
            }
            currentTranscript.current = '';
            setCurrentIndex(prev => prev - 1);
            if (isRecording[currentIndex - 1] === false) {
                setRecordedAudios(prev => {
                    const newAudios = [...prev];
                    newAudios[currentIndex - 1] = null;
                    return newAudios;
                });
                setRecordedText(prev => {
                    const newText = [...prev];
                    newText[currentIndex - 1] = '';
                    return newText;
                });
            }
        }
    };

    useEffect(() => {
        retrieveQuestions();
    }, [retrieveQuestions]);

    useEffect(() => {
        return () => {
            // cleanup on unmount
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                try { mediaRecorderRef.current.stop(); } catch (e) {}
            }
            if (streamRef.current) {
                try { streamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
                streamRef.current = null;
            }
            if (speechRecognitionRef.current) {
                try { speechRecognitionRef.current.stop(); } catch (e) {}
                speechRecognitionRef.current = null;
            }
        };
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card specific-card mt-3" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-body" style={{ flex: 1 }}>
                            <div className="d-flex justify-content-center">
                                <img src="https://www.vividsites.com/mm/images/Voice-UI.png" alt="" width="100px" height="100px" />
                            </div>
                            <h2 className="text-center my-3">Speaking: Trả lời các câu hỏi sử dụng thông tin được cung cấp</h2>
                            <h5 className="card-title text-primary">Directions:</h5>
                            <p className="card-text">
                                Trong phần kiểm tra này, bạn sẽ trả lời ba câu hỏi dựa trên thông tin được cung cấp. Bạn
                                sẽ có <strong>45</strong> giây để đọc thông tin trước khi câu hỏi bắt đầu. Bạn
                                sẽ có ba giây để chuẩn bị và <strong>15</strong> giây để trả lời Câu hỏi 8 và 9. Bạn sẽ
                                nghe Câu hỏi 10 hai lần. Bạn sẽ có 3 giây để chuẩn bị và <strong>30</strong> giây để phản hồi
                                Câu hỏi 10.
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
                                    <button className="button bg-primary" onClick={() => {
                                        // reset states and questions
                                        setIsReadyToTest(false);
                                        setCurrentIndex(0);
                                        retrieveQuestions();
                                    }}>
                                        Làm lại
                                    </button>

                                    <div className="word-item">
                                        <div className="mb-5">
                                            <div className="word-info">
                                                <button className="btn button5 my-2 me-3" style={{ backgroundColor: '#e8f2ff', color: '#35509a', width: '40px' }}>
                                                    {currentIndex + 1}
                                                </button>
                                                <strong>Question:</strong> {questions[currentIndex]?.questionContent}
                                                <br /><br />
                                                {/* Hint hidden until recording completed */}
                                                {isRecording[currentIndex] === null && (
                                                    <>
                                                        <strong className="ms-3 text-success">Hint to answer:</strong> {questions[currentIndex]?.suggestedAnswer}
                                                    </>
                                                )}
                                            </div>

                                                                    <div className="d-flex justify-content-center">
                                                                        <audio key={recordedAudios[currentIndex] || 'no-audio-' + currentIndex} className="my-3" src={recordedAudios[currentIndex]} controls preload="metadata"></audio>
                                                                    </div>

                                            <div className="word-actions d-flex justify-content-center">
                                                {isRecording[currentIndex] === false && (
                                                    <button className="btn" style={{ backgroundColor: '#052649' }} onClick={() => startRecording(currentIndex)}>
                                                        <i className="fas fa-microphone text-white"></i>
                                                    </button>
                                                )}
                                                {isRecording[currentIndex] === true && (
                                                    <button className="btn" style={{ backgroundColor: '#052649' }} onClick={() => stopRecording(currentIndex)}>
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
                                                        opacity: currentIndex >= questions.length - 1 ? 0.7 : 1,
                                                        cursor: currentIndex >= questions.length - 1 ? 'not-allowed' : 'pointer',
                                                        transition: 'background 0.3s, box-shadow 0.3s',
                                                    }}
                                                    onClick={nextQuestion}
                                                    disabled={currentIndex >= questions.length - 1}
                                                    onMouseEnter={e => {
                                                        if (currentIndex < questions.length - 1) e.currentTarget.style.boxShadow = '0 4px 16px rgba(67,206,162,0.15)';
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

export default No8To10;