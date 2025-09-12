import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import LessonContentService from '../../../services/lessonContentService';
import AddLessonContentModal from './AddLessonContentModal';
import EditLessonContentModal from './EditLessonContentModal';
import './style.css';

const LessonContentList = ({ lessonContents = [], sectionId, lessonId, retrieveLessonContents }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLessonContentId, setSelectedLessonContentId] = useState(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = [25, 50, 75, 100].map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered lesson contents based on search text
    const filteredLessonContents = useMemo(() => {
        if (!lessonContents || !Array.isArray(lessonContents)) {
            return [];
        }

        if (!searchText) {
            return lessonContents.slice();
        }

        return lessonContents.filter((lessonContent) =>
            Object.values(lessonContent).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [lessonContents, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredLessonContents.length / itemsPerPage);

    const paginatedLessonContents = useMemo(() => {
        if (!filteredLessonContents || filteredLessonContents.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredLessonContents.slice(startIndex, endIndex);
    }, [filteredLessonContents, currentPage, itemsPerPage]);

    // Reset to first page when lesson contents change
    useEffect(() => {
        setCurrentPage(1);
    }, [lessonContents]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleShowEditModal = (lessonContentId) => {
        setSelectedLessonContentId(lessonContentId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedLessonContentId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteLessonContent = async (lessonContentId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa nội dung bài học này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await LessonContentService.delete(lessonContentId);
                retrieveLessonContents();
                Swal.fire({
                    title: 'Xóa nội dung bài học thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa nội dung bài học',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (lessonContentId, newStatus) => {
        try {
            console.log(lessonContentId);
            console.log(newStatus);
            await LessonContentService.updateStatus(lessonContentId, newStatus);
            retrieveLessonContents();
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

    // Strip HTML tags from content for display
    const stripHtmlTags = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Truncate content for table display
    const truncateContent = (content, maxLength = 100) => {
        const strippedContent = stripHtmlTags(content);
        if (strippedContent.length <= maxLength) {
            return strippedContent;
        }
        return strippedContent.substring(0, maxLength) + '...';
    };

    // Pagination info
    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredLessonContents.length);

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
                        <div className="col-3">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn btn-success d-flex align-items-center"
                                    onClick={handleShowAddModal}
                                    title="Thêm nội dung bài học mới"
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
                                {/* Nếu có import/export/xóa hết thì thêm các button tương tự tại đây */}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                                    <th>TITLE</th>
                                    <th>CONTENT</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLessonContents.map((lessonContent, index) => (
                                    <tr key={lessonContent._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{lessonContent.title}</td>
                                        <td>
                                            <div
                                                title={stripHtmlTags(lessonContent.content)}
                                                style={{ cursor: 'help' }}
                                            >
                                                {truncateContent(lessonContent.content)}
                                            </div>
                                        </td>
                                        <td>
                                            {lessonContent.lessonContentStatus === 1 ? (
                                                <span
                                                    onClick={() => toggleStatus(lessonContent._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => toggleStatus(lessonContent._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(lessonContent.createdAt)}</td>
                                        <td>{formatDate(lessonContent.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(lessonContent._id)}
                                                    title={`Chỉnh sửa [${lessonContent.title}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteLessonContent(lessonContent._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${lessonContent.title}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedLessonContents.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="7">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredLessonContents.length > 0 && (
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
                        {filteredLessonContents.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredLessonContents.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddLessonContentModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                lessonId={lessonId}
                retrieveLessonContents={retrieveLessonContents}
            />

            <EditLessonContentModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                lessonContentId={selectedLessonContentId}
                lessonId={lessonId}
                retrieveLessonContents={retrieveLessonContents}
            />
        </div>
    );
};

export default LessonContentList;