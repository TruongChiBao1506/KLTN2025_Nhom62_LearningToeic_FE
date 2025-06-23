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
    // ✅ Ensure grammarContents is always an array
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

    // ...existing functions...

    // ✅ Helper function to get field value with fallback
    const getFieldValue = (item, primaryField, fallbackField, defaultValue = '') => {
        return item[primaryField] || item[fallbackField] || defaultValue;
    };

    // ✅ Helper function to get ID with different possible field names
    const getItemId = (item) => {
        return item._id || item.contentId || item.grammarContentId || item.id;
    };

    // ✅ Helper function to get title with different possible field names
    const getItemTitle = (item) => {
        return item.grammarContentTitle || item.title || item.name || 'No title';
    };

    // ✅ Helper function to get content/description
    const getItemContent = (item) => {
        return item.grammarContentDescription || item.content || item.description || 'No content';
    };

    // ✅ Helper function to get status
    const getItemStatus = (item) => {
        return item.grammarContentStatus !== undefined ? item.grammarContentStatus : (item.status !== undefined ? item.status : 1);
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

    // Delete grammar content
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

    // Toggle status
    const toggleStatus = async (grammarContentId, newStatus) => {
        try {
            console.log('Grammar Content ID:', grammarContentId);
            console.log('New Status:', newStatus);
            
            await GrammarContentService.updateStatus(grammarContentId, newStatus);
            retrieveGrammarContents();
            
            toast.success(`${newStatus === 1 ? 'Kích hoạt' : 'Vô hiệu hóa'} grammar content thành công`, {
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
                                    placeholder="Tìm kiếm grammar content..." 
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
                                title="Thêm grammar content mới"
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
                                                        <button className="btn btn-success rounded-5 disabled">No.</button>
                                                    </th>
                                                    <th>TITLE</th>
                                                    <th>DESCRIPTION</th>
                                                    <th>EXAMPLE</th>
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
                                                        <td>
                                                            <div title={getItemTitle(grammarContent)}>
                                                                {truncateText(getItemTitle(grammarContent), 30)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div 
                                                                title={stripHtml(getItemContent(grammarContent))}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: truncateText(getItemContent(grammarContent), 50) 
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div 
                                                                title={grammarContent.grammarContentExample || 'No example'}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: truncateText(grammarContent.grammarContentExample || 'No example', 50) 
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            {getItemStatus(grammarContent) === 1 ? (
                                                                <span 
                                                                    onClick={() => toggleStatus(getItemId(grammarContent), 0)}
                                                                    className="btn badge text-bg-success"
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Click để vô hiệu hóa"
                                                                >
                                                                    Enable
                                                                </span>
                                                            ) : (
                                                                <span 
                                                                    onClick={() => toggleStatus(getItemId(grammarContent), 1)}
                                                                    className="btn badge text-bg-danger"
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
                                                                    title={`Chỉnh sửa [${truncateText(getItemTitle(grammarContent), 15)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                                </button>

                                                                {/* Delete button */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => deleteGrammarContent(getItemId(grammarContent))}
                                                                    className="btn btn-white border-0"
                                                                    title={`Xóa [${truncateText(getItemTitle(grammarContent), 15)}]`}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedGrammarContents.length === 0 && filteredGrammarContents.length > 0 && (
                                                    <tr key="no-data">
                                                        <td colSpan="8">No data available on this page</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
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

                                        {/* Results info */}
                                        {filteredGrammarContents.length > 0 && (
                                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                                <p>
                                                    {firstRowNumber} - {lastRowNumber} trên {filteredGrammarContents.length} kết quả
                                                    {pagination && (
                                                        <> | Server: {pagination.totalItems} total items</>
                                                    )}
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
            />

            <EditGrammarContentModal 
                show={showEditModal}
                onHide={handleCloseEditModal}
                grammarContentId={selectedGrammarContentId}
                grammarId={grammarId}
                retrieveGrammarContents={retrieveGrammarContents}
            />
        </div>
    );
};

export default GrammarContentList;