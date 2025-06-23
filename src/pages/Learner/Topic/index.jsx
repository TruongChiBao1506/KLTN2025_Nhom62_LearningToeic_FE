import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faBolt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import sectionService from "../../../services/sectionsService";

const Topic = () => {
  // States
  const [topics, setTopics] = useState([]);
  const [sections, setSections] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch topics and sections
    const fetchData = async () => {
      try {
        const topicResponse = await topicService.getAllEnabled();
        setTopics(topicResponse.data);

        const sectionResponse = await sectionService.getAllEnabled();
        setSections(sectionResponse.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu chủ đề:", error);
        toast.error("Không thể tải dữ liệu chủ đề. Vui lòng thử lại sau.");
      }
    };

    fetchData();
  }, []);

  // Filtered topics based on search
  const filteredTopics = topics.filter((topic) => {
    if (!transcript) return true;
    return Object.values(topic).some((value) =>
      String(value).toLowerCase().includes(transcript.toLowerCase())
    );
  });

  // Filtered sections for reading and listening
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

  const getImageUrl = (imageName) => {
    if (imageName) {
      return `http://localhost:9004/images/${imageName}`;
    }
    return "http://localhost:9004/images/default-image.png";
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;

    setIsSpeaking(true);

    recognitionRef.current.addEventListener("result", (event) => {
      const lastResultIndex = event.results.length - 1;
      setTranscript(event.results[lastResultIndex][0].transcript);
    });

    recognitionRef.current.addEventListener("end", () => {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    });

    recognitionRef.current.start();
  };

  return (
    <div className="container">
      <h1 className="text-center mt-5">
        <span>HỌC TỪ VỰNG TOEIC THEO CHỦ ĐỀ</span>
      </h1>

      <div className="row mt-5">
        <div className="col-lg col-md col-sm">
          <div className="d-flex justify-content-center mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Tìm kiếm"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-light-emphasis"
                  onClick={startSpeechRecognition}
                >
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className={isSpeaking ? "active" : ""}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="card specific-card border-0">
            <div className="card-body lesson-content">
              <div className="row">
                {filteredTopics.map((topic) => (
                  <div
                    className="col-lg-6 col-md-6 col-sm-6"
                    key={topic.topicId}
                  >
                    <Link
                      to={`/learner/topic/${topic.topicId}`}
                      className="card mb-2 text-decoration-none border-0 shadow-lg"
                    >
                      <div className="card-body test row">
                        <div className="col-lg-3">
                          <img
                            src={getImageUrl(topic.image)}
                            className="card-img-top"
                            alt={`Ảnh chủ đề ${topic.topicName}`}
                            loading="lazy"
                          />
                        </div>
                        <div className="col-lg-9">
                          <span className="grammar-name ms-2 text-uppercase">
                            {topic.topicName}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-4 col-sm-4 text-decoration-none">
          <h5 className="fw-bold">
            <FontAwesomeIcon icon={faBolt} className="text-warning me-2" />
            LUYỆN TẬP KHÁC:
          </h5>
          {docngheSections.map((section) => (
            <div className="card mb-2" key={section.id}>
              <Link
                className="card-body text-decoration-none custom-card"
                to={`/learner/practice/${section.id}`}
              >
                {section.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topic;
