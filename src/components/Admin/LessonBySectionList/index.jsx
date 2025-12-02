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
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import LessonService from '../../../services/lessonService';
import lessonSubmissionService from '../../../services/lessonSubmissionService';
import AddLessonModal from './AddLessonModal';
import EditLessonModal from './EditLessonModal';
import './style.css';

const LessonBySectionList = ({ lessons = [], sectionId, retrieveLessons }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState(null);

    const itemsPerPageOptions = [25, 50, 75, 100].map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered lessons based on search text
    const filteredLessons = useMemo(() => {
        if (!lessons || !Array.isArray(lessons)) {
            return [];
        }

        if (!searchText) {
            return lessons.slice();
        }

        return lessons.filter((lesson) =>
            Object.values(lesson).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [lessons, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredLessons.length / itemsPerPage);

    const paginatedLessons = useMemo(() => {
        if (!filteredLessons || filteredLessons.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredLessons.slice(startIndex, endIndex);
    }, [filteredLessons, currentPage, itemsPerPage]);

    // Reset to first page when lessons change
    useEffect(() => {
        setCurrentPage(1);
    }, [lessons]);

    // Modal handlers
    const handleShowAddModal = () => {
        console.log('Opening Add Modal');
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        console.log('Closing Add Modal');
        setShowAddModal(false);
    };

    const handleShowEditModal = (lessonId) => {
        console.log('Opening Edit Modal for lesson:', lessonId);
        setSelectedLessonId(lessonId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        console.log('Closing Edit Modal');
        setShowEditModal(false);
        setSelectedLessonId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteLesson = async (lessonId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa bài học này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await LessonService.delete(lessonId);
                retrieveLessons();
                Swal.fire({
                    title: 'Xóa bài học thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa bài học',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (lessonId, newStatus) => {
        try {
            await LessonService.updateStatus(lessonId, newStatus);
            retrieveLessons();
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

    // ✅ Validate and submit lesson
    const handleSubmitLesson = async (lessonId, lessonName) => {
        try {
            // Step 1: Validate lesson
            const validateResponse = await lessonSubmissionService.validateLesson(lessonId);
            const validationData = validateResponse.data;

            if (!validationData.isValid) {
                // Show validation errors
                const issuesList = validationData.issues.map(issue => `• ${issue}`).join('<br>');
                
                await Swal.fire({
                    title: '❌ Không thể submit',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Lesson "${lessonName}" chưa đủ điều kiện để submit:</strong></p>
                            <div style="margin-top: 10px; color: #d33;">
                                ${issuesList}
                            </div>
                        </div>
                    `,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                });
                return;
            }

            // Step 2: Show confirmation with statistics
            const summary = validationData.summary || {};
            const result = await Swal.fire({
                title: '📤 Submit Lesson để Admin duyệt?',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Lesson:</strong> ${lessonName}</p>
                        <hr>
                        <p><strong>📊 Thống kê:</strong></p>
                        <ul style="list-style: none; padding-left: 0;">
                            <li>📝 Lesson Content: <strong>${summary.contentCount || 0}</strong></li>
                            <li>📄 File PDF: <strong>${summary.hasFile ? 'Có' : 'Không'}</strong></li>
                        </ul>
                        <hr>
                        <p style="color: #666; font-size: 12px;">
                            ⚠️ Sau khi submit, bạn không thể chỉnh sửa cho đến khi Admin phê duyệt hoặc từ chối.
                        </p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'var(--color-approved)',
                cancelButtonColor: 'var(--color-draft)',
                confirmButtonText: '✅ Submit',
                cancelButtonText: '❌ Hủy',
                width: 600,
            });

            if (!result.isConfirmed) return;

            // Step 3: Submit lesson
            await lessonSubmissionService.submitLesson(lessonId);

            // Step 4: Show success message
            await Swal.fire({
                title: '✅ Submit thành công!',
                html: `
                    <div style="text-align: center;">
                        <p>Lesson <strong>"${lessonName}"</strong> đã được gửi đến Admin để phê duyệt.</p>
                        <p style="color: #666; margin-top: 10px;">
                            Bạn sẽ nhận được thông báo khi Admin xem xét.
                        </p>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: 'var(--color-approved)',
                timer: 3000,
            });

            // Refresh list
            retrieveLessons();

        } catch (error) {
            console.error('Error submitting lesson:', error);
            
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi submit lesson';
            
            await Swal.fire({
                title: '❌ Lỗi',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#d33',
            });
        }
    };

    // ✅ Withdraw submission (if pending)
    const handleWithdrawSubmission = async (lessonId, lessonName) => {
        const result = await Swal.fire({
            title: '🔙 Rút lại submission?',
            html: `
                <p>Bạn có chắc muốn rút lại submission của lesson <strong>"${lessonName}"</strong>?</p>
                <p style="color: #666; font-size: 12px;">Sau khi rút lại, bạn có thể chỉnh sửa và submit lại.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            cancelButtonColor: 'var(--color-draft)',
            confirmButtonText: '✅ Rút lại',
            cancelButtonText: '❌ Hủy',
        });

        if (!result.isConfirmed) return;

        try {
            await lessonSubmissionService.withdrawSubmission(lessonId);

            await Swal.fire({
                title: '✅ Đã rút lại!',
                text: `Lesson "${lessonName}" đã được rút lại. Bạn có thể chỉnh sửa và submit lại.`,
                icon: 'success',
                confirmButtonColor: 'var(--color-approved)',
                timer: 2000,
            });

            retrieveLessons();
        } catch (error) {
            console.error('Error withdrawing submission:', error);
            
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi rút lại submission';
            
            await Swal.fire({
                title: '❌ Lỗi',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#d33',
            });
        }
    };

    // ✅ Get submission status badge
    const getSubmissionStatusBadge = (lesson) => {
        // Priority 1: Check if approved (has approvedAt and approvedBy)
        if (lesson.approvedAt && lesson.approvedBy) {
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
        if (lesson.rejectionReason) {
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
                        title={`Lý do từ chối: ${lesson.rejectionReason}`}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Bị từ chối
                    </span>
                    <button
                        onClick={() => handleSubmitLesson(lesson._id, lesson.lessonName)}
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
        if (lesson.isSubmitted) {
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
                        onClick={() => handleWithdrawSubmission(lesson._id, lesson.lessonName)}
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
                    onClick={() => handleSubmitLesson(lesson._id, lesson.lessonName)}
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredLessons.length);

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
                                    placeholder="Tìm kiếm bài học..."
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
                                title="Thêm bài học mới"
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
                                    <th>SUBMISSION</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                    <th>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLessons.map((lesson, index) => (
                                    <tr key={lesson._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{lesson.lessonName}</td>
                                        <td>
                                            {lesson.lessonStatus === 1 ? (
                                                <span
                                                    onClick={() => toggleStatus(lesson._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => toggleStatus(lesson._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        
                                        {/* ✅ Submission Column */}
                                        <td>
                                            {getSubmissionStatusBadge(lesson)}
                                        </td>

                                        <td>{formatDate(lesson.createdAt)}</td>
                                        <td>{formatDate(lesson.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(lesson._id)}
                                                    title={`Chỉnh sửa [${lesson.lessonName}]`}
                                                    disabled={lesson.isSubmitted && lesson.lessonStatus === 0}
                                                    style={{ 
                                                        opacity: (lesson.isSubmitted && lesson.lessonStatus === 0) ? 0.5 : 1,
                                                        cursor: (lesson.isSubmitted && lesson.lessonStatus === 0) ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteLesson(lesson._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${lesson.lessonName}]`}
                                                    disabled={lesson.isSubmitted && lesson.lessonStatus === 0}
                                                    style={{ 
                                                        opacity: (lesson.isSubmitted && lesson.lessonStatus === 0) ? 0.5 : 1,
                                                        cursor: (lesson.isSubmitted && lesson.lessonStatus === 0) ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <Link
                                                    to={`/teacher/sections/${sectionId}/lesson/${lesson._id}/lesson-content`}
                                                >
                                                    <button className="glowing-button">
                                                        Lesson Content
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedLessons.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="8">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredLessons.length > 0 && (
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
                        {filteredLessons.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredLessons.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Use React Bootstrap Modals */}
            <AddLessonModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                sectionId={sectionId}
                retrieveLessons={retrieveLessons}
            />

            <EditLessonModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                lessonId={selectedLessonId}
                sectionId={sectionId}
                retrieveLessons={retrieveLessons}
            />
        </div>
    );
};

export default LessonBySectionList;