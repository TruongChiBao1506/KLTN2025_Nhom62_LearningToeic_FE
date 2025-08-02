import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import LessonService from "../../../services/lessonService";
import TestService from "../../../services/testService";
import LessonContentService from "../../../services/lessonContentService";
import "./style.css";

const Lesson = () => {
  const { sectionId, lessonId } = useParams();
  const [lessonContents, setLessonContents] = useState([]);
  const [lessonName, setLessonName] = useState("");
  const [lessons, setLessons] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [tests, setTests] = useState([]);

  // Lấy nội dung bài học
  const retrieveLessonContents = async () => {
    try {
      console.log(lessonId);
      const response =
        await LessonContentService.getEnableLessonContentsByLesson(lessonId);
      setLessonContents(response);
      if (response && response.length > 0) {
        setLessonName(response[0].lesson.lessonName);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Lấy danh sách các bài học trong cùng section
  const retrieveLessons = async () => {
    try {
      console.log(sectionId);
      const response = await LessonService.getEnableLessonsBySection(sectionId);
      setLessons(response);
      if (response && response.length > 0) {
        setSectionName(response[0].section.name);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Lấy danh sách các bài kiểm tra trong cùng section
  const retrieveTests = async () => {
    try {
      console.log(sectionId);
      const response = await TestService.getEnableTestsBySection(sectionId);
      setTests(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    retrieveLessonContents();
    retrieveLessons();
    retrieveTests();
  }, [sectionId, lessonId]);

  return (
    <div className="container">
      <h1 className="text-center mt-5">
        <span>{sectionName}</span>
      </h1>
      <div className="row mt-5">
        <div className="col-lg col-md col-sm">
          <div className="card specific-card">
            <div
              className="card-body lesson-content"
              style={{ minHeight: "500px" }}
            >
              <h4 className="card-title text-center lesson-title mb-3">
                <span>{lessonName}</span>
              </h4>
              {lessonContents.map((lessonContent) => (
                <div key={lessonContent.contentId} className="mb-2">
                  <h4 className="card-subtitle mb-2 text-body-secondary lesson-subtitle">
                    <span className="highlight">{lessonContent.title}</span>
                  </h4>
                  <p
                    className="card-text"
                    dangerouslySetInnerHTML={{ __html: lessonContent.content }}
                  ></p>
                </div>
              ))}
              <div
                className="warning"
                style={{ marginBottom: "15px", padding: "4px 12px" }}
              >
                <p className="d-flex align-items-center">
                  <strong>Lưu ý!</strong> Hãy nhớ học từ vựng trước khi làm bài
                  kiểm tra
                </p>
              </div>
              <FontAwesomeIcon icon={faBook} className="book-icon" />
            </div>
          </div>

          <div className="row d-flex justify-content-start">
            {tests.map((test) => (
              <div className="col-lg-2 col-md-2 col-sm-2" key={test.testId}>
                <div className="card my-3">
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
          {lessons.map((lesson) => (
            <div className="card mb-2" key={lesson.lessonId}>
              <Link
                to={`/learner/section/${lesson.section.id}/lesson/${lesson.lessonId}`}
                className="card-body custom-card text-decoration-none"
              >
                <span
                  className="card-text overflow-ellipsis"
                  title={lesson.lessonName}
                >
                  {lesson.lessonName}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
