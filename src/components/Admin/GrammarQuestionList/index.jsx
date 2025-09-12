import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faDownload,
    faUpload,
    faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'sweetalert2/dist/sweetalert2.min.css';

import GrammarQuestionService from '../../../services/grammarQuestionService';
import AddGrammarQuestionModal from './AddGrammarQuestionModal';
import EditGrammarQuestionModal from './EditGrammarQuestionModal';
import './style.css';

const GrammarQuestionList = ({
    grammarQuestions = [],
    grammarId,
    retrieveGrammarQuestions,
    isLoading = false,
    pagination
}) => {
    // Ensure grammarQuestions is always an array
    const normalizedGrammarQuestions = Array.isArray(grammarQuestions) ? grammarQuestions : [];

    // States
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGrammarQuestionId, setSelectedGrammarQuestionId] = useState(null);

    // File import ref
    const fileInputRef = useRef(null);

    // Constants
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    console.log('Grammar ID:', grammarId);
    console.log('Grammar Questions (normalized):', normalizedGrammarQuestions);

    // Filter grammar questions based on search text
    const filteredGrammarQuestions = useMemo(() => {
        if (!searchText) {
            return normalizedGrammarQuestions;
        }
        return normalizedGrammarQuestions.filter((grammarQuestion) =>
            Object.values(grammarQuestion).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [normalizedGrammarQuestions, searchText]);

    // Pagination calculations
    const totalPageCount = useMemo(() => {
        const count = Math.ceil(filteredGrammarQuestions.length / itemsPerPage);
        console.log('Total pages:', count, 'Filtered items:', filteredGrammarQuestions.length);
        return count;
    }, [filteredGrammarQuestions.length, itemsPerPage]);

    const paginatedGrammarQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        console.log('Pagination:', { startIndex, endIndex, currentPage, itemsPerPage });
        return filteredGrammarQuestions.slice(startIndex, endIndex);
    }, [filteredGrammarQuestions, currentPage, itemsPerPage]);

    // Pagination info
    const firstRowNumber = useMemo(() =>
        (currentPage - 1) * itemsPerPage + 1,
        [currentPage, itemsPerPage]
    );

    const lastRowNumber = useMemo(() =>
        Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredGrammarQuestions.length),
        [currentPage, itemsPerPage, filteredGrammarQuestions.length]
    );

    // Reset current page when grammarQuestions prop changes
    useEffect(() => {
        setCurrentPage(1);
    }, [normalizedGrammarQuestions]);

    // Modal handlers
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleShowEditModal = (grammarQuestionId) => {
        setSelectedGrammarQuestionId(grammarQuestionId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedGrammarQuestionId(null);
    };

    const getItemId = (item) => {
        return item._id || item.questionId || item.grammarQuestionId || item.id;
    };

    const getQuestionContent = (item) => {
        return item.questionContent || item.grammarQuestionContent || 'No content';
    };

    const getQuestionStatus = (item) => {
        return item.questionStatus !== undefined ? item.questionStatus :
            (item.grammarQuestionStatus !== undefined ? item.grammarQuestionStatus : 1);
    };

    const getQuestionExplanation = (item) => {
        return item.questionExplanation || item.explanation || 'No explanation';
    };

    // Delete grammar question - matching Vue version
    const deleteGrammarQuestion = async (grammarQuestionId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa câu hỏi ngữ pháp này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                // Use GrammarQuestionService instead of GrammarContentService
                await GrammarQuestionService.delete(grammarQuestionId);
                retrieveGrammarQuestions();

                Swal.fire({
                    title: 'Xóa câu hỏi ngữ pháp thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa câu hỏi ngữ pháp',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    // Toggle status - matching Vue version
    const toggleStatus = async (grammarQuestionId, newStatus) => {
        try {
            console.log('Grammar Question ID:', grammarQuestionId);
            console.log('New Status:', newStatus);

            await GrammarQuestionService.updateStatus(grammarQuestionId, newStatus);
            retrieveGrammarQuestions();
        } catch (error) {
            console.error(error);
        }
    };

    // Export functions
    const handleDownloadTemplate = async () => {
        try {
            await GrammarQuestionService.exportTemplate();
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
            if (normalizedGrammarQuestions.length === 0) {
                toast.warning('Không có câu hỏi nào để export!', {
                    autoClose: 2000,
                });
                return;
            }

            await GrammarQuestionService.exportByGrammar(grammarId);
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
            toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)', {
                autoClose: 3000,
            });
            return;
        }

        try {
            const result = await Swal.fire({
                title: 'Xác nhận import',
                text: `Bạn có chắc chắn muốn import các câu hỏi từ file "${file.name}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Import',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#198754',
                cancelButtonColor: '#dc3545'
            });

            if (result.isConfirmed) {
                await GrammarQuestionService.importTemplate(file, grammarId);
                
                toast.success('Import câu hỏi thành công!', {
                    autoClose: 2000,
                });

                // Refresh the list
                retrieveGrammarQuestions();
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

    // Pagination functions
    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
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
                                                color: state.isSelected ? '#fff' : '#198754',
                                                backgroundColor: state.isSelected
                                                    ? '#198754'
                                                    : state.isFocused
                                                        ? '#e6f7ef'
                                                        : '#fff',
                                                ':active': { backgroundColor: '#43c59e', color: '#fff' }
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
                                    fontSize: '14px', 
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
                                    fontSize: '14px', 
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
                                disabled={normalizedGrammarQuestions.length === 0}
                                title="Export tất cả câu hỏi ra file Excel"
                                style={{ 
                                    borderRadius: '20px', 
                                    fontSize: '14px', 
                                    padding: '10px 18px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    minWidth: '110px',
                                    justifyContent: 'center',
                                    opacity: normalizedGrammarQuestions.length === 0 ? 0.6 : 1
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
                                title="Thêm grammar question mới"
                                style={{ 
                                    borderRadius: '20px', 
                                    fontSize: '14px', 
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
                                <p className="mt-2 text-muted">Đang tải danh sách grammar questions...</p>
                            </div>
                        ) : (
                            <>
                                {/* Show table if there are grammar questions */}
                                {normalizedGrammarQuestions.length > 0 ? (
                                    <>
                                        <table className="table text-center table-hover shadow">
                                            <thead className="shadow">
                                                <tr className="align-middle">
                                                    {/* Use <th> for all header cells, not <td> */}
                                                    <th>
                                                        <button className="btn btn-primary rounded-5 disabled">No.</button>
                                                    </th>
                                                    <th>CONTENT</th>
                                                    <th>OPT A</th>
                                                    <th>OPT B</th>
                                                    <th>OPT C</th>
                                                    <th>OPT D</th>
                                                    <th>CORRECT OPT</th>
                                                    <th>EXPLANATION</th>
                                                    <th>STATUS</th>
                                                    <th>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedGrammarQuestions.map((grammarQuestion, index) => (
                                                    <tr
                                                        key={getItemId(grammarQuestion) || `question-${index}`}
                                                        className="table-row shadow-on-hover align-middle"
                                                    >
                                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td>{getQuestionContent(grammarQuestion)}</td>
                                                        <td>{grammarQuestion.optionA || ''}</td>
                                                        <td>{grammarQuestion.optionB || ''}</td>
                                                        <td>{grammarQuestion.optionC || ''}</td>
                                                        <td>{grammarQuestion.optionD || ''}</td>
                                                        <td>
                                                            <span className="badge bg-primary">
                                                                {grammarQuestion.correctOption || 'N/A'}
                                                            </span>
                                                        </td>                                                        <td>{getQuestionExplanation(grammarQuestion)}</td>
                                                        <td>
                                                            {getQuestionStatus(grammarQuestion) === 1 ? (
                                                                <span
                                                                    onClick={() => toggleStatus(getItemId(grammarQuestion), 0)}
                                                                    className="btn badge text-bg-success rounded-5"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để vô hiệu hóa"
                                                                >
                                                                    Enable
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    onClick={() => toggleStatus(getItemId(grammarQuestion), 1)}
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
                                                                    onClick={() => handleShowEditModal(getItemId(grammarQuestion))}
                                                                    title={`Chỉnh sửa [${getQuestionContent(grammarQuestion)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                                </button>

                                                                {/* Delete button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteGrammarQuestion(getItemId(grammarQuestion))}
                                                                    className="btn btn-white border-0"
                                                                    title={`Xóa [${getQuestionContent(grammarQuestion)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Update colspan to match number of columns (10) */}
                                                {paginatedGrammarQuestions.length === 0 && filteredGrammarQuestions.length > 0 && (
                                                    <tr key="no-data">
                                                        <td colSpan="10">No data available on this page</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Pagination - matching Vue version */}
                                        {filteredGrammarQuestions.length > 0 && (
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

                                        {/* Results info - matching Vue version */}
                                        {filteredGrammarQuestions.length > 0 && (
                                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                                <p>
                                                    {firstRowNumber} - {lastRowNumber} trên {filteredGrammarQuestions.length} kết quả
                                                    {pagination && (
                                                        <> | Server: {pagination.totalItems} total items</>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {/* Search no results */}
                                        {normalizedGrammarQuestions.length > 0 && filteredGrammarQuestions.length === 0 && (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted" />
                                                </div>
                                                <h5 className="text-muted">Không tìm thấy kết quả</h5>
                                                <p className="text-muted">
                                                    Không có grammar question nào khớp với từ khóa "{searchText}"
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
                                    /* Empty state */
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <FontAwesomeIcon icon={faCirclePlus} size="3x" className="text-muted" />
                                        </div>
                                        <h5 className="text-muted">Chưa có grammar question nào</h5>
                                        <p className="text-muted">
                                            Grammar này chưa có questions. Hãy thêm question đầu tiên.
                                        </p>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleShowAddModal}
                                        >
                                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                            Thêm question đầu tiên
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddGrammarQuestionModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                grammarId={grammarId}
                retrieveGrammarQuestions={retrieveGrammarQuestions}
                grammarQuestions={grammarQuestions}
            />

            <EditGrammarQuestionModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                grammarQuestionId={selectedGrammarQuestionId}
                grammarId={grammarId}
                retrieveGrammarQuestions={retrieveGrammarQuestions}
                grammarQuestions={grammarQuestions}
            />
        </div>
    );
};

export default GrammarQuestionList;