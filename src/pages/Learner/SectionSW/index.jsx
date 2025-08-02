import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import SectionService from "../../../services/sectionsService";
import TestService from "../../../services/testService";
// import "./style.css";

const SectionSW = () => {
  const { sectionId } = useParams();
  const [sections, setSections] = useState([]);
  const [tests, setTests] = useState([]);
  const [sectionName, setSectionName] = useState("");

  // Lấy danh sách tất cả sections đã được kích hoạt
  const retrieveSections = useCallback(async () => {
    try {
      const response = await SectionService.allEnable();
      setSections(response);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // Lọc chỉ lấy các section liên quan đến Speaking và Writing
  const noivietSections = sections.filter(
    (section) => section.type === 3 || section.type === 4
  );

  // Lấy danh sách tests thuộc section hiện tại
  const retrieveTests = useCallback(async () => {
    if (!sectionId) return;
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
  }, [sectionId]);

  useEffect(() => {
    retrieveSections();
    if (sectionId) {
      retrieveTests();
    }
  }, [sectionId, retrieveSections, retrieveTests]);

  return (
    <div className="container">
      <h1 className="mt-5 text-center">
        <span>Luyện thi TOEIC SPEAKING WRITING online 2023</span>
        <h4>{sectionName}</h4>
      </h1>

      <div className="mt-5 row">
        <div className="col-lg-8 col-md-8 col-sm-8">
          <div className="my-3 row d-flex justify-content-start">
            <h5 className="fw-bold">BÀI KIỂM TRA:</h5>
            {tests.map((test) => (
              <div className="col-lg-2 col-md-2 col-sm-2" key={test.testId}>
                <div className="mt-3 card">
                  <div className="card-body">
                    <div className="test-name">{test.testName}</div>
                    <div className="test-info">Tiến độ: 20%</div>
                    <div className="test-info">
                      Tham gia: {test.testParticipants}
                    </div>
                    <Link
                      to={`/learner/section/${test.section.id}/study-sw/${test.testId}`}
                      className="mt-2 btn btn-primary custom-button"
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
          {noivietSections.map((section) => (
            <div className="mb-2 card" key={section.id}>
              <Link
                className="card-body text-decoration-none custom-card"
                to={`/learner/practice-sw/${section.id}`}
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

export default SectionSW;
