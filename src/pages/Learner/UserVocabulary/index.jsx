import React, { useState, useEffect, useRef } from 'react';
import userVocabularyService from '../../../services/userVocabularyService';
import { jwtDecode } from 'jwt-decode';
import './style.css';

const UserVocabulary = () => {
  const [userVocabularies, setUserVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const loadUserVocabularies = async () => {
      try {
        setLoading(true);
        const response = await userVocabularyService.getUserVocabularies();
        
        if (response && response.data) {
          // Thêm trường isCorrect và lowerTranscript cho mỗi từ vựng
          const vocabulariesWithStatus = response.data.map(item => ({
            ...item,
            isCorrect: null,
            lowerTranscript: ''
          }));
          
          setUserVocabularies(vocabulariesWithStatus);
        }
      } catch (error) {
        console.error('Lỗi khi tải từ vựng:', error);
        setError('Không thể tải từ vựng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadUserVocabularies();
  }, []);

  const getImageUrl = (imageName) => {
    if (imageName) {
      return `${process.env.REACT_APP_API_URL}/images/vocabulary/${imageName}`;
    }
    return `${process.env.REACT_APP_API_URL}/images/default-image.png`;
  };

  const speakWord = (index) => {
    const userVocabulary = userVocabularies[index].vocabulary;
    const utterance = new SpeechSynthesisUtterance(userVocabulary.word);
    utterance.lang = 'en-US';

    // Kiểm tra và chọn giọng nói phù hợp
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.name === 'Google US English' || 
      voice.name === 'Microsoft Aria Online (Natural) - English (United States)' ||
      voice.lang === 'en-US'
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const practicePronunciation = (index) => {
    const userVocabulary = userVocabularies[index];
    
    // Nếu đang thu âm, dừng lại
    if (isSpeaking && activeIndex === index) {
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
      setIsSpeaking(false);
      setActiveIndex(null);
      return;
    }
    
    // Bắt đầu thu âm
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    
    setIsSpeaking(true);
    setActiveIndex(index);
    
    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcriptValue = event.results[lastResultIndex][0].transcript;
      const lowerTranscript = transcriptValue.toLowerCase();
      
      const isCorrect = lowerTranscript === userVocabulary.vocabulary.word.toLowerCase();
      
      // Cập nhật state cho từ vựng hiện tại
      const updatedVocabularies = [...userVocabularies];
      updatedVocabularies[index] = {
        ...userVocabulary,
        isCorrect: isCorrect,
        lowerTranscript: lowerTranscript
      };
      
      setUserVocabularies(updatedVocabularies);
    };
    
    recognition.onend = () => {
      setIsSpeaking(false);
      setActiveIndex(null);
    };
    
    recognition.start();
    window.currentRecognition = recognition;
  };

  // Cấu hình giọng nói khi component mount
  useEffect(() => {
    const setupVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    setupVoices();
    
    // Đăng ký event listener cho 'voiceschanged'
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', setupVoices);
    }
    
    // Cleanup khi component unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', setupVoices);
        window.speechSynthesis.cancel();
      }
      
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container bg-light rounded">
      <div className="row my-5">
        <div className="col-lg col-md col-sm">
          <div className="pcss3t pcss3t-effect-scale pcss3t-theme-1">
            <input type="radio" name="pcss3t" checked id="tab1" className="tab-content-first" />
            <label htmlFor="tab1">
              <img className="icon-bolt"
                src="https://aten.edu.vn/wp-content/uploads/2022/11/cach-ghi-chep-tu-vung-ielts-giup-ban-nho-mai-khong-quen-so-1.jpg"
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                alt="Vocabulary"
                loading="lazy" />
            </label>
            <ul>
              <li className="tab-content tab-content-first typography">
                <div className="card specific-card mb-4">
                  <div className="card-body lesson-content">
                    <div className="row">
                      <div className="col-md-12">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Chủ đề</th>
                              <th>Từ vựng</th>
                              <th>Ảnh</th>
                              <th>Phiên âm</th>
                              <th>Nghĩa</th>
                              <th>Nghe</th>
                              <th>Luyện tập</th>
                              <th>Phát âm của bạn</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userVocabularies.map((userVocabulary, index) => (
                              <tr key={userVocabulary.userVocabularyId} className="align-middle">
                                <td>{userVocabulary.vocabulary.topic.topicName}</td>
                                <td className={
                                  userVocabulary.isCorrect === null ? '' :
                                  userVocabulary.isCorrect ? 'text-success fw-bold' : 'text-danger fw-bold'
                                }>
                                  {userVocabulary.vocabulary.word}
                                </td>
                                <td>
                                  <img
                                    src={getImageUrl(userVocabulary.vocabulary.image)}
                                    className="vocabulary-image"
                                    alt={userVocabulary.vocabulary.word}
                                  />
                                </td>
                                <td>{userVocabulary.vocabulary.ipa}</td>
                                <td>{userVocabulary.vocabulary.meaning}</td>
                                <td>
                                  <button className="btn btn-light" onClick={() => speakWord(index)}>
                                    <i className="fas fa-headphones"></i>
                                  </button>
                                </td>
                                <td>
                                  <button className="btn btn-light" onClick={() => practicePronunciation(index)}>
                                    <i className={`fas fa-microphone ${isSpeaking && activeIndex === index ? 'active' : ''}`}></i>
                                  </button>
                                </td>
                                <td>{userVocabulary.lowerTranscript}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVocabulary;
