import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight, faBolt } from "@fortawesome/free-solid-svg-icons";
import SectionService from "../../../services/sectionsService";
import LessonService from "../../../services/lessonService";
import TestService from "../../../services/testService";
import "./style.css";

const Section = () => {
  const { sectionId } = useParams();
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);
  const [sectionName, setSectionName] = useState("");

  // Lấy danh sách tất cả sections đã được kích hoạt
  const retrieveSections = async () => {
    try {
      const response = await SectionService.allEnable();
      setSections(response);
    } catch (error) {
      console.log(error);
    }
  };

  // Lọc chỉ lấy các section liên quan đến Listening và Reading
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

  // Lấy danh sách lessons thuộc section hiện tại
  const retrieveLessons = async () => {
    try {
      console.log(sectionId);
      const response = await LessonService.getEnableLessonsBySection(sectionId);
      setLessons(response);
    } catch (error) {
      console.log(error);
    }
  };

  // Lấy danh sách tests thuộc section hiện tại
  const retrieveTests = async () => {
    try {
      console.log(sectionId);
      const response = await TestService.getEnableTestsBySection(sectionId);
      setTests(response);
      if (response && response.length > 0) {
        setSectionName(response[0].section.name);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    retrieveSections();
    retrieveLessons();
    retrieveTests();
  }, [sectionId]);

  return (
    <div className="container">
      <h1 className="text-center mt-5">
        <span>Luyện thi TOEIC LISTENING READING online 2023</span>
        <h4>{sectionName}</h4>
      </h1>

      <div className="row mt-5">
        <div className="col-lg-8 col-md-8 col-sm-8">
          <h5 className="fw-bold">BÀI HỌC:</h5>
          {lessons.map((lesson) => (
            <div className="card" key={lesson.lessonId}>
              <Link
                to={`/learner/section/${lesson.section.id}/lesson/${lesson.lessonId}`}
                className="card-body custom-card text-decoration-none"
              >
                <span className="card-text">{lesson.lessonName}</span>
                <FontAwesomeIcon
                  icon={faCircleArrowRight}
                  className="arrow-icon"
                />
              </Link>
            </div>
          ))}

          <div className="row my-3 d-flex justify-content-start">
            {tests.map((test) => (
              <div className="col-lg-2 col-md-2 col-sm-2" key={test.testId}>
                <div className="card mt-3">
                  <div className="card-body">
                    <div className="test-name">{test.testName}</div>
                    <div className="test-info">Tiến độ: 20%</div>
                    <div className="test-info">
                      Tham gia: {test.testParticipants}
                    </div>
                    <Link
                      to={`/learner/section/${test.section.id}/study/${test.testId}`}
                      className="btn btn-primary mt-2 custom-button"
                    >
                      Học
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
                to={`/learner/practice-lr/${section.id}`}
              >
                <span
                  className="card-text overflow-ellipsis"
                  title={section.name}
                >
                  {section.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section;
