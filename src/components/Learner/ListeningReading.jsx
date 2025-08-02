import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ListeningReading.css";

// Import services
import sectionService from "../../../services/sectionsService";

const ListeningReading = () => {
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
  const ngheSections = sections.filter((section) => section.type === 1);
  const docSections = sections.filter((section) => section.type === 2);

  const getImageUrl = (imageName) => {
    if (imageName) {
      return `http://localhost:5000/images/${imageName}`;
    }
    return "http://localhost:5000/images/default-image.png";
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
      <h2 className="section-heading">NGHE</h2>
      <div className="row">
        {ngheSections.map((section) => (
          <div
            key={section.id}
            className="col-lg-3 col-md-6 col-sm-12 mb-4 d-flex"
          >
            <Link
              to={`/learner/practice/${section.id}`}
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

      <h2 className="section-heading">ĐỌC</h2>
      <div className="row">
        {docSections.map((section) => (
          <div
            key={section.id}
            className="col-lg-3 col-md-6 col-sm-12 mb-4 d-flex"
          >
            <Link
              to={`/learner/practice/${section.id}`}
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

export default ListeningReading;
