import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const Dictionary = () => {
  // State cho phần dịch thuật
  const [translationMode, setTranslationMode] = useState('en-vi');
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translatedTextTemp, setTranslatedTextTemp] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // State cho phần từ điển
  const [inputWord, setInputWord] = useState('');
  const [lastSearchedWord, setLastSearchedWord] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const audioRef = useRef(null);

  const characterCount = textToTranslate.length;

  // Xử lý đổi chế độ dịch thuật
  const handleTranslationModeChange = (e) => {
    setTranslationMode(e.target.value);
    translateText(textToTranslate, e.target.value);
  };

  // Hàm dịch văn bản
  const translateText = async (text, mode = translationMode) => {
    if (!text.trim()) {
      setTranslatedTextTemp('');
      return;
    }

    const apiKey = "AIzaSyD-7uWTjTodZba7ky7mgfSgnVxAX_opoh8";
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const sourceLang = mode.split("-")[0];
    const targetLang = mode.split("-")[1];
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
        }),
      });
      
      const result = await response.json();
      if (result.data && result.data.translations && result.data.translations[0]) {
        setTranslatedTextTemp(result.data.translations[0].translatedText);
      }
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error);
    }
  };

  // Cập nhật bản dịch khi text thay đổi
  useEffect(() => {
    translateText(textToTranslate);
  }, [textToTranslate]);

  // Chuyển đổi văn bản thành giọng nói
  const convertTranslatedTextToSpeech = () => {
    if (!translatedTextTemp.trim()) {
      alert("Không có văn bản để đọc phiên dịch.");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(translatedTextTemp);
    const lang = translationMode.split("-")[1];
    utterance.lang = lang === "vi" ? "vi-VN" : "en-US";
    
    // Dừng tất cả giọng nói đang phát
    window.speechSynthesis.cancel();
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
  };

  // Dừng giọng nói
  const stopConvertedTextSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Xử lý nhận dạng giọng nói
  const startTranslationSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = translationMode.startsWith("en") ? "en-US" : "vi-VN";
    recognition.interimResults = true;
    
    setIsTranslating(true);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTextToTranslate(transcript);
    };
    
    recognition.onend = () => {
      setIsTranslating(false);
    };
    
    recognition.start();
    
    // Lưu recognition vào biến để có thể dừng khi cần
    window.currentRecognition = recognition;
  };

  const stopTranslationSpeechRecognition = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setIsTranslating(false);
  };

  // Tìm kiếm từ trong từ điển
  const searchWord = async () => {
    if (!inputWord.trim()) return;

    try {
      const apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
      const response = await fetch(`${apiUrl}${inputWord}`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        const selectedWordData = data[0];

        // Hiển thị phân loại từ và IPA
        setPartOfSpeech(selectedWordData.meanings.map(meaning => meaning.partOfSpeech).join(', '));
        
        // Lấy phiên âm
        if (selectedWordData.phonetics && selectedWordData.phonetics.length > 0) {
          const phoneticTexts = selectedWordData.phonetics
            .map(p => p.text)
            .filter(text => text)
            .join(', ');
          setPhonetic(phoneticTexts);
        } else {
          setPhonetic('');
        }

        // Hiển thị định nghĩa và ví dụ
        let definitionHtml = "";
        let exampleText = "";

        for (const meaning of selectedWordData.meanings) {
          definitionHtml += `<i class="fa-solid fa-circle-chevron-right me-2 text-success"></i><strong class="text-primary">${meaning.partOfSpeech}:</strong><br>`;
          const data = [];
          
          // Duyệt qua tất cả các định nghĩa
          for (const def of meaning.definitions) {
            data.push(`<span class="ms-3">${def.definition}</span>`);
            if (def.example) {
              data.push(`<strong class="ms-3">Ví dụ:</strong> ${def.example}`);
              if (!exampleText) {
                exampleText = def.example;
              }
            }
          }

          definitionHtml += data.join("<br>");
          if (meaning.synonyms && meaning.synonyms.length > 0) {
            definitionHtml += `<br><strong class="ms-3">Từ đồng nghĩa: </strong>${meaning.synonyms.join(', ')}`;
          }
          if (meaning.antonyms && meaning.antonyms.length > 0) {
            definitionHtml += `<br><strong class="ms-3">Từ trái nghĩa: </strong>${meaning.antonyms.join(', ')}`;
          }
          definitionHtml += "<br>";
        }

        setDefinition(definitionHtml);
        setExample(exampleText);
        setLastSearchedWord(inputWord);

        // Tìm âm thanh hợp lệ
        let audio = "";
        for (const phonetic of selectedWordData.phonetics) {
          if (phonetic.audio) {
            audio = phonetic.audio;
            break;
          }
        }
        setAudioSrc(audio);

      } else {
        // Xử lý khi không tìm thấy từ
        setPartOfSpeech("");
        setPhonetic("");
        setDefinition("Không tìm thấy từ này");
        setExample("");
        setAudioSrc("");
        setLastSearchedWord("Không tìm thấy từ này");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm từ:", error);
      setPartOfSpeech("");
      setPhonetic("");
      setDefinition("Đã xảy ra lỗi khi tìm kiếm");
      setExample("");
      setAudioSrc("");
      setLastSearchedWord("Lỗi");
    }
  };

  // Phát âm thanh
  const playSound = () => {
    if (audioRef.current && audioSrc) {
      audioRef.current.play();
    }
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
    };
  }, []);

  return (
    <div className="container bg-light rounded">
      <div className="row my-5">
        <div className="col-lg col-md col-sm">
          <div className="pcss3t pcss3t-effect-scale pcss3t-theme-1">
            {/* Tab 1 - Translation */}
            <input type="radio" name="pcss3t" defaultChecked id="tab1" className="tab-content-first" />
            <label htmlFor="tab1">
              <img className="icon-bolt"
                src="https://3.imimg.com/data3/MV/XK/GLADMIN-154017/dictionaries-books-500x500.jpg"
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                alt="Translation"
                loading="lazy" />
            </label>

            {/* Tab 2 - Dictionary */}
            <input type="radio" name="pcss3t" id="tab2" className="tab-content-2" />
            <label htmlFor="tab2">
              <img className="icon-bolt"
                src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Woerterbuchstapel_Langenscheidt.jpg"
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                alt="Dictionary"
                loading="lazy" />
            </label>

            <ul>
              {/* Tab 1 Content - Translation */}
              <li className="tab-content tab-content-first typography">
                <h3 className="text-center mb-2">DỊCH THUẬT</h3>
                <div id="accordionExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        <span className="accordion-button-text"></span>
                        <i className="fa-solid fa-book-open"></i>
                      </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse show"
                      data-bs-parent="#accordionExample">
                      <div className="accordion-body mb-2">
                        <div className="card specific-card">
                          <div className="card-body lesson-content">
                            <div className="row">
                              <div>
                                <select className="form-select" value={translationMode} onChange={handleTranslationModeChange}>
                                  <option value="en-vi">Dịch tiếng Anh sang tiếng Việt</option>
                                  <option value="vi-en">Dịch tiếng Việt sang tiếng Anh</option>
                                </select>
                              </div>

                              <div className="col-md-6">
                                <h3 className="text-center">Dịch thuật</h3>
                                <div className="form-group">
                                  <div className="position-relative">
                                    <textarea rows="7" cols="33" className="form-control"
                                      value={textToTranslate}
                                      onChange={(e) => setTextToTranslate(e.target.value)}
                                      placeholder="Nhập văn bản cần dịch"
                                      maxLength={5000}></textarea>
                                    <small className="position-absolute bottom-0 end-0 text-danger me-2 mb-2">
                                      {characterCount} / 5000
                                    </small>
                                  </div>
                                </div>
                                <div>
                                  <button className="btn btn-primary mt-2" id="translate-button"
                                    onClick={isTranslating ? stopTranslationSpeechRecognition : startTranslationSpeechRecognition}>
                                    {!isTranslating ? (
                                      <i className="fas fa-microphone"></i>
                                    ) : (
                                      <i className="fas fa-stop"></i>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <h3 className="text-center">Bản dịch</h3>
                                <div className="form-group">
                                  <textarea rows="7" cols="33" className="form-control"
                                    value={translatedTextTemp}
                                    placeholder="Bản dịch"
                                    readOnly></textarea>
                                </div>
                                <div>
                                  <button className="btn btn-primary mt-2" id="translate-button"
                                    onClick={isPlaying ? stopConvertedTextSpeech : convertTranslatedTextToSpeech}>
                                    {!isPlaying ? (
                                      <i className="fas fa-headphones"></i>
                                    ) : (
                                      <i className="fas fa-stop"></i>
                                    )}
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
              </li>

              {/* Tab 2 Content - Dictionary */}
              <li className="tab-content tab-content-2 typography">
                <h3 className="text-center mb-2">TỪ ĐIỂN</h3>
                <div className="container-dictionary">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Nhập từ cần tra cứu..."
                      value={inputWord}
                      onChange={(e) => setInputWord(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchWord()}
                    />
                    <button onClick={searchWord}>Tìm kiếm</button>
                  </div>
                  <div className="result">
                    <div className="word">
                      <h3>{lastSearchedWord}</h3>
                      <audio ref={audioRef} src={audioSrc} type="audio/mpeg"></audio>
                      {audioSrc && (
                        <button onClick={playSound}>
                          <i className="fas fa-volume-up"></i>
                        </button>
                      )}
                    </div>

                    <div className="details">
                      {partOfSpeech && <p><strong className="text-dark">Phần của từ:</strong> {partOfSpeech}</p>}
                      <br />
                      {phonetic && <p><strong className="text-dark">Phiên âm:</strong> {phonetic}</p>}
                    </div>
                    <div className="word-meaning">
                      <br />
                      <div dangerouslySetInnerHTML={{ __html: definition }}></div>
                    </div>
                    {example && (
                      <div className="word-example">
                        Ví dụ
                        <div dangerouslySetInnerHTML={{ __html: example }}></div>
                      </div>
                    )}
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

export default Dictionary;
