import React, { useState, useEffect, useMemo } from 'react';
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
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import ExamService from '../../../services/examService';
import examSubmissionService from '../../../services/examSubmissionService';
import AddExamModal from './AddExamModal';
import EditExamModal from './EditExamModal';
import './style.css';

const ExamList = ({ exams = [], retrieveExams, showFullTest, setShowFullTest }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered exams based on search text
    const filteredExams = useMemo(() => {
        if (!exams || !Array.isArray(exams)) {
            return [];
        }

        if (!searchText) {
            return exams.slice();
        }

        return exams.filter((exam) =>
            Object.values(exam).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [exams, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredExams.length / itemsPerPage);

    const paginatedExams = useMemo(() => {
        if (!filteredExams || filteredExams.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredExams.slice(startIndex, endIndex);
    }, [filteredExams, currentPage, itemsPerPage]);

    // Reset to first page when exams change
    useEffect(() => {
        setCurrentPage(1);
    }, [exams]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleShowEditModal = (examId) => {
        setSelectedExamId(examId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedExamId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteExam = async (examId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa Exam này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                console.log(examId);
                await ExamService.delete(examId);
                retrieveExams();
                Swal.fire({
                    title: 'Xóa bài thi thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa bài thi',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (examId, newStatus) => {
        try {
            console.log(examId);
            console.log(newStatus);
            await ExamService.updateStatus(examId, newStatus);
            retrieveExams();
        } catch (error) {
            console.error(error);
        }
    };

    const getExamType = (type) => {
        switch (type) {
            case 0:
                return "Mini Test";
            case 1:
                return "Full Test";
            default:
                return "Unknown";
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

    // ✅ Submit exam for approval
    const handleSubmitExam = async (examId, examName) => {
        try {
            // Step 1: Validate exam before submission
            const validationResult = await examSubmissionService.validateExam(examId);
            
            if (!validationResult.isValid) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cannot Submit Exam',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Exam:</strong> ${examName}</p>
                            <p>${validationResult.message}</p>
                            ${validationResult.issues ? `
                                <ul>
                                    ${validationResult.issues.map(issue => `<li>${issue}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `,
                    confirmButtonText: 'Understood',
                    confirmButtonColor: '#d33'
                });
                return;
            }

            // Step 2: Show submission confirmation with statistics
            const stats = validationResult.statistics || {};
            const result = await Swal.fire({
                title: 'Submit Exam for Approval?',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Exam:</strong> ${examName}</p>
                        <p style="margin-top: 15px;"><strong>Statistics:</strong></p>
                        <ul style="margin-top: 10px;">
                            <li>Questions: <strong>${stats.questionCount || 0}</strong></li>
                            <li>Type: <strong>${showFullTest ? 'Full Test' : 'Mini Test'}</strong></li>
                        </ul>
                        <p style="margin-top: 15px; color: #666;">
                            After submission, admin will review your exam. You will be notified once it's approved or if changes are needed.
                        </p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Submit',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) return;

            // Step 3: Submit exam
            await examSubmissionService.submitExam(examId);
            
            // Step 4: Show success message
            Swal.fire({
                icon: 'success',
                title: 'Exam Submitted!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Exam:</strong> ${examName}</p>
                        <p style="margin-top: 10px;">Your exam has been submitted for admin review.</p>
                        <p style="margin-top: 10px; color: #666;">
                            You will receive a notification when the admin reviews your exam.
                        </p>
                    </div>
                `,
                confirmButtonText: 'Great!',
                confirmButtonColor: 'var(--color-approved)'
            });

            // Step 5: Refresh exam list
            retrieveExams();
        } catch (error) {
            console.error('Error submitting exam:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Failed to submit exam. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
    };

    // ✅ Withdraw exam submission
    const handleWithdrawSubmission = async (examId, examName) => {
        try {
            const result = await Swal.fire({
                title: 'Withdraw Submission?',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Exam:</strong> ${examName}</p>
                        <p style="margin-top: 15px; color: #666;">
                            This will withdraw your submission and return the exam to draft status.
                            You can edit and resubmit it later.
                        </p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, Withdraw',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) return;

            await examSubmissionService.withdrawSubmission(examId);
            
            Swal.fire({
                icon: 'success',
                title: 'Submission Withdrawn',
                text: `Exam "${examName}" has been withdrawn. You can edit and resubmit it.`,
                confirmButtonText: 'OK',
                confirmButtonColor: 'var(--color-approved)'
            });

            retrieveExams();
        } catch (error) {
            console.error('Error withdrawing submission:', error);
            Swal.fire({
                icon: 'error',
                title: 'Withdrawal Failed',
                text: error.response?.data?.message || 'Failed to withdraw submission. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
    };

    // ✅ Get submission status badge
    const getSubmissionStatusBadge = (exam) => {
        // Priority 1: Check if approved (has approvedAt and approvedBy)
        if (exam.approvedAt && exam.approvedBy) {
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
        if (exam.rejectionReason) {
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
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                        }}
                        title={`Lý do từ chối: ${exam.rejectionReason}`}
                        onClick={() => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Lý do từ chối',
                                html: `
                                    <div style="text-align: left;">
                                        <p><strong>Exam:</strong> ${exam.examName}</p>
                                        <p style="margin-top: 15px;"><strong>Phản hồi từ Admin:</strong></p>
                                        <p style="margin-top: 10px; padding: 15px; background-color: var(--color-danger-bg); border-left: 3px solid var(--color-danger); border-radius: 4px;">
                                            ${exam.rejectionReason}
                                        </p>
                                        <p style="margin-top: 15px; color: #666; font-size: 12px;">
                                            Vui lòng chỉnh sửa và gửi lại.
                                        </p>
                                    </div>
                                `,
                                confirmButtonText: 'Đã hiểu',
                                confirmButtonColor: '#d33'
                            });
                        }}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Bị từ chối
                    </span>
                    <button
                        onClick={() => handleSubmitExam(exam._id, exam.examName)}
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
        if (exam.isSubmitted) {
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
                        onClick={() => handleWithdrawSubmission(exam._id, exam.examName)}
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
                    onClick={() => handleSubmitExam(exam._id, exam.examName)}
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredExams.length);

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
                                    placeholder="Tìm kiếm bài thi..."
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
                                title="Thêm bài thi mới"
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
                        <div className="table-responsive">
                            <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th style={{ width: '50px' }}><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                                    <th style={{ width: '15%', minWidth: '150px' }}>EXAM</th>
                                    <th style={{ width: '90px' }}>TYPE</th>
                                    <th style={{ width: '80px' }}>TIME</th>
                                    <th style={{ width: '80px' }}>STATUS</th>
                                    <th style={{ width: '110px' }}>CREATED</th>
                                    <th style={{ width: '110px' }}>UPDATED</th>
                                    <th style={{ width: '100px' }}>SUBMISSION</th>
                                    <th style={{ width: '90px' }}>ACTION</th>
                                    <th style={{ width: '140px' }}>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedExams.map((exam, index) => (
                                    <tr key={exam._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <div className="text-wrap" title={exam.examName}>
                                                {exam.examName}
                                            </div>
                                        </td>
                                        <td>{getExamType(exam.examType)}</td>
                                        <td>{exam.examDuration ? `${exam.examDuration / 60} phút` : 'N/A'}</td>
                                        <td>
                                            {exam.examStatus === 1 ? (
                                                <span
                                                    onClick={() => toggleStatus(exam._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => toggleStatus(exam._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="text-wrap small">{formatDate(exam.createdAt)}</div>
                                        </td>
                                        <td>
                                            <div className="text-wrap small">{formatDate(exam.updatedAt)}</div>
                                        </td>
                                        
                                        {/* ✅ Submission Column */}
                                        <td>
                                            {getSubmissionStatusBadge(exam)}
                                        </td>
                                        
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(exam._id)}
                                                    title={`Chỉnh sửa [${exam.examName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteExam(exam._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${exam.examName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <div className="d-flex justify-content-center">
                                                <Link to={`/teacher/exams/${exam._id}/exam-question`}>
                                                    <button className="glowing-button-compact">Questions</button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedExams.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="10">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredExams.length > 0 && (
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
                        {filteredExams.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredExams.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddExamModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                retrieveExams={retrieveExams}
                setShowFullTest={setShowFullTest}
            />

            <EditExamModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                examId={selectedExamId}
                retrieveExams={retrieveExams}
            />
        </div>
    );
};

export default ExamList;