import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCheck,
    faUserTimes,
    faSearch,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import UserService from '../../../services/userService';
import './style.css';

const LearnerList = ({ learners = [], getAllLearners }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));

    // Filtered learners based on search text
    const filteredLearners = useMemo(() => {
        if (!learners || !Array.isArray(learners)) {
            return [];
        }

        if (!searchText) {
            return learners.slice();
        }

        return learners.filter((learner) =>
            Object.values(learner).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [learners, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredLearners.length / itemsPerPage);

    const paginatedLearners = useMemo(() => {
        if (!filteredLearners || filteredLearners.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredLearners.slice(startIndex, endIndex);
    }, [filteredLearners, currentPage, itemsPerPage]);

    // Handle page change
    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    // Handle delete learner
    const handleDeleteLearner = async (learnerId, learnerName) => {
        const result = await Swal.fire({
            title: `Bạn muốn xóa learner "${learnerName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await UserService.delete(learnerId);
                toast.success('Xóa learner thành công!', {
                    autoClose: 1000,
                });
                getAllLearners();
            } catch (error) {
                console.log(error);
                toast.error('Có lỗi xảy ra khi xóa learner!', {
                    autoClose: 2000,
                });
            }
        }
    };

    // toggle user status function
    const toggleUserStatus = async (learnerId, newStatus, learnerName) => {
        try {
            // Tìm learner theo id
            const learner = learners.find(l => (l._id || l.userId) === learnerId);
            // Kiểm tra nếu là admin thì không cho chặn
            if (
                learner &&
                learner.roles &&
                learner.roles.some(role => role.name?.includes("ROLE_ADMIN")) &&
                newStatus === 0 // chỉ kiểm tra khi muốn chặn
            ) {
                toast.warn('Không thể chặn tài khoản có quyền Admin!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                return;
            }

            // Add confirmation dialog
            const isBlocking = newStatus === 0; // 0 = block, 1 = unblock
            const action = isBlocking ? 'chặn' : 'bỏ chặn';

            const result = await Swal.fire({
                title: `Bạn muốn ${action} learner này?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: isBlocking ? '#d33' : '#3085d6',
                cancelButtonColor: '#6c757d',
                confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
                cancelButtonText: 'Hủy',
            });

            if (!result.isConfirmed) {
                return;
            }

            // Call API with proper data structure
            await UserService.updateUserStatus(learnerId, newStatus);
            console.log(`User ${learnerId} status updated to ${newStatus}`);

            // Show success message
            toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} thành công!`, {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Refresh data
            getAllLearners();
        } catch (error) {
            console.error('Toggle status error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    // Helper function to check if user is blocked
    const isUserBlocked = (learner) => {
        // Check multiple possible status fields
        if (learner.hasOwnProperty('status')) {
            return learner.status === 0; // status: 0 = blocked, 1 = active
        }
        if (learner.hasOwnProperty('isActive')) {
            return learner.isActive === 0; // isActive: 0 = blocked, 1 = active
        }
        if (learner.hasOwnProperty('isBlocked')) {
            return learner.isBlocked === true; // isBlocked: true = blocked
        }
        return false; // Default to not blocked
    };

    // Format date
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredLearners.length);

    console.log('Filtered Learners:', filteredLearners);
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

                        {/* Không có add button cho learner */}
                        <div className="col-3 d-flex justify-content-end"></div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-primary rounded-5 disabled">No.</button></th>
                                    <th>AVATAR</th>
                                    <th>USERNAME</th>
                                    <th>EMAIL</th>
                                    <th>ROLE</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLearners.length > 0 ? (
                                    paginatedLearners.map((learner, index) => (
                                        <tr key={learner._id || learner.userId || index} className="table-row shadow-on-hover align-middle">
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>
                                                <img
                                                    src={learner.avatar || "https://via.placeholder.com/40x40?text=User"}
                                                    alt={learner.username || learner.name || 'User'}
                                                    className="topic-image rounded-5"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td>
                                                <strong>{learner.username || learner.name}</strong>
                                            </td>
                                            <td>
                                                <span className="text-muted">{learner.email}</span>
                                            </td>
                                            <td>
                                                {learner.roles && learner.roles.length > 0 ? (
                                                    <span>
                                                        {learner.roles.map((role, idx) => {
                                                            let badgeClass = "badge me-1 ";
                                                            if (role.name?.toLowerCase().includes("admin")) {
                                                                badgeClass += "bg-warning";
                                                            } else if (role.name?.toLowerCase().includes("learner")) {
                                                                badgeClass += "bg-primary";
                                                            } else {
                                                                badgeClass += "bg-secondary";
                                                            }
                                                            return (
                                                                <span key={idx} className={badgeClass}>
                                                                    {role.name}
                                                                </span>
                                                            );
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">No roles assigned</span>
                                                )}
                                            </td>
                                            <td>
                                                {isUserBlocked(learner) ? (
                                                    <span
                                                        onClick={() => toggleUserStatus(
                                                            learner._id,
                                                            1, // unblock (change status to 1)
                                                            learner.username || learner.name
                                                        )}
                                                        className="btn badge text-bg-danger rounded-5"
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click để bỏ chặn"
                                                    >
                                                        <FontAwesomeIcon icon={faUserTimes} className="me-1" />
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span
                                                        onClick={() => toggleUserStatus(
                                                            learner._id,
                                                            0, // block (change status to 0)
                                                            learner.username || learner.name
                                                        )}
                                                        className="btn badge text-bg-success rounded-5"
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click để chặn"
                                                    >
                                                        <FontAwesomeIcon icon={faUserCheck} className="me-1" />
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td>{formatDate(learner.createdAt || learner.created_at)}</td>
                                            <td>
                                                <div className="d-flex justify-content-center">
                                                    {/* Delete button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLearner(
                                                            learner._id || learner.userId,
                                                            learner.username || learner.name
                                                        )}
                                                        className="btn btn-white border-0"
                                                        title={`Xóa [${learner.username || learner.name}]`}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr key="no-data">
                                        <td colSpan="7">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredLearners.length > 0 && (
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
                        {filteredLearners.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredLearners.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnerList;