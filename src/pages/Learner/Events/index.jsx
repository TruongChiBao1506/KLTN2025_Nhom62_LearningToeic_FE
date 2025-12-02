import React, { useState, useEffect } from 'react';
import './style.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data for events
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'TOEIC Listening Workshop',
        category: 'workshop',
        date: new Date('2024-12-15T14:00:00'),
        duration: 120,
        instructor: 'Ms. Sarah Johnson',
        maxParticipants: 50,
        currentParticipants: 32,
        price: 0,
        description: 'Intensive workshop focused on improving TOEIC listening skills with practical exercises and tips.',
        image: 'https://via.placeholder.com/300x200/667eea/white?text=Listening+Workshop',
        level: 'intermediate',
        isOnline: true,
        tags: ['listening', 'toeic', 'workshop'],
        agenda: [
          'Introduction to TOEIC Listening format',
          'Common question types and strategies',
          'Practice exercises with real audio',
          'Q&A session'
        ]
      },
      {
        id: 2,
        title: 'Business English Competition',
        category: 'competition',
        date: new Date('2024-12-20T09:00:00'),
        duration: 180,
        instructor: 'Mr. David Chen',
        maxParticipants: 100,
        currentParticipants: 78,
        price: 25000,
        description: 'Test your business English skills in this competitive event with prizes for top performers.',
        image: 'https://via.placeholder.com/300x200/764ba2/white?text=Business+Competition',
        level: 'advanced',
        isOnline: false,
        location: 'Conference Hall A, HCMC',
        tags: ['business', 'competition', 'prizes'],
        prizes: ['1st: $500', '2nd: $300', '3rd: $200'],
        agenda: [
          'Registration and check-in',
          'Written test (90 minutes)',
          'Speaking round (60 minutes)',
          'Awards ceremony'
        ]
      },
      {
        id: 3,
        title: 'Grammar Bootcamp',
        category: 'workshop',
        date: new Date('2024-12-12T19:00:00'),
        duration: 90,
        instructor: 'Dr. Emily Watson',
        maxParticipants: 30,
        currentParticipants: 25,
        price: 0,
        description: 'Intensive grammar session covering the most challenging aspects of English grammar for TOEIC.',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Grammar+Bootcamp',
        level: 'beginner',
        isOnline: true,
        tags: ['grammar', 'toeic', 'bootcamp'],
        agenda: [
          'Common grammar mistakes',
          'Tense usage in TOEIC',
          'Conditional sentences',
          'Practice quiz'
        ]
      },
      {
        id: 4,
        title: 'TOEIC Full Test Challenge',
        category: 'test',
        date: new Date('2024-12-25T10:00:00'),
        duration: 240,
        instructor: 'TOEIC Center',
        maxParticipants: 200,
        currentParticipants: 145,
        price: 15000,
        description: 'Take a full TOEIC practice test under exam conditions and receive detailed feedback.',
        image: 'https://via.placeholder.com/300x200/FF9800/white?text=Full+Test+Challenge',
        level: 'all',
        isOnline: false,
        location: 'TOEIC Test Center',
        tags: ['full-test', 'practice', 'feedback'],
        agenda: [
          'Test briefing and rules',
          'Listening section (45 minutes)',
          'Break (15 minutes)',
          'Reading section (75 minutes)',
          'Score analysis session'
        ]
      },
      {
        id: 5,
        title: 'Speaking Skills Masterclass',
        category: 'masterclass',
        date: new Date('2024-12-30T16:00:00'),
        duration: 150,
        instructor: 'Prof. Michael Brown',
        maxParticipants: 40,
        currentParticipants: 15,
        price: 50000,
        description: 'Advanced speaking techniques and confidence building for professional communication.',
        image: 'https://via.placeholder.com/300x200/9C27B0/white?text=Speaking+Masterclass',
        level: 'advanced',
        isOnline: true,
        tags: ['speaking', 'masterclass', 'professional'],
        agenda: [
          'Pronunciation and intonation',
          'Fluency building exercises',
          'Professional presentation skills',
          'Individual feedback session'
        ]
      },
      {
        id: 6,
        title: 'New Year Study Marathon',
        category: 'marathon',
        date: new Date('2025-01-01T08:00:00'),
        duration: 480,
        instructor: 'Multiple Instructors',
        maxParticipants: 500,
        currentParticipants: 89,
        price: 0,
        description: 'Start the new year with an 8-hour intensive study session covering all TOEIC sections.',
        image: 'https://via.placeholder.com/300x200/F44336/white?text=Study+Marathon',
        level: 'all',
        isOnline: true,
        tags: ['marathon', 'intensive', 'new-year'],
        agenda: [
          'Opening ceremony',
          'Listening practice (2 hours)',
          'Reading practice (2 hours)',
          'Lunch break',
          'Grammar review (2 hours)',
          'Vocabulary building (2 hours)',
          'Closing ceremony'
        ]
      }
    ];

    setEvents(mockEvents);
    
    // Mock registered events
    setMyEvents([1, 3]); // User is registered for events 1 and 3
  }, []);

  const filteredEvents = events.filter(event => {
    if (selectedCategory === 'all') return true;
    return event.category === selectedCategory;
  });

  const upcomingEvents = filteredEvents.filter(event => event.date > new Date());
  const pastEvents = filteredEvents.filter(event => event.date < new Date());

  const registerForEvent = (eventId) => {
    if (!myEvents.includes(eventId)) {
      setMyEvents(prev => [...prev, eventId]);
      // Update participant count
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, currentParticipants: event.currentParticipants + 1 }
          : event
      ));
    }
  };

  const unregisterFromEvent = (eventId) => {
    setMyEvents(prev => prev.filter(id => id !== eventId));
    // Update participant count
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) }
        : event
    ));
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      workshop: '#4CAF50',
      competition: '#FF9800',
      masterclass: '#9C27B0',
      test: '#2196F3',
      marathon: '#F44336'
    };
    return colors[category] || 'var(--color-text-secondary)';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      workshop: '🛠️',
      competition: '🏆',
      masterclass: '🎓',
      test: '📝',
      marathon: '🏃‍♂️'
    };
    return icons[category] || '📅';
  };

  const eventsToShow = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>📅 Sự kiện TOEIC</h1>
        <p>Tham gia các workshop, cuộc thi và sự kiện học tập để nâng cao kỹ năng TOEIC của bạn</p>
      </div>

      <div className="events-content">
        <div className="events-filters">
          <div className="tab-filters">
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Sắp diễn ra ({upcomingEvents.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Đã qua ({pastEvents.length})
            </button>
          </div>

          <div className="category-filters">
            <label>Loại sự kiện:</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="workshop">Workshop</option>
              <option value="competition">Cuộc thi</option>
              <option value="masterclass">Masterclass</option>
              <option value="test">Kiểm tra</option>
              <option value="marathon">Marathon</option>
            </select>
          </div>
        </div>

        <div className="events-grid">
          {eventsToShow.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <img src={event.image} alt={event.title} />
                <div className="event-category" style={{ backgroundColor: getCategoryColor(event.category) }}>
                  {getCategoryIcon(event.category)} {event.category}
                </div>
              </div>

              <div className="event-content">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="event-meta">
                    <span className="event-date">{formatDate(event.date)}</span>
                    <span className="event-duration">{event.duration} phút</span>
                  </div>
                </div>

                <p className="event-description">{event.description}</p>

                <div className="event-details">
                  <div className="detail-item">
                    <span className="label">Giảng viên:</span>
                    <span className="value">{event.instructor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Cấp độ:</span>
                    <span className="value">{event.level}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Hình thức:</span>
                    <span className="value">{event.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  {!event.isOnline && event.location && (
                    <div className="detail-item">
                      <span className="label">Địa điểm:</span>
                      <span className="value">{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="event-stats">
                  <div className="participants">
                    <span>👥 {event.currentParticipants}/{event.maxParticipants}</span>
                  </div>
                  <div className="price">
                    <span>{formatPrice(event.price)}</span>
                  </div>
                </div>

                <div className="event-actions">
                  <button 
                    className="btn-details"
                    onClick={() => openEventModal(event)}
                  >
                    Chi tiết
                  </button>
                  
                  {activeTab === 'upcoming' && (
                    myEvents.includes(event.id) ? (
                      <button 
                        className="btn-unregister"
                        onClick={() => unregisterFromEvent(event.id)}
                      >
                        Hủy đăng ký
                      </button>
                    ) : (
                      <button 
                        className="btn-register"
                        onClick={() => registerForEvent(event.id)}
                        disabled={event.currentParticipants >= event.maxParticipants}
                      >
                        {event.currentParticipants >= event.maxParticipants ? 'Hết chỗ' : 'Đăng ký'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {eventsToShow.length === 0 && (
          <div className="no-events">
            <h3>Không có sự kiện nào</h3>
            <p>Hiện tại không có sự kiện nào trong danh mục này.</p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="modal-image" />
              
              <div className="modal-info">
                <div className="info-grid">
                  <div className="info-item">
                    <strong>📅 Thời gian:</strong> {formatDate(selectedEvent.date)}
                  </div>
                  <div className="info-item">
                    <strong>⏱️ Thời lượng:</strong> {selectedEvent.duration} phút
                  </div>
                  <div className="info-item">
                    <strong>👨‍🏫 Giảng viên:</strong> {selectedEvent.instructor}
                  </div>
                  <div className="info-item">
                    <strong>📊 Cấp độ:</strong> {selectedEvent.level}
                  </div>
                  <div className="info-item">
                    <strong>💰 Giá:</strong> {formatPrice(selectedEvent.price)}
                  </div>
                  <div className="info-item">
                    <strong>👥 Số người:</strong> {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
                  </div>
                </div>

                <div className="description">
                  <h4>Mô tả:</h4>
                  <p>{selectedEvent.description}</p>
                </div>

                <div className="agenda">
                  <h4>Chương trình:</h4>
                  <ul>
                    {selectedEvent.agenda.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {selectedEvent.prizes && (
                  <div className="prizes">
                    <h4>Giải thưởng:</h4>
                    <ul>
                      {selectedEvent.prizes.map((prize, index) => (
                        <li key={index}>{prize}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="tags">
                  {selectedEvent.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {new Date(selectedEvent.date) > new Date() && (
                myEvents.includes(selectedEvent.id) ? (
                  <button 
                    className="btn-unregister"
                    onClick={() => {
                      unregisterFromEvent(selectedEvent.id);
                      setShowModal(false);
                    }}
                  >
                    Hủy đăng ký
                  </button>
                ) : (
                  <button 
                    className="btn-register"
                    onClick={() => {
                      registerForEvent(selectedEvent.id);
                      setShowModal(false);
                    }}
                    disabled={selectedEvent.currentParticipants >= selectedEvent.maxParticipants}
                  >
                    {selectedEvent.currentParticipants >= selectedEvent.maxParticipants ? 'Hết chỗ' : 'Đăng ký ngay'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Events Summary */}
      <div className="my-events-summary">
        <h3>📋 Sự kiện của tôi</h3>
        <div className="my-events-stats">
          <div className="stat-item">
            <span className="stat-number">{myEvents.length}</span>
            <span className="stat-label">Đã đăng ký</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {events.filter(e => myEvents.includes(e.id) && e.date > new Date()).length}
            </span>
            <span className="stat-label">Sắp tới</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {events.filter(e => myEvents.includes(e.id) && e.date < new Date()).length}
            </span>
            <span className="stat-label">Đã tham gia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
