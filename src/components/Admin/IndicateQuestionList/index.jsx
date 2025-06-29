import React, { useMemo, useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import TableSection1 from "../IndicateQuestionList/TableSection1";
import TableSection2 from "../IndicateQuestionList/TableSection2";
import TableSection3 from "../IndicateQuestionList/TableSection3";
import TableSection4 from "../IndicateQuestionList/TableSection4";
import TableSection5 from "../IndicateQuestionList/TableSection5";
import TableSection6 from "../IndicateQuestionList/TableSection6";
import TableSection7 from "../IndicateQuestionList/TableSection7";
// ...import các bảng khác nếu có

import "./../SectionList/style.css";

const ITEMS_PER_PAGE_OPTIONS = [60, 120, 180, 600];

const IndicateQuestion = ({
    questions = [],
    sectionId,
    testId,
    retrieveQuestions,
}) => {
    const [searchText, setSearchText] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtered questions based on search text
    const filteredQuestions = useMemo(() => {
        if (!searchText) return questions;
        return questions.filter((question) =>
            Object.values(question).some((value) =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [questions, searchText]);

    // Pagination
    const totalPageCount = Math.ceil(filteredQuestions.length / itemsPerPage);
    const paginatedQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredQuestions.slice(startIndex, endIndex);
    }, [filteredQuestions, currentPage, itemsPerPage]);

    // Reset page when questions change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [questions]);

    // Pagination info
    const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
    const lastRowNumber = Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredQuestions.length);

    // Helpers
    const getImageUrl = (imageName) =>
        imageName ? `http://localhost:9004/images/${imageName}` : "";
    const getAudioUrl = (audioName) =>
        audioName ? `http://localhost:9004/audios/${audioName}` : "";

    // Table render by sectionId
    const renderTable = () => {
        switch (sectionId) {
            case "686007e22278739d2ceea77a":
                return (
                    <TableSection1
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        getImageUrl={getImageUrl}
                        getAudioUrl={getAudioUrl}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            case "686007e22278739d2ceea77b":
                return (
                    <TableSection2
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        getAudioUrl={getAudioUrl}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            case "686007e22278739d2ceea77c":
                return (
                    <TableSection3
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        getImageUrl={getImageUrl}
                        getAudioUrl={getAudioUrl}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            case "686007e22278739d2ceea77d":
                return (
                    <TableSection4
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        getImageUrl={getImageUrl}
                        getAudioUrl={getAudioUrl}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            case "686007e22278739d2ceea77e":
                return (
                    <TableSection5
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            case "686007e22278739d2ceea77f":
                return (
                    <TableSection6
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            case "686007e22278739d2ceea780":
                return (
                    <TableSection7
                        paginatedQuestions={paginatedQuestions}
                        getImageUrl={getImageUrl}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            // ...case khác cho các bảng khác nếu có
            default:
                return <div className="text-center text-muted py-5">Không có dữ liệu phù hợp</div>;
        }
    };

    return (
        <div className="page-heading">
            <section className="section">
                <div className="card border-0">
                    <div className="row">
                        <div className="col-2 mt-4">
                            <Select
                                classNamePrefix="react-select"
                                options={ITEMS_PER_PAGE_OPTIONS.map((option) => ({
                                    value: option,
                                    label: option,
                                }))}
                                value={{
                                    value: itemsPerPage,
                                    label: itemsPerPage,
                                }}
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
                                        borderColor: "#198754",
                                        boxShadow: "none",
                                        fontWeight: 400,
                                        color: "#198754",
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        borderRadius: 30,
                                        color: state.isSelected ? "#fff" : "#198754",
                                        backgroundColor: state.isSelected
                                            ? "#198754"
                                            : state.isFocused
                                            ? "#e6f7ef"
                                            : "#fff",
                                        ":active": { backgroundColor: "#43c59e", color: "#fff" },
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        borderRadius: 20,
                                        overflow: "hidden",
                                    }),
                                }}
                            />
                        </div>
                        <div className="col-4 mt-4"></div>
                        <div className="col-6 mt-4 d-flex justify-content-end">
                            <div className="input-group me-3" style={{ width: "80%" }}>
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

                    <div className="card-body">
                        {renderTable()}

                        {/* Pagination controls */}
                        {filteredQuestions.length > 0 && (
                            <>
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                &laquo;
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPageCount }, (_, i) => i + 1).map((pageNumber) => (
                                            <li
                                                key={pageNumber}
                                                className={`page-item ${currentPage === pageNumber ? "active" : ""}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                >
                                                    {pageNumber}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPageCount ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => currentPage < totalPageCount && setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPageCount}
                                            >
                                                &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                                <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                                    <p>
                                        {firstRowNumber} - {lastRowNumber} trên {filteredQuestions.length} kết quả
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

export default IndicateQuestion;