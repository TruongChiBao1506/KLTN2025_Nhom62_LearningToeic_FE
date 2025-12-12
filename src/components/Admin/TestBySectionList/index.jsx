import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faPaperPlane,
    faUndo,
    faFileAlt,
    faTimesCircle,
    faHourglass,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { Modal, message } from 'antd';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useAuthStore } from '../../../hooks/useAuthStore';

import TestService from '../../../services/testService';
import testSubmissionService from '../../../services/testSubmissionService';
import AddTestModal from './AddTestModal';
import EditTestModal from './EditTestModal';
import './style.css';

const TestBySectionList = ({ tests = [], sectionId, retrieveTests }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Get current user from auth store
    const { info, role } = useAuthStore();
    const effectiveUserId = info?.id || null;

    // Helper: Normalize creator id in test object
    const getCreatorId = (test) => {
        if (!test) return null;
        const c = test.createdBy || null;
        if (!c) return null;
        if (typeof c === 'string') return c;
        if (typeof c === 'object') {
            if (c._id) return c._id;
            if (c.id) return c.id;
            if (c.userId) return c.userId;
            if (c.$oid) return c.$oid;
        }
        return null;
    };

    // Filtered tests based on search text
    const filteredTests = useMemo(() => {
        if (!tests || !Array.isArray(tests)) {
            return [];
        }

        // Start from the full list
        let base = tests.slice();
        // If we have a current user id and user is not admin, filter to only tests created by them
        if (effectiveUserId && role !== 'admin') {
            base = base.filter((t) => getCreatorId(t) === effectiveUserId);
        }

        if (!searchText) {
            return base;
        }

        return base.filter((test) =>
            Object.values(test).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [tests, searchText, effectiveUserId, role]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredTests.length / itemsPerPage);

    const paginatedTests = useMemo(() => {
        if (!filteredTests || filteredTests.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTests.slice(startIndex, endIndex);
    }, [filteredTests, currentPage, itemsPerPage]);

    // Reset to first page when tests change
    useEffect(() => {
        setCurrentPage(1);
    }, [tests, effectiveUserId, role]);

    // Modal handlers
    const handleShowAddModal = () => {
        console.log('🔄 Opening Add Test Modal');
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        console.log('🔄 Closing Add Test Modal');
        setShowAddModal(false);
    };

    const handleShowEditModal = (testId) => {
        console.log('🔄 Opening Edit Test Modal for:', testId);
        setSelectedTestId(testId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        console.log('🔄 Closing Edit Test Modal');
        setShowEditModal(false);
        setSelectedTestId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteTest = async (testId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa bài kiểm tra này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await TestService.delete(testId);
                retrieveTests();
                Swal.fire({
                    title: 'Xóa bài kiểm tra thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa bài kiểm tra',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (testId, newStatus) => {
        try {
            // ✅ Find the test to check approval status
            const test = paginatedTests.find(t => (t.testId || t._id) === testId);
            
            // ✅ Block if not approved yet (includes both draft and pending)
            if (!test.approvedAt) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Chưa Được Phê Duyệt',
                    text: test.isSubmitted 
                        ? 'Test này đang chờ admin phê duyệt. Vui lòng chờ phê duyệt trước khi thay đổi trạng thái.'
                        : 'Test này vẫn đang ở trạng thái bản nháp. Vui lòng gửi duyệt và chờ phê duyệt trước.',
                    confirmButtonText: 'Đã Hiểu',
                    timer: 3000
                });
                return;
            }
            
            console.log('Test ID:', testId);
            console.log('New Status:', newStatus);
            await TestService.updateStatus(testId, newStatus);
            retrieveTests();
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

    // ✅ Validate and submit test
    const handleSubmitTest = async (testId, testName) => {
        try {
            // Step 1: Validate test
            const validationResult = await testSubmissionService.validateTest(testId);
            
            if (!validationResult.data.isValid) {
                // Show validation errors
                const issuesHtml = validationResult.data.issues
                    .map(issue => `<li class="text-start">${issue}</li>`)
                    .join('');
                
                await Swal.fire({
                    icon: 'warning',
                    title: 'Không thể gửi duyệt',
                    html: `
                        <div class="text-start">
                            <p><strong>${testName}</strong> chưa đáp ứng các yêu cầu sau:</p>
                            <ul>${issuesHtml}</ul>
                            <p class="text-muted mt-3">
                                <i class="fas fa-info-circle"></i> 
                                Vui lòng hoàn thiện nội dung trước khi gửi duyệt.
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Đã hiểu',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            // Step 2: Show confirmation with statistics
            const { summary } = validationResult.data;
            const result = await new Promise((resolve) => {
                Modal.confirm({
                    title: 'Xác nhận gửi duyệt Test',
                    content: (
                        <div>
                            <p>Bạn có chắc muốn gửi <strong>{testName}</strong> để Admin duyệt?</p>
                            <div style={{ background: '#e6f7ff', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
                                <strong>📊 Thống kê:</strong>
                                <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                                    <li><strong>Số câu hỏi:</strong> {summary.questionCount || 0} câu</li>
                                </ul>
                            </div>
                            <p style={{ color: '#666', fontSize: '12px' }}>
                                <i className="fas fa-info-circle"></i> 
                                Sau khi gửi, bạn không thể chỉnh sửa cho đến khi Admin phê duyệt hoặc từ chối.
                            </p>
                        </div>
                    ),
                    icon: <i className="fas fa-paper-plane" style={{ color: '#1890ff' }} />,
                    okText: 'Gửi duyệt',
                    cancelText: 'Hủy',
                    okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
                    onOk: () => resolve({ isConfirmed: true }),
                    onCancel: () => resolve({ isConfirmed: false }),
                });
            });

            if (!result.isConfirmed) return;

            // Step 3: Submit test
            await testSubmissionService.submitTest(testId);

            // Step 4: Success message
            message.success(`Test "${testName}" đã được gửi đến Admin để duyệt.`);

            // Refresh list
            retrieveTests();

        } catch (error) {
            console.error('Submit test error:', error);
            
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi duyệt';
            
            Swal.fire({
                icon: 'error',
                title: 'Lỗi gửi duyệt',
                text: errorMessage,
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#d33',
            });
        }
    };

    // ✅ Withdraw submission (if pending)
    const handleWithdrawSubmission = async (testId, testName) => {
        try {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Xác nhận rút lại',
                html: `
                    <p>Bạn có chắc muốn rút lại yêu cầu duyệt <strong>${testName}</strong>?</p>
                    <p class="text-muted small">
                        <i class="fas fa-info-circle"></i> 
                        Sau khi rút lại, bạn có thể chỉnh sửa và gửi duyệt lại.
                    </p>
                `,
                showCancelButton: true,
                confirmButtonText: 'Rút lại',
                cancelButtonText: 'Hủy',
                confirmButtonColor: 'var(--color-danger)',
                cancelButtonColor: 'var(--color-draft)',
            });

            if (!result.isConfirmed) return;

            await testSubmissionService.withdrawSubmission(testId);

            Swal.fire({
                icon: 'success',
                title: 'Đã rút lại yêu cầu duyệt',
                text: 'Bạn có thể chỉnh sửa test này ngay bây giờ.',
                timer: 2000,
                showConfirmButton: false,
            });

            retrieveTests();

        } catch (error) {
            console.error('Withdraw submission error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi rút lại',
                text: error?.response?.data?.message || 'Có lỗi xảy ra',
                confirmButtonText: 'Đóng',
            });
        }
    };

    // ✅ Get submission status badge
    const getSubmissionStatusBadge = (test) => {
        // Priority 1: Check if approved (has approvedAt and approvedBy)
        if (test.approvedAt && test.approvedBy) {
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
        if (test.rejectionReason) {
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
                        title={`Lý do từ chối: ${test.rejectionReason}`}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Bị từ chối
                    </span>
                    <button
                        onClick={() => handleSubmitTest(test._id, test.testName)}
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
        if (test.isSubmitted) {
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
                        onClick={() => handleWithdrawSubmission(test._id, test.testName)}
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
                    onClick={() => handleSubmitTest(test._id, test.testName)}
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredTests.length);

    return (
        <div className="page-heading">
            <section className="section">
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
                                    placeholder="Tìm kiếm"
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-light-emphasis">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add button styled like TopicList */}
                        <div className="col-3" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexDirection: 'row' }}>
                            <button
                                type="button"
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleShowAddModal}
                                title="Thêm mới bài kiểm tra"
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
                                    <th>NAME</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>SUBMISSION</th>
                                    <th>ACTION</th>
                                    <th>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTests.map((test, index) => (
                                    <tr
                                        key={test.testId || test._id}
                                        className="table-row shadow-on-hover align-middle"
                                    >
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{test.testName}</td>
                                        <td>
                                            {test.testStatus === 1 ? (
                                                <span
                                                    onClick={() => {
                                                        if (!test.approvedAt) {
                                                            return;
                                                        }
                                                        toggleStatus(test.testId || test._id, 0);
                                                    }}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ 
                                                        cursor: !test.approvedAt ? 'not-allowed' : 'pointer',
                                                        opacity: !test.approvedAt ? 0.6 : 1
                                                    }}
                                                    title={!test.approvedAt ? (test.isSubmitted ? 'Chờ phê duyệt' : 'Bản nháp') : 'Click để disable'}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => {
                                                        if (!test.approvedAt) {
                                                            return;
                                                        }
                                                        toggleStatus(test.testId || test._id, 1);
                                                    }}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ 
                                                        cursor: !test.approvedAt ? 'not-allowed' : 'pointer',
                                                        opacity: !test.approvedAt ? 0.6 : 1
                                                    }}
                                                    title={!test.approvedAt ? (test.isSubmitted ? 'Chờ phê duyệt' : 'Bản nháp') : 'Click để enable'}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(test.createdAt)}</td>
                                        <td>{formatDate(test.updatedAt)}</td>
                                        
                                        {/* ✅ Submission Column */}
                                        <td>
                                            {getSubmissionStatusBadge(test)}
                                        </td>
                                        
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(test.testId || test._id)}
                                                    title={`Chỉnh sửa [${test.testName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTest(test.testId || test._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${test.testName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <Link
                                                    to={`/teacher/section/${sectionId}/test/${test.testId || test._id}/indicate-questions`}
                                                >
                                                    <button className="glowing-button ms-2">
                                                        Câu hỏi chỉ định
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedTests.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="8">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredTests.length > 0 && (
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
                        {filteredTests.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredTests.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddTestModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                sectionId={sectionId}
                retrieveTests={retrieveTests}
            />

            <EditTestModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                testId={selectedTestId}
                sectionId={sectionId}
                retrieveTests={retrieveTests}
            />
        </div>
    );
};

export default TestBySectionList;