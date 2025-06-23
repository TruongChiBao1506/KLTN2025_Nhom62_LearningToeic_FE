import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFileAlt,
  faFilter,
  faSearch,
  faSort,
  faClock,
  faQuestionCircle,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import learnerExamService from "../../../services/learnerExamService";
import "./style.css";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    type: "all",
    difficulty: "all",
    status: "all",
  });
  const [sortOption, setSortOption] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "Practice Tests | TOEIC Learning Platform";
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await learnerExamService.getAllExams();
      const examData = response.exams || [];
      setExams(examData);
      setFilteredExams(examData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setLoading(false);
    }
  };

  // Apply filters when search term or filter options change
  useEffect(() => {
    filterExams();
  }, [searchTerm, filterOptions, sortOption, exams]);

  const filterExams = () => {
    let filtered = [...exams];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterOptions.type !== "all") {
      filtered = filtered.filter((exam) => exam.type === filterOptions.type);
    }

    // Apply difficulty filter
    if (filterOptions.difficulty !== "all") {
      filtered = filtered.filter(
        (exam) => exam.difficulty === filterOptions.difficulty
      );
    }

    // Apply status filter
    if (filterOptions.status !== "all") {
      filtered = filtered.filter(
        (exam) => exam.status === filterOptions.status
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "date_desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "difficulty_asc":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "difficulty_desc":
          const difficultyOrderDesc = { Easy: 1, Medium: 2, Hard: 3 };
          return (
            difficultyOrderDesc[b.difficulty] -
            difficultyOrderDesc[a.difficulty]
          );
        default:
          return 0;
      }
    });

    setFilteredExams(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterOptions({
      type: "all",
      difficulty: "all",
      status: "all",
    });
    setSortOption("name_asc");
    setFilteredExams(exams);
    setShowFilters(false);
  };

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "badge-success";
      case "Medium":
        return "badge-warning";
      case "Hard":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "in-progress":
        return "badge-warning";
      case "not-started":
        return "badge-secondary";
      default:
        return "badge-info";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return faCheckCircle;
      case "in-progress":
        return faClock;
      case "not-started":
        return faExclamationTriangle;
      default:
        return faQuestionCircle;
    }
  };
  return (
    <div className="exam-list-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/learner/dashboard">
                <FontAwesomeIcon icon={faHouse} className="me-2" />
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active">
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              Practice Tests
            </li>
          </ol>
        </nav>
      </div>

      {/* Header with Search and Filters */}
      <div className="exam-list-header">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h4 className="mb-0">TOEIC Practice Tests</h4>
            <p className="text-muted">
              Find and take practice tests to improve your TOEIC score
            </p>
          </div>
          <div className="col-md-6">
            <div className="search-container">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for exams..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={toggleFilters}
                >
                  <FontAwesomeIcon icon={faFilter} /> Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel mt-3">
            <div className="row">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Exam Type</label>
                  <select
                    className="form-select"
                    value={filterOptions.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="full-test">Full Test</option>
                    <option value="mini-test">Mini Test</option>
                    <option value="part-practice">Part Practice</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={filterOptions.difficulty}
                    onChange={(e) =>
                      handleFilterChange("difficulty", e.target.value)
                    }
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filterOptions.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="all">All Statuses</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    value={sortOption}
                    onChange={handleSortChange}
                  >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="date_asc">Date (Oldest First)</option>
                    <option value="date_desc">Date (Newest First)</option>
                    <option value="difficulty_asc">
                      Difficulty (Easy-Hard)
                    </option>
                    <option value="difficulty_desc">
                      Difficulty (Hard-Easy)
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={resetFilters}>
                Reset Filters
              </button>
              <button className="btn btn-primary" onClick={toggleFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exam List */}
      <div className="exam-cards">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading available exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="no-exams-message">
            <div className="no-exams-icon">
              <FontAwesomeIcon icon={faFileAlt} size="3x" />
            </div>
            <h5>No exams found</h5>
            <p>Try adjusting your search or filters to find more exams</p>
            <button className="btn btn-outline-primary" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="row">
            {filteredExams.map((exam, index) => (
              <div className="col-md-4" key={index}>
                <div
                  className={`exam-card ${
                    exam.status === "completed" ? "completed" : ""
                  }`}
                >
                  <div className="exam-card-header">
                    <h5>{exam.name}</h5>
                    <span
                      className={`badge ${getDifficultyBadgeClass(
                        exam.difficulty
                      )}`}
                    >
                      {exam.difficulty}
                    </span>
                  </div>
                  <div className="exam-card-body">
                    <p>{exam.description}</p>
                    <div className="exam-details">
                      <div className="exam-detail-item">
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        <span>{exam.duration} mins</span>
                      </div>
                      <div className="exam-detail-item">
                        <FontAwesomeIcon
                          icon={faQuestionCircle}
                          className="me-2"
                        />
                        <span>{exam.questionCount} questions</span>
                      </div>
                      <div className="exam-detail-item">
                        <FontAwesomeIcon
                          icon={getStatusIcon(exam.status)}
                          className="me-2"
                        />
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            exam.status
                          )}`}
                        >
                          {exam.status === "completed"
                            ? "Completed"
                            : exam.status === "in-progress"
                            ? "In Progress"
                            : "Not Started"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="exam-card-footer">
                    <Link
                      to={`/learner/exams/${exam.id}`}
                      className="btn btn-primary w-100"
                    >
                      {exam.status === "completed"
                        ? "Review Test"
                        : exam.status === "in-progress"
                        ? "Continue Test"
                        : "Start Test"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
