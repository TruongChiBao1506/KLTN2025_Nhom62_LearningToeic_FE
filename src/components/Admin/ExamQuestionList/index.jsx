import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faFileDownload,
    faVolumeUp,
    faImage
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'sweetalert2/dist/sweetalert2.min.css';

import ExamQuestionService from '../../../services/examQuestionService';
import AddExamQuestionModal from './AddExamQuestionModal';
import './style.css';

const ExamQuestionList = ({
    examQuestions = [],
    examId,
    retrieveExamQuestions,
    isLoading = false,
    pagination
}) => {
    // Ensure examQuestions is always an array
    const normalizedExamQuestions = Array.isArray(examQuestions) ? examQuestions : [];

    // States
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);

    // Constants
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = [25, 50, 75, 100].map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    console.log('Exam ID:', examId);
    console.log('Exam Questions (normalized):', normalizedExamQuestions);

    // Filter exam questions based on search text
    const filteredExamQuestions = useMemo(() => {
        if (!searchText) {
            return normalizedExamQuestions;
        }
        return normalizedExamQuestions.filter((examQuestion) =>
            Object.values(examQuestion).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [normalizedExamQuestions, searchText]);

    // Pagination calculations
    const totalPageCount = useMemo(() => {
        const count = Math.ceil(filteredExamQuestions.length / itemsPerPage);
        console.log('Total pages:', count, 'Filtered items:', filteredExamQuestions.length);
        return count;
    }, [filteredExamQuestions.length, itemsPerPage]);

    const paginatedExamQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        console.log('Pagination:', { startIndex, endIndex, currentPage, itemsPerPage });

        // Add order number to each question
        return filteredExamQuestions.slice(startIndex, endIndex).map((question, index) => ({
            ...question,
            orderNumber: startIndex + index + 1
        }));
    }, [filteredExamQuestions, currentPage, itemsPerPage]);

    // Pagination info
    const firstRowNumber = useMemo(() =>
        (currentPage - 1) * itemsPerPage + 1,
        [currentPage, itemsPerPage]
    );

    const lastRowNumber = useMemo(() =>
        Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredExamQuestions.length),
        [currentPage, itemsPerPage, filteredExamQuestions.length]
    );

    // Reset current page when examQuestions prop changes
    useEffect(() => {
        setCurrentPage(1);
    }, [normalizedExamQuestions]);

    // Modal handlers
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    // Helper function to get ID with different possible field names
    const getItemId = (item) => {
        return item.examQuestionId || item._id || item.questionId || item.id;
    };

    // Helper function to get status
    const getItemStatus = (item) => {
        return item.questionStatus !== undefined ? item.questionStatus :
            (item.examQuestionStatus !== undefined ? item.examQuestionStatus :
                (item.status !== undefined ? item.status : 1));
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

    // Media URL helpers (matching Vue version)
    const getImageUrl = (imageName) => {
        if (imageName) {
            return `http://localhost:5000/images/${imageName}`;
        }
        return "";
    };

    const getAudioUrl = (audioName) => {
        if (audioName) {
            return `http://localhost:5000/audios/${audioName}`;
        }
        return "";
    };

    // Text limitation helpers (matching Vue version)
    const getLimitedPassage = (passage) => {
        const MAX_SCRIPT_LENGTH = 200;
        if (!passage) return '';
        if (passage.length > MAX_SCRIPT_LENGTH) {
            return passage.slice(0, MAX_SCRIPT_LENGTH) + '...';
        } else {
            return passage;
        }
    };

    const getLimitedScript = (script) => {
        const MAX_SCRIPT_LENGTH = 100;
        if (!script) return '';
        if (script.length > MAX_SCRIPT_LENGTH) {
            return script.slice(0, MAX_SCRIPT_LENGTH) + '...';
        } else {
            return script;
        }
    };

    const getLimitedExplanation = (explanation) => {
        const MAX_EXPLANATION_LENGTH = 50;
        if (!explanation) return '';
        if (explanation.length > MAX_EXPLANATION_LENGTH) {
            return explanation.slice(0, MAX_EXPLANATION_LENGTH) + '...';
        } else {
            return explanation;
        }
    };

    // Show import button logic
    const showImportButton = useMemo(() => {
        return normalizedExamQuestions.length === 0;
    }, [normalizedExamQuestions.length]);

    // Download template
    const downloadTemplate = async () => {
        try {
            console.log('📥 Downloading exam question template');
            await ExamQuestionService.exportTemplate();
            toast.success('Export template thành công!', {
                autoClose: 1000,
            });
        } catch (error) {
            console.error('❌ Error downloading template:', error);
            toast.error('Lỗi khi export template', {
                autoClose: 2000,
            });
        }
    };

    // Toggle status
    const toggleStatus = async (examQuestionId, newStatus) => {
        try {
            console.log('Exam Question ID:', examQuestionId);
            console.log('New Status:', newStatus);

            await ExamQuestionService.updateStatus(examQuestionId, newStatus);
            retrieveExamQuestions();

            toast.success(`${newStatus === 1 ? 'Kích hoạt' : 'Vô hiệu hóa'} exam question thành công`, {
                autoClose: 1000,
            });
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật trạng thái', {
                autoClose: 2000,
            });
        }
    };

    // Delete all questions
    const deleteAllQuestions = async () => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa Exam 200 câu hỏi này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                console.log('🗑️ Deleting all questions for exam:', examId);
                await ExamQuestionService.deleteExamQuestionsByExamId(examId);
                retrieveExamQuestions();

                Swal.fire({
                    title: 'Xóa 200 câu hỏi thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa 200 câu hỏi',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
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

                        {/* Action buttons */}
                        <div className="col-3 d-flex justify-content-end">
                            {showImportButton ? (
                                <button
                                    type="button"
                                    className="btn badge text-bg-success d-flex align-items-center p-3 rounded-5 me-2"
                                    onClick={handleShowAddModal}
                                    title="Import exam questions"
                                >
                                    <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                    Import
                                </button>
                            ) : (
                                <button
                                    className="btn badge text-bg-danger d-flex align-items-center p-3 rounded-5 me-2"
                                    onClick={deleteAllQuestions}
                                    title="Delete all questions"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                                    Xóa hết
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn badge text-bg-success d-flex align-items-center p-3 rounded-5"
                                onClick={downloadTemplate}
                                title="Export template"
                            >
                                <FontAwesomeIcon icon={faFileDownload} className="me-2" />
                                Export
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
                                <p className="mt-2 text-muted">Đang tải danh sách exam questions...</p>
                            </div>
                        ) : (
                            <>
                                {/* Show table if there are exam questions */}
                                {normalizedExamQuestions.length > 0 ? (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table text-center table-hover shadow">
                                                <thead className="shadow">
                                                    <tr className="align-middle">
                                                        <th>
                                                            <button className="btn btn-primary rounded-5 disabled">No.</button>
                                                        </th>
                                                        <th>CONTENT</th>
                                                        <th>OPT A</th>
                                                        <th>OPT B</th>
                                                        <th>OPT C</th>
                                                        <th>OPT D</th>
                                                        <th>CORRECT_OPT</th>
                                                        <th>IMG</th>
                                                        <th>AUDIO</th>
                                                        <th>SCRIPT</th>
                                                        <th>PASSAGE</th>
                                                        <th>EXPLANATION</th>
                                                        <th>PART</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedExamQuestions.map((examQuestion, index) => (

                                                        <tr
                                                            key={getItemId(examQuestion) || `question-${index}`}
                                                            className="table-row shadow-on-hover align-middle"
                                                        >
                                                            <td>{examQuestion.orderNumber}</td>
                                                            <td>
                                                                <div title={examQuestion.questionContent || 'No content'}>
                                                                    {truncateText(examQuestion.questionContent || 'No content', 30)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div title={examQuestion.optionA || 'No option A'}>
                                                                    {truncateText(examQuestion.optionA || 'No option A', 20)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div title={examQuestion.optionB || 'No option B'}>
                                                                    {truncateText(examQuestion.optionB || 'No option B', 20)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div title={examQuestion.optionC || 'No option C'}>
                                                                    {truncateText(examQuestion.optionC || 'No option C', 20)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div title={examQuestion.optionD || 'No option D'}>
                                                                    {truncateText(examQuestion.optionD || 'No option D', 20)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div title={examQuestion.correctOption || 'No correct option'}>
                                                                    <span className="badge bg-primary">
                                                                        {examQuestion.correctOption || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {examQuestion.questionImage && examQuestion.questionImage !== '' ? (
                                                                    <img
                                                                        src={getImageUrl(examQuestion.questionImage)}
                                                                        alt="Question"
                                                                        className="question-image"
                                                                        title={`Image: ${examQuestion.questionImage}`}
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted small">No image</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {examQuestion.questionAudio && examQuestion.questionAudio !== '' ? (
                                                                    <audio
                                                                        controls
                                                                        src={getAudioUrl(examQuestion.questionAudio)}
                                                                        title={`Audio: ${examQuestion.questionAudio}`}
                                                                    >
                                                                        Your browser does not support the audio element.
                                                                    </audio>
                                                                ) : (
                                                                    <span className="text-muted small">No audio</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div
                                                                    title={examQuestion.questionScript || 'No script'}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: getLimitedScript(examQuestion.questionScript || '')
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div
                                                                    title={examQuestion.questionPassage || 'No passage'}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: getLimitedPassage(examQuestion.questionPassage || '')
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div
                                                                    title={examQuestion.questionExplanation || 'No explanation'}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: getLimitedExplanation(examQuestion.questionExplanation || '')
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-info">
                                                                    {(() => {
                                                                        const part = examQuestion.questionPart || examQuestion.partNumber;
                                                                        if (part !== undefined && part !== null && part !== '') {
                                                                            return `Part ${part}`;
                                                                        }
                                                                        return 'N/A';
                                                                    })()}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {paginatedExamQuestions.length === 0 && filteredExamQuestions.length > 0 && (
                                                        <tr key="no-data">
                                                            <td colSpan="13">No data available on this page</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {filteredExamQuestions.length > 0 && (
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
                                        {filteredExamQuestions.length > 0 && (
                                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                                <p>
                                                    {firstRowNumber} - {lastRowNumber} trên {filteredExamQuestions.length} kết quả
                                                    {pagination && (
                                                        <> | Server: {pagination.totalItems} total items</>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {/* Search no results */}
                                        {normalizedExamQuestions.length > 0 && filteredExamQuestions.length === 0 && (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted" />
                                                </div>
                                                <h5 className="text-muted">Không tìm thấy kết quả</h5>
                                                <p className="text-muted">
                                                    Không có exam question nào khớp với từ khóa "{searchText}"
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
                                        <h5 className="text-muted">Chưa có exam question nào</h5>
                                        <p className="text-muted">
                                            Exam này chưa có questions. Hãy import questions đầu tiên.
                                        </p>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleShowAddModal}
                                        >
                                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                            Import questions đầu tiên
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Add Modal */}
            <AddExamQuestionModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                examId={examId}
                retrieveExamQuestions={retrieveExamQuestions}
            />
        </div>
    );
};

export default ExamQuestionList;