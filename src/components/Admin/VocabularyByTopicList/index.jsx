import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faEdit,
    faTrash,
    faSearch,
    faFileImport,
    faFileDownload
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'sweetalert2/dist/sweetalert2.min.css';

import VocabularyService from '../../../services/vocabularyService';
import AddVocabularyModal from './AddVocabularyModal';
import EditVocabularyModal from './EditVocabularyModal';
import './style.css';

const VocabularyList = ({ vocabularies = [], topicId, retrieveVocabularies }) => {
    const [searchText, setSearchText] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVocabularyId, setSelectedVocabularyId] = useState(null);

    const fileInputRef = useRef(null);

    const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

    const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        value: option,
        label: `${option} mục/trang`
    }));


    // Modal handlers
    const handleShowAddModal = () => {
        console.log('🔄 Opening Add Vocabulary Modal');
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        console.log('🔄 Closing Add Vocabulary Modal');
        setShowAddModal(false);
    };

    const handleShowEditModal = (vocabularyId) => {
        console.log('🔄 Opening Edit Vocabulary Modal for:', vocabularyId);
        setSelectedVocabularyId(vocabularyId);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        console.log('🔄 Closing Edit Vocabulary Modal');
        setShowEditModal(false);
        setSelectedVocabularyId(null);
    };

    // Filter vocabularies based on search
    const filteredVocabularies = useMemo(() => {
        if (!vocabularies || !Array.isArray(vocabularies)) {
            return [];
        }

        if (!searchText) {
            return vocabularies.slice();
        }

        return vocabularies.filter((vocabulary) =>
            Object.values(vocabulary).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [vocabularies, searchText]);

    // Pagination logic
    const totalPageCount = Math.ceil(filteredVocabularies.length / itemsPerPage);
    const paginatedVocabularies = useMemo(() => {
        if (!filteredVocabularies || filteredVocabularies.length === 0) {
            return [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredVocabularies.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredVocabularies, currentPage, itemsPerPage]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [vocabularies]);

    // Pagination helpers
    const changePage = (page) => {
        if (page >= 1 && page <= totalPageCount) {
            setCurrentPage(page);
        }
    };

    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min(currentPage * itemsPerPage, filteredVocabularies.length);

    // Delete vocabulary
    const deleteVocabulary = async (vocabularyId) => {
        try {
            const result = await Swal.fire({
                title: 'Bạn muốn xóa từ vựng này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                await VocabularyService.delete(vocabularyId);
                retrieveVocabularies();
                Swal.fire({
                    title: 'Xóa từ vựng thành công!',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Lỗi khi xóa từ vựng',
                icon: 'error',
                timer: 1000,
                showConfirmButton: false,
            });
        }
    };

    // Toggle vocabulary status
    const toggleStatus = async (vocabularyId, newStatus) => {
        try {
            console.log('Vocabulary ID:', vocabularyId);
            console.log('New Status:', newStatus);
            await VocabularyService.updateStatus(vocabularyId, newStatus);
            retrieveVocabularies();
        } catch (error) {
            console.error(error);
        }
    };

    // Download template
    const downloadTemplate = async () => {
        try {
            await VocabularyService.exportTemplate();
            toast.success('Download template thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi download template', {
                autoClose: 1000,
            });
        }
    };

    // Handle file change for import
    const handleFileChange = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];

            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)', {
                    autoClose: 2000,
                });
                return;
            }

            console.log('📤 Importing vocabulary file:', file.name);

            await VocabularyService.importTemplate(file, topicId);
            retrieveVocabularies();

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            toast.success('Import Vocabulary Data thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi Import Vocabulary Data', {
                autoClose: 2000,
            });
        }
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

    // Get image URL
    const getImageUrl = (imageName) => {
        if (imageName) {
            return `${process.env.REACT_APP_API_URL || 'http://localhost:9004'}/images/vocabulary/${imageName}`;
        }
        return `https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png`;
    };

    // Truncate text
    const truncateText = (text, maxLength = 20) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
                        <div className="col-3 d-flex justify-content-end">
                            {/* Add button */}
                            <button
                                type="button"
                                className="btn badge text-bg-success d-flex align-items-center p-3 rounded-5"
                                onClick={handleShowAddModal}
                                title="Thêm vocabulary mới"
                            >
                                <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                Thêm mới
                            </button>

                            {/* Import button */}
                            <label
                                htmlFor="fileInput"
                                className="btn badge text-bg-success d-flex align-items-center p-3 rounded-5 ms-2"
                                title="Import từ Excel file"
                                style={{ cursor: 'pointer', height: '72%' }}
                            >
                                <FontAwesomeIcon icon={faFileImport} className="me-2" />
                                Import
                            </label>
                            <input
                                id="fileInput"
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".xlsx,.xls"
                            />

                            {/* Export button */}
                            <button
                                type="button"
                                className="btn badge text-bg-success d-flex align-items-center p-3 rounded-5 ms-2"
                                onClick={downloadTemplate}
                                title="Download template Excel"
                            >
                                <FontAwesomeIcon icon={faFileDownload} className="me-2" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card-body">
                        <table className="table text-center table-hover shadow">
                            <thead className="shadow">
                                <tr className="align-middle">
                                    <th><button className="btn btn-success rounded-5 disabled">No.</button></th>
                                    <th>VOCAB</th>
                                    <th>IPA</th>
                                    <th>MEANING</th>
                                    <th>EXAMPLE</th>
                                    <th>IMAGE</th>
                                    <th>STATUS</th>
                                    <th>CREATED_AT</th>
                                    <th>UPDATED_AT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedVocabularies.map((vocabulary, index) => (
                                    <tr
                                        key={vocabulary._id}
                                        className="table-row shadow-on-hover align-middle"
                                    >
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <strong title={vocabulary.word}>
                                                {vocabulary.word}
                                            </strong>
                                        </td>
                                        <td>
                                            <span className="text-muted fst-italic">
                                                {vocabulary.ipa || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div title={vocabulary.meaning}>
                                                {truncateText(vocabulary.meaning, 25)}
                                            </div>
                                        </td>
                                        <td>
                                            <div title={vocabulary.exampleSentence}>
                                                {truncateText(vocabulary.exampleSentence, 30)}
                                            </div>
                                        </td>
                                        <td>
                                            <img
                                                src={getImageUrl(vocabulary.image)}
                                                alt="Vocabulary"
                                                className="topic-image rounded-3"
                                            // onError={(e) => {
                                            //     e.target.src = `https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png`;
                                            // }}
                                            />
                                        </td>
                                        <td>
                                            {vocabulary.vocabularyStatus === 1 ? (
                                                <span
                                                    onClick={() => toggleStatus(vocabulary._id, 0)}
                                                    className="btn badge text-bg-success rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Enable
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={() => toggleStatus(vocabulary._id, 1)}
                                                    className="btn badge text-bg-danger rounded-5"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Disable
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(vocabulary.createdAt)}</td>
                                        <td>{formatDate(vocabulary.updatedAt)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-white border-0"
                                                    onClick={() => handleShowEditModal(vocabulary._id)}
                                                    title={`Chỉnh sửa [${vocabulary.word}]`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} style={{ color: 'rgb(192, 129, 13)' }} />
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteVocabulary(vocabulary.vocabularyId || vocabulary._id)}
                                                    className="btn btn-white border-0"
                                                    title={`Xóa [${vocabulary.word}]`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedVocabularies.length === 0 && (
                                    <tr key="no-data">
                                        <td colSpan="10">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredVocabularies.length > 0 && (
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
                        {filteredVocabularies.length > 0 && (
                            <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                <p>
                                    {firstRowNumber} - {lastRowNumber} trên {filteredVocabularies.length} kết quả
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AddVocabularyModal
                show={showAddModal}
                onHide={handleCloseAddModal}
                topicId={topicId}
                retrieveVocabularies={retrieveVocabularies}
            />

            <EditVocabularyModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                vocabularyId={selectedVocabularyId}
                topicId={topicId}
                retrieveVocabularies={retrieveVocabularies}
            />
        </div>
    );
};

export default VocabularyList;