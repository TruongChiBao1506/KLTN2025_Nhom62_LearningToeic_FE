import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import AddBlogModal from './AddBlogModal';
import BlogService from '../../../services/blogService';
import { extractBlogsFromResponse, getBlogId, getFormattedStatus, getStatusColor } from '../../../utils/blogUtils';

const BlogList = ({ blogs = [], retrieveBlogs }) => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Ensure blogs is always an array - use utility function
    const blogsArray = useMemo(() => {
        return extractBlogsFromResponse(blogs);
    }, [blogs]);

    // Filtered blogs based on search text
    const filteredBlogs = useMemo(() => {
        if (!searchText.trim()) {
            return blogsArray;
        }

        const searchLower = searchText.toLowerCase();
        return blogsArray.filter((blog) =>
            blog.title?.toLowerCase().includes(searchLower) ||
            blog.category?.toLowerCase().includes(searchLower) ||
            blog.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }, [blogsArray, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredBlogs.length / itemsPerPage);

    const paginatedBlogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredBlogs.slice(startIndex, endIndex);
    }, [filteredBlogs, currentPage, itemsPerPage]);

    // Reset to first page when blogs change
    useEffect(() => {
        setCurrentPage(1);
    }, [blogsArray]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleEditBlog = (blogId) => {
        console.log('🚀 Navigating to blog detail:', blogId); // Debug
        if (!blogId) {
            console.error('❌ Cannot navigate: No blog ID provided');
            return;
        }
        navigate(`/admin/blog/${blogId}`);
    };



    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteBlog = async (blogId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa Blog này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await BlogService.deleteBlog(blogId);
                if (retrieveBlogs) {
                    retrieveBlogs();
                }
                Swal.fire({
                    title: 'Xóa blog thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.error('Error deleting blog:', error);
                Swal.fire({
                    title: 'Lỗi khi xóa blog',
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredBlogs.length);

    return (
        <div className="page-heading">
            <div className="section">
                <div className="card border-0">
                    <div className="row align-items-center p-3">
                        {/* Items per page selector */}
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
                                    placeholder="Tìm kiếm blog..."
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
                                title="Thêm blog mới"
                                style={{ 
                                    borderRadius: '20px', 
                                    fontSize: '12px', 
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
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                                    <th>TITLE</th>
                                    <th>CATEGORY</th>
                                    <th>TAGS</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBlogs.map((blog, index) => (
                                    <tr key={getBlogId(blog)} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td style={{ maxWidth: '200px' }}>
                                            <div style={{ 
                                                textOverflow: 'ellipsis', 
                                                overflow: 'hidden', 
                                                whiteSpace: 'nowrap',
                                                fontWeight: '500'
                                            }}>
                                                {blog.title}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-primary rounded-5">
                                                {blog.category}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '150px' }}>
                                            <div style={{ 
                                                textOverflow: 'ellipsis', 
                                                overflow: 'hidden', 
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {blog.tags?.slice(0, 2).join(', ')}
                                                {blog.tags?.length > 2 && '...'}
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className={`badge rounded-5 ${
                                                    getStatusColor(blog.status, blog.generationStatus) === 'green' 
                                                        ? 'text-bg-success' 
                                                        : getStatusColor(blog.status, blog.generationStatus) === 'orange'
                                                            ? 'text-bg-warning'
                                                            : 'text-bg-secondary'
                                                }`}
                                            >
                                                {getFormattedStatus(blog.status, blog.generationStatus)}
                                            </span>
                                        </td>
                                        <td>{formatDate(blog.createdAt)}</td>
                                        <td>{formatDate(blog.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* View button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => alert('View content functionality - to be implemented')}
                                                    title={`Xem nội dung [${blog.title}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEye} style={{ color: 'rgb(13, 110, 253)' }} />
                                                </button>

                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => {
                                                        const blogId = getBlogId(blog);
                                                        if (blogId) {
                                                            handleEditBlog(blogId);
                                                        } else {
                                                            console.error('❌ No valid blog ID found');
                                                        }
                                                    }}
                                                    title={`Chỉnh sửa [${blog.title}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const blogId = getBlogId(blog);
                                                        if (blogId) {
                                                            deleteBlog(blogId);
                                                        } else {
                                                            console.error('❌ No valid blog ID for deletion');
                                                        }
                                                    }}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${blog.title}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedBlogs.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="8">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredBlogs.length > 0 && (
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
                        {filteredBlogs.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredBlogs.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddBlogModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                retrieveBlogs={retrieveBlogs}
            />
        </div>
    );
};

export default BlogList;