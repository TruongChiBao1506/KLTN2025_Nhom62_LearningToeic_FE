import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import sectionsService from "../../../services/sectionsService";

import TableSection1 from "./TableSection1";
import TableSection2 from "./TableSection2";
import TableSection3 from "./TableSection3";
import TableSection4 from "./TableSection4";
import TableSection5 from "./TableSection5";
import TableSection6 from "./TableSection6";
import TableSection7 from "./TableSection7";
import TableSectionNo1To2 from "./TableSectionNo1To2";
import TableSectionNo3To4 from "./TableSectionNo3To4";
import TableSectionNo5To7 from "./TableSectionNo5To7";
import TableSectionNo8To10 from "./TableSectionNo8To10";
import TableSectionNo1To5 from "./TableSectionNo1To5";
import TableSectionNo6To7 from "./TableSectionNo6To7";
import TableSectionNo8 from "./TableSectionNo8";
import TableSectionNo11 from "./TableSectionNo11";

import "./../SectionList/style.css";

const ITEMS_PER_PAGE_OPTIONS = [60, 120, 180, 600];

const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
    value: option,
    label: `${option} mục/trang`
}));

const IndicateQuestion = ({
    questions = [],
    sectionId,
    testId,
    retrieveQuestions,
}) => {
    const [searchText, setSearchText] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [section, setSection] = useState(null);
    const [sectionLoading, setSectionLoading] = useState(false);

    // Fetch section metadata
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

    // Table render by section metadata
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
                            allQuestions={filteredQuestions}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            getImageUrl={getImageUrl}
                            getAudioUrl={getAudioUrl}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
                        />
                    );
                case 2:
                    return (
                        <TableSection2
                            paginatedQuestions={paginatedQuestions}
                            allQuestions={filteredQuestions}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            getAudioUrl={getAudioUrl}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
                        />
                    );
                case 3:
                    return (
                        <TableSection3
                            paginatedQuestions={paginatedQuestions}
                            allQuestions={filteredQuestions}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            getImageUrl={getImageUrl}
                            getAudioUrl={getAudioUrl}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
                        />
                    );
                case 4:
                    return (
                        <TableSection4
                            paginatedQuestions={paginatedQuestions}
                            allQuestions={filteredQuestions}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            getImageUrl={getImageUrl}
                            getAudioUrl={getAudioUrl}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
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
                            allQuestions={filteredQuestions}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
                        />
                    );
                case 6:
                    return (
                        <TableSection6
                            paginatedQuestions={paginatedQuestions}
                            allQuestions={filteredQuestions}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
                        />
                    );
                case 7:
                    return (
                        <TableSection7
                            paginatedQuestions={paginatedQuestions}
                            allQuestions={filteredQuestions}
                            getImageUrl={getImageUrl}
                            currentPage={currentPage}
                            ITEMS_PER_PAGE={itemsPerPage}
                            sectionId={sectionId}
                            testId={testId}
                            retrieveQuestions={retrieveQuestions}
                        />
                    );
                default:
                    return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần thi Reading này.</div>;
            }
        } else if (section.type === 3) {  // Grammar sections
            // Determine by section name patterns
            const nameLower = section.name.toLowerCase();
            
            if (nameLower.includes("1") && nameLower.includes("2")) {
                return (
                    <TableSectionNo1To2
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
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
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            } else if (nameLower.includes("5") && nameLower.includes("7")) {
                return (
                    <TableSectionNo5To7
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
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
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            } else if (nameLower.includes("11")) {
                return (
                    <TableSectionNo11
                        paginatedQuestions={paginatedQuestions}
                        getImageUrl={getImageUrl}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            }
            return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần này.</div>;
        } else if (section.type === 4) {  // Vocabulary sections
            const nameLower = section.name.toLowerCase();
            
            if (nameLower.includes("1") && nameLower.includes("5")) {
                return (
                    <TableSectionNo1To5
                        paginatedQuestions={paginatedQuestions}
                        getImageUrl={getImageUrl}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            } else if (nameLower.includes("6") && nameLower.includes("7")) {
                return (
                    <TableSectionNo6To7
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            } else if (nameLower.includes("8")) {
                return (
                    <TableSectionNo8
                        paginatedQuestions={paginatedQuestions}
                        currentPage={currentPage}
                        ITEMS_PER_PAGE={itemsPerPage}
                        sectionId={sectionId}
                        testId={testId}
                        retrieveQuestions={retrieveQuestions}
                    />
                );
            }
            return <div className="text-center p-4 text-warning">Chưa hỗ trợ hiển thị cho phần này.</div>;
        } else if (section.type === 5) {  // Speaking sections
            return (
                <TableSectionNo11
                    paginatedQuestions={paginatedQuestions}
                    currentPage={currentPage}
                    ITEMS_PER_PAGE={itemsPerPage}
                    getImageUrl={getImageUrl}
                    sectionId={sectionId}
                    testId={testId}
                    retrieveQuestions={retrieveQuestions}
                />
            );
        }

        return <div className="text-center text-muted py-5">Không có dữ liệu phù hợp</div>;
    };

    return (
        <div className="page-heading">
            <section className="section">
                <div className="card border-0">
                    <div className="row align-items-center px-3 pt-3">
                        {/* Select item per page bên trái */}
                        <div className="col-3 d-flex align-items-center">
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
                        {/* Spacer */}
                        <div className="col-4"></div>
                        <div className="col-5 d-flex justify-content-end">
                            <div className="input-group rounded-5" style={{ minWidth: 220 }}>
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