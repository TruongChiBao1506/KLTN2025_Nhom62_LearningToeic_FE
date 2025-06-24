import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faBolt } from '@fortawesome/free-solid-svg-icons';

import EditScoreTableModal from './EditScoreTableModal';
import './style.css';

const ScoreTableList = ({ tableScores = [], getTableScores }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedScoreId, setSelectedScoreId] = useState(null);

    // Items per page options
    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    // Filtered scores based on search
    const filteredTableScores = useMemo(() => {
        if (!searchText) {
            return tableScores.slice();
        }
        return tableScores.filter((score) =>
            Object.values(score).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [tableScores, searchText]);

    // Total page count
    const totalPageCount = useMemo(() =>
        Math.ceil(filteredTableScores.length / itemsPerPage),
        [filteredTableScores.length, itemsPerPage]
    );

    // Paginated scores
    const paginatedTableScores = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTableScores.slice(startIndex, endIndex);
    }, [filteredTableScores, currentPage, itemsPerPage]);

    // First and last row numbers for pagination info
    const firstRowNumber = useMemo(() =>
        (currentPage - 1) * itemsPerPage + 1,
        [currentPage, itemsPerPage]
    );

    const lastRowNumber = useMemo(() =>
        Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredTableScores.length),
        [currentPage, itemsPerPage, filteredTableScores.length]
    );

    // Change page
    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    // Reset to page 1 when tableScores change
    useEffect(() => {
        setCurrentPage(1);
    }, [tableScores]);

    // Handle edit modal
    const handleShowEditModal = (scoreTableId) => {
        console.log('Opening edit modal for score table ID:', scoreTableId);
        setSelectedScoreId(scoreTableId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        console.log('Closing edit modal');
        setShowEditModal(false);
        setSelectedScoreId(null);
    };

    return (
        <>
            <div className="score-table-list">
                <div className="page-heading">
                    <section className="section">
                        <div className="card border-0">
                            {/* Search and Filter Controls */}
                            <div className="row">
                                <div className="col-3 mt-4">
                                    <select
                                        className="form-select ms-3 w-50"
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    >
                                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                            </div>

                            {/* Table */}
                            <div className="card-body">
                                <table className="table text-center table-hover shadow">
                                    <thead className="shadow">
                                        <tr className="align-middle">
                                            <th className="text-center">
                                                <button className="btn btn-success rounded-5 disabled">
                                                    NUM CORRECT
                                                </button>
                                            </th>
                                            <th className="text-center">SCORE</th>
                                            <th className="text-center">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTableScores.map((tableScore, index) => (
                                            <tr
                                                key={tableScore.scoreTableId || tableScore._id || tableScore.id || index}
                                                className="table-row shadow-on-hover align-middle"
                                            >
                                                {/* Center align the content */}
                                                <td className="text-center align-middle">
                                                    <span className="fw-bold">
                                                        {tableScore.numCorrectAnswers || tableScore.correctAnswers || 0}
                                                    </span>
                                                </td>
                                                <td className="text-center align-middle">
                                                    <span className="badge bg-primary fs-6">
                                                        {tableScore.score || 0}
                                                    </span>
                                                    <FontAwesomeIcon
                                                        icon={faBolt}
                                                        className="text-warning ms-2"
                                                    />
                                                </td>
                                                <td className="text-center align-middle">
                                                    <div className="d-flex justify-content-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-white border-0"
                                                            onClick={() => handleShowEditModal(
                                                                tableScore.scoreTableId ||
                                                                tableScore._id ||
                                                                tableScore.id
                                                            )}
                                                            title={`Chỉnh sửa điểm số [${tableScore.score}]`}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faEdit}
                                                                style={{ color: 'rgb(192, 129, 13)' }}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* No data row */}
                                        {paginatedTableScores.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center align-middle py-4">
                                                    <div>
                                                        <i className="fas fa-table fa-2x text-muted mb-2"></i>
                                                        <p className="text-muted mb-0">No data available</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {filteredTableScores.length > 0 && (
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

                                {/* Pagination Info */}
                                {filteredTableScores.length > 0 && (
                                    <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                        <p>
                                            {firstRowNumber} - {lastRowNumber} trên {filteredTableScores.length} kết quả
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>


            {/* Edit Score Table Modal */}
            <EditScoreTableModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                scoreTableId={selectedScoreId}
                getTableScores={getTableScores}
            />
        </>
    );
};

export default ScoreTableList;