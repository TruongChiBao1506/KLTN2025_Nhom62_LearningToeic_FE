import React, { useState, useEffect, useMemo } from 'react';
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

import GrammarService from '../../services/grammarService';
import AddGrammarModal from './AddGrammarModal';
import EditGrammarModal from './EditGrammarModal';
import './style.css';

const GrammarList = ({ grammars = [], retrieveGrammars }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGrammarId, setSelectedGrammarId] = useState(null);
    
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    // Filtered grammars based on search text
    const filteredGrammars = useMemo(() => {
        if (!grammars || !Array.isArray(grammars)) {
            return [];
        }
        
        if (!searchText) {
            return grammars.slice();
        }
        
        return grammars.filter((grammar) =>
            Object.values(grammar).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [grammars, searchText]);

    // Pagination calculations
    const totalPageCount = Math.ceil(filteredGrammars.length / itemsPerPage);
    
    const paginatedGrammars = useMemo(() => {
        if (!filteredGrammars || filteredGrammars.length === 0) {
            return [];
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredGrammars.slice(startIndex, endIndex);
    }, [filteredGrammars, currentPage, itemsPerPage]);

    // Reset to first page when grammars change
    useEffect(() => {
        setCurrentPage(1);
    }, [grammars]);

    // Modal handlers
    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleShowEditModal = (grammarId) => {
        setSelectedGrammarId(grammarId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedGrammarId(null);
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const deleteGrammar = async (grammarId) => {
        const result = await Swal.fire({
            title: 'Bạn muốn xóa ngữ pháp này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await GrammarService.delete(grammarId);
                retrieveGrammars();
                Swal.fire({
                    title: 'Xóa ngữ pháp thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: 'Lỗi khi xóa ngữ pháp',
                    icon: 'error',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        }
    };

    const toggleStatus = async (grammarId, newStatus) => {
        try {
            console.log(grammarId);
            console.log(newStatus);
            await GrammarService.updateStatus(grammarId, newStatus);
            retrieveGrammars();
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
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredGrammars.length);

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
                        <div className="col-7 mt-4">
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
                        <div className="col-3 mt-4 d-flex justify-content-end">
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
                            <thead className="text-center shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-success rounded-5 disabled">No.</button></th>
                                    <th>GRAMMAR</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                    <th>MANAGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedGrammars.map((grammar, index) => (
                                    <tr key={grammar._id} className="table-row shadow-on-hover align-middle">
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{grammar.grammarName}</td>
                                        <td>
                                            {grammar.grammarStatus === 1 ? (
                                                <span 
                                                    onClick={() => toggleStatus(grammar._id, 0)}
                                                    className="btn badge text-bg-success"
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span 
                                                    onClick={() => toggleStatus(grammar._id, 1)}
                                                    className="btn badge text-bg-danger"
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(grammar.createdAt)}</td>
                                        <td>{formatDate(grammar.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button 
                                                    type="button" 
                                                    className="btn btn-white border-0" 
                                                    onClick={() => handleShowEditModal(grammar._id)}
                                                    title={`Chỉnh sửa [${grammar.grammarName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{color: 'rgb(192, 129, 13)'}} />
                                                </button>

                                                {/* Delete button */}
                                                <button 
                                                    type="button" 
                                                    onClick={() => deleteGrammar(grammar._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${grammar.grammarName}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <Link to={`/admin/grammar/${grammar._id}/grammar-content`}>
                                                    <button className="glowing-button ms-2">Grammar Content</button>
                                                </Link>

                                                <Link to={`/admin/grammar/${grammar._id}/grammar-question`}>
                                                    <button className="glowing-button ms-2">Question</button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedGrammars.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="7">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredGrammars.length > 0 && (
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
                        {filteredGrammars.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredGrammars.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddGrammarModal 
                show={showAddModal}
                onHide={handleCloseAddModal}
                retrieveGrammars={retrieveGrammars}
            />

            <EditGrammarModal 
                show={showEditModal}
                onHide={handleCloseEditModal}
                grammarId={selectedGrammarId}
                retrieveGrammars={retrieveGrammars}
            />
        </div>
    );
};

export default GrammarList;