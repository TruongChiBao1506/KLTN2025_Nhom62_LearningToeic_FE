import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faSearch,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import FeedbackService from '../../../services/feedbackService';
import './style.css';

const FeedbackList = ({ feedbacks = [], retrieveFeedbacks }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered feedbacks based on search text
    const filteredFeedbacks = useMemo(() => {
        if (!feedbacks || !Array.isArray(feedbacks)) {
            return [];
        }

        if (!searchText) {
            return feedbacks.slice();
        }

        return feedbacks.filter((feedback) =>
            Object.values(feedback).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [feedbacks, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredFeedbacks.length / itemsPerPage);

    const paginatedFeedbacks = useMemo(() => {
        if (!filteredFeedbacks || filteredFeedbacks.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredFeedbacks.slice(startIndex, endIndex);
    }, [filteredFeedbacks, currentPage, itemsPerPage]);

    // Reset to first page when feedbacks change
    useEffect(() => {
        setCurrentPage(1);
    }, [feedbacks]);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteFeedback = async (feedbackId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa đánh giá này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await FeedbackService.delete(feedbackId);
                // Retrieve feedbacks if function provided
                if (retrieveFeedbacks) {
                    retrieveFeedbacks();
                }
                Swal.fire({
                    title: 'Xóa đánh giá thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa đánh giá',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
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

    // Pagination info
    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredFeedbacks.length);

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

                        {/* Không có add button cho feedback */}
                        <div className="col-3 d-flex justify-content-end"></div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th>
                                        <button className="btn btn-primary rounded-5 disabled">No.</button>
                                    </th>
                                    <th>NAME</th>
                                    <th>EMAIL</th>
                                    <th>REVIEW</th>
                                    <th>STAR</th>
                                    <th>CREATED_AT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedFeedbacks.map((feedback, index) => (
                                    <tr key={feedback.id || feedback.feedbackId || feedback._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{feedback.name || feedback.userName || 'Anonymous'}</td>
                                        <td>{feedback.email || feedback.userEmail || 'N/A'}</td>
                                        <td>{feedback.review || feedback.content || feedback.message || 'No content'}</td>
                                        <td>
                                            {feedback.rating || 0}
                                            <FontAwesomeIcon icon={faStar} className="text-warning ms-2" />
                                        </td>
                                        <td>{formatDate(feedback.createdAt || feedback.created_at)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteFeedback(feedback.id || feedback.feedbackId || feedback._id)}
                                                    title="Xóa"
                                                    className="btn btn-white border-0"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedFeedbacks.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="7">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination controls */}
                        {filteredFeedbacks.length > 0 && (
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
                        {filteredFeedbacks.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trong {filteredFeedbacks.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FeedbackList;