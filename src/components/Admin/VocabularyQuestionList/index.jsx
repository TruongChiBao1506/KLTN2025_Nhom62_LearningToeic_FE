import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faQuestion
} from '@fortawesome/free-solid-svg-icons';
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

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

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

    return (
        <div className="page-heading">
            <section className="section">
                <div className="card border-0">
                    {/* Header Controls */}
                    <div className="row">
                        {/* Items per page */}
                        <div className="col-2 mt-4">
                            <select
                                className="form-select ms-3 w-50"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="col-6 mt-4">
                            <div className="input-group">
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

                        {/* Action buttons */}
                        <div className="col-4 mt-4 d-flex justify-content-end">
                            {/* Add button */}
                            <button
                                type="button"
                                className="btn btn-success mb-3 me-3"
                                onClick={handleShowAddModal}
                                title="Thêm vocabulary question mới"
                            >
                                <FontAwesomeIcon icon={faCirclePlus} />
                            </button>
                        </div>
                    </div>

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
                                        <table className="table text-center table-hover shadow">
                                            <thead className="shadow">
                                                <tr className="align-middle">
                                                    <td><button className="btn btn-success rounded-5 disabled">No.</button></td>
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
                                                {paginatedVocabularyQuestions.map((vocabularyQuestion, index) => (
                                                    <tr
                                                        key={vocabularyQuestion.questionId || vocabularyQuestion._id}
                                                        className="table-row shadow-on-hover align-middle"
                                                    >
                                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td>
                                                            <div title={vocabularyQuestion.questionContent}>
                                                                {truncateText(vocabularyQuestion.questionContent, 40)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={vocabularyQuestion.optionA}>
                                                                {truncateText(vocabularyQuestion.optionA, 25)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={vocabularyQuestion.optionB}>
                                                                {truncateText(vocabularyQuestion.optionB, 25)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={vocabularyQuestion.optionC}>
                                                                {truncateText(vocabularyQuestion.optionC, 25)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={vocabularyQuestion.optionD}>
                                                                {truncateText(vocabularyQuestion.optionD, 25)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div
                                                                title={vocabularyQuestion.correctOption}
                                                                className="fw-bold text-success"
                                                            >
                                                                {truncateText(vocabularyQuestion.correctOption, 25)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={stripHtml(vocabularyQuestion.questionExplanation)}>
                                                                {truncateText(stripHtml(vocabularyQuestion.questionExplanation), 30)}
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
                                        <button
                                            className="btn btn-success"
                                            onClick={handleShowAddModal}
                                        >
                                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                            Thêm câu hỏi đầu tiên
                                        </button>
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