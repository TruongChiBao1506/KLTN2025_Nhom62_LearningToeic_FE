import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCirclePlus,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import QuestionService from "../../../services/questionService";

// Table components
import TableSection1 from "./TableSection1";
import TableSection2 from "./TableSection2";
import TableSection3 from "./TableSection3";
import TableSection4 from "./TableSection4";
import TableSection5 from "./TableSection5";
import TableSection6 from "./TableSection6";
import TableSection7Single from "./TableSection7_1";
import TableSection7Double from "./TableSection7_2";
import TableSection7Triple from "./TableSection7_3";
import TableSectionNo1To2 from "./TableSectionNo1To2";
import TableSectionNo3To4 from "./TableSectionNo3To4";
import TableSectionNo5To7 from "./TableSectionNo5To7";
import TableSectionNo8To10 from "./TableSectionNo8To10";
import TableSectionNo11 from "./TableSectionNo11";
import TableSectionNo1To5 from "./TableSectionNo1To5";
import TableSectionNo6To7 from "./TableSectionNo6To7";
import TableSectionNo8 from "./TableSectionNo8";

// Modal wrappers
import AddQuestionModal from "./AddQuestionModal";
import EditQuestionModal from "./EditQuestionModal";

import "./style.css";

const ITEMS_PER_PAGE_OPTIONS = [60, 120, 180, 600];

const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
  value: option,
  label: `${option} mục/trang`
}));

const QuestionSectionPage = ({
  questions = [],
  sectionId,
  retrieveQuestions,
}) => {
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  const filteredQuestions = useMemo(() => {
    if (!questions || !Array.isArray(questions)) {
      return [];
    }

    if (!searchText) return questions.slice();

    return questions.filter((question) =>
      Object.values(question).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [questions, searchText]);

  const totalPageCount = Math.ceil(filteredQuestions.length / itemsPerPage);

  const paginatedQuestions = useMemo(() => {
    if (!filteredQuestions || filteredQuestions.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage, itemsPerPage]);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPageCount) {
      setCurrentPage(page);
    }
  };

  // Add Modal handlers
  const handleShowAddModal = () => {
    console.log('Opening Add Question Modal');
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    console.log('Closing Add Question Modal');
    setShowAddModal(false);
  };

  // Edit Modal handlers
  const handleShowEditModal = (questionId) => {
    console.log('Opening Edit Question Modal for ID:', questionId);
    setSelectedQuestionId(questionId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    console.log('Closing Edit Question Modal');
    setShowEditModal(false);
    setSelectedQuestionId(null);
  };

  const getImageUrl = (imageName) =>
    imageName ? `http://localhost:9004/images/${imageName}` : "https://demofree.sirv.com/nope-not-here.jpg";

  const getAudioUrl = (audioName) =>
    audioName ? `http://localhost:9004/audios/${audioName}` : "https://static.vecteezy.com/system/resources/thumbnails/016/089/966/small_2x/sound-error-black-glyph-icon-device-breakage-media-player-failure-loudspeaker-is-broken-warning-signal-silhouette-symbol-on-white-space-solid-pictogram-isolated-illustration-vector.jpg";

  // Table selection logic
  const renderTable = () => {
    switch (sectionId) {
      case "686ce171b614dda1fc08f1d0":
        return (
          <TableSection1
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            getImageUrl={getImageUrl}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "686ce171b614dda1fc08f1d1":
        return (
          <TableSection2
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "686ce171b614dda1fc08f1d2":
        return (
          <TableSection3
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            getImageUrl={getImageUrl}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "686ce171b614dda1fc08f1d3":
        return (
          <TableSection4
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            getImageUrl={getImageUrl}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "686ce171b614dda1fc08f1d4":
        return (
          <TableSection5
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "686ce171b614dda1fc08f1d5":
        return (
          <TableSection6
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "686007e22278739d2ceea780":
        return (
          <TableSection7Single
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d10f3abd7f3cf92add620":
        return (
          <TableSection7Double
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d12f0abd7f3cf92add643":
        return (
          <TableSection7Triple
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d16f6abd7f3cf92add64a":
        return (
          <TableSectionNo1To2
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d170eabd7f3cf92add651":
        return (
          <TableSectionNo3To4
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d1721abd7f3cf92add658":
        return (
          <TableSectionNo5To7
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d1732abd7f3cf92add65f":
        return (
          <TableSectionNo8To10
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d1744abd7f3cf92add666":
        return (
          <TableSectionNo11
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d1761abd7f3cf92add66d":
        return (
          <TableSectionNo1To5
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d1773abd7f3cf92add674":
        return (
          <TableSectionNo6To7
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      case "685d178babd7f3cf92add67b":
        return (
          <TableSectionNo8
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={itemsPerPage}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
            handleShowEditModal={handleShowEditModal}
          />
        );
      default:
        return null;
    }
  };

  // Pagination info
  const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
  const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredQuestions.length);

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
            {renderTable()}

            {/* Pagination */}
            {filteredQuestions.length > 0 && (
              <>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
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
                        className={`page-item${currentPage === pageNumber ? " active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => changePage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item${currentPage === totalPageCount ? " disabled" : ""}`}>
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

                {/* Pagination info */}
                <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                  <p>
                    {firstRowNumber} - {lastRowNumber} trên {filteredQuestions.length} kết quả
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AddQuestionModal
        show={showAddModal}
        onHide={handleCloseAddModal}
        sectionId={sectionId}
        retrieveQuestions={retrieveQuestions}
      />

      {/* Edit Modal */}
      <EditQuestionModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        sectionId={sectionId}
        questionId={selectedQuestionId}
        retrieveQuestions={retrieveQuestions}
      />
    </div>
  );
};

export default QuestionSectionPage;