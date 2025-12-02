import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheck,
  faTimes,
  faDownload,
  faUser,
  faRefresh,
  faPhone,
  faEnvelope,
  faClock,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import moment from 'moment';
// SweetAlert2 removed - not needed in this component
import ViewRequestModal from './ViewRequestModal';
import RejectRequestModal from './RejectRequestModal';
import './style.css';

// Bootstrap-based TeacherRequestList component

const TeacherRequestList = ({ 
  requests = [], 
  loading,
  statistics,
  onApprove,
  onReject,
  onReload,
  currentPage,
  pageSize,
  totalRequests,
  onPageChange,
  onPageSizeChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Filter requests by search text
  const filteredRequests = useMemo(() => {
    if (!searchText) return requests;
    
    const lowerSearch = searchText.toLowerCase();
    return requests.filter(req => 
      req.fullName?.toLowerCase().includes(lowerSearch) ||
      req.email?.toLowerCase().includes(lowerSearch) ||
      req.phoneNumber?.includes(lowerSearch) ||
      req.user?.username?.toLowerCase().includes(lowerSearch)
    );
  }, [requests, searchText]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setViewModalVisible(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = (rejectionReason) => {
    onReject(selectedRequest, rejectionReason);
    setRejectModalVisible(false);
    setSelectedRequest(null);
  };

  // Items per page options for select
  const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

  const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
    value: option,
    label: `${option} items/page`,
  }));

  // Pagination calculations
  const totalPageCount = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  return (
    <div className="page-heading">
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faUsers} size="2x" className="mb-2 text-primary" />
              <h4 className="fw-bold">{statistics.total}</h4>
              <p className="mb-0 text-muted">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faClock} size="2x" className="mb-2 text-warning" />
              <h4 className="fw-bold">{statistics.pending}</h4>
              <p className="mb-0 text-muted">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" className="mb-2 text-success" />
              <h4 className="fw-bold">{statistics.approved}</h4>
              <p className="mb-0 text-muted">Approved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <FontAwesomeIcon icon={faTimesCircle} size="2x" className="mb-2 text-danger" />
              <h4 className="fw-bold">{statistics.rejected}</h4>
              <p className="mb-0 text-muted">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card border-0">
          <div className="row align-items-center p-3">
            {/* Items per page selector */}
            <div className="col-3">
              <div className="d-flex align-items-center px-3 py-2 rounded-4">
                <label className="fw-semibold me-2 mb-0" htmlFor="itemsPerPageSelect">
                  Show:
                </label>
                <div style={{ minWidth: 140 }}>
                  <Select
                    inputId="itemsPerPageSelect"
                    classNamePrefix="react-select"
                    options={itemsPerPageOptions}
                    value={itemsPerPageOptions.find((opt) => opt.value === pageSize)}
                    onChange={(selected) => {
                      onPageSizeChange(selected.value);
                      onPageChange(1);
                    }}
                    isSearchable={false}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: 30,
                        minHeight: 32,
                        borderColor: "#198754",
                        boxShadow: "none",
                        fontWeight: 400,
                        color: "#198754",
                      }),
                      option: (base, state) => ({
                        ...base,
                        borderRadius: 30,
                        color: state.isSelected ? "var(--color-bg-primary)" : "#198754",
                        backgroundColor: state.isSelected
                          ? "#198754"
                          : state.isFocused
                          ? "#e6f7ef"
                          : "var(--color-bg-primary)",
                        ":active": {
                          backgroundColor: "#43c59e",
                          color: "var(--color-bg-primary)",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: 20,
                        overflow: "hidden",
                      }),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Search input */}
            <div className="col-6">
              <div className="input-group rounded-5">
                <input
                  type="text"
                  className="form-control"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by name, email, phone..."
                />
                <div className="input-group-append">
                  <button className="btn btn-light-emphasis">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Filter and Reload button */}
            <div className="col-3">
              <div className="d-flex justify-content-end align-items-center gap-2">
                <Select
                  placeholder="Filter status"
                  isClearable
                  value={statusFilter !== null ? { value: statusFilter, label: statusFilter === 0 ? 'Pending' : statusFilter === 1 ? 'Approved' : 'Rejected' } : null}
                  onChange={(selected) => onStatusFilterChange(selected?.value || null)}
                  options={[
                    { value: 0, label: 'Pending' },
                    { value: 1, label: 'Approved' },
                    { value: 2, label: 'Rejected' },
                  ]}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minWidth: 130,
                      borderRadius: 20,
                      minHeight: 38,
                    }),
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onReload}
                  title="Reload data"
                >
                  <FontAwesomeIcon icon={faRefresh} className="me-2" />
                  Reload
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card-body">
            <table className="table text-center table-hover shadow">
              <thead className="shadow">
                <tr className="align-middle">
                  <th>
                    <button className="btn btn-primary rounded-5 disabled">
                      No.
                    </button>
                  </th>
                  <th>APPLICANT</th>
                  <th>CONTACT</th>
                  <th>EXPERIENCE</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                  <th>MANAGE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request, index) => (
                  <tr
                    key={request._id || request.id}
                    className="table-row shadow-on-hover align-middle"
                  >
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {request.user?.avatar || request.userId?.avatar ? (
                        <img
                          src={request.user?.avatar || request.userId?.avatar}
                          alt="Avatar"
                          className="rounded-circle"
                          style={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40, backgroundColor: 'var(--color-brand-purple)', color: 'white' }}
                        >
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      )}
                      <div className="mt-1">
                        <small className="fw-bold d-block">{request.user?.username || request.userId?.username || 'N/A'}</small>
                        <small className="text-muted">{request.fullName}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <FontAwesomeIcon icon={faEnvelope} className="text-primary me-1" />
                        <small>{request.email}</small>
                      </div>
                      <div className="mt-1">
                        <FontAwesomeIcon icon={faPhone} className="text-success me-1" />
                        <small>{request.phoneNumber}</small>
                      </div>
                    </td>
                    <td>
                      <div 
                        title={request.experience}
                        style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                      >
                        {request.experience}
                      </div>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faClock} className="me-1" />
                      <small>{moment(request.createdAt).format('DD/MM/YYYY')}</small>
                    </td>
                    <td>
                      {request.status === 0 ? (
                        <span className="btn badge text-bg-warning rounded-5" style={{ cursor: "default" }}>
                          Pending
                        </span>
                      ) : request.status === 1 ? (
                        <span className="btn badge text-bg-success rounded-5" style={{ cursor: "default" }}>
                          Approved
                        </span>
                      ) : (
                        <span className="btn badge text-bg-danger rounded-5" style={{ cursor: "default" }}>
                          Rejected
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        {/* View button */}
                        <button
                          type="button"
                          className="btn btn-white border-0"
                          onClick={() => handleViewDetails(request)}
                          title="View Details"
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ color: "rgb(23, 162, 184)" }}
                          />
                        </button>

                        {/* Download documents button */}
                        <button
                          type="button"
                          className="btn btn-white border-0"
                          onClick={() => request.documents && window.open(request.documents, '_blank')}
                          disabled={!request.documents}
                          title={request.documents ? 'View documents' : 'No documents'}
                        >
                          <FontAwesomeIcon
                            icon={faDownload}
                            className={request.documents ? 'text-info' : 'text-muted'}
                          />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        {request.status === 0 ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-white border-0"
                              onClick={() => onApprove(request)}
                              title="Approve Request"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                style={{ color: "rgb(40, 167, 69)" }}
                              />
                            </button>

                            <button
                              type="button"
                              className="btn btn-white border-0"
                              onClick={() => handleRejectClick(request)}
                              title="Reject Request"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="text-danger"
                              />
                            </button>
                          </>
                        ) : (
                          <span className="badge text-bg-secondary rounded-5">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedRequests.length === 0 && (
                  <tr key="no-data">
                    <td colSpan="8">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredRequests.length > 0 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPageCount }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          currentPage === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => onPageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    )
                  )}
                  <li
                    className={`page-item ${
                      currentPage === totalPageCount ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPageCount}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            )}

            {/* Pagination info */}
            {filteredRequests.length > 0 && (
              <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                <p>
                  {startIndex + 1} - {Math.min(endIndex, filteredRequests.length)} trên{" "}
                  {filteredRequests.length} kết quả
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewRequestModal
        visible={viewModalVisible}
        request={selectedRequest}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedRequest(null);
        }}
      />

      <RejectRequestModal
        visible={rejectModalVisible}
        request={selectedRequest}
        onClose={() => {
          setRejectModalVisible(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
};

export default TeacherRequestList;
