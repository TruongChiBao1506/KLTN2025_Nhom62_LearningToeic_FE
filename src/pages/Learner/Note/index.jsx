import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPen,
  faEdit,
  faTimes,
  faSave,
  faPlus,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./style.css";

// Import services
import noteService from "../../../services/noteService";

// Sortable Note Card Component
const SortableNoteCard = ({ note, onEdit, onDelete, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.noteId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-note-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <FontAwesomeIcon icon={faGripVertical} />
      </div>
      {children}
    </div>
  );
};

const Note = () => {
  // States
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [localOrder, setLocalOrder] = useState([]); // Thêm state để lưu thứ tự local

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
          const decoded = jwtDecode(learnerToken);
          setUserId(decoded.id);
        }
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        toast.error("Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
      }
    };

    getUserId();
  }, []);

  // Get all notes for the user
  const getAllNotesByUserId = useCallback(async () => {
    try {
      const response = await noteService.getAllNotesByUserId(userId);
      console.log("🚀 ~ getAllNotesByUserId ~ response:", response);

      // Check if response has data property or is array directly
      const notesData = Array.isArray(response) ? response : response.data;

      const processedNotes = notesData.map((note) => ({
        ...note,
        noteId: note._id, // Map _id to noteId for consistency
        editMode: false,
      }));

      setNotes(processedNotes);

      // Khởi tạo local order nếu chưa có
      if (localOrder.length === 0) {
        setLocalOrder(processedNotes.map(note => note.noteId));
      }
    } catch (error) {
      console.error("Lỗi khi tải ghi chú:", error);
      toast.error("Không thể tải ghi chú. Vui lòng thử lại sau.");
    }
  }, [userId, localOrder.length]);

  useEffect(() => {
    // Fetch notes when userId is available
    if (userId) {
      getAllNotesByUserId();
    }
  }, [userId, getAllNotesByUserId]);

  // Handle drag end - chỉ cập nhật local order
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.noteId === active.id);
        const newIndex = items.findIndex((item) => item.noteId === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Cập nhật local order
        const newOrder = newItems.map(note => note.noteId);
        setLocalOrder(newOrder);

        // Lưu vào localStorage để duy trì thứ tự trong session
        localStorage.setItem(`noteOrder_${userId}`, JSON.stringify(newOrder));

        return newItems;
      });
    }
  };

  // Load local order từ localStorage khi component mount
  useEffect(() => {
    if (userId) {
      const savedOrder = localStorage.getItem(`noteOrder_${userId}`);
      if (savedOrder) {
        setLocalOrder(JSON.parse(savedOrder));
      }
    }
  }, [userId]);

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

  // Sắp xếp notes theo local order
  const sortedNotes = notes.sort((a, b) => {
    const aIndex = localOrder.indexOf(a.noteId);
    const bIndex = localOrder.indexOf(b.noteId);
    
    // Nếu chưa có trong localOrder, sắp xếp theo createdAt
    if (aIndex === -1 && bIndex === -1) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    // Ưu tiên localOrder, sau đó theo thời gian
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  return (
    <div className="notes-container">
      <div className="container">
        <div className="notes-wrapper">
          {/* Header */}
          <div className="notes-header">
            <h1 className="notes-title">Ghi chú của tôi</h1>
            <p className="notes-subtitle">
              Quản lý và tổ chức các ghi chú học tập của bạn
            </p>
          </div>

          {/* Add New Note button */}
          <div className="mb-4 text-center">
            <button
              className="add-note-btn"
              onClick={() => setShowNewNoteForm(!showNewNoteForm)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Tạo ghi chú mới
            </button>
          </div>

          {/* New Note Form */}
          {showNewNoteForm && (
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 col-md-10">
                <div className="new-note-form">
                  <div className="form-header">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Tạo ghi chú mới
                  </div>
                  <div className="form-body">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={noteFormSchema}
                      onSubmit={createNote}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="mb-4">
                            <label htmlFor="title" className="form-label">
                              Tiêu đề <span className="required-field">*</span>
                            </label>
                            <Field
                              name="title"
                              type="text"
                              className="form-control form-input"
                              placeholder="Nhập tiêu đề cho ghi chú của bạn..."
                            />
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="error-feedback"
                            />
                          </div>

                          <div className="mb-4">
                            <label htmlFor="content" className="form-label">
                              Nội dung <span className="required-field">*</span>
                            </label>
                            <Field
                              as="textarea"
                              name="content"
                              className="form-control form-input"
                              rows="4"
                              placeholder="Viết nội dung ghi chú ở đây..."
                            />
                            <ErrorMessage
                              name="content"
                              component="div"
                              className="error-feedback"
                            />
                          </div>

                          <div className="d-flex justify-content-end gap-3">
                            <button
                              type="button"
                              className="btn-cancel"
                              onClick={() => setShowNewNoteForm(false)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="me-2"
                              />
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="btn-primary-custom"
                              disabled={isSubmitting}
                            >
                              <FontAwesomeIcon icon={faSave} className="me-2" />
                              {isSubmitting ? "Đang lưu..." : "Lưu ghi chú"}
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

          {/* Notes Grid with Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedNotes.map(note => note.noteId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="row">
                {sortedNotes.length === 0 ? (
                  <div className="col-12">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <FontAwesomeIcon icon={faUserPen} />
                      </div>
                      <div className="empty-title">Chưa có ghi chú nào</div>
                      <div className="empty-subtitle">
                        Hãy tạo ghi chú đầu tiên của bạn để bắt đầu ghi lại những
                        kiến thức quan trọng!
                      </div>
                    </div>
                  </div>
                ) : (
                  sortedNotes.map((note) => (
                    <div
                      className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4"
                      key={note.noteId}
                    >
                      <SortableNoteCard
                        note={note}
                        onEdit={toggleEditMode}
                        onDelete={deleteNote}
                      >
                        {!note.editMode ? (
                          <div className="note-card">
                            <div className="note-card-header">
                              <div className="note-title">
                                <FontAwesomeIcon
                                  icon={faUserPen}
                                  className="note-icon"
                                />
                                {note.title}
                              </div>
                              <div className="note-actions">
                                <button
                                  type="button"
                                  className="action-btn edit-btn"
                                  onClick={() => toggleEditMode(note)}
                                  title="Chỉnh sửa"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  type="button"
                                  className="action-btn delete-btn"
                                  onClick={() => deleteNote(note.noteId)}
                                  title="Xóa"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            </div>
                            <div className="note-content-wrapper">
                              <p className="note-content">{note.content}</p>
                            </div>
                            <div className="note-footer">
                              Cập nhật:{" "}
                              {new Date(
                                note.updatedAt || note.createdAt
                              ).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="note-card-edit">
                            <div className="edit-header">
                              <FontAwesomeIcon icon={faEdit} className="me-2" />
                              Chỉnh sửa ghi chú
                            </div>
                            <div className="edit-body">
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
                                        Tiêu đề{" "}
                                        <span className="required-field">*</span>
                                      </label>
                                      <Field
                                        name="title"
                                        type="text"
                                        className="form-control form-input"
                                        id={`title-${note.noteId}`}
                                      />
                                      <ErrorMessage
                                        name="title"
                                        component="div"
                                        className="error-feedback"
                                      />
                                    </div>

                                    <div className="mb-4">
                                      <label
                                        htmlFor={`content-${note.noteId}`}
                                        className="form-label"
                                      >
                                        Nội dung{" "}
                                        <span className="required-field">*</span>
                                      </label>
                                      <Field
                                        as="textarea"
                                        name="content"
                                        className="form-control form-input"
                                        id={`content-${note.noteId}`}
                                        rows="4"
                                      />
                                      <ErrorMessage
                                        name="content"
                                        component="div"
                                        className="error-feedback"
                                      />
                                    </div>

                                    <div className="d-flex justify-content-end gap-2">
                                      <button
                                        type="button"
                                        className="btn-cancel"
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
                                        className="btn-save"
                                        disabled={isSubmitting}
                                      >
                                        <FontAwesomeIcon
                                          icon={faSave}
                                          className="me-1"
                                        />
                                        {isSubmitting ? "Đang lưu..." : "Lưu"}
                                      </button>
                                    </div>
                                  </Form>
                                )}
                              </Formik>
                            </div>
                          </div>
                        )}
                      </SortableNoteCard>
                    </div>
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default Note;