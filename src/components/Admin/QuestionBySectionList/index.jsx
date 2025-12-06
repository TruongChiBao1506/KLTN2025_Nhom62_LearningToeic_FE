import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCirclePlus,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import QuestionService from "../../../services/questionService";
import sectionsService from "../../../services/sectionsService";

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
  const [section, setSection] = useState(null);
  const [sectionLoading, setSectionLoading] = useState(false);

  useEffect(() => {
    const fetchSection = async () => {
      if (!sectionId) return;
      
      setSectionLoading(true);
      try {
        const response = await sectionsService.get(sectionId);
        setSection(response);
      } catch (error) {
        console.error("Error fetching section:", error);
        setSection(null);
      } finally {
        setSectionLoading(false);
      }
    };

    fetchSection();
  }, [sectionId]);

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

  // ✅ Hỗ trợ cả S3 URL và local URL
  const getImageUrl = (imageName) => {
    if (!imageName) return "https://demofree.sirv.com/nope-not-here.jpg";
    
    // Nếu đã là URL đầy đủ (S3 hoặc HTTP/HTTPS), trả về trực tiếp
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    
    // Nếu chỉ là tên file, tạo URL local
    return `http://localhost:9004/images/${imageName}`;
  };

  // ✅ Hỗ trợ cả S3 URL và local URL
  const getAudioUrl = (audioName) => {
    if (!audioName) {
      return "https://static.vecteezy.com/system/resources/thumbnails/016/089/966/small_2x/sound-error-black-glyph-icon-device-breakage-media-player-failure-loudspeaker-is-broken-warning-signal-silhouette-symbol-on-white-space-solid-pictogram-isolated-illustration-vector.jpg";
    }
    
    // Nếu đã là URL đầy đủ (S3 hoặc HTTP/HTTPS), trả về trực tiếp
    if (audioName.startsWith('http://') || audioName.startsWith('https://')) {
      return audioName;
    }
    
    // Nếu chỉ là tên file, tạo URL local
    return `http://localhost:9004/audios/${audioName}`;
  };

  // Table selection logic based on section metadata
  const renderTable = () => {
    if (sectionLoading) {
      return <div className="text-center p-4">Đang tải thông tin phần thi...</div>;
    }
    if (!section) {
      return <div className="text-center p-4 text-danger">Không tìm thấy thông tin phần thi.</div>;
    }

    // Extract part number from name (e.g., "Part 1: Photographs" -> 1)
    const partMatch = section.name.match(/Part (\d+)/i);
    const partNumber = partMatch ? parseInt(partMatch[1]) : null;

    // Determine table based on type and part number
    if (section.type === 1) {  // Listening sections
      switch (partNumber) {
        case 1:
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
        case 2:
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
        case 3:
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
        case 4:
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
        default:
          return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần thi Listening này.</div>;
      }
    } else if (section.type === 2) {  // Reading sections
      switch (partNumber) {
        case 5:
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
        case 6:
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
        case 7:
          // Handle Part 7 variants based on name keywords
          if (section.name.toLowerCase().includes("single")) {
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
          } else if (section.name.toLowerCase().includes("double")) {
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
          } else if (section.name.toLowerCase().includes("triple")) {
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
          } else {
            // Default Part 7 (general Reading Comprehension)
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
          }
        default:
          return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần thi Reading này.</div>;
      }
    } else if (section.type === 3) {  // Grammar sections (types 1-2, 3-4, 5-7, 8-10, 11)
      // Determine by section name patterns
      const nameLower = section.name.toLowerCase();
      
      if (nameLower.includes("1") && nameLower.includes("2")) {
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
      } else if (nameLower.includes("3") && nameLower.includes("4")) {
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
      } else if (nameLower.includes("5") && nameLower.includes("7")) {
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
      } else if (nameLower.includes("8") && nameLower.includes("10")) {
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
      } else if (nameLower.includes("11")) {
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
      }
      return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần ngữ pháp này.</div>;
    } else if (section.type === 4) {  // Vocabulary sections (types 1-5, 6-7, 8)
      const nameLower = section.name.toLowerCase();
      
      if (nameLower.includes("1") && nameLower.includes("5")) {
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
      } else if (nameLower.includes("6") && nameLower.includes("7")) {
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
      } else if (nameLower.includes("8")) {
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
      }
      return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần từ vựng này.</div>;
    }

    return <div className="text-center p-4 text-warning">Không xác định được loại phần thi.</div>;
  };

  // Pagination info
  const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
  const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredQuestions.length);

  return (
    <div className="page-heading">
      <div className="section">
        <div className="card border-0">
          {/* Control row with Bootstrap grid columns */}
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
                  placeholder="Tìm kiếm"
                />
                <div className="input-group-append">
                  <button className="btn btn-light-emphasis">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add button styled like TopicList */}
            <div className="col-3" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexDirection: 'row' }}>
              <button
                type="button"
                className="btn btn-success d-flex align-items-center"
                onClick={handleShowAddModal}
                title="Thêm mới câu hỏi"
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