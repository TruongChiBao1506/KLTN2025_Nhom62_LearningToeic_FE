import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SpeakingWriting.css";

// Import services
import sectionService from "../../../services/sectionsService";

const SpeakingWriting = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await sectionService.getAllEnabled();
        setSections(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu các phần học:", error);
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Lọc sections theo loại
  const noiSections = sections.filter((section) => section.type === 3);
  const vietSections = sections.filter((section) => section.type === 4);

  const getImageUrl = (imageName) => {
    if (imageName) {
      return `http://localhost:9004/images/${imageName}`;
    }
    return "http://localhost:9004/images/default-image.png";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-heading">NÓI</h2>
      <div className="row">
        {noiSections.map((section) => (
          <div
            key={section.id}
            className="col-lg-3 col-md-6 col-sm-12 mb-4 d-flex"
          >
            <Link
              to={`/learner/practice-sw/${section.id}`}
              className="card text-decoration-none section-card w-100"
            >
              <div className="card-image">
                <img
                  src={getImageUrl(section.image)}
                  className="card-img-top"
                  alt={section.name}
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <p className="fw-bolder underline-hover">{section.name}</p>
                <p
                  className="card-text overflow-ellipsis"
                  title={section.description}
                >
                  {section.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <h2 className="section-heading">VIẾT</h2>
      <div className="row">
        {vietSections.map((section) => (
          <div
            key={section.id}
            className="col-lg-3 col-md-6 col-sm-12 mb-4 d-flex"
          >
            <Link
              to={`/learner/practice-sw/${section.id}`}
              className="card text-decoration-none section-card w-100"
            >
              <div className="card-image">
                <img
                  src={getImageUrl(section.image)}
                  className="card-img-top"
                  alt={section.name}
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <p className="fw-bolder underline-hover">{section.name}</p>
                <p
                  className="card-text overflow-ellipsis"
                  title={section.description}
                >
                  {section.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeakingWriting;
