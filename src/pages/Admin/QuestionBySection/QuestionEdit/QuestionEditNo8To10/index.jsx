import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import QuestionGroupService from "../../../../../services/questionGroupService";
import CKEditorOptimized from "../../../../../components/Admin/EditorOptimized";
import "./style.css";

const QuestionEditNo8To10 = ({ sectionId, groupId, retrieveQuestions, onClose }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    groupImage: null,
    groupText: "",
    questions: [],
  });
  const [groupTextEditor, setGroupTextEditor] = useState("");
  const editorRef = useRef();

  // Tạo schema động cho từng câu hỏi
  const getValidationSchema = (questions) => {
    const shape = {
      groupImage: Yup.mixed()
        .nullable()
        .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
          if (!value) return true;
          const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
          return allowedFormats.includes(value.type);
        })
        .test("fileSize", "Tệp ảnh quá lớn", (value) => {
          if (!value) return true;
          return value.size <= 1024 * 1024;
        }),
      groupText: Yup.string().required("groupText phải có giá trị."),
    };
    questions.forEach((q, idx) => {
      shape[`questionContent${idx}`] = Yup.string()
        .required("questionContent phải có giá trị.")
        .min(2, "questionContent phải ít nhất 2 ký tự.")
        .max(500, "questionContent có nhiều nhất 500 ký tự.");
      shape[`suggestedAnswer${idx}`] = Yup.string()
        .required("suggestedAnswer phải có giá trị.")
        .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
        .max(500, "suggestedAnswer có nhiều nhất 500 ký tự.");
    });
    return Yup.object().shape(shape);
  };

  useEffect(() => {
    if (!groupId) return;
    const getQuestion = async () => {
      try {
        const data = await QuestionService.getQuestionsByQuestionGroup(groupId);
        const questions = data.map((item) => ({
          questionId: item._id || item.questionId,
          questionContent: item.questionContent,
          suggestedAnswer: item.suggestedAnswer,
        }));
        setInitialValues({
          groupImage: null,
          groupText: data[0]?.questionGroup?.groupText || "",
          questions,
        });
        setGroupTextEditor(data[0]?.questionGroup?.groupText || "");
        setQuestion(data[0]);
      } catch (error) {
        toast.error("Lỗi khi tải thông tin nhóm câu hỏi", { autoClose: 1000 });
      }
    };
    getQuestion();
  }, [groupId]);

  // Lưu toàn bộ group và các câu hỏi
  const handleSaveAll = async (values, { setSubmitting }) => {
    try {
      if (!groupTextEditor || groupTextEditor.trim() === "") {
        toast.error("groupText phải có giá trị.", { autoClose: 1000 });
        setSubmitting(false);
        return;
      }
      // Cập nhật groupText và groupImage
      const groupFormData = new FormData();
      if (values.groupImage) {
        groupFormData.append("groupImage", values.groupImage, values.groupImage.name);
      }
      groupFormData.append("groupText", groupTextEditor);
      await QuestionGroupService.update(groupId, groupFormData);

      // Cập nhật từng câu hỏi
      await Promise.all(
        initialValues.questions.map(async (q, idx) => {
          const formData = new FormData();
          formData.append("sectionId", sectionId);
          formData.append("questionContent", values[`questionContent${idx}`]);
          formData.append("suggestedAnswer", values[`suggestedAnswer${idx}`]);
          await QuestionService.update(q.questionId, formData);
        })
      );

      toast.success("Cập nhật thành công!", { autoClose: 1000 });
      retrieveQuestions && retrieveQuestions();
      if (onClose) onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu!", { autoClose: 1000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialValues.questions.length) return <div>Đang tải...</div>;

  return (
    <div className="question-edit-no8to10-page">
      <Formik
        enableReinitialize
        initialValues={{
          groupImage: null,
          groupText: initialValues.groupText,
          ...initialValues.questions.reduce((acc, q, idx) => {
            acc[`questionContent${idx}`] = q.questionContent;
            acc[`suggestedAnswer${idx}`] = q.suggestedAnswer;
            return acc;
          }, {}),
        }}
        validationSchema={getValidationSchema(initialValues.questions)}
        onSubmit={handleSaveAll}
      >
        {({ values, setFieldValue, isSubmitting, submitCount }) => (
          <Form encType="multipart/form-data">
            <div className="modal-body text-start p-4">
              <div className="form-group mb-3">
                <label htmlFor="groupImage">
                  Question Group Image<span className="required-field">*</span>
                </label>
                <input
                  type="file"
                  name="groupImage"
                  className="form-control border-secondary custom-font"
                  onChange={(e) => setFieldValue("groupImage", e.currentTarget.files[0])}
                  accept="image/jpeg,image/png,image/gif"
                />
                <ErrorMessage name="groupImage" component="div" className="error-feedback" />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="groupText" className="form-label">
                  Question Group Text<span className="required-field">*</span>
                </label>
                <div className="ckeditor-container">
                  <CKEditorOptimized
                    data={groupTextEditor}
                    onChange={setGroupTextEditor}
                    onReady={(editor) => { editorRef.current = editor; }}
                    placeholder="Nhập nội dung nhóm câu hỏi..."
                    height="170px"
                  />
                </div>
                {!groupTextEditor && submitCount > 0 && (
                  <div className="error-feedback">groupText phải có giá trị.</div>
                )}
              </div>
              <hr />
              <div className="row">
                {initialValues.questions.map((q, idx) => (
                  <div className="col-md-4 mb-4" key={q.questionId}>
                    <div className="form-group mb-3">
                      <label htmlFor={`questionContent${idx}`}>
                        Question Content {idx + 1}
                        <span className="required-field">*</span>
                      </label>
                      <Field
                        name={`questionContent${idx}`}
                        type="text"
                        className="form-control border-secondary custom-font"
                      />
                      <ErrorMessage
                        name={`questionContent${idx}`}
                        component="div"
                        className="error-feedback"
                      />
                    </div>
                    <div className="form-group mb-3">
                      <label htmlFor={`suggestedAnswer${idx}`}>
                        Suggested Answer<span className="required-field">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name={`suggestedAnswer${idx}`}
                        style={{ height: "150px", resize: "none" }}
                        className="form-control border-secondary custom-font"
                      />
                      <ErrorMessage
                        name={`suggestedAnswer${idx}`}
                        component="div"
                        className="error-feedback"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary rounded-5"
                onClick={() => {
                  if (onClose) onClose();
                }}
              >
                Đóng
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default QuestionEditNo8To10;