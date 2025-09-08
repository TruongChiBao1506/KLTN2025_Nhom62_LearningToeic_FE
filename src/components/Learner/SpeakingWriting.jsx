import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Import services
import sectionService from "../../services/sectionsService";

const SpeakingWriting = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await sectionService.allEnable();
        setSections(response);
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
      <h2 className="text-center mb-4" style={{ color: '#2c3e50', fontWeight: '700' }}>NÓI</h2>
      <div className="row">
        {noiSections.map((section) => (
          <div
            key={section.id}
            className="col-lg-3 col-md-6 col-sm-12 mb-4 d-flex"
          >
            <Link
              to={`/learner/practice-sw/${section.id}`}
              className="card text-decoration-none w-100 shadow-sm"
              style={{ 
                border: 'none', 
                borderRadius: '16px', 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src={getImageUrl(section.image)}
                  className="card-img-top"
                  alt={section.name}
                  loading="lazy"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <p className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '1.1rem' }}>
                  {section.name}
                </p>
                <p
                  className="card-text text-muted"
                  style={{ 
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                  title={section.description}
                >
                  {section.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <h2 className="text-center mb-4 mt-5" style={{ color: '#2c3e50', fontWeight: '700' }}>VIẾT</h2>
      <div className="row">
        {vietSections.map((section) => (
          <div
            key={section.id}
            className="col-lg-3 col-md-6 col-sm-12 mb-4 d-flex"
          >
            <Link
              to={`/learner/practice-sw/${section.id}`}
              className="card text-decoration-none w-100 shadow-sm"
              style={{ 
                border: 'none', 
                borderRadius: '16px', 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src={getImageUrl(section.image)}
                  className="card-img-top"
                  alt={section.name}
                  loading="lazy"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <p className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '1.1rem' }}>
                  {section.name}
                </p>
                <p
                  className="card-text text-muted"
                  style={{ 
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
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
