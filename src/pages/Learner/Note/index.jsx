import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPen,
  faEdit,
  faTimes,
  faSave,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";
import "./style.css";

// Import services
import noteService from "../../../services/noteService";

const Note = () => {
  // States
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  // Form validation schema
  const noteFormSchema = Yup.object().shape({
    title: Yup.string().required("Tiêu đề phải có giá trị."),
    content: Yup.string().required("Nội dung phải có giá trị."),
  });

  // Initial form values
  const initialValues = {
    title: "",
    content: "",
  };

  useEffect(() => {
    // Get user ID from token
    const getUserId = () => {
      try {
        const learnerToken = localStorage.getItem("learnerToken");
        if (learnerToken) {
          const decoded = jwt_decode(learnerToken);
          setUserId(decoded.id);
        }
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        toast.error("Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    // Fetch notes when userId is available
    if (userId) {
      getAllNotesByUserId();
    }
  }, [userId]);

  // Get all notes for the user
  const getAllNotesByUserId = async () => {
    try {
      const response = await noteService.getAllNotesByUserId(userId);
      setNotes(
        response.data.map((note) => ({
          ...note,
          editMode: false,
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tải ghi chú:", error);
      toast.error("Không thể tải ghi chú. Vui lòng thử lại sau.");
    }
  };

  // Toggle edit mode for a note
  const toggleEditMode = (note) => {
    setNotes(
      notes.map((n) =>
        n.noteId === note.noteId ? { ...n, editMode: !n.editMode } : n
      )
    );
  };

  // Update a note
  const updateNote = async (values, noteId) => {
    try {
      const data = {
        title: values.title,
        content: values.content,
      };

      await noteService.update(noteId, data);
      toast.success("Cập nhật thành công");
      getAllNotesByUserId();
    } catch (error) {
      console.error("Lỗi khi cập nhật ghi chú:", error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại sau.");
    }
  };

  // Create a new note
  const createNote = async (values, { resetForm }) => {
    try {
      const data = {
        title: values.title,
        content: values.content,
        userId: userId,
      };

      await noteService.create(data);
      toast.success("Tạo ghi chú thành công");
      resetForm();
      setShowNewNoteForm(false);
      getAllNotesByUserId();
    } catch (error) {
      console.error("Lỗi khi tạo ghi chú:", error);
      toast.error("Tạo ghi chú thất bại. Vui lòng thử lại sau.");
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ghi chú này không?")) {
      try {
        await noteService.delete(noteId);
        toast.success("Xóa ghi chú thành công");
        getAllNotesByUserId();
      } catch (error) {
        console.error("Lỗi khi xóa ghi chú:", error);
        toast.error("Xóa ghi chú thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ghi chú của tôi</h2>

      {/* Add New Note button */}
      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowNewNoteForm(!showNewNoteForm)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Tạo ghi chú mới
        </button>
      </div>

      {/* New Note Form */}
      {showNewNoteForm && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                Tạo ghi chú mới
              </div>
              <div className="card-body">
                <Formik
                  initialValues={initialValues}
                  validationSchema={noteFormSchema}
                  onSubmit={createNote}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                          Tiêu đề <span className="required-field">*</span>
                        </label>
                        <Field
                          name="title"
                          type="text"
                          className="form-control"
                          placeholder="Nhập tiêu đề"
                        />
                        <ErrorMessage
                          name="title"
                          component="div"
                          className="error-feedback"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="content" className="form-label">
                          Nội dung <span className="required-field">*</span>
                        </label>
                        <Field
                          as="textarea"
                          name="content"
                          className="form-control"
                          rows="3"
                          placeholder="Nhập nội dung"
                        />
                        <ErrorMessage
                          name="content"
                          component="div"
                          className="error-feedback"
                        />
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary me-2"
                          onClick={() => setShowNewNoteForm(false)}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          Lưu
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="row">
        {notes.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted">
              Bạn chưa có ghi chú nào. Hãy tạo ghi chú mới!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={note.noteId}>
              {!note.editMode ? (
                <div className="card h-100 note-card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>
                      <FontAwesomeIcon
                        icon={faUserPen}
                        className="me-2 text-warning"
                      />
                      {note.title}
                    </span>
                    <div className="note-actions">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => toggleEditMode(note)}
                      >
                        <FontAwesomeIcon
                          icon={faEdit}
                          className="text-primary"
                        />
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0 ms-2"
                        onClick={() => deleteNote(note.noteId)}
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="text-danger"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-text note-content">{note.content}</p>
                  </div>
                  <div className="card-footer text-muted small">
                    {new Date(
                      note.updatedAt || note.createdAt
                    ).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              ) : (
                <div className="card h-100 note-card-edit">
                  <div className="card-header bg-light">
                    <strong>Chỉnh sửa ghi chú</strong>
                  </div>
                  <div className="card-body">
                    <Formik
                      initialValues={{
                        title: note.title,
                        content: note.content,
                      }}
                      validationSchema={noteFormSchema}
                      onSubmit={(values) => updateNote(values, note.noteId)}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="mb-3">
                            <label
                              htmlFor={`title-${note.noteId}`}
                              className="form-label"
                            >
                              Tiêu đề
                            </label>
                            <Field
                              name="title"
                              type="text"
                              className="form-control"
                              id={`title-${note.noteId}`}
                            />
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="error-feedback"
                            />
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor={`content-${note.noteId}`}
                              className="form-label"
                            >
                              Nội dung
                            </label>
                            <Field
                              as="textarea"
                              name="content"
                              className="form-control"
                              id={`content-${note.noteId}`}
                              rows="3"
                            />
                            <ErrorMessage
                              name="content"
                              component="div"
                              className="error-feedback"
                            />
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-outline-secondary me-2"
                              onClick={() => toggleEditMode(note)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="me-1"
                              />
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="btn btn-success"
                              disabled={isSubmitting}
                            >
                              <FontAwesomeIcon icon={faSave} className="me-1" />
                              Lưu
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Note;
