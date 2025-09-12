import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'sweetalert2/dist/sweetalert2.min.css';

import GrammarContentService from '../../../services/grammarContentService';
import AddGrammarContentModal from './AddGrammarContentModal';
import EditGrammarContentModal from './EditGrammarContentModal';
import './style.css';

const GrammarContentList = ({
    grammarContents = [],
    grammarId,
    retrieveGrammarContents,
    isLoading = false,
    pagination
}) => {
    // Ensure grammarContents is always an array
    const normalizedGrammarContents = Array.isArray(grammarContents) ? grammarContents : [];

    // States
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGrammarContentId, setSelectedGrammarContentId] = useState(null);

    // Constants
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    console.log('Grammar ID:', grammarId);
    console.log('Grammar Contents (normalized):', normalizedGrammarContents);

    // Filter grammar contents based on search text
    const filteredGrammarContents = useMemo(() => {
        if (!searchText) {
            return normalizedGrammarContents;
        }
        return normalizedGrammarContents.filter((grammarContent) =>
            Object.values(grammarContent).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [normalizedGrammarContents, searchText]);

    // Pagination calculations
    const totalPageCount = useMemo(() => {
        const count = Math.ceil(filteredGrammarContents.length / itemsPerPage);
        console.log('Total pages:', count, 'Filtered items:', filteredGrammarContents.length);
        return count;
    }, [filteredGrammarContents.length, itemsPerPage]);

    const paginatedGrammarContents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        console.log('Pagination:', { startIndex, endIndex, currentPage, itemsPerPage });
        return filteredGrammarContents.slice(startIndex, endIndex);
    }, [filteredGrammarContents, currentPage, itemsPerPage]);

    // Pagination info
    const firstRowNumber = useMemo(() =>
        (currentPage - 1) * itemsPerPage + 1,
        [currentPage, itemsPerPage]
    );

    const lastRowNumber = useMemo(() =>
        Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredGrammarContents.length),
        [currentPage, itemsPerPage, filteredGrammarContents.length]
    );

    // Reset current page when grammarContents prop changes
    useEffect(() => {
        setCurrentPage(1);
    }, [normalizedGrammarContents]);

    // Modal handlers
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleShowEditModal = (grammarContentId) => {
        setSelectedGrammarContentId(grammarContentId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedGrammarContentId(null);
    };

    // Helper function to get ID - matching Vue version field names
    const getItemId = (item) => {
        return item.contentId || item._id || item.grammarContentId || item.id;
    };

    // Helper function to get title - matching Vue version
    const getItemTitle = (item) => {
        return item.title || item.grammarContentTitle || item.name || 'No title';
    };

    // Helper function to get content - matching Vue version
    const getItemContent = (item) => {
        return item.content || item.grammarContentDescription || item.description || 'No content';
    };

    // Helper function to get status - matching Vue version
    const getItemStatus = (item) => {
        return item.grammarContentStatus !== undefined ? item.grammarContentStatus :
            (item.status !== undefined ? item.status : 1);
    };

    // Format date - matching Vue version
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

    // Delete grammar content - matching Vue version
    const deleteGrammarContent = async (grammarContentId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa nội dung ngữ pháp này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await GrammarContentService.delete(grammarContentId);
                retrieveGrammarContents();

                Swal.fire({
                    title: 'Xóa nội dung ngữ pháp thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa nội dung ngữ pháp',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    // Toggle status - matching Vue version
    const toggleStatus = async (grammarContentId, newStatus) => {
        try {
            console.log('Grammar Content ID:', grammarContentId);
            console.log('New Status:', newStatus);

            await GrammarContentService.updateStatus(grammarContentId, newStatus);
            retrieveGrammarContents();
        } catch (error) {
            console.error(error);
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
                                    placeholder="Tìm kiếm nội dung ngữ pháp..."
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-light-emphasis">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add button */}
                        <div className="col-3" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexDirection: 'row' }}>
                            <button
                                type="button"
                                className="btn btn-success d-flex align-items-center"
                                onClick={handleShowAddModal}
                                title="Thêm nội dung ngữ pháp mới"
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

                    {/* Table */}
                    <div className="card-body">
                        {/* Show loading state */}
                        {isLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Đang tải danh sách grammar contents...</p>
                            </div>
                        ) : (
                            <>
                                {/* Show table if there are grammar contents */}
                                {normalizedGrammarContents.length > 0 ? (
                                    <>
                                        <table className="table text-center table-hover shadow">
                                            <thead className="shadow">
                                                <tr className="align-middle">
                                                    <th>
                                                        <button className="btn btn-primary rounded-5 disabled">No.</button>
                                                    </th>
                                                    <th>TITLE</th>
                                                    <th>CONTENT</th>
                                                    <th>STATUS</th>
                                                    <th>CREATED_AT</th>
                                                    <th>UPDATED_AT</th>
                                                    <th>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedGrammarContents.map((grammarContent, index) => (
                                                    <tr
                                                        key={getItemId(grammarContent) || `content-${index}`}
                                                        className="table-row shadow-on-hover align-middle"
                                                    >
                                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td>{getItemTitle(grammarContent)}</td>
                                                        <td
                                                            dangerouslySetInnerHTML={{
                                                                __html: getItemContent(grammarContent)
                                                            }}
                                                        />
                                                        <td>
                                                            {getItemStatus(grammarContent) === 1 ? (
                                                                <span
                                                                    onClick={() => toggleStatus(getItemId(grammarContent), 0)}
                                                                    className="btn badge text-bg-success rounded-5"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để vô hiệu hóa"
                                                                >
                                                                    Enable
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    onClick={() => toggleStatus(getItemId(grammarContent), 1)}
                                                                    className="btn badge text-bg-danger rounded-5"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để kích hoạt"
                                                                >
                                                                    Disable
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>{formatDate(grammarContent.createdAt)}</td>
                                                        <td>{formatDate(grammarContent.updatedAt)}</td>
                                                        <td>
                                                            <div className="d-flex justify-content-center">
                                                                {/* Edit button */}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-white border-0"
                                                                    onClick={() => handleShowEditModal(getItemId(grammarContent))}
                                                                    title={`Chỉnh sửa [${getItemTitle(grammarContent)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                                </button>

                                                                {/* Delete button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteGrammarContent(getItemId(grammarContent))}
                                                                    className="btn btn-white border-0"
                                                                    title={`Xóa [${getItemTitle(grammarContent)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedGrammarContents.length === 0 && filteredGrammarContents.length > 0 && (
                                                    <tr key="no-data">
                                                        <td colSpan="7">No data available on this page</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Pagination - matching Vue version */}
                                        {filteredGrammarContents.length > 0 && (
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
                                        {filteredGrammarContents.length > 0 && (
                                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                                <p>
                                                    {firstRowNumber} - {lastRowNumber} trên {filteredGrammarContents.length} kết quả
                                                </p>
                                            </div>
                                        )}

                                        {/* Search no results */}
                                        {normalizedGrammarContents.length > 0 && filteredGrammarContents.length === 0 && (
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted" />
                                                </div>
                                                <h5 className="text-muted">Không tìm thấy kết quả</h5>
                                                <p className="text-muted">
                                                    Không có grammar content nào khớp với từ khóa "{searchText}"
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
                                        <h5 className="text-muted">Chưa có grammar content nào</h5>
                                        <p className="text-muted">
                                            Grammar này chưa có contents. Hãy thêm content đầu tiên.
                                        </p>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleShowAddModal}
                                        >
                                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                            Thêm content đầu tiên
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddGrammarContentModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                grammarId={grammarId}
                retrieveGrammarContents={retrieveGrammarContents}
                grammarContents={grammarContents}
            />

            <EditGrammarContentModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                grammarContentId={selectedGrammarContentId}
                grammarId={grammarId}
                retrieveGrammarContents={retrieveGrammarContents}
                grammarContents={grammarContents}
            />
        </div>
    );
};

export default GrammarContentList;