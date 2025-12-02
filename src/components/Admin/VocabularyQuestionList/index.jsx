import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faQuestion, faEdit, faTrash, faSearch, faFileExcel, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'sweetalert2/dist/sweetalert2.min.css';

import VocabularyQuestionService from '../../../services/vocabularyQuestionService';
import AddVocabularyQuestionModal from './AddVocabularyQuestionModal';
import EditVocabularyQuestionModal from './EditVocabularyQuestionModal';
import './style.css';

const VocabularyQuestionList = ({ vocabularyQuestions = [], topicId, retrieveVocabularyQuestions, isLoading = false }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVocabularyQuestionId, setSelectedVocabularyQuestionId] = useState(null);
    
    // File import ref
    const fileInputRef = useRef(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Modal handlers
    const handleShowAddModal = () => {
        console.log('🔄 Opening Add Vocabulary Question Modal');
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        console.log('🔄 Closing Add Vocabulary Question Modal');
        setShowAddModal(false);
    };

    const handleShowEditModal = (vocabularyQuestionId) => {
        console.log('🔄 Opening Edit Vocabulary Question Modal for:', vocabularyQuestionId);
        setSelectedVocabularyQuestionId(vocabularyQuestionId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        console.log('🔄 Closing Edit Vocabulary Question Modal');
        setShowEditModal(false);
        setSelectedVocabularyQuestionId(null);
    };

    // Filter vocabulary questions based on search
    const filteredVocabularyQuestions = useMemo(() => {
        if (!vocabularyQuestions || !Array.isArray(vocabularyQuestions)) {
            return [];
        }

        if (!searchText) {
            return vocabularyQuestions.slice();
        }

        return vocabularyQuestions.filter((vocabularyQuestion) =>
            Object.values(vocabularyQuestion).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [vocabularyQuestions, searchText]);

    // Pagination logic
    const totalPageCount = Math.ceil(filteredVocabularyQuestions.length / itemsPerPage);
    const paginatedVocabularyQuestions = useMemo(() => {
        if (!filteredVocabularyQuestions || filteredVocabularyQuestions.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredVocabularyQuestions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredVocabularyQuestions, currentPage, itemsPerPage]);

    // Reset page when vocabulary questions change
    useEffect(() => {
        setCurrentPage(1);
    }, [vocabularyQuestions]);

    // Pagination helpers
    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min(currentPage * itemsPerPage, filteredVocabularyQuestions.length);

    // Delete vocabulary question
    const deleteVocabularyQuestion = async (vocabularyQuestionId) => {
        try {
            const result = await Swal.fire({
                title: 'Bạn muốn xóa câu hỏi từ vựng này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                await VocabularyQuestionService.delete(vocabularyQuestionId);
                retrieveVocabularyQuestions();
                Swal.fire({
                    title: 'Xóa câu hỏi từ vựng thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Lỗi khi xóa câu hỏi từ vựng',
                icon: 'error',
                timer: 1000,
                showConfirmButton: false,
            });
        }
    };

    // Toggle vocabulary question status
    const toggleStatus = async (vocabularyQuestionId, newStatus) => {
        try {
            console.log('Vocabulary Question ID:', vocabularyQuestionId);
            console.log('New Status:', newStatus);
            await VocabularyQuestionService.updateStatus(vocabularyQuestionId, newStatus);
            retrieveVocabularyQuestions();

            toast.success(`${newStatus === 1 ? 'Kích hoạt' : 'Vô hiệu hóa'} câu hỏi thành công`, {
                autoClose: 1000,
            });
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật trạng thái câu hỏi', {
                autoClose: 2000,
            });
        }
    };

    // Format date
    const formatDate = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
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

    // Truncate text
    const truncateText = (text, maxLength = 30) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Strip HTML tags from explanation
    const stripHtml = (html) => {
        if (!html) return 'N/A';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    // Export functions
    const handleDownloadTemplate = async () => {
        try {
            await VocabularyQuestionService.exportTemplate();
            toast.success('Tải template thành công!', {
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error downloading template:', error);
            toast.error('Lỗi khi tải template!', {
                autoClose: 2000,
            });
        }
    };

    const handleExportQuestions = async () => {
        try {
            if (vocabularyQuestions.length === 0) {
                toast.warning('Không có câu hỏi nào để export!', {
                    autoClose: 2000,
                });
                return;
            }

            await VocabularyQuestionService.exportByTopic(topicId);
            toast.success('Export câu hỏi thành công!', {
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error exporting questions:', error);
            toast.error(error.message || 'Lỗi khi export câu hỏi!', {
                autoClose: 2000,
            });
        }
    };

    const handleImportQuestions = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)!', {
                autoClose: 2000,
            });
            return;
        }

        try {
            const result = await Swal.fire({
                title: 'Xác nhận import',
                text: `Bạn có muốn import câu hỏi từ file "${file.name}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Import',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                // Show loading
                Swal.fire({
                    title: 'Đang import...',
                    text: 'Vui lòng đợi trong giây lát',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await VocabularyQuestionService.importTemplate(file, topicId);
                
                // Refresh data
                await retrieveVocabularyQuestions();
                
                Swal.fire({
                    title: 'Import thành công!',
                    text: 'Câu hỏi đã được thêm vào topic',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });

                toast.success('Import câu hỏi thành công!', {
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error('Error importing questions:', error);
            Swal.fire({
                title: 'Lỗi import!',
                text: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <div className="page-heading">
            <section className="section">
                <div className="card border-0">
                    {/* Header Controls */}
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
                        <div className="col-3">
                            <div className="input-group rounded-5">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Tìm kiếm câu hỏi..."
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-light-emphasis">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add button and Import/Export buttons */}
                        <div className="col-6" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexDirection: 'row' }}>
                            {/* Download Template Button */}
                            <button
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleDownloadTemplate}
                                title="Tải template mẫu Excel"
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
                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                Template
                            </button>

                            {/* Import Button */}
                            <button
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleImportQuestions}
                                title="Import câu hỏi từ file Excel"
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
                                <FontAwesomeIcon icon={faUpload} className="me-2" />
                                Import
                            </button>

                            {/* Export Button */}
                            <button
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleExportQuestions}
                                disabled={vocabularyQuestions.length === 0}
                                title="Export tất cả câu hỏi ra file Excel"
                                style={{ 
                                    borderRadius: '20px', 
                                    fontSize: '12px', 
                                    padding: '10px 18px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    minWidth: '110px',
                                    justifyContent: 'center',
                                    opacity: vocabularyQuestions.length === 0 ? 0.6 : 1
                                }}
                            >
                                <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                                Export
                            </button>

                            {/* Add new button */}
                            <button
                                type="button"
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleShowAddModal}
                                title="Thêm vocabulary question mới"
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

                    {/* Hidden file input for import */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                    />

                    {/* Table */}
                    <div className="card-body">
                        {/* Show loading state */}
                        {isLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Đang tải danh sách câu hỏi từ vựng...</p>
                            </div>
                        ) : (
                            <>
                                {/* Show table if there are questions */}
                                {vocabularyQuestions.length > 0 ? (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table text-center table-hover shadow">
                                            <thead className="shadow">
                                                <tr className="align-middle">
                                                    <td style={{ width: '50px' }}><button className="btn btn-primary rounded-5 disabled">No.</button></td>
                                                    <th style={{ width: '20%', minWidth: '150px' }}>CONTENT</th>
                                                    <th style={{ width: '12%' }}>OPT A</th>
                                                    <th style={{ width: '12%' }}>OPT B</th>
                                                    <th style={{ width: '12%' }}>OPT C</th>
                                                    <th style={{ width: '12%' }}>OPT D</th>
                                                    <th style={{ width: '10%' }}>CORRECT</th>
                                                    <th style={{ width: '15%' }}>EXPLANATION</th>
                                                    <th style={{ width: '80px' }}>STATUS</th>
                                                    <th style={{ width: '90px' }}>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedVocabularyQuestions.map((vocabularyQuestion, index) => (
                                                    <tr
                                                        key={vocabularyQuestion.questionId || vocabularyQuestion._id}
                                                        className="table-row shadow-on-hover align-middle"
                                                    >
                                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td>
                                                            <div className="text-wrap" title={vocabularyQuestion.questionContent}>
                                                                {vocabularyQuestion.questionContent}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-wrap" title={vocabularyQuestion.optionA}>
                                                                {vocabularyQuestion.optionA}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-wrap" title={vocabularyQuestion.optionB}>
                                                                {vocabularyQuestion.optionB}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-wrap" title={vocabularyQuestion.optionC}>
                                                                {vocabularyQuestion.optionC}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-wrap" title={vocabularyQuestion.optionD}>
                                                                {vocabularyQuestion.optionD}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div
                                                                className="text-wrap fw-bold text-success"
                                                                title={vocabularyQuestion.correctOption}
                                                            >
                                                                {vocabularyQuestion.correctOption}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-wrap" title={stripHtml(vocabularyQuestion.questionExplanation)}>
                                                                {stripHtml(vocabularyQuestion.questionExplanation)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {vocabularyQuestion.questionStatus === 1 ? (
                                                                <span
                                                                    onClick={() => toggleStatus(vocabularyQuestion.questionId || vocabularyQuestion._id, 0)}
                                                                    className="btn badge text-bg-success rounded-5"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để vô hiệu hóa"
                                                                >
                                                                    Enable
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    onClick={() => toggleStatus(vocabularyQuestion.questionId || vocabularyQuestion._id, 1)}
                                                                    className="btn badge text-bg-danger rounded-5"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để kích hoạt"
                                                                >
                                                                    Disable
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center">
                                                                {/* Edit button */}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-white border-0"
                                                                    onClick={() => handleShowEditModal(vocabularyQuestion.questionId || vocabularyQuestion._id)}
                                                                    title={`Chỉnh sửa câu hỏi [${truncateText(vocabularyQuestion.questionContent, 15)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                                </button>

                                                                {/* Delete button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteVocabularyQuestion(vocabularyQuestion.questionId || vocabularyQuestion._id)}
                                                                    className="btn btn-white border-0"
                                                                    title={`Xóa câu hỏi [${truncateText(vocabularyQuestion.questionContent, 15)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedVocabularyQuestions.length === 0 && filteredVocabularyQuestions.length > 0 && (
                                                    <tr key="no-data">
                                                        <td colSpan="10">No data available on this page</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {filteredVocabularyQuestions.length > 0 && (
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

                                        {/* Results info */}
                                        {filteredVocabularyQuestions.length > 0 && (
                                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                                <p>
                                                    {firstRowNumber} - {lastRowNumber} trên {filteredVocabularyQuestions.length} kết quả
                                                </p>
                                            </div>
                                        )}

                                        {/* Search no results */}
                                        {vocabularyQuestions.length > 0 && filteredVocabularyQuestions.length === 0 && (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted" />
                                                </div>
                                                <h5 className="text-muted">Không tìm thấy kết quả</h5>
                                                <p className="text-muted">
                                                    Không có câu hỏi nào khớp với từ khóa "{searchText}"
                                                </p>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setSearchText('')}
                                                >
                                                    Xóa bộ lọc
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Empty state khi chưa có vocabulary questions */
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <FontAwesomeIcon icon={faQuestion} size="3x" className="text-muted" />
                                        </div>
                                        <h5 className="text-muted">Chưa có câu hỏi từ vựng nào</h5>
                                        <p className="text-muted">
                                            Topic này chưa có vocabulary questions. Hãy thêm câu hỏi đầu tiên.
                                        </p>
                                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                                            <button
                                                className="btn btn-success"
                                                onClick={handleShowAddModal}
                                            >
                                                <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                                Thêm câu hỏi đầu tiên
                                            </button>
                                            
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={handleDownloadTemplate}
                                                    title="Tải template Excel để import nhiều câu hỏi cùng lúc"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                    Tải template
                                                </button>
                                                
                                                <button
                                                    className="btn btn-outline-info"
                                                    onClick={handleImportQuestions}
                                                    title="Import câu hỏi từ file Excel"
                                                >
                                                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                                                    Import Excel
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <small className="text-muted">
                                                💡 <strong>Gợi ý:</strong> Sử dụng tính năng import Excel để thêm nhiều câu hỏi cùng lúc
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddVocabularyQuestionModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                topicId={topicId}
                retrieveVocabularyQuestions={retrieveVocabularyQuestions}
            />

            <EditVocabularyQuestionModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                vocabularyQuestionId={selectedVocabularyQuestionId}
                topicId={topicId}
                retrieveVocabularyQuestions={retrieveVocabularyQuestions}
            />
        </div>
    );
};

export default VocabularyQuestionList;