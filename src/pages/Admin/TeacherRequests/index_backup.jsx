import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb, Modal, message } from 'antd';
import { UserAddOutlined, HomeOutlined } from '@ant-design/icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import socketService from '../../../services/socketService';
import teacherRequestService from '../../../services/teacherRequestService';
import TeacherRequestList from '../../../components/Admin/TeacherRequestList';
import '../../../assets/breadcrumb.css';
import './style.css';

const TeacherRequests = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  
  // Pagination and Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRequests, setTotalRequests] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const fetchRequests = useCallback(async (page = 1, limit = 10, status = null) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      
      // Only add status if it's not null (null means "all")
      if (status !== null) {
        params.status = status;
      }
      
      const response = await teacherRequestService.getAllRequests(params);
      
      // Handle different response structures
      let requestsData = [];
      let total = 0;
      let pagination = null;
      
      if (response?.data) {
        // Case 1: data.requests with pagination
        if (response.data.requests && Array.isArray(response.data.requests)) {
          requestsData = response.data.requests;
          pagination = response.data.pagination;
          total = pagination?.total || requestsData.length;
        }
        // Case 2: data is array directly
        else if (Array.isArray(response.data)) {
          requestsData = response.data;
          total = requestsData.length;
        }
        // Case 3: data.data
        else if (response.data.data && Array.isArray(response.data.data)) {
          requestsData = response.data.data;
          total = response.data.total || requestsData.length;
        }
      }
      // Case 4: response is array directly
      else if (Array.isArray(response)) {
        requestsData = response;
        total = requestsData.length;
      }
      
      setRequests(requestsData);
      setTotalRequests(total);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Failed to load requests: ' + (error.response?.data?.message || error.message));
      setRequests([]);
      setTotalRequests(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await teacherRequestService.getPendingCount();
      
      if (response?.data?.count !== undefined) {
        setPendingCount(response.data.count);
      } else if (response?.count !== undefined) {
        setPendingCount(response.count);
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
      setPendingCount(0);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await teacherRequestService.getStatistics();
      
      if (response?.data) {
        setStatistics({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          approved: response.data.approved || 0,
          rejected: response.data.rejected || 0
        });
      } else if (response) {
        setStatistics({
          total: response.total || 0,
          pending: response.pending || 0,
          approved: response.approved || 0,
          rejected: response.rejected || 0
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(() => {
    fetchRequests(currentPage, pageSize, statusFilter);
    fetchPendingCount();
    fetchStatistics();
  }, [currentPage, pageSize, statusFilter, fetchRequests, fetchPendingCount, fetchStatistics]);

  // Handle real-time updates
  const handleNewRequest = useCallback((data) => {
    console.log('📝 New teacher request received:', data);
    message.info('🔔 New teacher request received!');
    loadAllData();
  }, [loadAllData]);

  const handleRequestApproved = useCallback((data) => {
    console.log('✅ Teacher request approved:', data);
    message.success('A teacher request has been approved!');
    loadAllData();
  }, [loadAllData]);

  const handleRequestRejected = useCallback((data) => {
    console.log('❌ Teacher request rejected:', data);
    message.info('A teacher request has been rejected');
    loadAllData();
  }, [loadAllData]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 100,
      delay: 0,
      easing: 'ease-out',
      once: true,
      disable: 'mobile'
    });
  }, []);

  // Initial load and socket setup
  useEffect(() => {
    document.title = "Teacher Requests | Admin";
    loadAllData();
    
    // Setup real-time listeners
    console.log('🔔 Setting up teacher request listeners...');
    socketService.on('new_teacher_request', handleNewRequest);
    socketService.on('teacher_request_approved', handleRequestApproved);
    socketService.on('teacher_request_rejected', handleRequestRejected);
    
    return () => {
      console.log('🔕 Cleaning up teacher request listeners...');
      socketService.off('new_teacher_request', handleNewRequest);
      socketService.off('teacher_request_approved', handleRequestApproved);
      socketService.off('teacher_request_rejected', handleRequestRejected);
    };
  }, [loadAllData, handleNewRequest, handleRequestApproved, handleRequestRejected]);

  // Reload when filter/pagination changes
  useEffect(() => {
    fetchRequests(currentPage, pageSize, statusFilter);
  }, [currentPage, pageSize, statusFilter, fetchRequests]);

  // Handle approve request
  const handleApprove = async (request) => {
    Modal.confirm({
      title: '✅ Approve Teacher Request',
      content: (
        <div>
          <p>Are you sure you want to approve this request?</p>
          <div style={{ marginTop: 12, padding: 12, background: 'var(--color-bg-tertiary)', borderRadius: 8 }}>
            <strong>Applicant:</strong> {request.fullName}<br />
            <strong>Username:</strong> {request.user?.username || request.userId?.username}<br />
            <strong>Email:</strong> {request.email}
          </div>
          <p style={{ marginTop: 12, color: 'var(--color-success)' }}>
            The user will be granted teacher privileges and can start creating content.
          </p>
        </div>
      ),
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      width: 500,
      onOk: async () => {
        try {
          const response = await teacherRequestService.approveRequest(request._id);
          
          if (response?.success || response?.data?.success) {
            message.success('✅ Request approved successfully! User is now a teacher.');
            
            // 🔧 Update pending count immediately
            setPendingCount(prev => Math.max(0, prev - 1));
            
            // 🔧 Emit browser custom event to notify sidebar
            console.log('📤 Dispatching sidebar-update-badge event');
            window.dispatchEvent(new CustomEvent('sidebar-update-badge', {
              detail: { type: 'teacher_request', action: 'approved' }
            }));
            
            // Reload data
            loadAllData();
          } else {
            message.error(response?.message || 'Failed to approve request');
          }
        } catch (error) {
          console.error('Error approving request:', error);
          message.error(error.response?.data?.message || 'Failed to approve request');
        }
      }
    });
  };

  // Handle reject request
  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectModalVisible(true);
    setRejectionReason('');
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason?.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }
    
    if (rejectionReason.trim().length < 10) {
      message.error('Rejection reason must be at least 10 characters');
      return;
    }

    if (rejectionReason.trim().length > 500) {
      message.error('Rejection reason must not exceed 500 characters');
      return;
    }

    try {
      const response = await teacherRequestService.rejectRequest(selectedRequest._id, { 
        rejectionReason: rejectionReason.trim() 
      });
      
      if (response?.success || response?.data?.success) {
        message.success('❌ Request rejected successfully');
        setRejectModalVisible(false);
        setRejectionReason('');
        setSelectedRequest(null);
        
        // 🔧 Update pending count immediately
        setPendingCount(prev => Math.max(0, prev - 1));
        
        // 🔧 Emit browser custom event to notify sidebar
        console.log('📤 Dispatching sidebar-update-badge event');
        window.dispatchEvent(new CustomEvent('sidebar-update-badge', {
          detail: { type: 'teacher_request', action: 'rejected' }
        }));
        
        loadAllData();
      } else {
        message.error(response?.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value === 'all' ? null : parseInt(value));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getStatusTag = (status) => {
    const statusMap = {
      0: { color: 'gold', text: '🟡 PENDING' },
      1: { color: 'success', text: '🟢 APPROVED' },
      2: { color: 'error', text: '🔴 REJECTED' }
    };
    const config = statusMap[status] || { color: 'default', text: 'UNKNOWN' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Table columns - styled like Section page
  const columns = [
    {
      title: () => (
        <Button 
          type="primary" 
          size="small"
          disabled
          style={{ 
            borderRadius: 20,
            cursor: 'default',
            opacity: 1
          }}
        >
          No.
        </Button>
      ),
      key: 'index',
      width: 80,
      align: 'center',
      render: (_, __, index) => (
        <Text strong style={{ color: 'var(--color-brand-purple)' }}>
          {(currentPage - 1) * pageSize + index + 1}
        </Text>
      )
    },
    {
      title: 'APPLICANT',
      key: 'user',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const user = record.userId || record.user;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              size={40}
              style={{ backgroundColor: 'var(--color-primary)', marginBottom: 8 }}
              icon={<UserOutlined />}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 
               user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <div style={{ textAlign: 'center' }}>
              <div>
                <Text strong>{user?.username || user?.name || 'Unknown'}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {user?.email || 'No email'}
              </Text>
            </div>
          </div>
        );
      }
    },
    {
      title: 'FULL NAME',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
      align: 'center'
    },
    {
      title: 'CONTACT',
      key: 'contact',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 4, color: 'var(--color-primary)' }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: 4, color: 'var(--color-success)' }} />
            <Text style={{ fontSize: 12 }}>{record.phoneNumber}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'EXPERIENCE',
      key: 'experience',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.experience}>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 0, fontSize: 12, textAlign: 'center' }}
          >
            {record.experience}
          </Paragraph>
        </Tooltip>
      )
    },
    {
      title: 'DOCUMENTS',
      key: 'documents',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const cvCount = record.cv ? 1 : 0;
        const certCount = record.certificates?.length || 0;
        const total = cvCount + certCount;
        
        return total > 0 ? (
          <Badge count={total} showZero={false}>
            <FileTextOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />
          </Badge>
        ) : (
          <Text type="secondary">-</Text>
        );
      }
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'SUBMITTED',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      align: 'center',
      render: (date) => (
        <Tooltip title={moment(date).format('DD/MM/YYYY HH:mm:ss')}>
          <div style={{ textAlign: 'center' }}>
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            {moment(date).format('DD/MM/YYYY')}
          </div>
        </Tooltip>
      )
    },
    {
      title: 'ACTION',
      key: 'actions',
      width: 250,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Tooltip title="View Details">
            <Button
              type="default"
              icon={<EyeOutlined />}
              size="small"
              style={{ borderRadius: 20 }}
              onClick={() => {
                setSelectedRequest(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 0 && (
            <>
              <Tooltip title="Approve Request">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ borderRadius: 20 }}
                  onClick={() => handleApprove(record)}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject Request">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  style={{ borderRadius: 20 }}
                  onClick={() => handleReject(record)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-heading" data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
      {/* Header Breadcrumb with AOS */}
      <div
        style={{
          background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)',
          minHeight: 70,
          border: 'none',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(80,120,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          marginBottom: 16,
        }}
        data-aos="fade-down"
        data-aos-duration="400"
        data-aos-delay="50"
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
            <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Teacher Requests</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Statistics Cards with AOS */}
      <Row 
        gutter={[16, 16]} 
        style={{ marginBottom: 16 }}
        data-aos="fade-up"
        data-aos-duration="500"
        data-aos-delay="150"
      >
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: 12,
              background: '#2C5F8D',
              border: 'none',
              boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Requests</span>}
              value={statistics.total}
              valueStyle={{ color: 'var(--color-bg-primary)', fontSize: 32, fontWeight: 'bold' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Pending</span>}
              value={statistics.pending}
              valueStyle={{ color: 'var(--color-bg-primary)', fontSize: 32, fontWeight: 'bold' }}
              prefix={<ClockCircleOutlined />}
              suffix={
                <Badge 
                  count={pendingCount} 
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)', 
                    color: '#f5576c',
                    marginLeft: 8
                  }} 
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Approved</span>}
              value={statistics.approved}
              valueStyle={{ color: 'var(--color-bg-primary)', fontSize: 32, fontWeight: 'bold' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Rejected</span>}
              value={statistics.rejected}
              valueStyle={{ color: 'var(--color-bg-primary)', fontSize: 32, fontWeight: 'bold' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Section with AOS */}
      <div
        className="section"
        data-aos="fade-up"
        data-aos-duration="500"
        data-aos-delay="200"
      >
        <Card
          bordered={false}
          style={{ 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          {/* Control Row - giống Section page */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <Row align="middle" gutter={[16, 16]}>
              {/* Items per page selector */}
              <Col xs={24} sm={8} md={6}>
                <Space>
                  <Text strong>Hiển thị:</Text>
                  <Select
                    value={pageSize}
                    onChange={(value) => {
                      setPageSize(value);
                      setCurrentPage(1);
                    }}
                    style={{ width: 140 }}
                    options={[
                      { value: 10, label: '10 mục/trang' },
                      { value: 20, label: '20 mục/trang' },
                      { value: 50, label: '50 mục/trang' },
                      { value: 100, label: '100 mục/trang' },
                    ]}
                  />
                </Space>
              </Col>

              {/* Status Filter */}
              <Col xs={24} sm={8} md={10}>
                <Space style={{ width: '100%' }}>
                  <Text strong>Status Filter:</Text>
                  <Select
                    value={statusFilter === null ? 'all' : statusFilter.toString()}
                    onChange={handleStatusFilterChange}
                    style={{ width: 180 }}
                  >
                    <Select.Option value="all">📋 All Status</Select.Option>
                    <Select.Option value="0">⏳ Pending</Select.Option>
                    <Select.Option value="1">✅ Approved</Select.Option>
                    <Select.Option value="2">❌ Rejected</Select.Option>
                  </Select>
                </Space>
              </Col>
            

              {/* Refresh Button */}
              <Col xs={24} sm={8} md={8} style={{ textAlign: 'right' }}>
                <Tooltip title="Refresh Data">
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadAllData}
                    type="primary"
                    style={{ borderRadius: 20 }}
                  >
                    Refresh
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Card Body - giống Section page */}
          <div style={{ padding: '20px' }}>
            {loading && requests.length === 0 ? (
              <div
                className="text-center py-5"
                data-aos="zoom-in"
                data-aos-duration="600"
                style={{ padding: '60px 0', textAlign: 'center' }}
              >
                <div className="spinner-border text-primary" role="status" style={{
                  width: '3rem',
                  height: '3rem',
                  borderWidth: '0.25rem',
                  color: 'var(--color-brand-purple)'
                }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ marginTop: 16, color: '#8c8c8c', fontSize: 14 }}>
                  Đang tải dữ liệu teacher requests...
                </p>
              </div>
            ) : (
              <>
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={requests}
                  rowKey={(record) => record._id || record.id}
                  pagination={false}
                  scroll={{ x: 1400 }}
                  bordered
                  className="table text-center table-hover shadow"
                  rowClassName="table-row shadow-on-hover align-middle"
                  locale={{
                    emptyText: 'No teacher requests found'
                  }}
                />

                {/* Pagination - giống Section page */}
                {requests.length > 0 && (
                  <>
                    <nav aria-label="Page navigation" style={{ marginTop: 20 }}>
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1);
                              }
                            }}
                            disabled={currentPage === 1}
                          >
                            &laquo;
                          </button>
                        </li>
                        {Array.from(
                          { length: Math.ceil(totalRequests / pageSize) },
                          (_, i) => i + 1
                        ).map((pageNumber) => (
                          <li
                            key={pageNumber}
                            className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            currentPage === Math.ceil(totalRequests / pageSize) ? 'disabled' : ''
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => {
                              if (currentPage < Math.ceil(totalRequests / pageSize)) {
                                setCurrentPage(currentPage + 1);
                              }
                            }}
                            disabled={currentPage === Math.ceil(totalRequests / pageSize)}
                          >
                            &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>

                    {/* Pagination info - giống Section page */}
                    <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                      <p>
                        {(currentPage - 1) * pageSize + 1} -{' '}
                        {Math.min(currentPage * pageSize, totalRequests)} trên {totalRequests} kết quả
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* View Request Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EyeOutlined style={{ color: 'var(--color-primary)' }} />
            <span>Teacher Request Details</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedRequest(null);
        }}
        width={900}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setViewModalVisible(false);
              setSelectedRequest(null);
            }}
          >
            Close
          </Button>,
          selectedRequest?.status === 0 && (
            <React.Fragment key="actions">
              <Button
                key="reject"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setViewModalVisible(false);
                  handleReject(selectedRequest);
                }}
              >
                Reject
              </Button>
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  setViewModalVisible(false);
                  handleApprove(selectedRequest);
                }}
              >
                Approve
              </Button>
            </React.Fragment>
          )
        ]}
      >
        {selectedRequest && (
          <div>
            {/* User Information */}
            <Card 
              size="small" 
              title={
                <Space>
                  <UserOutlined />
                  <Text strong>User Information</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Username:</Text>
                  <div>
                    <Text strong>
                      {selectedRequest.user?.username || selectedRequest.userId?.username || 'N/A'}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Email:</Text>
                  <div>
                    <Text strong>
                      {selectedRequest.user?.email || selectedRequest.userId?.email || selectedRequest.email}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Application Information */}
            <Card 
              size="small" 
              title={
                <Space>
                  <FileTextOutlined />
                  <Text strong>Application Information</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Full Name">
                  <Text strong>{selectedRequest.fullName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  <Space>
                    <PhoneOutlined style={{ color: 'var(--color-success)' }} />
                    <Text>{selectedRequest.phoneNumber}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  <Paragraph 
                    style={{ 
                      whiteSpace: 'pre-wrap',
                      maxHeight: 200,
                      overflow: 'auto',
                      marginBottom: 0,
                      padding: 8,
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 4
                    }}
                  >
                    {selectedRequest.experience}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Reason for Applying">
                  <Paragraph 
                    style={{ 
                      whiteSpace: 'pre-wrap',
                      maxHeight: 200,
                      overflow: 'auto',
                      marginBottom: 0,
                      padding: 8,
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 4
                    }}
                  >
                    {selectedRequest.reason}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Documents */}
            {((selectedRequest.cv) || (selectedRequest.certificates && selectedRequest.certificates.length > 0)) && (
              <Card 
                size="small" 
                title={
                  <Space>
                    <DownloadOutlined />
                    <Text strong>Documents</Text>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedRequest.cv && (
                    <div>
                      <Text strong>CV:</Text>
                      <div style={{ marginTop: 8 }}>
                        <Button
                          icon={<DownloadOutlined />}
                          href={selectedRequest.cv.startsWith('http') ? selectedRequest.cv : `http://localhost:5000${selectedRequest.cv}`}
                          target="_blank"
                          type="link"
                        >
                          Download CV
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.certificates && selectedRequest.certificates.length > 0 && (
                    <div>
                      <Text strong>Certificates ({selectedRequest.certificates.length}):</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {selectedRequest.certificates.map((cert, index) => (
                            <Button
                              key={index}
                              icon={<DownloadOutlined />}
                              href={cert.startsWith('http') ? cert : `http://localhost:5000${cert}`}
                              target="_blank"
                              type="link"
                              block
                            >
                              Certificate {index + 1}
                            </Button>
                          ))}
                        </Space>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            )}

            {/* Status Information */}
            <Card 
              size="small" 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>Status Information</Text>
                </Space>
              }
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Status" span={2}>
                  {getStatusTag(selectedRequest.status)}
                </Descriptions.Item>
                {selectedRequest.rejectionReason && (
                  <Descriptions.Item label="Rejection Reason" span={2}>
                    <Paragraph 
                      type="danger"
                      style={{ 
                        marginBottom: 0,
                        padding: 8,
                        background: '#fff2e8',
                        borderRadius: 4,
                        border: '1px solid #ffbb96'
                      }}
                    >
                      {selectedRequest.rejectionReason}
                    </Paragraph>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Submitted At">
                  {moment(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </Descriptions.Item>
                {selectedRequest.updatedAt && (
                  <Descriptions.Item label="Last Updated">
                    {moment(selectedRequest.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>

      {/* Reject Request Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloseOutlined style={{ color: 'var(--color-danger)' }} />
            <span>Reject Teacher Request</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
          setSelectedRequest(null);
        }}
        onOk={submitRejection}
        okText="Submit Rejection"
        okButtonProps={{ 
          danger: true,
          disabled: !rejectionReason || rejectionReason.trim().length < 10
        }}
        cancelText="Cancel"
        width={600}
      >
        {selectedRequest && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Request Info */}
            <Card size="small" style={{ background: 'var(--color-warning-bg)', border: '1px solid #ffd591' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Applicant:</Text>
                  <div>
                    <Text strong>{selectedRequest.fullName}</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Username:</Text>
                  <div>
                    <Text strong>
                      {selectedRequest.user?.username || selectedRequest.userId?.username}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Email:</Text>
                  <div>
                    <Text strong>{selectedRequest.email}</Text>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Rejection Reason */}
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: 'var(--color-danger)' }}>
                  * Rejection Reason (Required)
                </Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  (10-500 characters)
                </Text>
              </div>
              <TextArea
                rows={6}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear and constructive reason for rejecting this application. This will be sent to the applicant.&#10;&#10;Example: Your application shows promise, but we need more specific teaching experience or higher English proficiency certifications."
                maxLength={500}
                showCount
                status={rejectionReason && rejectionReason.trim().length < 10 ? 'error' : ''}
              />
              {rejectionReason && rejectionReason.trim().length < 10 && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                  ⚠️ Rejection reason must be at least 10 characters
                </Text>
              )}
            </div>

            {/* Warning */}
            <Card 
              size="small" 
              style={{ 
                background: '#fff2e8', 
                border: '1px solid #ffbb96'
              }}
            >
              <Text type="warning">
                <strong>⚠️ Warning:</strong> This action cannot be undone. The applicant will be notified of this rejection and the reason provided.
              </Text>
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default TeacherRequests;
