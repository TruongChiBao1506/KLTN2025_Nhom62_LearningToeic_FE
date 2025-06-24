import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCirclePlus, 
    faEdit, 
    faTrash, 
    faSearch 
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import LessonService from '../../../services/lessonService';
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
    
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

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

    // Pagination info
    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredLessons.length);

    return (
        <div className="page-heading">
            <div className="section">
                <div className="card border-0">
                    <div className="row">
                        {/* Items per page selector */}
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

                        {/* Search input */}
                        <div className="col-6 mt-4">
                            <div className="input-group">
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

                        {/* Add button - dùng onClick thay vì data-bs-toggle */}
                        <div className="col-4 mt-4 d-flex justify-content-end">
                            <button 
                                type="button" 
                                className="btn btn-success mb-3 me-3"
                                onClick={handleShowAddModal}
                            >
                                <FontAwesomeIcon icon={faCirclePlus} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-success rounded-5 disabled">No.</button></th>
                                    <th>NAME</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                    <th>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLessons.map((lesson, index) => (
                                    <tr 
                                        key={lesson._id} 
                                        className="table-row shadow-on-hover align-middle"
                                    >
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{lesson.lessonName}</td>
                                        <td>
                                            {lesson.lessonStatus === 1 ? (
                                                <span 
                                                    onClick={() => toggleStatus(lesson._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span 
                                                    onClick={() => toggleStatus(lesson._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(lesson.createdAt)}</td>
                                        <td>{formatDate(lesson.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button - dùng onClick */}
                                                <button 
                                                    type="button" 
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(lesson._id)}
                                                    title={`Chỉnh sửa [${lesson.lessonName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{color: 'rgb(192, 129, 13)'}} />
                                                </button>

                                                {/* Delete button */}
                                                <button 
                                                    type="button" 
                                                    onClick={() => deleteLesson(lesson._id)}
                                                    title={`Xóa [${lesson.lessonName}]`}
                                                    className="btn btn-white border-0"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <Link 
                                                    to={`/admin/section/${sectionId}/lesson/${lesson._id}/lesson-content`}
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
                                        <td colSpan="7">No data available</td>
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