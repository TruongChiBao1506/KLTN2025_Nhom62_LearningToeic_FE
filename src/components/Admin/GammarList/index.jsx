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

import GrammarService from '../../../services/grammarService';
import grammarSubmissionService from '../../../services/grammarSubmissionService';
import AddGrammarModal from './AddGrammarModal';
import EditGrammarModal from './EditGrammarModal';
import './style.css';

const GrammarList = ({ grammars = [], retrieveGrammars }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGrammarId, setSelectedGrammarId] = useState(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered grammars based on search text
    const filteredGrammars = useMemo(() => {
        if (!grammars || !Array.isArray(grammars)) {
            return [];
        }

        if (!searchText) {
            return grammars.slice();
        }

        return grammars.filter((grammar) =>
            Object.values(grammar).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [grammars, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredGrammars.length / itemsPerPage);

    const paginatedGrammars = useMemo(() => {
        if (!filteredGrammars || filteredGrammars.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredGrammars.slice(startIndex, endIndex);
    }, [filteredGrammars, currentPage, itemsPerPage]);

    // Reset to first page when grammars change
    useEffect(() => {
        setCurrentPage(1);
    }, [grammars]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleShowEditModal = (grammarId) => {
        setSelectedGrammarId(grammarId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedGrammarId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteGrammar = async (grammarId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa ngữ pháp này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await GrammarService.delete(grammarId);
                retrieveGrammars();
                Swal.fire({
                    title: 'Xóa ngữ pháp thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa ngữ pháp',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (grammarId, newStatus) => {
        try {
            console.log(grammarId);
            console.log(newStatus);
            await GrammarService.updateStatus(grammarId, newStatus);
            retrieveGrammars();
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

    // ✅ Validate and submit grammar
    const handleSubmitGrammar = async (grammarId, grammarName) => {
        try {
            // Step 1: Validate grammar
            const validationResult = await grammarSubmissionService.validateGrammar(grammarId);
            
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
                            <p><strong>${grammarName}</strong> chưa đáp ứng các yêu cầu sau:</p>
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
            const result = await Swal.fire({
                icon: 'question',
                title: 'Xác nhận gửi duyệt',
                html: `
                    <div class="text-start">
                        <p class="mb-3">Bạn có chắc muốn gửi <strong>${grammarName}</strong> để Admin duyệt?</p>
                        <div class="alert alert-info">
                            <strong>📊 Thống kê nội dung:</strong>
                            <ul class="mb-0 mt-2">
                                <li><strong>Nội dung:</strong> ${summary.contentCount} phần</li>
                                <li><strong>Câu hỏi:</strong> ${summary.questionCount} câu</li>
                            </ul>
                        </div>
                        <p class="text-muted small mt-3">
                            <i class="fas fa-info-circle"></i> 
                            Sau khi gửi, bạn không thể chỉnh sửa cho đến khi Admin phê duyệt hoặc từ chối.
                        </p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-paper-plane"></i> Gửi duyệt',
                cancelButtonText: 'Hủy',
                confirmButtonColor: 'var(--color-approved)',
                cancelButtonColor: 'var(--color-draft)',
            });

            if (!result.isConfirmed) return;

            // Step 3: Submit grammar
            await grammarSubmissionService.submitGrammar(grammarId);

            // Step 4: Success message
            await Swal.fire({
                icon: 'success',
                title: 'Gửi duyệt thành công! 🎉',
                html: `
                    <p><strong>${grammarName}</strong> đã được gửi đến Admin để duyệt.</p>
                    <p class="text-muted small">
                        <i class="fas fa-bell"></i> 
                        Bạn sẽ nhận được thông báo khi Admin xét duyệt.
                    </p>
                `,
                timer: 3000,
                showConfirmButton: false,
            });

            // Refresh list
            retrieveGrammars();

        } catch (error) {
            console.error('Submit grammar error:', error);
            
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
    const handleWithdrawSubmission = async (grammarId, grammarName) => {
        try {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Xác nhận rút lại',
                html: `
                    <p>Bạn có chắc muốn rút lại yêu cầu duyệt <strong>${grammarName}</strong>?</p>
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

            await grammarSubmissionService.withdrawSubmission(grammarId);

            Swal.fire({
                icon: 'success',
                title: 'Đã rút lại yêu cầu duyệt',
                text: 'Bạn có thể chỉnh sửa grammar này ngay bây giờ.',
                timer: 2000,
                showConfirmButton: false,
            });

            retrieveGrammars();

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
    const getSubmissionStatusBadge = (grammar) => {
        // Priority 1: Check if approved (has approvedAt and approvedBy)
        if (grammar.approvedAt && grammar.approvedBy) {
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
        if (grammar.rejectionReason) {
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
                        title={`Lý do từ chối: ${grammar.rejectionReason}`}
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Bị từ chối
                    </span>
                    <button
                        onClick={() => handleSubmitGrammar(grammar._id, grammar.grammarName)}
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
        if (grammar.isSubmitted) {
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
                        onClick={() => handleWithdrawSubmission(grammar._id, grammar.grammarName)}
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
                    onClick={() => handleSubmitGrammar(grammar._id, grammar.grammarName)}
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredGrammars.length);

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
                                    placeholder="Tìm kiếm ngữ pháp..."
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
                                title="Thêm ngữ pháp mới"
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
                            <thead className="text-center shadow">
                                <tr className="align-middle">
                                    <th style={{ width: '50px' }}><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                                    <th style={{ width: '25%', minWidth: '150px' }}>GRAMMAR</th>
                                    <th style={{ width: '80px' }}>STATUS</th>
                                    <th style={{ width: '110px' }}>CREATED</th>
                                    <th style={{ width: '110px' }}>UPDATED</th>
                                    <th style={{ width: '100px' }}>SUBMISSION</th>
                                    <th style={{ width: '90px' }}>ACTION</th>
                                    <th style={{ width: '200px' }}>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedGrammars.map((grammar, index) => (
                                    <tr key={grammar._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <div className="text-wrap" title={grammar.grammarName}>
                                                {grammar.grammarName}
                                            </div>
                                        </td>
                                        <td>
                                            {grammar.grammarStatus === 1 ? (
                                                <span
                                                    onClick={() => toggleStatus(grammar._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => toggleStatus(grammar._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="text-wrap small">{formatDate(grammar.createdAt)}</div>
                                        </td>
                                        <td>
                                            <div className="text-wrap small">{formatDate(grammar.updatedAt)}</div>
                                        </td>
                                        <td>
                                            {getSubmissionStatusBadge(grammar)}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(grammar._id)}
                                                    title={`Chỉnh sửa [${grammar.grammarName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteGrammar(grammar._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${grammar.grammarName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-1 flex-wrap">
                                                <Link to={`/teacher/grammar/${grammar._id}/grammar-content`}>
                                                    <button className="glowing-button-compact">Content</button>
                                                </Link>

                                                <Link to={`/teacher/grammar/${grammar._id}/grammar-question`}>
                                                    <button className="glowing-button-compact">Question</button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedGrammars.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="8">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredGrammars.length > 0 && (
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
                        {filteredGrammars.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredGrammars.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddGrammarModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                retrieveGrammars={retrieveGrammars}
            />

            <EditGrammarModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                grammarId={selectedGrammarId}
                retrieveGrammars={retrieveGrammars}
            />
        </div>
    );
};

export default GrammarList;