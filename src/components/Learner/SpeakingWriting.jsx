import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Import services
import sectionService from "../../services/sectionsService";

const SpeakingWriting = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Luyện Nói & Viết | TOEIC Learning Platform";
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

  const getImageUrl = (imageName, sectionType) => {
    if (imageName) {
      return `http://localhost:5000/images/${imageName}`;
    }
    // Fallback images based on section type
    if (sectionType === 3) {
      // Speaking - Professional communication image
      return "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=face";
    } else if (sectionType === 4) {
      // Writing - Creative writing and composition image
      return "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center";
    }
    return "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center";
  };

  // Function to get local image path for better fallback
  const getLocalImagePath = (sectionType) => {
    if (sectionType === 3) {
      return "/conversation.png";
    } else if (sectionType === 4) {
      return "/writing.png";
    }
    return null;
  };

  const getFallbackImage = (sectionType) => {
    if (sectionType === 3) {
      // Speaking fallback - SVG with microphone icon
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50MCkiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZGllbnQwIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N0VFQTtzdG9wLW9wYWNpdHk6MSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3NjRCQTI7c3RvcC1vcGFjaXR5OjEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0QkEyO3N0b3Atb3BhY2l0eToxIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI2MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjkpIi8+CjxwYXRoIGQ9Ik0xNzAgMTQwSDE4MEwxODAgMTYwSDE3MFoiIGZpbGw9IiM2NjdFRUEiLz4KPHBhdGggZD0iTTIwMCAxNDBMMjEwIDE0MEwyMTAgMTYwTDIwMCAxNjBaIiBmaWxsPSIjNjY3RUVBIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+U1BFQUtJTkc8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+UHJhY3RpY2UgWW91ciBFbmdsaXNoPC90ZXh0Pgo8L3N2Zz4=";
    } else {
      // Writing fallback - SVG with pen icon
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50MCkiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZGllbnQwIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0YwOTNGQjtzdG9wLW9wYWNpdHk6MSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGNTU3NkM7c3RvcC1vcGFjaXR5OjEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjU1NzZDO3N0b3Atb3BhY2l0eToxIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI2MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIi8+CjxwYXRoIGQ9Ik0xODUgMTM1SDE4NUwxODUgMTY1SDE4NVoiIGZpbGw9IiNGNTU3NkMiLz4KPHBhdGggZD0iTTE3MCAxNTBMMjMwIDE1MEwyMzAgMTYwTDE3MCAxNjBaIiBmaWxsPSIjRjU1NzZDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+V1JJVElORzwvdGV4dD4KPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5J0xsIFdyaXRlIFlvdXIgVGhvdWdodHM8L3RleHQ+Cjwvc3ZnPg==";
    }
  };

  const handleImageError = (e, sectionType) => {
    const localImage = getLocalImagePath(sectionType);
    if (localImage && e.target.src !== localImage) {
      // Try local image first
      e.target.src = localImage;
    } else {
      // Fallback to beautiful SVG placeholder if local image also fails
      e.target.src = getFallbackImage(sectionType);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  const SectionCard = ({ section, sectionType }) => (
    <div className="col-lg-4 col-md-6 col-sm-12 mb-4 d-flex">
      <Link
        to={`/learner/practice-sw/${section._id || section.id}`}
        className="card text-decoration-none w-100 shadow-sm border-0"
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          background: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{
          height: '180px',
          overflow: 'hidden',
          position: 'relative',
          background: sectionType === 3
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }}>
          <img
            src={getImageUrl(section.image, sectionType)}
            className="card-img-top"
            alt={section.name}
            loading="lazy"
            onError={(e) => handleImageError(e, sectionType)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'scale-down',
              transition: 'transform 0.4s ease'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: sectionType === 3 ? '#667eea' : '#f5576c'
          }}>
            {sectionType === 3 ? '🗣️ Nói' : '✍️ Viết'}
          </div>
        </div>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h5 className="card-title fw-bold mb-3" style={{
            color: '#1e293b',
            fontSize: '1.1rem',
            lineHeight: '1.4'
          }}>
            {section.name}
          </h5>
          <p
            className="card-text text-muted mb-3"
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
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-muted">
              <i className="fas fa-clock me-1"></i>
              ~30 phút
            </small>
            <div style={{
              background: sectionType === 3 ? '#667eea' : '#f5576c',
              color: 'white',
              borderRadius: '15px',
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              Bắt đầu
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div>
      {/* Speaking Section */}
      {noiSections.length > 0 && (
        <div className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-3" style={{
              color: '#2c3e50',
              fontSize: '2.2rem',
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🗣️ NÓI - Speaking Practice
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              Phát triển kỹ năng giao tiếp và thuyết trình tiếng Anh
            </p>
          </div>
          <div className="row justify-content-center">
            {noiSections.map((section) => (
              <SectionCard key={section.id || section._id} section={section} sectionType={3} />
            ))}
          </div>
        </div>
      )}

      {/* Writing Section */}
      {vietSections.length > 0 && (
        <div className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-3" style={{
              color: '#2c3e50',
              fontSize: '2.2rem',
              background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ✍️ VIẾT - Writing Practice
            </h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              Nâng cao khả năng viết và diễn đạt ý tưởng bằng tiếng Anh
            </p>
          </div>
          <div className="row justify-content-center">
            {vietSections.map((section) => (
              <SectionCard key={section.id || section._id} section={section} sectionType={4} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {noiSections.length === 0 && vietSections.length === 0 && (
        <div className="text-center py-5">
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            opacity: '0.5'
          }}>
            📚
          </div>
          <h3 className="text-muted">Chưa có bài luyện tập nào</h3>
          <p className="text-muted">Các bài luyện tập sẽ được cập nhật sớm. Vui lòng quay lại sau!</p>
        </div>
      )}
    </div>
  );
};

export default SpeakingWriting;
