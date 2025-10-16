import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import SectionService from "../../../services/sectionsService";
import AddSectionModal from "./AddSectionModal";
import EditSectionModal from "./EditSectionModal";
import "./style.css";

const SectionList = ({ sections = [], retrieveSections }) => {
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const ITEMS_PER_PAGE_OPTIONS = [25, 50, 75, 100];

  const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((option) => ({
    value: option,
    label: `${option} mục/trang`,
  }));

  // Filtered sections based on search text
  const filteredSections = useMemo(() => {
    if (!sections || !Array.isArray(sections)) {
      return [];
    }

    if (!searchText) {
      return sections.slice();
    }

    return sections.filter((section) =>
      Object.values(section).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [sections, searchText]);

  // Pagination calculations
  const totalPageCount = Math.ceil(filteredSections.length / itemsPerPage);

  const paginatedSections = useMemo(() => {
    if (!filteredSections || filteredSections.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSections.slice(startIndex, endIndex);
  }, [filteredSections, currentPage, itemsPerPage]);

  // Reset to first page when sections change
  useEffect(() => {
    setCurrentPage(1);
  }, [sections]);

  // Modal handlers
  const handleShowAddModal = () => {
    console.log("Opening Add Modal");
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    console.log("Closing Add Modal");
    setShowAddModal(false);
  };

  const handleShowEditModal = (sectionId) => {
    console.log("Opening Edit Modal for section:", sectionId);
    setSelectedSectionId(sectionId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    console.log("Closing Edit Modal");
    setShowEditModal(false);
    setSelectedSectionId(null);
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPageCount) {
      setCurrentPage(page);
    }
  };

  const deleteSection = async (sectionId) => {
    const result = await Swal.fire({
      title: "Bạn muốn xóa phần này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await SectionService.delete(sectionId);
        retrieveSections();
        Swal.fire({
          title: "Xóa phần thành công!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          title: "Lỗi khi xóa phần",
          icon: "error",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    }
  };

  const getImageUrl = (imageName) => {
    if (imageName) {
      return imageName;
    }
    return `${process.env.LOCALHOST}/images/default-image.png`;
  };

  const toggleStatus = async (sectionId, newStatus) => {
    try {
      await SectionService.updateStatus(sectionId, newStatus);
      retrieveSections();
    } catch (error) {
      console.error(error);
    }
  };

  const getSectionType = (type) => {
    switch (type) {
      case 1:
        return "Nghe";
      case 2:
        return "Đọc";
      case 3:
        return "Nói";
      case 4:
        return "Viết";
      default:
        return "";
    }
  };

  // Pagination info
  const firstRowNumber = (currentPage - 1) * itemsPerPage + 1;
  const lastRowNumber = Math.min(
    (currentPage - 1) * itemsPerPage + itemsPerPage,
    filteredSections.length
  );

  console.log(("Sections: ", sections));
  return (
    <div className="page-heading">
      <div className="section">
        <div className="card border-0">
          <div className="row align-items-center p-3">
            {/* Items per page selector cải tiến */}
            <div className="col-3">
              <div className="d-flex align-items-center px-3 py-2 rounded-4">
                <label
                  className="fw-semibold me-2 mb-0"
                  htmlFor="itemsPerPageSelect"
                >
                  Hiển thị:
                </label>
                <div style={{ minWidth: 140 }}>
                  <Select
                    inputId="itemsPerPageSelect"
                    classNamePrefix="react-select"
                    options={itemsPerPageOptions}
                    value={itemsPerPageOptions.find(
                      (opt) => opt.value === itemsPerPage
                    )}
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
                        ":active": {
                          backgroundColor: "#43c59e",
                          color: "#fff",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: 20,
                        overflow: "hidden",
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
                  placeholder="Tìm kiếm phần..."
                />
                <div className="input-group-append">
                  <button className="btn btn-light-emphasis">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add button */}
            <div
              className="col-3"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "12px",
                flexDirection: "row",
              }}
            >
              <button
                type="button"
                className="btn btn-success d-flex align-items-center"
                onClick={handleShowAddModal}
                title="Thêm phần mới"
                style={{
                  borderRadius: "20px",
                  fontSize: "14px",
                  padding: "10px 18px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  minWidth: "110px",
                  justifyContent: "center",
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
                  <th>
                    <button className="btn btn-primary rounded-5 disabled">
                      No.
                    </button>
                  </th>
                  <th>SECTION NAME</th>
                  <th>IMAGE</th>
                  <th>TYPE</th>
                  <th>DESCRIPTION</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                  <th>MANAGE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSections.map((section, index) => (
                  <tr
                    key={section._id}
                    className="table-row shadow-on-hover align-middle"
                  >
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{section.name}</td>
                    <td>
                      <img
                        src={getImageUrl(section.image)}
                        alt="Section Image"
                        className="section-image rounded-5"
                      />
                    </td>
                    <td>{getSectionType(section.type)}</td>
                    <td>{section.description}</td>
                    <td>
                      {section.status === 1 ? (
                        <span
                          onClick={() => toggleStatus(section._id, 0)}
                          className="btn badge text-bg-success rounded-5"
                          style={{ cursor: "pointer" }}
                        >
                          Enable
                        </span>
                      ) : (
                        <span
                          onClick={() => toggleStatus(section._id, 1)}
                          className="btn badge text-bg-danger rounded-5"
                          style={{ cursor: "pointer" }}
                        >
                          Disable
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        {/* Edit button - dùng onClick */}
                        <button
                          type="button"
                          className="btn btn-white border-0"
                          onClick={() => handleShowEditModal(section._id)}
                          title={`Chỉnh sửa [${section.name}]`}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            style={{ color: "rgb(192, 129, 13)" }}
                          />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => deleteSection(section._id)}
                          className="btn btn-white border-0"
                          title={`Xóa [${section.name}]`}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="text-danger"
                          />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <Link to={`/admin/section/${section._id}/lesson`}>
                          <button className="glowing-button">Lesson</button>
                        </Link>

                        <Link to={`/admin/section/${section._id}/question`}>
                          <button className="glowing-button ms-2">
                            Question
                          </button>
                        </Link>

                        <Link to={`/admin/section/${section._id}/test`}>
                          <button className="glowing-button ms-2">Test</button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedSections.length === 0 && (
                  <tr key="no-data">
                    <td colSpan="8">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredSections.length > 0 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPageCount }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          currentPage === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => changePage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    )
                  )}
                  <li
                    className={`page-item ${
                      currentPage === totalPageCount ? "disabled" : ""
                    }`}
                  >
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
            {filteredSections.length > 0 && (
              <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic">
                <p>
                  {firstRowNumber} - {lastRowNumber} trên{" "}
                  {filteredSections.length} kết quả
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddSectionModal
        show={showAddModal}
        onHide={handleCloseAddModal}
        retrieveSections={retrieveSections}
      />

      <EditSectionModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        sectionId={selectedSectionId}
        retrieveSections={retrieveSections}
      />
    </div>
  );
};

export default SectionList;
