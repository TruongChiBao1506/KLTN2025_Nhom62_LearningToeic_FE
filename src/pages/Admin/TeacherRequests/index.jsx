import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
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

  // Fetch requests with pagination and filter
  const fetchRequests = useCallback(async (page = 1, limit = 10, status = null) => {
    setLoading(true);
    try {
      const params = { page, limit };
      
      if (status !== null) {
        params.status = status;
      }
      
      const response = await teacherRequestService.getAllRequests(params);
      
      let requestsData = [];
      let total = 0;
      
      if (response?.data) {
        if (response.data.requests && Array.isArray(response.data.requests)) {
          requestsData = response.data.requests;
          total = response.data.pagination?.total || requestsData.length;
        } else if (Array.isArray(response.data)) {
          requestsData = response.data;
          total = requestsData.length;
        }
      }
      
      setRequests(requestsData);
      setTotalRequests(total);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch teacher requests',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
      setRequests([]);
      setTotalRequests(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await teacherRequestService.getStatistics();
      
      if (response?.success && response?.data) {
        setStatistics(response.data);
      } else if (response?.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(() => {
    fetchRequests(currentPage, pageSize, statusFilter);
    fetchStatistics();
  }, [currentPage, pageSize, statusFilter, fetchRequests, fetchStatistics]);

  // Handle real-time updates
  const handleNewRequest = useCallback((data) => {
    console.log('🆕 New teacher request received:', data);
    loadAllData();
  }, [loadAllData]);

  const handleRequestApproved = useCallback((data) => {
    console.log('✅ Teacher request approved:', data);
    loadAllData();
  }, [loadAllData]);

  const handleRequestRejected = useCallback((data) => {
    console.log('❌ Teacher request rejected:', data);
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
    const result = await Swal.fire({
      title: '✅ Approve Teacher Request',
      html: `
        <p>Are you sure you want to approve this request?</p>
        <div style="margin-top: 12px; padding: 12px; background: #f0f2f5; border-radius: 8px; text-align: left;">
          <strong>Applicant:</strong> ${request.fullName}<br />
          <strong>Username:</strong> ${request.user?.username || request.userId?.username}<br />
          <strong>Email:</strong> ${request.email}
        </div>
        <p style="margin-top: 12px; color: #52c41a;">
          The user will be granted teacher privileges and can start creating content.
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-approved)',
      cancelButtonColor: 'var(--color-draft)',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      width: 500
    });

    if (result.isConfirmed) {
      try {
        const response = await teacherRequestService.approveRequest(request._id);
        
        if (response?.success || response?.data?.success) {
          Swal.fire({
            title: 'Success!',
            text: '✅ Request approved successfully! User is now a teacher.',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });
          
          // 🔧 Emit browser custom event to notify sidebar
          console.log('📤 Dispatching sidebar-update-badge event');
          window.dispatchEvent(new CustomEvent('sidebar-update-badge', {
            detail: { type: 'teacher_request', action: 'approved' }
          }));
          
          // Reload data
          loadAllData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.message || 'Failed to approve request',
            icon: 'error',
            timer: 3000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error approving request:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to approve request',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      }
    }
  };

  // Handle reject request
  const handleReject = async (request, rejectionReason) => {
    try {
      const response = await teacherRequestService.rejectRequest(request._id, { 
        rejectionReason: rejectionReason.trim() 
      });
      
      if (response?.success || response?.data?.success) {
        Swal.fire({
          title: 'Success!',
          text: '❌ Request rejected successfully',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
        
        // 🔧 Emit browser custom event to notify sidebar
        console.log('📤 Dispatching sidebar-update-badge event');
        window.dispatchEvent(new CustomEvent('sidebar-update-badge', {
          detail: { type: 'teacher_request', action: 'rejected' }
        }));
        
        loadAllData();
      } else {
        Swal.fire({
          title: 'Error!',
          text: response?.message || 'Failed to reject request',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to reject request',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handle reload
  const handleReload = () => {
    loadAllData();
    Swal.fire({
      title: 'Success!',
      text: 'Data reloaded successfully',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
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
          marginBottom: 24,
        }}
        data-aos="fade-down"
        data-aos-duration="400"
        data-aos-delay="50"
      >
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <FontAwesomeIcon icon={faUserPlus} style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
          </span>
          <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Teacher Requests</span>
        </div>
      </div>

      {/* Teacher Request List Component */}
      <div
        data-aos="fade-up"
        data-aos-duration="500"
        data-aos-delay="200"
      >
        <TeacherRequestList
          requests={requests}
          loading={loading}
          statistics={statistics}
          onApprove={handleApprove}
          onReject={handleReject}
          onReload={handleReload}
          currentPage={currentPage}
          pageSize={pageSize}
          totalRequests={totalRequests}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />
      </div>
    </div>
  );
};

export default TeacherRequests;
