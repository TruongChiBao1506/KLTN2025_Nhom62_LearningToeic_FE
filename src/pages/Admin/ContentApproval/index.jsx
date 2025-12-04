import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  DatePicker,
  Avatar,
  Typography,
  message,
  Descriptions,
  Breadcrumb,
  Tabs
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  FileTextOutlined,
  EditOutlined,
  FormOutlined
} from '@ant-design/icons';
import moment from 'moment';
import socketService from '../../../services/socketService';
import topicSubmissionService from '../../../services/topicSubmissionService';
import lessonSubmissionService from '../../../services/lessonSubmissionService';
import grammarSubmissionService from '../../../services/grammarSubmissionService';
import testSubmissionService from '../../../services/testSubmissionService';
import examSubmissionService from '../../../services/examSubmissionService';
import './style.css';

const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ContentApproval = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('topic'); // Default tab
  
  // Separate state for each content type
  const [topicData, setTopicData] = useState([]);
  const [lessonData, setLessonData] = useState([]);
  const [grammarData, setGrammarData] = useState([]);
  const [testData, setTestData] = useState([]);
  const [examData, setExamData] = useState([]);
  
  // Counts for badges
  const [counts, setCounts] = useState({
    topic: 0,
    lesson: 0,
    grammar: 0,
    test: 0,
    exam: 0,
    total: 0
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // ✅ Fetch pending topics
  const fetchPendingTopics = useCallback(async () => {
    try {
      const response = await topicSubmissionService.getPendingTopics();
      
      if (response.success) {
        const topicCount = response.data?.length || 0;
        setTopicData(response.data || []);
        setCounts(prev => ({ 
          ...prev, 
          topic: topicCount,
          total: topicCount + prev.lesson + prev.grammar + prev.test + prev.exam
        }));
      }
    } catch (error) {
      console.error('Failed to load pending topics:', error);
      setTopicData([]);
      // ❌ Chỉ log error, không spam message khi reload
      // message.error(error.response?.data?.message || 'Failed to load pending topics');
    }
  }, []);

  // ✅ Fetch pending lessons
  const fetchPendingLessons = useCallback(async () => {
    try {
      const response = await lessonSubmissionService.getPendingLessons();
      
      if (response.success) {
        const lessonCount = response.data?.length || 0;
        setLessonData(response.data || []);
        setCounts(prev => ({ 
          ...prev, 
          lesson: lessonCount,
          total: prev.topic + lessonCount + prev.grammar + prev.test + prev.exam
        }));
      }
    } catch (error) {
      console.error('Failed to load pending lessons:', error);
      setLessonData([]);
      // ❌ Chỉ log error, không spam message khi reload
      // message.error(error.response?.data?.message || 'Failed to load pending lessons');
    }
  }, []);

  // ✅ Fetch pending grammar
  const fetchPendingGrammar = useCallback(async () => {
    try {
      const response = await grammarSubmissionService.getPendingGrammars();
      
      if (response.success) {
        const grammarCount = response.data?.length || 0;
        setGrammarData(response.data || []);
        setCounts(prev => ({ 
          ...prev, 
          grammar: grammarCount,
          total: prev.topic + prev.lesson + grammarCount + prev.test + prev.exam
        }));
      }
    } catch (error) {
      console.error('Failed to load pending grammar:', error);
      setGrammarData([]);
      // ❌ Chỉ log error, không spam message khi reload
      // message.error(error.response?.data?.message || 'Failed to load pending grammar');
    }
  }, []);

  // ✅ Fetch pending tests
  const fetchPendingTests = useCallback(async () => {
    try {
      const response = await testSubmissionService.getPendingTests();
      
      if (response.success) {
        const testCount = response.data?.length || 0;
        setTestData(response.data || []);
        setCounts(prev => ({ 
          ...prev, 
          test: testCount,
          total: prev.topic + prev.lesson + prev.grammar + testCount + prev.exam
        }));
      }
    } catch (error) {
      console.error('Failed to load pending tests:', error);
      setTestData([]);
      // ❌ Chỉ log error, không spam message khi reload
      // message.error(error.response?.data?.message || 'Failed to load pending tests');
    }
  }, []);

  // ✅ Fetch pending exams
  const fetchPendingExams = useCallback(async () => {
    try {
      const response = await examSubmissionService.getPendingExams();
      
      if (response.success && Array.isArray(response.data)) {
        const formattedExams = response.data.map(exam => ({
          id: exam._id,
          title: exam.examName,
          contentType: 'exam',
          status: exam.examStatus,
          submittedAt: exam.submittedAt,
          createdBy: exam.createdBy,
          statistics: exam.statistics || {},
          rawData: exam
        }));
        
        const examCount = formattedExams.length;
        setExamData(formattedExams);
        setCounts(prev => ({ 
          ...prev, 
          exam: examCount,
          total: prev.topic + prev.lesson + prev.grammar + prev.test + examCount
        }));
      } else {
        setExamData([]);
        setCounts(prev => ({ 
          ...prev, 
          exam: 0,
          total: prev.topic + prev.lesson + prev.grammar + prev.test
        }));
      }
    } catch (error) {
      console.error('Failed to load pending exams:', error);
      setExamData([]);
      setCounts(prev => ({ 
        ...prev, 
        exam: 0,
        total: prev.topic + prev.lesson + prev.grammar + prev.test
      }));
      // ❌ Không hiển thị message.error để tránh spam khi reload
      // message.error('Failed to load pending exams');
    }
  }, []);

  // ✅ Fetch all pending content
  const fetchAllPendingContent = useCallback(async () => {
    try {
      // Reset counts first
      setCounts({
        topic: 0,
        lesson: 0,
        grammar: 0,
        test: 0,
        exam: 0,
        total: 0
      });
      
      await Promise.all([
        fetchPendingTopics(),
        fetchPendingLessons(),
        fetchPendingGrammar(),
        fetchPendingTests(),
        fetchPendingExams()
      ]);
    } catch (error) {
      message.error('Failed to load pending content');
      console.error(error);
    }
  }, [fetchPendingTopics, fetchPendingLessons, fetchPendingGrammar, fetchPendingTests, fetchPendingExams]);

  // ✅ Handle real-time notifications
  const handleNewPendingContent = useCallback((data) => {
    message.info(`New ${data.contentType} pending approval!`);
    
    // Refresh specific content type
    switch(data.contentType) {
      case 'topic':
        fetchPendingTopics();
        break;
      case 'lesson':
        fetchPendingLessons();
        break;
      case 'grammar':
        fetchPendingGrammar();
        break;
      case 'test':
        fetchPendingTests();
        break;
      case 'exam':
        fetchPendingExams();
        break;
      default:
        break;
    }
  }, [fetchPendingTopics, fetchPendingLessons, fetchPendingGrammar, fetchPendingTests, fetchPendingExams]);

  useEffect(() => {
    document.title = "Content Approval | Admin";
    fetchAllPendingContent();
    
    // Setup real-time listeners for specific events only (không dùng 'notification' chung)
    socketService.on('new_pending_content', handleNewPendingContent);
    socketService.on('content_pending', handleNewPendingContent);
    
    return () => {
      socketService.off('new_pending_content', handleNewPendingContent);
      socketService.off('content_pending', handleNewPendingContent);
    };
  }, [fetchAllPendingContent, handleNewPendingContent]);

  // ✅ Get current tab data with filters
  const getCurrentTabData = useCallback(() => {
    let data = [];
    
    switch(activeTab) {
      case 'topic':
        data = topicData;
        break;
      case 'lesson':
        data = lessonData;
        break;
      case 'grammar':
        data = grammarData;
        break;
      case 'test':
        data = testData;
        break;
      case 'exam':
        data = examData;
        break;
      default:
        data = [];
    }

    // Apply search filter
    if (searchQuery) {
      data = data.filter(item => {
        const title = getContentTitle(item, activeTab);
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Apply date range filter
    if (dateRange && dateRange.length === 2) {
      data = data.filter(item => {
        const createdDate = moment(item.submittedAt || item.createdAt);
        return createdDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }

    return data;
  }, [activeTab, topicData, lessonData, grammarData, testData, examData, searchQuery, dateRange]);

  // ✅ Approve content
  const handleApprove = async (content, contentType) => {
    Modal.confirm({
      title: 'Phê Duyệt Content',
      content: `Bạn có chắc chắn muốn phê duyệt ${contentType} này?`,
      okText: 'Phê Duyệt',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          let response;
          
          // Use appropriate service based on content type
          if (contentType === 'topic') {
            response = await topicSubmissionService.approveTopic(content._id);
          } else if (contentType === 'lesson') {
            response = await lessonSubmissionService.approveLesson(content._id);
          } else if (contentType === 'grammar') {
            response = await grammarSubmissionService.approveGrammar(content._id);
          } else if (contentType === 'test') {
            response = await testSubmissionService.approveTest(content._id);
          } else if (contentType === 'exam') {
            response = await examSubmissionService.approveExam(content._id);
          }
          
          if (response?.success) {
            message.success(`${contentType} đã được phê duyệt thành công!`);
            fetchAllPendingContent();
            
            // 🔔 Notify sidebar to update badge
            window.dispatchEvent(new CustomEvent('sidebar-update-badge', { 
              detail: { action: 'approved', contentType } 
            }));
          } else {
            message.error(response?.message || 'Phê duyệt thất bại');
          }
        } catch (error) {
          message.error(error.response?.data?.message || 'Phê duyệt thất bại');
          console.error(error);
        }
      }
    });
  };

  // ✅ Reject content
  const handleReject = (content, contentType) => {
    setSelectedContent({ ...content, contentType });
    setRejectModalVisible(true);
    setRejectionReason('');
  };

  const submitRejection = async () => {
    if (!rejectionReason || rejectionReason.length < 10) {
      message.error('Lý do từ chối phải có ít nhất 10 ký tự');
      return;
    }

    try {
      let response;
      
      // Use appropriate service based on content type
      if (selectedContent.contentType === 'topic') {
        response = await topicSubmissionService.rejectTopic(
          selectedContent._id,
          { rejectionReason }
        );
      } else if (selectedContent.contentType === 'lesson') {
        response = await lessonSubmissionService.rejectLesson(
          selectedContent._id,
          { rejectionReason }
        );
      } else if (selectedContent.contentType === 'grammar') {
        response = await grammarSubmissionService.rejectGrammar(
          selectedContent._id,
          { rejectionReason }
        );
      } else if (selectedContent.contentType === 'test') {
        response = await testSubmissionService.rejectTest(
          selectedContent._id,
          { rejectionReason }
        );
      } else if (selectedContent.contentType === 'exam') {
        response = await examSubmissionService.rejectExam(
          selectedContent._id,
          { rejectionReason }
        );
      }
      
      if (response?.success) {
        message.success('Content đã bị từ chối!');
        setRejectModalVisible(false);
        setRejectionReason('');
        fetchAllPendingContent();
        
        // 🔔 Notify sidebar to update badge
        window.dispatchEvent(new CustomEvent('sidebar-update-badge', { 
          detail: { action: 'rejected', contentType: selectedContent.contentType } 
        }));
      } else {
        message.error(response?.message || 'Từ chối thất bại');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Từ chối thất bại');
      console.error(error);
    }
  };

  // ✅ Get content title based on type
  const getContentTitle = (content, type) => {
    switch(type) {
      case 'topic':
        return content.topicName;
      case 'lesson':
        return content.lessonName;
      case 'grammar':
        return content.grammarName;
      case 'test':
        return content.testName;
      case 'exam':
        return content.examName;
      default:
        return 'Untitled';
    }
  };

  // ✅ Get content description based on type
  const getContentDescription = (content, type) => {
    switch(type) {
      case 'topic':
        return content.topicDescription;
      case 'lesson':
        return content.lessonDescription;
      case 'grammar':
        return content.grammarDescription;
      case 'test':
        return content.testDescription;
      case 'exam':
        return content.examDescription;
      default:
        return 'N/A';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      topic: 'blue',
      lesson: 'green',
      grammar: 'orange',
      test: 'purple',
      exam: 'red'
    };
    return colors[type] || 'default';
  };

  // ✅ Get content detail URL based on type
  const getContentDetailUrl = (content, contentType, subType = null) => {
    const baseUrl = '/teacher'; // Admin có thể truy cập route teacher
    
    if (subType) {
      // Sub-content URLs (vocabularies, questions, contents)
      switch(contentType) {
        case 'topic':
          if (subType === 'vocabulary') {
            return `${baseUrl}/topics/${content._id}/vocabulary`;
          } else if (subType === 'question') {
            return `${baseUrl}/topics/${content._id}/vocabulary-question`;
          }
          return null;
          
        case 'lesson':
          if (subType === 'content') {
            const sectionId = content.section?._id || content.sectionId;
            return sectionId ? `${baseUrl}/sections/${sectionId}/lesson/${content._id}/lesson-content` : null;
          }
          return null;
          
        case 'grammar':
          if (subType === 'content') {
            return `${baseUrl}/grammar/${content._id}/grammar-content`;
          } else if (subType === 'question') {
            return `${baseUrl}/grammar/${content._id}/grammar-question`;
          }
          return null;
          
        case 'test':
          if (subType === 'question') {
            const testSectionId = content.section?._id || content.sectionId;
            return testSectionId ? `${baseUrl}/sections/${testSectionId}/test/${content._id}/indicate-questions` : null;
          }
          return null;
          
        case 'exam':
          if (subType === 'question') {
            return `${baseUrl}/exams/${content._id}/exam-question`;
          }
          return null;
          
        default:
          return null;
      }
    }
    
    // Main content URLs
    switch(contentType) {
      case 'topic':
        return `${baseUrl}/topics/${content._id}/vocabulary`;
      case 'lesson':
        const sectionId = content.section?._id || content.sectionId;
        return sectionId ? `${baseUrl}/sections/${sectionId}/lesson/${content._id}/lesson-content` : null;
      case 'grammar':
        return `${baseUrl}/grammar/${content._id}/grammar-content`;
      case 'test':
        const testSectionId = content.section?._id || content.sectionId;
        return testSectionId ? `${baseUrl}/sections/${testSectionId}/test/${content._id}/indicate-questions` : null;
      case 'exam':
        return `${baseUrl}/exams/${content._id}/exam-question`;
      default:
        return null;
    }
  };

  // ✅ Navigate to content detail (same tab - preserves auth state)
  const handleViewInNewTab = (content, contentType, subType = null) => {
    const url = getContentDetailUrl(content, contentType, subType);
    
    if (url) {
      // ✅ Navigate trong cùng tab để giữ sessionStorage
      navigate(url);
    } else {
      message.warning('Không thể mở content này (thiếu thông tin cần thiết)');
    }
  };

  // ✅ Tab items with icons and badges
  const tabItems = [
    {
      key: 'topic',
      label: (
        <span>
          <BookOutlined />
          Topics
          {counts.topic > 0 && (
            <Badge count={counts.topic} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: <></>
    },
    {
      key: 'lesson',
      label: (
        <span>
          <ReadOutlined />
          Lessons
          {counts.lesson > 0 && (
            <Badge count={counts.lesson} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: <></>
    },
    {
      key: 'grammar',
      label: (
        <span>
          <FileTextOutlined />
          Grammar
          {counts.grammar > 0 && (
            <Badge count={counts.grammar} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: <></>
    },
    {
      key: 'test',
      label: (
        <span>
          <EditOutlined />
          Tests
          {counts.test > 0 && (
            <Badge count={counts.test} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: <></>
    },
    {
      key: 'exam',
      label: (
        <span>
          <FormOutlined />
          Exams
          {counts.exam > 0 && (
            <Badge count={counts.exam} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: <></>
    }
  ];

  return (
    <div className="content-approval-container">
      {/* Breadcrumb */}
      <div
        style={{
          background: 'var(--color-primary)',
          minHeight: 70,
          border: 'none',
          borderRadius: 16,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          marginBottom: 16,
        }}
      >
        <Breadcrumb separator={null} style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-bg-primary)' }}>
          <Breadcrumb.Item>
            <span style={{
              background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
            }}>
              <HomeOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
            </span>
            <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Content Approval</span>
            <Badge 
              count={counts.total} 
              style={{ marginLeft: 16, backgroundColor: 'var(--color-warning)' }}
            />
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters */}
          <Card size="small">
            <Space wrap>
              <Input.Search
                placeholder={
                  activeTab === 'lesson' 
                    ? 'Search lesson by title...' 
                    : activeTab === 'grammar'
                    ? 'Search grammar by title...'
                    : activeTab === 'test'
                    ? 'Search test by title...'
                    : activeTab === 'exam'
                    ? 'Search exam by title...'
                    : `Search ${activeTab} by title...`
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />

              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['From Date', 'To Date']}
              />
            </Space>
          </Card>

          {/* ✅ Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />

          {/* 🚧 Coming Soon Notice for non-implemented tabs */}
          {!['topic', 'lesson', 'grammar', 'test', 'exam'].includes(activeTab) && (
            <Card 
              style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'var(--color-primary)',
                border: 'none'
              }}
            >
              <Space direction="vertical" size="large">
                <div style={{ fontSize: '72px' }}>🚧</div>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '24px', 
                    color: 'white',
                    display: 'block'
                  }}
                >
                  Tính Năng Đang Phát Triển
                </Text>
                <Text 
                  style={{ 
                    fontSize: '16px', 
                    color: 'rgba(255,255,255,0.9)',
                    display: 'block'
                  }}
                >
                  Tab <strong>{activeTab.toUpperCase()}</strong> submission sẽ sớm được cập nhật.
                  <br />
                  Hiện tại chỉ có <strong>TOPIC</strong>, <strong>LESSON</strong>, <strong>GRAMMAR</strong>, <strong>TEST</strong> và <strong>EXAM</strong> submission đã sẵn sàng.
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setActiveTab('topic')}
                  style={{ 
                    background: 'white',
                    color: 'var(--color-brand-purple)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  Quay Lại Topics
                </Button>
              </Space>
            </Card>
          )}

          {/* ✅ Table for current tab - Show for topic, lesson, grammar, test and exam */}
          {['topic', 'lesson', 'grammar', 'test', 'exam'].includes(activeTab) && (
            <div className="approval-table-wrapper">
              <table className="table text-center table-hover shadow approval-table">
                <thead className="shadow">
                  <tr className="align-middle">
                    <th><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                    <th>TIÊU ĐỀ</th>
                    <th>GIÁO VIÊN</th>
                    <th>THỜI GIAN SUBMIT</th>
                    <th>THỐNG KÊ</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentTabData().map((record, index) => (
                    <tr key={record._id} className="table-row shadow-on-hover align-middle">
                      <td>{index + 1}</td>
                      <td>
                        <Text strong style={{ fontSize: '12px', color: 'var(--color-brand-navy)' }}>
                          {getContentTitle(record, activeTab)}
                        </Text>
                      </td>
                      <td>
                        <Space>
                          <Avatar size="small" style={{ backgroundColor: 'var(--color-primary)' }}>
                            {record.createdBy?.name?.charAt(0).toUpperCase() || 
                             record.createdBy?.username?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Text style={{ fontSize: '12px', color: 'var(--color-brand-navy)' }}>
                            {record.createdBy?.name || record.createdBy?.username || 'Unknown'}
                          </Text>
                        </Space>
                      </td>
                      <td>
                        <Text style={{ fontSize: '12px', color: 'var(--color-brand-navy)' }}>
                          {record.submittedAt ? moment(record.submittedAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                        </Text>
                      </td>
                      <td>
                        {activeTab === 'topic' && record.statistics ? (
                          <Space direction="vertical" size="small">
                            <span className="badge bg-primary rounded-pill px-3 py-1">
                              📚 {record.statistics.vocabularyCount} vocabularies
                            </span>
                            <span className="badge bg-success rounded-pill px-3 py-1">
                              ❓ {record.statistics.totalQuestions} questions
                            </span>
                          </Space>
                        ) : activeTab === 'lesson' && record.statistics ? (
                          <Space direction="vertical" size="small">
                            <span className="badge bg-primary rounded-pill px-3 py-1">
                              📝 {record.statistics.contentCount || 0} contents
                            </span>
                            {record.statistics.hasFile && (
                              <span className="badge bg-info rounded-pill px-3 py-1">
                                📄 Has PDF
                              </span>
                            )}
                          </Space>
                        ) : activeTab === 'grammar' && record.statistics ? (
                          <Space direction="vertical" size="small">
                            <span className="badge bg-primary rounded-pill px-3 py-1">
                              📖 {record.statistics.contentCount || 0} contents
                            </span>
                            <span className="badge bg-success rounded-pill px-3 py-1">
                              ❓ {record.statistics.questionCount || 0} questions
                            </span>
                          </Space>
                        ) : activeTab === 'test' && record.statistics ? (
                          <Space direction="vertical" size="small">
                            <span className="badge bg-success rounded-pill px-3 py-1">
                              ❓ {record.statistics.questionCount || 0} questions
                            </span>
                          </Space>
                        ) : activeTab === 'exam' && record.statistics ? (
                          <Space direction="vertical" size="small">
                            <span className="badge bg-success rounded-pill px-3 py-1">
                              ❓ {record.statistics.questionCount || 0} questions
                            </span>
                            <span className="badge bg-info rounded-pill px-3 py-1">
                              {record.rawData?.examType === 1 ? '📝 Full Test' : '⚡ Mini Test'}
                            </span>
                          </Space>
                        ) : (
                          <Text type="secondary">-</Text>
                        )}
                      </td>
                      <td>
                        <Space wrap>
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              // ✅ Set content first, then open modal after a tiny delay
                              setSelectedContent({ ...record, contentType: activeTab });
                              // Use setTimeout to ensure state is set before modal opens
                              setTimeout(() => setViewModalVisible(true), 0);
                            }}
                            style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '500' }}
                          >
                            Xem
                          </Button>
                          <button
                            className="btn btn-sm btn-success rounded-pill px-3"
                            onClick={() => handleApprove(record, activeTab)}
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: '500',
                              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                              border: 'none',
                              boxShadow: '0 2px 4px rgba(82, 196, 26, 0.3)'
                            }}
                          >
                            <CheckOutlined style={{ marginRight: '4px' }} />
                            Phê Duyệt
                          </button>
                          <button
                            className="btn btn-sm btn-danger rounded-pill px-3"
                            onClick={() => handleReject(record, activeTab)}
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: '500',
                              boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
                            }}
                          >
                            <CloseOutlined style={{ marginRight: '4px' }} />
                            Từ Chối
                          </button>
                        </Space>
                      </td>
                    </tr>
                  ))}
                  {getCurrentTabData().length === 0 && (
                    <tr key="no-data">
                      <td colSpan="6">
                        <Space direction="vertical" size="large" style={{ padding: '40px' }}>
                          <div style={{ fontSize: '48px' }}>📭</div>
                          <Text type="secondary" style={{ fontSize: '16px' }}>
                            Không có {activeTab} nào đang chờ phê duyệt
                          </Text>
                        </Space>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Space>
      </Card>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: 'var(--color-primary)' }} />
            <span>Chi Tiết {selectedContent?.contentType?.toUpperCase()}</span>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          // Clear selected content after modal close animation
          setTimeout(() => setSelectedContent(null), 300);
        }}
        width={800}
        destroyOnClose={false}
        maskClosable={true}
        transitionName=""
        maskTransitionName=""
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setTimeout(() => setSelectedContent(null), 300);
          }}>
            Đóng
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              handleApprove(selectedContent, selectedContent.contentType);
            }}
          >
            Phê Duyệt
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              handleReject(selectedContent, selectedContent.contentType);
            }}
          >
            Từ Chối
          </Button>
        ]}
      >
        {selectedContent && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại">
              <Tag color={getTypeColor(selectedContent.contentType)}>
                {selectedContent.contentType?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu Đề">
              <strong>{getContentTitle(selectedContent, selectedContent.contentType)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mô Tả">
              {getContentDescription(selectedContent, selectedContent.contentType) || 'Không có'}
            </Descriptions.Item>
            {selectedContent.contentType === 'topic' && selectedContent.statistics && (
              <>
                <Descriptions.Item label="Số Vocabularies">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.vocabularyCount} 
                      style={{ backgroundColor: 'var(--color-success)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'topic', 'vocabulary')}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Số Questions">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.totalQuestions} 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'topic', 'question')}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
              </>
            )}
            {selectedContent.contentType === 'lesson' && selectedContent.statistics && (
              <>
                <Descriptions.Item label="Số Lesson Contents">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.contentCount || 0} 
                      style={{ backgroundColor: 'var(--color-success)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'lesson', 'content')}
                      disabled={!selectedContent.section && !selectedContent.sectionId}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="PDF File">
                  <Tag color={selectedContent.statistics.hasFile ? 'green' : 'default'}>
                    {selectedContent.statistics.hasFile ? '✓ Có file' : '✗ Không có file'}
                  </Tag>
                </Descriptions.Item>
                {selectedContent.section && (
                  <Descriptions.Item label="Section">
                    <Tag color="blue">{selectedContent.section.sectionName}</Tag>
                  </Descriptions.Item>
                )}
              </>
            )}
            {selectedContent.contentType === 'grammar' && selectedContent.statistics && (
              <>
                <Descriptions.Item label="Số Grammar Contents">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.contentCount || 0} 
                      style={{ backgroundColor: 'var(--color-success)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'grammar', 'content')}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số Grammar Questions">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.questionCount || 0} 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'grammar', 'question')}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
              </>
            )}
            {selectedContent.contentType === 'test' && (
              <>
                <Descriptions.Item label="Số Test Questions">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.questionCount || 0} 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'test', 'question')}
                      disabled={!selectedContent.section && !selectedContent.sectionId}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
              </>
            )}
            {selectedContent.contentType === 'exam' && (
              <>
                <Descriptions.Item label="Số Exam Questions">
                  <Space>
                    <Badge 
                      count={selectedContent.statistics.questionCount || 0} 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      showZero
                    />
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewInNewTab(selectedContent, 'exam', 'question')}
                      style={{ fontSize: '12px', padding: '0 8px' }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Loại Exam">
                  <Tag color={selectedContent.rawData?.examType === 1 ? 'blue' : 'green'}>
                    {selectedContent.rawData?.examType === 1 ? 'Full Test' : 'Mini Test'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thời Lượng">
                  <Badge 
                    count={`${(selectedContent.rawData?.examDuration || 0) / 60} phút`} 
                    style={{ backgroundColor: 'var(--color-warning)' }}
                  />
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Người Tạo">
              <Space>
                <Avatar size="small">
                  {selectedContent.createdBy?.name?.charAt(0).toUpperCase() || 
                   selectedContent.createdBy?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                {selectedContent.createdBy?.name || selectedContent.createdBy?.username || 'Unknown'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Thời Gian Submit">
              {selectedContent.submittedAt 
                ? moment(selectedContent.submittedAt).format('DD/MM/YYYY HH:mm')
                : 'Không có'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <Space>
            <CloseOutlined style={{ color: 'var(--color-danger)' }} />
            <span>Từ Chối Content</span>
          </Space>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
        }}
        onOk={submitRejection}
        okText="Từ Chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text strong>
            Vui lòng cung cấp lý do từ chối (tối thiểu 10 ký tự):
          </Text>
          <TextArea
            rows={5}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối chi tiết để giúp teacher cải thiện content...&#10;&#10;Ví dụ:&#10;- Vocabularies cần thêm ví dụ cụ thể&#10;- Questions chưa đủ độ khó&#10;- Cần kiểm tra lại ngữ pháp"
            maxLength={500}
            showCount
            style={{ fontSize: '12px' }}
          />
          {rejectionReason && rejectionReason.length < 10 && (
            <Text type="danger">
              ⚠️ Lý do từ chối phải có ít nhất 10 ký tự
            </Text>
          )}
          {selectedContent && (
            <Card size="small" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <Space direction="vertical" size="small">
                <Text type="secondary">Content đang từ chối:</Text>
                <Text strong>{getContentTitle(selectedContent, selectedContent.contentType)}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Bởi: {selectedContent.createdBy?.name || selectedContent.createdBy?.username}
                </Text>
              </Space>
            </Card>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default ContentApproval;