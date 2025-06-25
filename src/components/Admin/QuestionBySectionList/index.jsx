import React, { useState, useMemo } from "react";
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

// Add-question modals
import QuestionAddSection1 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection1";
import QuestionAddSection2 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection2";
import QuestionAddSection3 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection3";
import QuestionAddSection4 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection4";
import QuestionAddSection5 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection5";
import QuestionAddSection6 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection6";
import QuestionAddSection7Single from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection7_1";
import QuestionAddSection7Double from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection7_2";
import QuestionAddSection7Triple from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection7_3";
import QuestionAddNo1To2 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo1To2";
import QuestionAddNo3To4 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo3To4";
import QuestionAddNo5To7 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo5To7";
import QuestionAddNo8To10 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo8To10";
import QuestionAddNo11 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo11";
import QuestionAddNo1To5 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo1To5";
import QuestionAddNo6To7 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo6To7";
import QuestionAddNo8 from "../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo8";

import "./style.css";

const ITEMS_PER_PAGE_OPTIONS = [60, 120, 180, 600];

const QuestionSectionPage = ({
  questions = [],
  sectionId,
  retrieveQuestions,
}) => {
  const [searchText, setSearchText] = useState("");
  const [ITEMS_PER_PAGE, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredQuestions = useMemo(() => {
    if (!searchText) return questions;
    return questions.filter((question) =>
      Object.values(question).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [questions, searchText]);

  const totalPageCount = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage, ITEMS_PER_PAGE]);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPageCount) {
      setCurrentPage(page);
    }
  };

  const getImageUrl = (imageName) =>
    imageName ? `http://localhost:9004/images/${imageName}` : "https://demofree.sirv.com/nope-not-here.jpg";

  const getAudioUrl = (audioName) =>
    audioName ? `http://localhost:9004/audios/${audioName}` : "https://static.vecteezy.com/system/resources/thumbnails/016/089/966/small_2x/sound-error-black-glyph-icon-device-breakage-media-player-failure-loudspeaker-is-broken-warning-signal-silhouette-symbol-on-white-space-solid-pictogram-isolated-illustration-vector.jpg";

  // Table selection logic
  const renderTable = () => {
    switch (sectionId) {
      case "1":
        return (
          <TableSection1
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            getImageUrl={getImageUrl}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "2":
        return (
          <TableSection2
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "3":
        return (
          <TableSection3
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            getImageUrl={getImageUrl}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "4":
        return (
          <TableSection4
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            getImageUrl={getImageUrl}
            getAudioUrl={getAudioUrl}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "5":
        return (
          <TableSection5
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "6":
        return (
          <TableSection6
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "7":
        return (
          <TableSection7Single
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "12":
        return (
          <TableSection7Double
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "13":
        return (
          <TableSection7Triple
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "104":
        return (
          <TableSectionNo1To2
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "105":
        return (
          <TableSectionNo3To4
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "106":
        return (
          <TableSectionNo5To7
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "107":
        return (
          <TableSectionNo8To10
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "108":
        return (
          <TableSectionNo11
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "109":
        return (
          <TableSectionNo1To5
            paginatedQuestions={paginatedQuestions}
            getImageUrl={getImageUrl}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "110":
        return (
          <TableSectionNo6To7
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      case "111":
        return (
          <TableSectionNo8
            paginatedQuestions={paginatedQuestions}
            currentPage={currentPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
            QuestionService={QuestionService}
          />
        );
      default:
        return null;
    }
  };

  // Modal selection logic (for add-question modals)
  const renderAddModal = () => {
    switch (sectionId) {
      case "1":
        return (
          <QuestionAddSection1
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "2":
        return (
          <QuestionAddSection2
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "3":
        return (
          <QuestionAddSection3
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "4":
        return (
          <QuestionAddSection4
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "5":
        return (
          <QuestionAddSection5
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "6":
        return (
          <QuestionAddSection6
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "7":
        return (
          <QuestionAddSection7Single
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "12":
        return (
          <QuestionAddSection7Double
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "13":
        return (
          <QuestionAddSection7Triple
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "104":
        return (
          <QuestionAddNo1To2
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "105":
        return (
          <QuestionAddNo3To4
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "106":
        return (
          <QuestionAddNo5To7
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "107":
        return (
          <QuestionAddNo8To10
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "108":
        return (
          <QuestionAddNo11
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "109":
        return (
          <QuestionAddNo1To5
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "110":
        return (
          <QuestionAddNo6To7
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      case "111":
        return (
          <QuestionAddNo8
            sectionId={sectionId}
            retrieveQuestions={retrieveQuestions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-heading">
      <section className="section">
        <div className="card border-0">
          <div className="row">
            <div className="col-2 mt-4">
              <select
                className="form-select ms-3 w-50"
                value={ITEMS_PER_PAGE}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {ITEMS_PER_PAGE_OPTIONS.map((perPageOption) => (
                  <option key={perPageOption} value={perPageOption}>
                    {perPageOption}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 mt-4">
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
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-4 mt-4 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-success mb-3 me-3"
                data-bs-toggle="modal"
                data-bs-target="#addQuestionModal"
              >
                <i className="fa-solid fa-circle-plus"></i>
              </button>
              <div
                className="modal zoom"
                id="addQuestionModal"
                tabIndex="-1"
                aria-labelledby="addQuestionModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="addQuestionModalLabel">
                        <i className="fa-solid fa-circle-plus text-success"></i> Add Question
                      </h1>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    {renderAddModal()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            {renderTable()}
            {/* Pagination controls */}
            {filteredQuestions.length > 0 && (
              <>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          changePage(currentPage - 1);
                        }}
                      >
                        &laquo;
                      </a>
                    </li>
                    {Array.from({ length: totalPageCount }, (_, i) => i + 1).map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item${currentPage === pageNumber ? " active" : ""}`}
                      >
                        <a
                          className="page-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            changePage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </a>
                      </li>
                    ))}
                    <li className={`page-item${currentPage === totalPageCount ? " disabled" : ""}`}>
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          changePage(currentPage + 1);
                        }}
                      >
                        &raquo;
                      </a>
                    </li>
                  </ul>
                </nav>
                <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                  <p>
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min((currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE, filteredQuestions.length)}{" "}
                    trên {filteredQuestions.length} kết quả
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuestionSectionPage;