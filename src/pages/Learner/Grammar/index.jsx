import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpenReader,
  faBolt,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import grammarService from "../../../services/grammarService";
import sectionService from "../../../services/sectionsService";

const Grammar = () => {
  // States
  const [grammars, setGrammars] = useState([]);
  const [sections, setSections] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch grammars and sections
    const fetchData = async () => {
      try {
        const grammarResponse = await grammarService.getAllEnabled();
        setGrammars(grammarResponse.data);

        const sectionResponse = await sectionService.getAllEnabled();
        setSections(sectionResponse.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ngữ pháp:", error);
        toast.error("Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
      }
    };

    fetchData();
  }, []);

  // Filtered grammars based on search
  const filteredGrammars = grammars.filter((grammar) => {
    if (!transcript) return true;
    return Object.values(grammar).some((value) =>
      String(value).toLowerCase().includes(transcript.toLowerCase())
    );
  });

  // Filtered sections for reading and listening
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

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

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center mt-5">
        <span>LUYỆN NGỮ PHÁP TOEIC</span>
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

          <div className="card specific-card">
            <div className="card-body lesson-content">
              <div className="row">
                {filteredGrammars.map((grammar) => (
                  <div
                    className="col-lg-6 col-md-6 col-sm-6"
                    key={grammar.grammarId}
                  >
                    <Link
                      to={`/learner/grammar/${grammar.grammarId}`}
                      className="card mb-2 text-decoration-none"
                    >
                      <div className="card-body test">
                        <span className="icon-container">
                          <FontAwesomeIcon
                            icon={faBookOpenReader}
                            className="text-white"
                          />
                        </span>
                        <span className="grammar-name">
                          {grammar.grammarName}
                        </span>
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

export default Grammar;
