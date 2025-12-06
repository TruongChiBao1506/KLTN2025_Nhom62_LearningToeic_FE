import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  Tabs,
  Alert,
  Tag,
  Divider,
  Spin,
  message,
  Progress,
  List,
  Modal,
  Empty,
  Tooltip,
  Badge,
  Dropdown,
} from "antd";
import {
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  Search,
  Languages,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Users,
  Globe,
  Heart,
  History,
  Star,
  Trash2,
  Clock,
  BookmarkPlus,
  Bookmark,
  Settings,
  Download,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Dictionary = () => {
  // State cho phần dịch thuật
  const [translationMode, setTranslationMode] = useState("en-vi");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedTextTemp, setTranslatedTextTemp] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translating, setTranslating] = useState(false);

  // State cho phần từ điển
  const [inputWord, setInputWord] = useState("");
  const [lastSearchedWord, setLastSearchedWord] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [searching, setSearching] = useState(false);
  const [synonyms, setSynonyms] = useState([]);
  const [antonyms, setAntonyms] = useState([]);
  const audioRef = useRef(null);

  // State cho tính năng mới
  const [searchHistory, setSearchHistory] = useState([]);
  const [bookmarkedWords, setBookmarkedWords] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.8,
    pitch: 1,
    volume: 1,
    autoPlay: false,
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState("en-US");

  const characterCount = textToTranslate.length;

  // Load data from localStorage
  useEffect(() => {
    document.title = "Từ điển | TOEIC Learning Platform";

    const savedHistory = localStorage.getItem("dictionaryHistory");
    const savedBookmarks = localStorage.getItem("dictionaryBookmarks");
    const savedVoiceSettings = localStorage.getItem("voiceSettings");

    console.log("Loading data:", {
      savedHistory,
      savedBookmarks,
      savedVoiceSettings,
    });

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      console.log("Parsed history:", parsedHistory);
      setSearchHistory(parsedHistory);
    }
    if (savedBookmarks) {
      const parsedBookmarks = JSON.parse(savedBookmarks);
      console.log("Parsed bookmarks:", parsedBookmarks);
      setBookmarkedWords(parsedBookmarks);
    }
    if (savedVoiceSettings) {
      setVoiceSettings(JSON.parse(savedVoiceSettings));
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Add to search history
  const addToHistory = (word, definition, phonetic) => {
    const newHistoryItem = {
      id: Date.now(),
      word: word.toLowerCase(),
      definition: Array.isArray(definition)
        ? definition[0]?.definitions[0]?.definition
        : definition,
      phonetic,
      timestamp: new Date().toISOString(),
      searchCount: 1,
    };

    setSearchHistory((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.word === word.toLowerCase()
      );
      let newHistory;

      if (existingIndex !== -1) {
        // Update existing item
        newHistory = [...prev];
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          searchCount: newHistory[existingIndex].searchCount + 1,
          timestamp: new Date().toISOString(),
        };
        // Move to top
        const updatedItem = newHistory.splice(existingIndex, 1)[0];
        newHistory.unshift(updatedItem);
      } else {
        // Add new item
        newHistory = [newHistoryItem, ...prev].slice(0, 50); // Keep last 50 searches
      }

      saveToLocalStorage("dictionaryHistory", newHistory);
      return newHistory;
    });
  };

  // Toggle bookmark
  const toggleBookmark = (word, definition, phonetic) => {
    const bookmarkItem = {
      id: Date.now(),
      word: word.toLowerCase(),
      definition: Array.isArray(definition)
        ? definition[0]?.definitions[0]?.definition
        : definition,
      phonetic,
      timestamp: new Date().toISOString(),
    };

    setBookmarkedWords((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.word === word.toLowerCase()
      );
      let newBookmarks;

      if (existingIndex !== -1) {
        // Remove from bookmarks
        newBookmarks = prev.filter((item) => item.word !== word.toLowerCase());
        setIsBookmarked(false);
        message.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        // Add to bookmarks
        newBookmarks = [bookmarkItem, ...prev];
        setIsBookmarked(true);
        message.success("Đã thêm vào danh sách yêu thích");
      }

      saveToLocalStorage("dictionaryBookmarks", newBookmarks);
      return newBookmarks;
    });
  };

  // Check if word is bookmarked
  const checkIfBookmarked = (word) => {
    const isBookmarked = bookmarkedWords.some(
      (item) => item.word === word.toLowerCase()
    );
    setIsBookmarked(isBookmarked);
  };

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    saveToLocalStorage("dictionaryHistory", []);
    message.success("Đã xóa lịch sử tìm kiếm");
  };

  // Clear bookmarks
  const clearBookmarks = () => {
    setBookmarkedWords([]);
    saveToLocalStorage("dictionaryBookmarks", []);
    message.success("Đã xóa danh sách yêu thích");
  };

  // Search from history or bookmark
  const searchFromList = (word) => {
    console.log("searchFromList called with word:", word);
    setInputWord(word);
    searchWord(word);
    setShowHistory(false);
    setShowBookmarks(false);
  };

  // Add sample data for testing
  const addSampleData = () => {
    const sampleHistory = [
      {
        id: 1,
        word: "hello",
        definition: "A greeting used when meeting someone",
        phonetic: "/həˈloʊ/",
        timestamp: new Date().toISOString(),
        searchCount: 3,
      },
      {
        id: 2,
        word: "world",
        definition: "The earth and all its inhabitants",
        phonetic: "/wɜːrld/",
        timestamp: new Date().toISOString(),
        searchCount: 2,
      },
    ];

    const sampleBookmarks = [
      {
        id: 1,
        word: "beautiful",
        definition: "Pleasing the senses or mind aesthetically",
        phonetic: "/ˈbjuːtɪfəl/",
        timestamp: new Date().toISOString(),
      },
    ];

    setSearchHistory(sampleHistory);
    setBookmarkedWords(sampleBookmarks);
    saveToLocalStorage("dictionaryHistory", sampleHistory);
    saveToLocalStorage("dictionaryBookmarks", sampleBookmarks);
    message.success("Đã thêm dữ liệu mẫu!");
  };

  // Xử lý đổi chế độ dịch thuật
  const handleTranslationModeChange = (value) => {
    setTranslationMode(value);
    if (textToTranslate.trim()) {
      translateText(textToTranslate, value);
    }
  };

  // Hàm dịch văn bản
  const translateText = React.useCallback(
    async (text, mode = translationMode) => {
      if (!text.trim()) {
        setTranslatedTextTemp("");
        return;
      }

      setTranslating(true);
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
        if (
          result.data &&
          result.data.translations &&
          result.data.translations[0]
        ) {
          setTranslatedTextTemp(result.data.translations[0].translatedText);
          // message.success("Dịch thành công!");
        }
      } catch (error) {
        console.error("Lỗi khi dịch văn bản:", error);
        message.error("Lỗi khi dịch văn bản. Vui lòng thử lại.");
      } finally {
        setTranslating(false);
      }
    },
    [translationMode]
  );

  // Cập nhật bản dịch khi text thay đổi
  const translateTextDebounced = React.useCallback(
    (text) => translateText(text),
    [translateText]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (textToTranslate.trim()) {
        translateTextDebounced(textToTranslate);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [textToTranslate, translateTextDebounced]);

  // Update recognition language when translation mode changes
  useEffect(() => {
    setRecognitionLang(translationMode.startsWith("en") ? "en-US" : "vi-VN");
  }, [translationMode]);

  // Chuyển đổi văn bản thành giọng nói với cài đặt nâng cao
  const convertTranslatedTextToSpeech = () => {
    if (!translatedTextTemp.trim()) {
      message.warning("Không có văn bản để đọc phiên dịch.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedTextTemp);
    const lang = translationMode.split("-")[1];
    utterance.lang = lang === "vi" ? "vi-VN" : "en-US";
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Dừng tất cả giọng nói đang phát
    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    // message.info("Đang phát âm...");

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      message.error("Lỗi khi phát âm");
    };
  };

  // Dừng giọng nói
  const stopConvertedTextSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    message.info("Đã dừng phát âm");
  };

  // Xử lý nhận dạng giọng nói cải thiện
  const startTranslationSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    setIsTranslating(true);
    setIsListening(true);
    message.info("Đang nghe... Hãy nói nội dung cần dịch");

    let finalTranscript = "";
    let interimTranscript = "";

    recognition.onresult = (event) => {
      finalTranscript = "";
      interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTextToTranslate(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsTranslating(false);
      setIsListening(false);
      if (finalTranscript) {
        message.success("Nhận dạng giọng nói thành công!");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      let errorMessage = "Lỗi nhận dạng giọng nói";

      switch (event.error) {
        case "no-speech":
          errorMessage = "Không phát hiện giọng nói. Vui lòng thử lại.";
          break;
        case "audio-capture":
          errorMessage = "Không thể truy cập microphone.";
          break;
        case "not-allowed":
          errorMessage = "Vui lòng cho phép truy cập microphone.";
          break;
        case "network":
          errorMessage = "Lỗi kết nối mạng.";
          break;
        default:
          errorMessage = `Lỗi nhận dạng: ${event.error}`;
      }

      message.error(errorMessage);
      setIsTranslating(false);
      setIsListening(false);
    };

    recognition.start();
    window.currentRecognition = recognition;
  };

  const stopTranslationSpeechRecognition = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setIsTranslating(false);
  };

  // Tìm kiếm từ trong từ điển với history và bookmark
  const searchWord = async (wordToSearch = null) => {
    const searchTerm = wordToSearch || inputWord.trim();
    if (!searchTerm) {
      message.warning("Vui lòng nhập từ cần tra cứu");
      return;
    }

    setSearching(true);
    try {
      const apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
      const response = await fetch(`${apiUrl}${searchTerm}`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        const selectedWordData = data[0];

        // Hiển thị phân loại từ và IPA
        setPartOfSpeech(
          selectedWordData.meanings
            .map((meaning) => meaning.partOfSpeech)
            .join(", ")
        );

        // Lấy phiên âm
        let phoneticTexts = "";
        if (
          selectedWordData.phonetics &&
          selectedWordData.phonetics.length > 0
        ) {
          phoneticTexts = selectedWordData.phonetics
            .map((p) => p.text)
            .filter((text) => text)
            .join(", ");
          setPhonetic(phoneticTexts);
        } else {
          setPhonetic("");
        }

        // Hiển thị định nghĩa và ví dụ
        let definitionList = [];
        let exampleText = "";
        let allSynonyms = [];
        let allAntonyms = [];

        for (const meaning of selectedWordData.meanings) {
          const meaningObj = {
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions.map((def) => ({
              definition: def.definition,
              example: def.example,
            })),
          };

          definitionList.push(meaningObj);

          // Lấy ví dụ đầu tiên
          if (!exampleText && meaning.definitions[0].example) {
            exampleText = meaning.definitions[0].example;
          }

          // Tập hợp synonyms và antonyms
          if (meaning.synonyms) {
            allSynonyms = [...allSynonyms, ...meaning.synonyms];
          }
          if (meaning.antonyms) {
            allAntonyms = [...allAntonyms, ...meaning.antonyms];
          }
        }

        setDefinition(definitionList);
        setExample(exampleText);
        setSynonyms([...new Set(allSynonyms)].slice(0, 10)); // Giới hạn 10 từ
        setAntonyms([...new Set(allAntonyms)].slice(0, 10)); // Giới hạn 10 từ
        setLastSearchedWord(searchTerm);

        // Tìm âm thanh hợp lệ
        let audio = "";
        for (const phonetic of selectedWordData.phonetics) {
          if (phonetic.audio) {
            audio = phonetic.audio;
            break;
          }
        }
        setAudioSrc(audio);

        // Add to history và check bookmark
        addToHistory(searchTerm, definitionList, phoneticTexts);
        checkIfBookmarked(searchTerm);

        // Auto play nếu được bật
        if (voiceSettings.autoPlay && audio) {
          setTimeout(() => playSound(), 500);
        }

        message.success("Tìm kiếm thành công!");
      } else {
        // Xử lý khi không tìm thấy từ
        resetDictionaryState();
        setLastSearchedWord("Không tìm thấy từ này");
        message.warning("Không tìm thấy từ này trong từ điển");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm từ:", error);
      resetDictionaryState();
      setLastSearchedWord("Lỗi");
      message.error("Đã xảy ra lỗi khi tìm kiếm");
    } finally {
      setSearching(false);
    }
  };

  const resetDictionaryState = () => {
    setPartOfSpeech("");
    setPhonetic("");
    setDefinition([]);
    setExample("");
    setAudioSrc("");
    setSynonyms([]);
    setAntonyms([]);
  };

  // Phát âm thanh
  const playSound = () => {
    if (audioRef.current && audioSrc) {
      audioRef.current.play();
      // message.info("Đang phát âm từ vựng");
    } else {
      message.warning("Không có âm thanh cho từ này");
    }
  };

  // Clear translation
  const clearTranslation = () => {
    setTextToTranslate("");
    setTranslatedTextTemp("");
  };

  // Clear dictionary
  const clearDictionary = () => {
    setInputWord("");
    setLastSearchedWord("");
    resetDictionaryState();
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

  // Translation Tab Content
  const translationContent = (
    <div style={{ padding: "24px 0" }} className="fade-in-up">
      {/* Translation Mode Selector */}
      <Card
        size="small"
        style={{
          marginBottom: "24px",
          borderRadius: "16px",
          border: "1px solid #e6f7ff",
          background: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)",
          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)"
        }}
        className="slide-in-left"
      >
        <Row align="middle" gutter={16}>
          <Col>
            <Languages size={24} style={{ color: "var(--color-primary)" }} />
          </Col>
          <Col flex="auto">
            <Select
              value={translationMode}
              onChange={handleTranslationModeChange}
              style={{ width: "100%" }}
              size="large"
              dropdownStyle={{
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              <Option value="en-vi">
                <Space>
                  <Globe size={18} />
                  <span style={{ fontWeight: "500" }}>Tiếng Anh → Tiếng Việt</span>
                </Space>
              </Option>
              <Option value="vi-en">
                <Space>
                  <Globe size={18} />
                  <span style={{ fontWeight: "500" }}>Tiếng Việt → Tiếng Anh</span>
                </Space>
              </Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Translation Interface */}
      <Row gutter={24}>
        {/* Input Column */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileText size={18} />
                <span style={{ fontWeight: "600", color: "var(--color-primary)" }}>Văn bản gốc</span>
              </Space>
            }
            style={{ 
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0"
            }}
            className="slide-in-left"
            extra={
              <Space>
                <Select
                  value={recognitionLang}
                  onChange={setRecognitionLang}
                  size="small"
                  style={{ width: 120 }}
                >
                  <Option value="en-US">English</Option>
                  <Option value="vi-VN">Tiếng Việt</Option>
                  <Option value="en-GB">English (UK)</Option>
                  <Option value="en-AU">English (AU)</Option>
                </Select>
                <Button
                  type={isTranslating ? "danger" : "primary"}
                  ghost
                  size="small"
                  icon={
                    isTranslating ? <MicOff size={16} /> : <Mic size={16} />
                  }
                  onClick={
                    isTranslating
                      ? stopTranslationSpeechRecognition
                      : startTranslationSpeechRecognition
                  }
                  loading={isTranslating}
                  style={{ borderRadius: "8px" }}
                >
                  {isTranslating ? "Dừng" : "Ghi âm"}
                </Button>
                <Button
                  size="small"
                  icon={<RotateCcw size={16} />}
                  onClick={clearTranslation}
                  style={{ borderRadius: "8px" }}
                >
                  Xóa
                </Button>
              </Space>
            }
          >
            <div style={{ position: "relative" }}>
              <TextArea
                rows={8}
                value={textToTranslate}
                onChange={(e) => setTextToTranslate(e.target.value)}
                placeholder="Nhập văn bản cần dịch..."
                maxLength={5000}
                style={{
                  resize: "none",
                  borderColor: isListening ? "var(--color-danger)" : "var(--color-border)",
                  borderWidth: isListening ? "2px" : "1px",
                  borderRadius: "12px",
                  boxShadow: isListening
                    ? "0 0 10px rgba(255, 77, 79, 0.3)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  transition: "all 0.3s ease",
                  background: "white"
                }}
              />
              {isListening && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "var(--color-danger)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  <Mic size={12} />
                  Đang nghe...
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(255,255,255,0.9)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: characterCount > 4000 ? "var(--color-danger)" : "#8c8c8c",
                }}
              >
                {characterCount}/5000
              </div>
            </div>
            {characterCount > 4000 && (
              <Progress
                percent={(characterCount / 5000) * 100}
                size="small"
                strokeColor="var(--color-danger)"
                style={{ marginTop: "8px" }}
              />
            )}
          </Card>
        </Col>

        {/* Output Column */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <Languages size={18} />
                <span style={{ fontWeight: "600", color: "var(--color-success)" }}>Bản dịch</span>
                {translating && <Spin size="small" />}
              </Space>
            }
            style={{ 
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0"
            }}
            className="slide-in-right"
            extra={
              <Button
                type={isPlaying ? "danger" : "primary"}
                ghost
                size="small"
                icon={isPlaying ? <Pause size={16} /> : <Volume2 size={16} />}
                onClick={
                  isPlaying
                    ? stopConvertedTextSpeech
                    : convertTranslatedTextToSpeech
                }
                disabled={!translatedTextTemp.trim()}
                style={{ borderRadius: "8px" }}
              >
                {isPlaying ? "Dừng" : "Nghe"}
              </Button>
            }
          >
            <TextArea
              rows={8}
              value={translatedTextTemp}
              placeholder="Bản dịch sẽ hiển thị ở đây..."
              readOnly
              style={{
                resize: "none",
                background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
                border: "1px solid #e6f7ff",
                borderRadius: "12px",
                fontSize: "12px",
                lineHeight: "1.6",
                color: "#262626",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
              }}
            />
            {translating && (
              <div
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  color: "var(--color-primary)",
                  background: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid #d6e4ff",
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)"
                }}
              >
                <Spin size="small" style={{ color: "var(--color-primary)" }} />
                <div style={{ 
                  marginTop: "8px", 
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--color-primary)"
                }}>
                  Đang dịch văn bản...
                </div>
                <div style={{ 
                  fontSize: "12px",
                  color: "#8c8c8c",
                  marginTop: "4px"
                }}>
                  Vui lòng đợi trong giây lát
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Dictionary Tab Content
  const dictionaryContent = (
    <div style={{ padding: "24px 0" }} className="fade-in-up">
      {/* Search Box */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "16px",
          border: "1px solid #e6f7ff",
          background: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)",
          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)"
        }}
        className="slide-in-left"
      >
        <Row gutter={12}>
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Nhập từ cần tra cứu..."
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onPressEnter={() => searchWord()}
              prefix={<Search size={18} style={{ color: "var(--color-primary)" }} />}
              style={{
                borderRadius: "12px",
                border: "2px solid transparent",
                background: "white",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Search size={18} />}
              onClick={() => searchWord()}
              loading={searching}
              style={{ 
                borderRadius: "12px",
                height: "48px",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                transition: "all 0.3s ease"
              }}
              title="Tìm kiếm từ trong từ điển"
            >
              Tìm kiếm
            </Button>
          </Col>
          <Col>
            <Dropdown
              trigger={["click"]}
              open={showHistory}
              onOpenChange={setShowHistory}
              placement="bottomRight"
              dropdownRender={() => (
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Card
                    title={
                      <Space>
                        <History size={18} />
                        <span style={{ fontWeight: "600" }}>Lịch sử tìm kiếm</span>
                        <Badge count={searchHistory.length} style={{ backgroundColor: "var(--color-primary)" }} />
                      </Space>
                    }
                    style={{
                      width: 380,
                      maxHeight: 420,
                      overflow: "auto",
                      border: "none",
                      borderRadius: "12px"
                    }}
                    extra={
                      <Button
                        size="small"
                        icon={<Trash2 size={16} />}
                        onClick={clearHistory}
                        disabled={searchHistory.length === 0}
                        style={{ borderRadius: "6px" }}
                      >
                        Xóa tất cả
                      </Button>
                    }
                  >
                    {searchHistory.length > 0 ? (
                      <List
                        size="small"
                        dataSource={searchHistory.slice(0, 10)}
                        renderItem={(item) => (
                          <List.Item
                            style={{
                              cursor: "pointer",
                              padding: "8px 0",
                              borderRadius: "4px",
                              transition: "background-color 0.2s",
                            }}
                            onClick={() => searchFromList(item.word)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                            actions={[
                              <Tag color="blue" key="count">
                                {item.searchCount} lần
                              </Tag>,
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                                key="date"
                              >
                                {new Date(item.timestamp).toLocaleDateString()}
                              </Text>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Clock size={16} style={{ color: "var(--color-primary)" }} />
                              }
                              title={<Text strong>{item.word}</Text>}
                              description={
                                <Text ellipsis style={{ maxWidth: "200px" }}>
                                  {item.definition}
                                </Text>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <div>
                            <div style={{ fontWeight: "500", color: "#8c8c8c" }}>
                              Chưa có lịch sử tìm kiếm
                            </div>
                            <div style={{ fontSize: "12px", color: "#bfbfbf", marginTop: "4px" }}>
                              Bắt đầu tìm kiếm để xem lịch sử ở đây
                            </div>
                          </div>
                        }
                        style={{ padding: "20px" }}
                      />
                    )}
                  </Card>
                </div>
              )}
            >
              <Button
                size="large"
                type={showHistory ? "primary" : "default"}
                icon={
                  <Badge count={searchHistory.length} size="small">
                    <History size={18} />
                  </Badge>
                }
                style={{ 
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  boxShadow: showHistory ? "0 4px 12px rgba(24, 144, 255, 0.3)" : "none"
                }}
                title="Xem lịch sử tìm kiếm"
              >
                Lịch sử
              </Button>
            </Dropdown>
          </Col>
          <Col>
            <Dropdown
              trigger={["click"]}
              open={showBookmarks}
              onOpenChange={setShowBookmarks}
              placement="bottomRight"
              dropdownRender={() => (
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Card
                    title={
                      <Space>
                        <Heart size={18} />
                        <span style={{ fontWeight: "600" }}>Từ yêu thích</span>
                        <Badge count={bookmarkedWords.length} style={{ backgroundColor: "var(--color-warning)" }} />
                      </Space>
                    }
                    style={{
                      width: 380,
                      maxHeight: 420,
                      overflow: "auto",
                      border: "none",
                      borderRadius: "12px"
                    }}
                    extra={
                      <Button
                        size="small"
                        icon={<Trash2 size={16} />}
                        onClick={clearBookmarks}
                        disabled={bookmarkedWords.length === 0}
                        style={{ borderRadius: "6px" }}
                      >
                        Xóa tất cả
                      </Button>
                    }
                  >
                    {bookmarkedWords.length > 0 ? (
                      <List
                        size="small"
                        dataSource={bookmarkedWords.slice(0, 10)}
                        renderItem={(item) => (
                          <List.Item
                            style={{
                              cursor: "pointer",
                              padding: "8px 0",
                              borderRadius: "4px",
                              transition: "background-color 0.2s",
                            }}
                            onClick={() => searchFromList(item.word)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                            actions={[
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                                key="date"
                              >
                                {new Date(item.timestamp).toLocaleDateString()}
                              </Text>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Star size={16} style={{ color: "var(--color-warning)" }} />
                              }
                              title={<Text strong>{item.word}</Text>}
                              description={
                                <Text ellipsis style={{ maxWidth: "200px" }}>
                                  {item.definition}
                                </Text>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <div>
                            <div style={{ fontWeight: "500", color: "#8c8c8c" }}>
                              Chưa có từ yêu thích
                            </div>
                            <div style={{ fontSize: "12px", color: "#bfbfbf", marginTop: "4px" }}>
                              Thêm từ vào danh sách yêu thích để xem ở đây
                            </div>
                          </div>
                        }
                        style={{ padding: "20px" }}
                      />
                    )}
                  </Card>
                </div>
              )}
            >
              <Button
                size="large"
                type={showBookmarks ? "primary" : "default"}
                icon={
                  <Badge count={bookmarkedWords.length} size="small">
                    <Heart size={18} />
                  </Badge>
                }
                style={{ 
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  boxShadow: showBookmarks ? "0 4px 12px rgba(250, 173, 20, 0.3)" : "none"
                }}
                title="Xem danh sách từ yêu thích"
              >
                Yêu thích
              </Button>
            </Dropdown>
          </Col>
          <Col>
            <Button
              size="large"
              icon={<RotateCcw size={18} />}
              onClick={clearDictionary}
              style={{ 
                borderRadius: "12px",
                transition: "all 0.3s ease"
              }}
              title="Xóa kết quả tìm kiếm hiện tại"
            >
              Xóa
            </Button>
          </Col>
          <Col>
            <Button
              size="large"
              type="dashed"
              onClick={addSampleData}
              style={{ 
                borderRadius: "12px", 
                color: "var(--color-chart-4)",
                borderColor: "var(--color-chart-4)",
                transition: "all 0.3s ease"
              }}
              title="Thêm dữ liệu mẫu để test"
            >
              Test Data
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Dictionary Results */}
      {(lastSearchedWord || searching) && (
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            border: "1px solid #f0f0f0",
            background: "linear-gradient(145deg, #ffffff 0%, #fafbff 100%)"
          }}
          className="fade-in-up"
        >
          {searching ? (
            <div style={{ textAlign: "center", padding: "60px 40px" }}>
              <Spin size="large" style={{ color: "var(--color-primary)" }} />
              <div style={{ 
                marginTop: "20px", 
                color: "var(--color-primary)",
                fontSize: "16px",
                fontWeight: "500"
              }}>
                Đang tìm kiếm từ điển...
              </div>
              <div style={{
                marginTop: "12px",
                color: "#8c8c8c",
                fontSize: "12px"
              }}>
                Vui lòng đợi trong giây lát
              </div>
            </div>
          ) : (
            <>
              {/* Word Header */}
              <div style={{ marginBottom: "24px", padding: "20px", background: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)", borderRadius: "12px", border: "1px solid #d6e4ff" }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        background: "linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        textTransform: "capitalize",
                        fontWeight: "700",
                        fontSize: "2.2rem"
                      }}
                    >
                      {lastSearchedWord}
                    </Title>
                  </Col>
                  <Col>
                    <Space size="middle">
                      <Tooltip
                        title={
                          isBookmarked
                            ? "Xóa khỏi yêu thích"
                            : "Thêm vào yêu thích"
                        }
                      >
                        <Button
                          type={isBookmarked ? "primary" : "default"}
                          ghost={!isBookmarked}
                          icon={
                            isBookmarked ? (
                              <Heart size={18} style={{ fill: "var(--color-danger)" }} />
                            ) : (
                              <Heart size={18} />
                            )
                          }
                          onClick={() =>
                            toggleBookmark(
                              lastSearchedWord,
                              definition,
                              phonetic
                            )
                          }
                          style={{ 
                            borderRadius: "12px",
                            transition: "all 0.3s ease",
                            boxShadow: isBookmarked ? "0 4px 12px rgba(255, 77, 79, 0.3)" : "none"
                          }}
                        >
                          {isBookmarked ? "Đã yêu thích" : "Yêu thích"}
                        </Button>
                      </Tooltip>
                      {audioSrc && (
                        <Button
                          type="primary"
                          ghost
                          icon={<Volume2 size={18} />}
                          onClick={playSound}
                          style={{ 
                            borderRadius: "12px",
                            transition: "all 0.3s ease"
                          }}
                        >
                          Phát âm
                        </Button>
                      )}
                      <Dropdown
                        trigger={["click"]}
                        open={showVoiceSettings}
                        onOpenChange={setShowVoiceSettings}
                        dropdownRender={() => (
                          <Card
                            title={
                              <Space>
                                <Settings size={16} />
                                Cài đặt Voice
                              </Space>
                            }
                            style={{ width: 300 }}
                          >
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              <div>
                                <Text>Tốc độ: {voiceSettings.rate}</Text>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="2"
                                  step="0.1"
                                  value={voiceSettings.rate}
                                  onChange={(e) => {
                                    const newSettings = {
                                      ...voiceSettings,
                                      rate: parseFloat(e.target.value),
                                    };
                                    setVoiceSettings(newSettings);
                                    saveToLocalStorage(
                                      "voiceSettings",
                                      newSettings
                                    );
                                  }}
                                  style={{ width: "100%" }}
                                />
                              </div>
                              <div>
                                <Text>Cao độ: {voiceSettings.pitch}</Text>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="2"
                                  step="0.1"
                                  value={voiceSettings.pitch}
                                  onChange={(e) => {
                                    const newSettings = {
                                      ...voiceSettings,
                                      pitch: parseFloat(e.target.value),
                                    };
                                    setVoiceSettings(newSettings);
                                    saveToLocalStorage(
                                      "voiceSettings",
                                      newSettings
                                    );
                                  }}
                                  style={{ width: "100%" }}
                                />
                              </div>
                              <div>
                                <Text>Âm lượng: {voiceSettings.volume}</Text>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={voiceSettings.volume}
                                  onChange={(e) => {
                                    const newSettings = {
                                      ...voiceSettings,
                                      volume: parseFloat(e.target.value),
                                    };
                                    setVoiceSettings(newSettings);
                                    saveToLocalStorage(
                                      "voiceSettings",
                                      newSettings
                                    );
                                  }}
                                  style={{ width: "100%" }}
                                />
                              </div>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={voiceSettings.autoPlay}
                                  onChange={(e) => {
                                    const newSettings = {
                                      ...voiceSettings,
                                      autoPlay: e.target.checked,
                                    };
                                    setVoiceSettings(newSettings);
                                    saveToLocalStorage(
                                      "voiceSettings",
                                      newSettings
                                    );
                                  }}
                                />
                                <Text>Tự động phát âm</Text>
                              </label>
                            </Space>
                          </Card>
                        )}
                      >
                        <Button
                          icon={<Settings size={16} />}
                          style={{ borderRadius: "6px" }}
                        >
                          Cài đặt
                        </Button>
                      </Dropdown>
                    </Space>
                  </Col>
                </Row>

                {/* Phonetic and Part of Speech */}
                {(phonetic || partOfSpeech) && (
                  <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {phonetic && (
                      <Tag 
                        color="green" 
                        style={{ 
                          marginRight: "0", 
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "500",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                      >
                        <Volume2 size={14} style={{ marginRight: "6px" }} />
                        {phonetic}
                      </Tag>
                    )}
                    {partOfSpeech && (
                      <Tag 
                        color="blue" 
                        style={{ 
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "500",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                      >
                        <BookOpen size={14} style={{ marginRight: "6px" }} />
                        {partOfSpeech}
                      </Tag>
                    )}
                  </div>
                )}
              </div>

              {/* Definitions */}
              {Array.isArray(definition) && definition.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <Title 
                    level={4} 
                    style={{ 
                      color: "#262626",
                      marginBottom: "16px",
                      fontWeight: "600"
                    }}
                  >
                    <BookOpen size={20} style={{ marginRight: "10px", color: "var(--color-primary)" }} />
                    Định nghĩa
                  </Title>
                  {definition.map((meaning, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{
                        marginBottom: "16px",
                        border: "1px solid #e6f7ff",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #fafbff 0%, #f0f8ff 100%)",
                        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.08)",
                        transition: "all 0.3s ease"
                      }}
                      className="fade-in-up"
                    >
                      <Title
                        level={5}
                        style={{
                          color: "var(--color-primary)",
                          marginBottom: "12px",
                          textTransform: "capitalize",
                          fontWeight: "600",
                          fontSize: "1.1rem"
                        }}
                      >
                        {meaning.partOfSpeech}
                      </Title>
                      {meaning.definitions.map((def, defIdx) => (
                        <div key={defIdx} style={{ marginBottom: "8px" }}>
                          <Paragraph style={{ margin: 0 }}>
                            • {def.definition}
                          </Paragraph>
                          {def.example && (
                            <Paragraph
                              style={{
                                margin: "4px 0 0 16px",
                                fontStyle: "italic",
                                color: "#8c8c8c",
                              }}
                            >
                              Ví dụ: "{def.example}"
                            </Paragraph>
                          )}
                        </div>
                      ))}
                    </Card>
                  ))}
                </div>
              )}

              {/* Synonyms and Antonyms */}
              {(synonyms.length > 0 || antonyms.length > 0) && (
                <>
                  <Divider />
                  <Row gutter={16}>
                    {synonyms.length > 0 && (
                      <Col xs={24} md={12}>
                        <Title level={5} style={{ color: "var(--color-success)" }}>
                          Từ đồng nghĩa
                        </Title>
                        <div>
                          {synonyms.map((synonym, idx) => (
                            <Tag
                              key={idx}
                              color="green"
                              style={{
                                marginBottom: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setInputWord(synonym);
                                searchWord(synonym);
                              }}
                            >
                              {synonym}
                            </Tag>
                          ))}
                        </div>
                      </Col>
                    )}

                    {antonyms.length > 0 && (
                      <Col xs={24} md={12}>
                        <Title level={5} style={{ color: "var(--color-danger)" }}>
                          Từ trái nghĩa
                        </Title>
                        <div>
                          {antonyms.map((antonym, idx) => (
                            <Tag
                              key={idx}
                              color="red"
                              style={{
                                marginBottom: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setInputWord(antonym);
                                searchWord(antonym);
                              }}
                            >
                              {antonym}
                            </Tag>
                          ))}
                        </div>
                      </Col>
                    )}
                  </Row>
                </>
              )}

              {/* Audio Element */}
              <audio ref={audioRef} src={audioSrc} type="audio/mpeg" />
            </>
          )}
        </Card>
      )}
    </div>
  );

  const tabItems = [
    {
      key: "1",
      label: (
        <Space>
          <Languages size={16} />
          Dịch thuật
        </Space>
      ),
      children: translationContent,
    },
    {
      key: "2",
      label: (
        <Space>
          <BookOpen size={16} />
          Từ điển
        </Space>
      ),
      children: dictionaryContent,
    },
    {
      key: "3",
      label: (
        <Space>
          <Users size={16} />
          Thống kê
          <Badge count={searchHistory.length + bookmarkedWords.length} />
        </Space>
      ),
      children: (
        <div style={{ padding: "16px 0" }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <History size={16} />
                    Lịch sử tìm kiếm
                  </Space>
                }
                style={{ marginBottom: "16px" }}
                extra={
                  <Button
                    size="small"
                    icon={<Download size={14} />}
                    onClick={() => {
                      const dataStr = JSON.stringify(searchHistory, null, 2);
                      const dataBlob = new Blob([dataStr], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "dictionary-history.json";
                      link.click();
                    }}
                  >
                    Xuất
                  </Button>
                }
              >
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Title level={3} style={{ color: "var(--color-primary)" }}>
                    {searchHistory.length}
                  </Title>
                  <Text type="secondary">Từ đã tìm kiếm</Text>
                </div>

                {searchHistory.length > 0 && (
                  <List
                    size="small"
                    dataSource={searchHistory.slice(0, 5)}
                    renderItem={(item) => (
                      <List.Item
                        style={{ cursor: "pointer" }}
                        onClick={() => searchFromList(item.word)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Clock size={16} style={{ color: "var(--color-primary)" }} />
                          }
                          title={item.word}
                          description={`${item.searchCount} lần - ${new Date(
                            item.timestamp
                          ).toLocaleDateString()}`}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <Heart size={16} />
                    Từ yêu thích
                  </Space>
                }
                style={{ marginBottom: "16px" }}
                extra={
                  <Button
                    size="small"
                    icon={<Download size={14} />}
                    onClick={() => {
                      const dataStr = JSON.stringify(bookmarkedWords, null, 2);
                      const dataBlob = new Blob([dataStr], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "dictionary-bookmarks.json";
                      link.click();
                    }}
                  >
                    Xuất
                  </Button>
                }
              >
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Title level={3} style={{ color: "var(--color-warning)" }}>
                    {bookmarkedWords.length}
                  </Title>
                  <Text type="secondary">Từ yêu thích</Text>
                </div>

                {bookmarkedWords.length > 0 && (
                  <List
                    size="small"
                    dataSource={bookmarkedWords.slice(0, 5)}
                    renderItem={(item) => (
                      <List.Item
                        style={{ cursor: "pointer" }}
                        onClick={() => searchFromList(item.word)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Star size={16} style={{ color: "var(--color-warning)" }} />
                          }
                          title={item.word}
                          description={new Date(
                            item.timestamp
                          ).toLocaleDateString()}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          
          .listening-indicator {
            animation: pulse 1.5s infinite;
          }
          
          .voice-visualizer {
            display: flex;
            align-items: center;
            gap: 2px;
            height: 20px;
          }
          
          .voice-bar {
            width: 3px;
            background: #ff4d4f;
            border-radius: 2px;
            animation: voice-wave 1s infinite ease-in-out;
          }
          
          .voice-bar:nth-child(2) { animation-delay: 0.1s; }
          .voice-bar:nth-child(3) { animation-delay: 0.2s; }
          .voice-bar:nth-child(4) { animation-delay: 0.3s; }
          .voice-bar:nth-child(5) { animation-delay: 0.4s; }
          
          @keyframes voice-wave {
            0%, 40%, 100% { transform: scaleY(0.4); height: 8px; }
            20% { transform: scaleY(1); height: 20px; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .slide-in-left {
            animation: slideInLeft 0.5s ease-out;
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .slide-in-right {
            animation: slideInRight 0.5s ease-out;
          }
          
          /* Responsive Design */
          @media (max-width: 768px) {
            .container-dictionary {
              width: 95% !important;
              margin: 20px auto !important;
              padding: 20px 15px !important;
            }
            
            .search-box {
              flex-direction: column;
              gap: 15px;
            }
            
            .search-box input {
              width: 100% !important;
            }
            
            .search-box button {
              width: 100% !important;
            }
            
            .result h3 {
              font-size: 24px !important;
            }
            
            .word-meaning {
              font-size: 12px !important;
            }
            
            .word-example {
              font-size: 12px !important;
              padding-left: 15px !important;
            }
          }
          
          @media (max-width: 576px) {
            .container-dictionary {
              width: 98% !important;
              padding: 15px 10px !important;
            }
            
            .result h3 {
              font-size: 20px !important;
            }
            
            .result .word {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 10px;
            }
            
            .result button {
              width: 100%;
              margin-top: 10px;
            }
          }
          
          /* Hover Effects */
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
            transition: all 0.3s ease;
          }
          
          .hover-scale:hover {
            transform: scale(1.02);
            transition: all 0.3s ease;
          }
          
          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2C5F8D;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          }
        `}
      </style>
      <div
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center", position: "relative" }}>
          <div style={{
            background: "#2C5F8D",
            borderRadius: "20px",
            padding: window.innerWidth <= 768 ? "30px 20px" : "40px 30px",
            marginBottom: "24px",
            boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Background Pattern */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
              animation: "float 6s ease-in-out infinite"
            }}></div>
            
            <Title
              level={2}
              style={{
                marginBottom: "12px",
                color: "white",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontWeight: "700",
                fontSize: "2.5rem",
                position: "relative",
                zIndex: 1
              }}
            >
              <BookOpen
                size={32}
                style={{ marginRight: "16px", color: "white", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
              />
              Công cụ Dịch thuật & Từ điển
            </Title>
            <Text style={{ 
              fontSize: "18px", 
              color: "rgba(255,255,255,0.9)",
              fontWeight: "400",
              position: "relative",
              zIndex: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)"
            }}>
              Dịch văn bản và tra cứu từ điển tiếng Anh một cách dễ dàng
            </Text>
            
            {/* Floating Elements */}
            <div style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              opacity: 0.6,
              animation: "bounce 3s ease-in-out infinite"
            }}>
              <Languages size={24} style={{ color: "white" }} />
            </div>
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "30px",
              opacity: 0.6,
              animation: "bounce 3s ease-in-out infinite 1s"
            }}>
              <Search size={20} style={{ color: "white" }} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card
          style={{
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "none",
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
            overflow: "hidden"
          }}
          className="fade-in-up"
        >
          <Tabs items={tabItems} size="large" centered type="card" />
        </Card>
      </div>
    </>
  );
};

export default Dictionary;
