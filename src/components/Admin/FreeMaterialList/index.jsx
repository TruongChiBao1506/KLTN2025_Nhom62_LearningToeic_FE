import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faFile
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import FreeMaterialService from '../../../services/freeMaterialService';
import AddFreeMaterialModal from './AddFreeMaterialModal';
import EditFreeMaterialModal from './EditFreeMaterialModal';
import './style.css';

const FreeMaterialList = ({ freeMaterials = [], retrieveFreeMaterials }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));


    // Filtered free materials based on search text
    const filteredFreeMaterials = useMemo(() => {
        if (!freeMaterials || !Array.isArray(freeMaterials)) {
            return [];
        }

        if (!searchText) {
            return freeMaterials.slice();
        }

        return freeMaterials.filter((freeMaterial) =>
            Object.values(freeMaterial).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [freeMaterials, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredFreeMaterials.length / itemsPerPage);

    const paginatedFreeMaterials = useMemo(() => {
        if (!filteredFreeMaterials || filteredFreeMaterials.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredFreeMaterials.slice(startIndex, endIndex);
    }, [filteredFreeMaterials, currentPage, itemsPerPage]);

    // Reset to first page when freeMaterials change
    useEffect(() => {
        setCurrentPage(1);
    }, [freeMaterials]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleShowEditModal = (materialId) => {
        setSelectedMaterialId(materialId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedMaterialId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteFreeMaterial = async (freeMaterialId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa tài liệu này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await FreeMaterialService.delete(freeMaterialId);
                retrieveFreeMaterials();
                Swal.fire({
                    title: 'Xóa tài liệu thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa tài liệu',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const getFilePdfUrl = (filePdf) => {
        if (filePdf) {
            return `http://localhost:5000/pdfs/${filePdf}`;
        }
        return null;
    };

    const toggleStatus = async (freeMaterialId, newStatus) => {
        try {
            await FreeMaterialService.updateStatus(freeMaterialId, newStatus);
            retrieveFreeMaterials();
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredFreeMaterials.length);

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

                        {/* Add button */}
                        <div className="col-3 d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn badge text-bg-success d-flex align-items-center p-3 rounded-5"
                                onClick={handleShowAddModal}
                            >
                                <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                Thêm mới
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th>
                                        <button className="btn btn-primary rounded-5 disabled">No.</button>
                                    </th>
                                    <th>TITLE</th>
                                    <th>DESCRIPTION</th>
                                    <th>FILE</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedFreeMaterials.map((freeMaterial, index) => (
                                    <tr key={freeMaterial._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{freeMaterial.title}</td>
                                        <td>{freeMaterial.description}</td>
                                        <td>
                                            <span>
                                                <FontAwesomeIcon icon={faFile} className="me-2" />
                                                {freeMaterial.filePdf ? (
                                                    <p className="mb-0">
                                                        <a
                                                            className="text-decoration-none"
                                                            href={getFilePdfUrl(freeMaterial.filePdf)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View PDF
                                                        </a>
                                                    </p>
                                                ) : (
                                                    <p className="mb-0">No Data</p>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            {freeMaterial.materialStatus === 1 ? (
                                                <span
                                                    onClick={() => toggleStatus(freeMaterial._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => toggleStatus(freeMaterial._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(freeMaterial.createdAt)}</td>
                                        <td>{formatDate(freeMaterial.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0 me-1"
                                                    onClick={() => handleShowEditModal(freeMaterial._id)}
                                                    title={`Chỉnh sửa [${freeMaterial.title}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteFreeMaterial(freeMaterial._id)}
                                                    title={`Xóa [${freeMaterial.title}]`}
                                                    className="btn btn-white border-0"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedFreeMaterials.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="8">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination controls */}
                        {filteredFreeMaterials.length > 0 && (
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
                        {filteredFreeMaterials.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredFreeMaterials.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddFreeMaterialModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                retrieveFreeMaterials={retrieveFreeMaterials}
            />

            <EditFreeMaterialModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                materialId={selectedMaterialId}
                retrieveFreeMaterials={retrieveFreeMaterials}
            />
        </div>
    );
};

export default FreeMaterialList;