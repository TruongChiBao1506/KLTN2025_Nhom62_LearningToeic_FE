import React from 'react';
import './NotImplemented.css';

const NotImplemented = ({ 
  title = "Tính năng đang phát triển",
  icon = "🚧",
  description = "Tính năng này đang được phát triển và sẽ sớm ra mắt.",
  features = []
}) => {
  return (
    <div className="not-implemented-container">
      <div className="not-implemented-content">
        <div className="not-implemented-icon">
          {icon}
        </div>
        <h1 className="not-implemented-title">{title}</h1>
        <p className="not-implemented-description">{description}</p>
        
        {features.length > 0 && (
          <div className="not-implemented-features">
            <h3>Tính năng sẽ có:</h3>
            <ul>
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="not-implemented-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Quay lại
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/learner/dashboard'}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotImplemented;
