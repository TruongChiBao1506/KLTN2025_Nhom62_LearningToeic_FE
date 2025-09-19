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
          message.success("Dịch thành công!");
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
    message.info("Đang phát âm...");

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
      message.info("Đang phát âm từ vựng");
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
    <div style={{ padding: "16px 0" }}>
      {/* Translation Mode Selector */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #d6e4ff",
        }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <Languages size={20} style={{ color: "#1890ff" }} />
          </Col>
          <Col flex="auto">
            <Select
              value={translationMode}
              onChange={handleTranslationModeChange}
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="en-vi">
                <Space>
                  <Globe size={16} />
                  Tiếng Anh → Tiếng Việt
                </Space>
              </Option>
              <Option value="vi-en">
                <Space>
                  <Globe size={16} />
                  Tiếng Việt → Tiếng Anh
                </Space>
              </Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Translation Interface */}
      <Row gutter={16}>
        {/* Input Column */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileText size={16} />
                Văn bản gốc
              </Space>
            }
            style={{ borderRadius: "12px" }}
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
                    isTranslating ? <MicOff size={14} /> : <Mic size={14} />
                  }
                  onClick={
                    isTranslating
                      ? stopTranslationSpeechRecognition
                      : startTranslationSpeechRecognition
                  }
                  loading={isTranslating}
                >
                  {isTranslating ? "Dừng" : "Ghi âm"}
                </Button>
                <Button
                  size="small"
                  icon={<RotateCcw size={14} />}
                  onClick={clearTranslation}
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
                  borderColor: isListening ? "#ff4d4f" : undefined,
                  borderWidth: isListening ? "2px" : "1px",
                  boxShadow: isListening
                    ? "0 0 10px rgba(255, 77, 79, 0.3)"
                    : undefined,
                }}
              />
              {isListening && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#ff4d4f",
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
                  color: characterCount > 4000 ? "#ff4d4f" : "#8c8c8c",
                }}
              >
                {characterCount}/5000
              </div>
            </div>
            {characterCount > 4000 && (
              <Progress
                percent={(characterCount / 5000) * 100}
                size="small"
                strokeColor="#ff4d4f"
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
                <Languages size={16} />
                Bản dịch
                {translating && <Spin size="small" />}
              </Space>
            }
            style={{ borderRadius: "12px" }}
            extra={
              <Button
                type={isPlaying ? "danger" : "primary"}
                ghost
                size="small"
                icon={isPlaying ? <Pause size={14} /> : <Volume2 size={14} />}
                onClick={
                  isPlaying
                    ? stopConvertedTextSpeech
                    : convertTranslatedTextToSpeech
                }
                disabled={!translatedTextTemp.trim()}
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
                background: "#fafafa",
              }}
            />
            {translating && (
              <div
                style={{
                  marginTop: "8px",
                  textAlign: "center",
                  color: "#1890ff",
                }}
              >
                <Spin size="small" /> Đang dịch...
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Dictionary Tab Content
  const dictionaryContent = (
    <div style={{ padding: "16px 0" }}>
      {/* Search Box */}
      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          border: "1px solid #d6e4ff",
        }}
      >
        <Row gutter={12}>
          <Col flex="auto">
            <Input
              size="large"
              placeholder="Nhập từ cần tra cứu..."
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onPressEnter={() => searchWord()}
              prefix={<Search size={16} style={{ color: "#8c8c8c" }} />}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Search size={16} />}
              onClick={() => searchWord()}
              loading={searching}
              style={{ borderRadius: "6px" }}
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
                    borderRadius: "8px",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                    border: "1px solid #d9d9d9",
                  }}
                >
                  <Card
                    title={
                      <Space>
                        <History size={16} />
                        Lịch sử tìm kiếm
                        <Badge count={searchHistory.length} />
                      </Space>
                    }
                    style={{
                      width: 350,
                      maxHeight: 400,
                      overflow: "auto",
                      border: "none",
                    }}
                    extra={
                      <Button
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={clearHistory}
                        disabled={searchHistory.length === 0}
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
                              e.currentTarget.style.backgroundColor = "#f5f5f5";
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
                                <Clock size={16} style={{ color: "#1890ff" }} />
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
                        description="Chưa có lịch sử tìm kiếm"
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
                    <History size={16} />
                  </Badge>
                }
                style={{ borderRadius: "6px" }}
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
                    borderRadius: "8px",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                    border: "1px solid #d9d9d9",
                  }}
                >
                  <Card
                    title={
                      <Space>
                        <Heart size={16} />
                        Từ yêu thích
                        <Badge count={bookmarkedWords.length} />
                      </Space>
                    }
                    style={{
                      width: 350,
                      maxHeight: 400,
                      overflow: "auto",
                      border: "none",
                    }}
                    extra={
                      <Button
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={clearBookmarks}
                        disabled={bookmarkedWords.length === 0}
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
                              e.currentTarget.style.backgroundColor = "#f5f5f5";
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
                                <Star size={16} style={{ color: "#faad14" }} />
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
                        description="Chưa có từ yêu thích"
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
                    <Heart size={16} />
                  </Badge>
                }
                style={{ borderRadius: "6px" }}
              >
                Yêu thích
              </Button>
            </Dropdown>
          </Col>
          <Col>
            <Button
              size="large"
              icon={<RotateCcw size={16} />}
              onClick={clearDictionary}
              style={{ borderRadius: "6px" }}
            >
              Xóa
            </Button>
          </Col>
          <Col>
            <Button
              size="large"
              type="dashed"
              onClick={addSampleData}
              style={{ borderRadius: "6px", color: "#722ed1" }}
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
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {searching ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px", color: "#1890ff" }}>
                Đang tìm kiếm từ điển...
              </div>
            </div>
          ) : (
            <>
              {/* Word Header */}
              <div style={{ marginBottom: "20px" }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        color: "#1890ff",
                        textTransform: "capitalize",
                      }}
                    >
                      {lastSearchedWord}
                    </Title>
                  </Col>
                  <Col>
                    <Space>
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
                              <Heart size={16} />
                            ) : (
                              <Heart size={16} />
                            )
                          }
                          onClick={() =>
                            toggleBookmark(
                              lastSearchedWord,
                              definition,
                              phonetic
                            )
                          }
                          style={{ borderRadius: "6px" }}
                        >
                          {isBookmarked ? "Đã yêu thích" : "Yêu thích"}
                        </Button>
                      </Tooltip>
                      {audioSrc && (
                        <Button
                          type="primary"
                          ghost
                          icon={<Volume2 size={16} />}
                          onClick={playSound}
                          style={{ borderRadius: "6px" }}
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
                  <div style={{ marginTop: "12px" }}>
                    {phonetic && (
                      <Tag color="green" style={{ marginRight: "8px" }}>
                        {phonetic}
                      </Tag>
                    )}
                    {partOfSpeech && <Tag color="blue">{partOfSpeech}</Tag>}
                  </div>
                )}
              </div>

              {/* Definitions */}
              {Array.isArray(definition) && definition.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <Title level={4} style={{ color: "#262626" }}>
                    <BookOpen size={18} style={{ marginRight: "8px" }} />
                    Định nghĩa
                  </Title>
                  {definition.map((meaning, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{
                        marginBottom: "12px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          color: "#1890ff",
                          marginBottom: "8px",
                          textTransform: "capitalize",
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
                        <Title level={5} style={{ color: "#52c41a" }}>
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
                        <Title level={5} style={{ color: "#ff4d4f" }}>
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
                  <Title level={3} style={{ color: "#1890ff" }}>
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
                            <Clock size={16} style={{ color: "#1890ff" }} />
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
                  <Title level={3} style={{ color: "#faad14" }}>
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
                            <Star size={16} style={{ color: "#faad14" }} />
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
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <Title
            level={2}
            style={{
              marginBottom: "8px",
              background: "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%) text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <BookOpen
              size={28}
              style={{ marginRight: "12px", color: "rgb(102, 126, 234)" }}
            />
            Công cụ Dịch thuật & Từ điển
          </Title>
          <Text type="secondary" style={{ fontSize: "16px", background: "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%) text" }}>
            Dịch văn bản và tra cứu từ điển tiếng Anh một cách dễ dàng
          </Text>
        </div>

        {/* Main Content */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <Tabs items={tabItems} size="large" centered type="card" />
        </Card>
      </div>
    </>
  );
};

export default Dictionary;
