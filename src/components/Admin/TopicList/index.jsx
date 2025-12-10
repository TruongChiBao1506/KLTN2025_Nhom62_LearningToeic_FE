import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faPaperPlane,
    faUndo,
    faCheckCircle,
    faTimesCircle,
    faHourglass,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { Modal, message } from 'antd';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import TopicService from '../../../services/topicService';
import topicSubmissionService from '../../../services/topicSubmissionService';
import AddTopicModal from './AddTopicModal';
import EditTopicModal from './EditTopicModal';
import './style.css';

const TopicList = ({ topics = [], retrieveTopics }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered topics based on search text
    const filteredTopics = useMemo(() => {
        if (!topics || !Array.isArray(topics)) {
            return [];
        }

        if (!searchText) {
            return topics.slice();
        }

        return topics.filter((topic) =>
            Object.values(topic).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [topics, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredTopics.length / itemsPerPage);

    const paginatedTopics = useMemo(() => {
        if (!filteredTopics || filteredTopics.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTopics.slice(startIndex, endIndex);
    }, [filteredTopics, currentPage, itemsPerPage]);

    // Reset to first page when topics change
    useEffect(() => {
        setCurrentPage(1);
    }, [topics]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleShowEditModal = (topicId) => {
        setSelectedTopicId(topicId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedTopicId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteTopic = async (topicId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa chủ đề này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await TopicService.delete(topicId);
                retrieveTopics();
                Swal.fire({
                    title: 'Xóa chủ đề thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa chủ đề',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const getImageUrl = (imageName) => {
        if (imageName) {
            return imageName;
        }
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsfjXYvk-1w7U3EVJgTlll6d6I0ntyjj18fg&s";
    };

    const toggleStatus = async (topicId, newStatus) => {
        try {
            // ✅ Find the topic to check approval status
            const topic = paginatedTopics.find(t => t._id === topicId);
            
            // ✅ Block if not approved yet (includes both draft and pending)
            if (!topic.approvedAt) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Chưa Được Phê Duyệt',
                    text: topic.isSubmitted 
                        ? 'Topic này đang chờ admin phê duyệt. Vui lòng chờ phê duyệt trước khi thay đổi trạng thái.'
                        : 'Topic này vẫn đang ở trạng thái bản nháp. Vui lòng gửi duyệt và chờ phê duyệt trước.',
                    confirmButtonText: 'Đã Hiểu',
                    timer: 3000
                });
                return;
            }
            
            console.log(topicId);
            console.log(newStatus);
            await TopicService.updateStatus(topicId, newStatus);
            retrieveTopics();
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateTimeString) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-GB', options);
    };

    // ✅ Validate and submit topic
    const handleSubmitTopic = async (topicId, topicName) => {
        console.log('Submitting topic:', topicId, topicName);
        try {
            // 🚧 SKIP VALIDATION - Submit trực tiếp
            // Show confirmation
            const result = await new Promise((resolve) => {
                Modal.confirm({
                    title: `Xác nhận gửi duyệt Topic`,
                    content: (
                        <div>
                            <p>Topic này sẽ được gửi đến admin để phê duyệt.</p>
                            <p style={{ color: '#666', fontSize: '12px' }}>
                                ⚠️ Sau khi submit, bạn không thể chỉnh sửa cho đến khi admin duyệt/từ chối.
                            </p>
                        </div>
                    ),
                    icon: <i className="fas fa-paper-plane" style={{ color: '#1890ff' }} />,
                    okText: 'Gửi ngay',
                    cancelText: 'Hủy',
                    okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
                    onOk: () => resolve({ isConfirmed: true }),
                    onCancel: () => resolve({ isConfirmed: false }),
                });
            });

            if (!result.isConfirmed) return;

            // Submit to admin
            const submitResponse = await topicSubmissionService.submitTopic(topicId);
            
            if (submitResponse.success) {
                message.success(`Topic "${topicName}" đã được gửi đến admin để phê duyệt.`);
                retrieveTopics(); // Refresh list
            } else {
                throw new Error(submitResponse.message || 'Failed to submit');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            
            // Better error message
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Đã xảy ra lỗi không xác định';
            
            Swal.fire({
                title: '❌ Gửi thất bại',
                html: `
                    <p>${errorMessage}</p>
                    ${error.response?.data?.details ? `
                        <div style="background: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 10px;">
                            <small>${error.response.data.details}</small>
                        </div>
                    ` : ''}
                `,
                icon: 'error',
                confirmButtonText: 'Đóng'
            });
        }
    };

    // ✅ Withdraw submission (if pending)
    const handleWithdrawSubmission = async (topicId, topicName) => {
        const result = await Swal.fire({
            title: `Rút lại submission?`,
            text: `Rút lại "${topicName}" khỏi quy trình phê duyệt`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: 'var(--color-draft)',
            confirmButtonText: 'Rút lại',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const response = await topicSubmissionService.withdrawSubmission(topicId);
                
                if (response.success) {
                    Swal.fire({
                        title: 'Đã rút lại!',
                        text: 'Bạn có thể chỉnh sửa topic này lại',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    retrieveTopics();
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: 'Rút lại thất bại',
                    text: error.response?.data?.message || 'Đã xảy ra lỗi',
                    icon: 'error',
                });
            }
        }
    };

    // ✅ Get submission status badge
    const getSubmissionStatusBadge = (topic) => {
        // Priority 1: Check if approved (has approvedAt or approvedBy)
        if (topic.approvedAt || topic.approvedBy) {
            return (
                <span 
                    className="badge rounded-pill px-3 py-2" 
                    style={{ 
                        backgroundColor: 'var(--color-approved)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        justifyContent: 'center'
                    }}
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Đã duyệt
                </span>
            );
        }

        // Priority 2: Check if rejected (has rejectionReason)
        if (topic.rejectionReason) {
            return (
                <div className="d-flex flex-column align-items-center" style={{ gap: '8px' }}>
                    <span 
                        className="badge rounded-pill px-3 py-2" 
                        style={{ 
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                        }}
                        title={`Lý do từ chối: ${topic.rejectionReason}`}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Bị từ chối
                    </span>
                    <button
                        onClick={() => handleSubmitTopic(topic._id, topic.topicName)}
                        className="btn btn-sm"
                        style={{
                            backgroundColor: '#1e88e5',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '20px',
                            padding: '6px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(30, 136, 229, 0.3)',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                        title="Gửi duyệt lại"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Gửi lại
                    </button>
                </div>
            );
        }

        // Priority 3: Check if pending approval (isSubmitted = true, status = 0)
        if (topic.isSubmitted) {
            return (
                <div className="d-flex flex-column align-items-center" style={{ gap: '8px' }}>
                    <span 
                        className="badge rounded-pill px-3 py-2" 
                        style={{ 
                            backgroundColor: '#ffc107',
                            color: 'var(--color-text-primary)',
                            fontSize: '12px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FontAwesomeIcon icon={faHourglass} />
                        Chờ duyệt
                    </span>
                    <button
                        onClick={() => handleWithdrawSubmission(topic._id, topic.topicName)}
                        className="btn btn-sm"
                        style={{
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '20px',
                            padding: '6px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                        title="Rút lại yêu cầu duyệt"
                    >
                        <FontAwesomeIcon icon={faUndo} />
                        Rút lại
                    </button>
                </div>
            );
        }

        // Draft state (not submitted, not published)
        return (
            <div className="d-flex flex-column align-items-center" style={{ gap: '8px' }}>
                <span 
                    className="badge rounded-pill px-3 py-2" 
                    style={{ 
                        backgroundColor: 'var(--color-draft)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(108, 117, 125, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <FontAwesomeIcon icon={faFileAlt} />
                    Bản nháp
                </span>
                <button
                    onClick={() => handleSubmitTopic(topic._id, topic.topicName)}
                    className="btn btn-sm"
                    style={{
                        backgroundColor: '#1e88e5',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(30, 136, 229, 0.3)',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap'
                    }}
                    title="Gửi để Admin duyệt"
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Gửi duyệt
                </button>
            </div>
        );
    };

    // Pagination info
    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredTopics.length);

    return (
        <div className="page-heading">
            <div className="section">
                <div className="card border-0">
                    <div className="row align-items-center p-3">
                        {/* Items per page selector cải tiến */}
                        <div className="col-3">
                            <div className="d-flex align-items-center px-3 py-2 rounded-4">
                                <label className="fw-semibold me-2 mb-0" htmlFor="itemsPerPageSelect">
                                    Hiển thị:
                                </label>
                                <div style={{ minWidth: 140 }}>
                                    <Select
                                        inputId="itemsPerPageSelect"
                                        classNamePrefix="react-select"
                                        options={itemsPerPageOptions}
                                        value={itemsPerPageOptions.find(opt => opt.value === itemsPerPage)}
                                        onChange={(selected) => {
                                            setItemsPerPage(selected.value);
                                            setCurrentPage(1);
                                        }}
                                        isSearchable={false}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: 30,
                                                minHeight: 32,
                                                borderColor: '#198754',
                                                boxShadow: 'none',
                                                fontWeight: 400,
                                                color: '#198754',
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                borderRadius: 30,
                                                color: state.isSelected ? 'var(--color-bg-primary)' : '#198754',
                                                backgroundColor: state.isSelected
                                                    ? '#198754'
                                                    : state.isFocused
                                                        ? '#e6f7ef'
                                                        : 'var(--color-bg-primary)',
                                                ':active': { backgroundColor: '#43c59e', color: 'var(--color-bg-primary)' }
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                borderRadius: 20,
                                                overflow: 'hidden'
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
                                    placeholder="Tìm kiếm chủ đề..."
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-light-emphasis">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add button */}
                        <div className="col-3" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexDirection: 'row' }}>
                            <button
                                type="button"
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleShowAddModal}
                                title="Thêm chủ đề mới"
                                style={{ 
                                    borderRadius: '20px', 
                                    fontSize: '12px', 
                                    padding: '10px 18px', 
                                    whiteSpace: 'nowrap', 
                                    flexShrink: 0,
                                    minWidth: '110px',
                                    justifyContent: 'center'
                                }}
                            >
                                <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                Thêm mới
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                                    <th>TOPIC</th>
                                    <th>IMAGE</th>
                                    <th>STATUS</th>
                                    <th>SUBMISSION</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                    <th>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTopics.map((topic, index) => (
                                    <tr key={topic._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{topic.topicName}</td>
                                        <td>
                                            <img
                                                src={getImageUrl(topic.topicImage)}
                                                alt="Topic"
                                                className="topic-image rounded-5"
                                            />
                                        </td>
                                        <td>
                                            {topic.topicStatus === 1 ? (
                                                <span
                                                    onClick={() => {
                                                        if (!topic.approvedAt) {
                                                            return;
                                                        }
                                                        toggleStatus(topic._id, 0);
                                                    }}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ 
                                                        cursor: !topic.approvedAt ? 'not-allowed' : 'pointer',
                                                        opacity: !topic.approvedAt ? 0.6 : 1
                                                    }}
                                                    title={!topic.approvedAt ? (topic.isSubmitted ? 'Chờ phê duyệt' : 'Bản nháp') : 'Click để disable'}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => {
                                                        if (!topic.approvedAt) {
                                                            return;
                                                        }
                                                        toggleStatus(topic._id, 1);
                                                    }}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ 
                                                        cursor: !topic.approvedAt ? 'not-allowed' : 'pointer',
                                                        opacity: !topic.approvedAt ? 0.6 : 1
                                                    }}
                                                    title={!topic.approvedAt ? (topic.isSubmitted ? 'Chờ phê duyệt' : 'Bản nháp') : 'Click để enable'}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {getSubmissionStatusBadge(topic)}
                                        </td>

                                        <td>{formatDate(topic.createdAt)}</td>
                                        <td>{formatDate(topic.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(topic._id)}
                                                    title={`Chỉnh sửa [${topic.topicName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTopic(topic._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${topic.topicName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <Link to={`/teacher/topics/${topic._id}/vocabulary`}>
                                                    <button className="glowing-button ms-2">Từ vựng</button>
                                                </Link>

                                                <Link to={`/teacher/topics/${topic._id}/vocabulary-question`}>
                                                    <button className="glowing-button ms-2">Câu hỏi</button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedTopics.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="9">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredTopics.length > 0 && (
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => changePage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            &laquo;
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPageCount }, (_, i) => i + 1).map((pageNumber) => (
                                        <li
                                            key={pageNumber}
                                            className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => changePage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPageCount ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => changePage(currentPage + 1)}
                                            disabled={currentPage === totalPageCount}
                                        >
                                            &raquo;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}

                        {/* Pagination info */}
                        {filteredTopics.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredTopics.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddTopicModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                retrieveTopics={retrieveTopics}
            />

            <EditTopicModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                topicId={selectedTopicId}
                retrieveTopics={retrieveTopics}
            />
        </div>
    );
};

export default TopicList;