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

import TestService from '../../services/testService';
import AddTestModal from './AddTestModal';
import EditTestModal from './EditTestModal';
import './style.css';

const TestBySectionList = ({ tests = [], sectionId, retrieveTests }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);
    
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    // Filtered tests based on search text
    const filteredTests = useMemo(() => {
        if (!tests || !Array.isArray(tests)) {
            return [];
        }
        
        if (!searchText) {
            return tests.slice();
        }
        
        return tests.filter((test) =>
            Object.values(test).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [tests, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredTests.length / itemsPerPage);
    
    const paginatedTests = useMemo(() => {
        if (!filteredTests || filteredTests.length === 0) {
            return [];
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTests.slice(startIndex, endIndex);
    }, [filteredTests, currentPage, itemsPerPage]);

    // Reset to first page when tests change
    useEffect(() => {
        setCurrentPage(1);
    }, [tests]);

    // Modal handlers
    const handleShowAddModal = () => {
        console.log('🔄 Opening Add Test Modal');
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        console.log('🔄 Closing Add Test Modal');
        setShowAddModal(false);
    };

    const handleShowEditModal = (testId) => {
        console.log('🔄 Opening Edit Test Modal for:', testId);
        setSelectedTestId(testId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        console.log('🔄 Closing Edit Test Modal');
        setShowEditModal(false);
        setSelectedTestId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteTest = async (testId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa bài kiểm tra này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await TestService.delete(testId);
                retrieveTests();
                Swal.fire({
                    title: 'Xóa bài kiểm tra thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa bài kiểm tra',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (testId, newStatus) => {
        try {
            console.log('Test ID:', testId);
            console.log('New Status:', newStatus);
            await TestService.updateStatus(testId, newStatus);
            retrieveTests();
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredTests.length);

    return (
        <div className="page-heading">
            <section className="section">
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

                        {/* Add button */}
                        <div className="col-4 mt-4 d-flex justify-content-end">
                            <button 
                                type="button" 
                                className="btn btn-success mb-3 me-3"
                                onClick={handleShowAddModal}
                                title="Thêm test mới"
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
                                {paginatedTests.map((test, index) => (
                                    <tr 
                                        key={test.testId || test._id} 
                                        className="table-row shadow-on-hover align-middle"
                                    >
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{test.testName}</td>
                                        <td>
                                            {test.testStatus === 1 ? (
                                                <span 
                                                    onClick={() => toggleStatus(test.testId || test._id, 0)}
                                                    className="btn badge text-bg-success"
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span 
                                                    onClick={() => toggleStatus(test.testId || test._id, 1)}
                                                    className="btn badge text-bg-danger"
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(test.createdAt)}</td>
                                        <td>{formatDate(test.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button 
                                                    type="button" 
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(test.testId || test._id)}
                                                    title={`Chỉnh sửa [${test.testName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{color: 'rgb(192, 129, 13)'}} />
                                                </button>

                                                {/* Delete button */}
                                                <button 
                                                    type="button" 
                                                    onClick={() => deleteTest(test.testId || test._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${test.testName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <Link 
                                                    to={`/admin/section/${sectionId}/test/${test.testId || test._id}/indicate-questions`}
                                                >
                                                    <button className="glowing-button ms-2">
                                                        Indicate Questions
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedTests.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="7">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredTests.length > 0 && (
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
                        {filteredTests.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredTests.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddTestModal 
                show={showAddModal}
                onHide={handleCloseAddModal}
                sectionId={sectionId}
                retrieveTests={retrieveTests}
            />

            <EditTestModal 
                show={showEditModal}
                onHide={handleCloseEditModal}
                testId={selectedTestId}
                sectionId={sectionId}
                retrieveTests={retrieveTests}
            />
        </div>
    );
};

export default TestBySectionList;