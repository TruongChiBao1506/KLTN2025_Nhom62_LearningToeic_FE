import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCirclePlus, 
    faEdit, 
    faTrash, 
    faSearch 
} from '@fortawesome/free-solid-svg-icons';
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
    // ✅ Ensure grammarQuestions is always an array
    const normalizedGrammarQuestions = Array.isArray(grammarQuestions) ? grammarQuestions : [];
    
    // States
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGrammarQuestionId, setSelectedGrammarQuestionId] = useState(null);

    // Constants
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

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

    // ✅ Helper function to get ID with different possible field names
    const getItemId = (item) => {
        return item.questionId || item._id || item.grammarQuestionId || item.id;
    };

    // ✅ Helper function to get status
    const getItemStatus = (item) => {
        return item.questionStatus !== undefined ? item.questionStatus : (item.status !== undefined ? item.status : 1);
    };

    // Truncate text for display
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Strip HTML tags from content for preview
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
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

    // Delete grammar question
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

    // Toggle status
    const toggleStatus = async (grammarQuestionId, newStatus) => {
        try {
            console.log('Grammar Question ID:', grammarQuestionId);
            console.log('New Status:', newStatus);
            
            await GrammarQuestionService.updateStatus(grammarQuestionId, newStatus);
            retrieveGrammarQuestions();
            
            toast.success(`${newStatus === 1 ? 'Kích hoạt' : 'Vô hiệu hóa'} grammar question thành công`, {
                autoClose: 1000,
            });
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật trạng thái', {
                autoClose: 2000,
            });
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
                                    placeholder="Tìm kiếm grammar question..." 
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
                            <button 
                                type="button" 
                                className="btn btn-success mb-3 me-3" 
                                onClick={handleShowAddModal}
                                title="Thêm grammar question mới"
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
                                                    <td>
                                                        <button className="btn btn-success rounded-5 disabled">No.</button>
                                                    </td>
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
                                                        <td>
                                                            <div title={grammarQuestion.questionContent || 'No content'}>
                                                                {truncateText(grammarQuestion.questionContent || 'No content', 30)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={grammarQuestion.optionA || 'No option A'}>
                                                                {truncateText(grammarQuestion.optionA || 'No option A', 20)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={grammarQuestion.optionB || 'No option B'}>
                                                                {truncateText(grammarQuestion.optionB || 'No option B', 20)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={grammarQuestion.optionC || 'No option C'}>
                                                                {truncateText(grammarQuestion.optionC || 'No option C', 20)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={grammarQuestion.optionD || 'No option D'}>
                                                                {truncateText(grammarQuestion.optionD || 'No option D', 20)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div title={grammarQuestion.correctOption || 'No correct option'}>
                                                                <span className="badge bg-primary">
                                                                    {truncateText(grammarQuestion.correctOption || 'N/A', 15)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div 
                                                                title={stripHtml(grammarQuestion.questionExplanation || 'No explanation')}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: truncateText(grammarQuestion.questionExplanation || 'No explanation', 30) 
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            {getItemStatus(grammarQuestion) === 1 ? (
                                                                <span 
                                                                    onClick={() => toggleStatus(getItemId(grammarQuestion), 0)}
                                                                    className="btn badge text-bg-success"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để vô hiệu hóa"
                                                                >
                                                                    Enable
                                                                </span>
                                                            ) : (
                                                                <span 
                                                                    onClick={() => toggleStatus(getItemId(grammarQuestion), 1)}
                                                                    className="btn badge text-bg-danger"
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
                                                                    title={`Chỉnh sửa [${truncateText(grammarQuestion.questionContent || 'Question', 15)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                                </button>

                                                                {/* Delete button */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => deleteGrammarQuestion(getItemId(grammarQuestion))}
                                                                    className="btn btn-white border-0"
                                                                    title={`Xóa [${truncateText(grammarQuestion.questionContent || 'Question', 15)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedGrammarQuestions.length === 0 && filteredGrammarQuestions.length > 0 && (
                                                    <tr key="no-data">
                                                        <td colSpan="10">No data available on this page</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
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

                                        {/* Results info */}
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
            />

            <EditGrammarQuestionModal 
                show={showEditModal}
                onHide={handleCloseEditModal}
                grammarQuestionId={selectedGrammarQuestionId}
                grammarId={grammarId}
                retrieveGrammarQuestions={retrieveGrammarQuestions}
            />
        </div>
    );
};

export default GrammarQuestionList;