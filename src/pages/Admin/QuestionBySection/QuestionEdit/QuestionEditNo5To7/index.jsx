import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import QuestionGroupService from "../../../../../services/questionGroupService";
import CKEditorOptimized from "../../../../../components/Admin/EditorOptimized";
import "./style.css";
import questionService from "../../../../../services/questionService";

const QuestionEditNo5To7 = ({ sectionId, groupId, retrieveQuestions, onClose }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    groupText: "",
    questions: [],
  });
  const [groupTextEditor, setGroupTextEditor] = useState("");
  const editorRef = useRef();

  // Tạo schema động cho từng câu hỏi
  const getValidationSchema = (questions) => {
    const shape = {
      groupText: Yup.string().required("groupText phải có giá trị."),
    };
    questions.forEach((q, idx) => {
      shape[`questionContent${idx}`] = Yup.string()
        .required("questionContent phải có giá trị.")
        .min(2, "questionContent phải ít nhất 2 ký tự.")
        .max(500, "questionContent có nhiều nhất 500 ký tự.");
      shape[`suggestedAnswer${idx}`] = Yup.string()
        .required("suggestedAnswer phải có giá trị.")
        .min(2, "suggestedAnswer ít nhất 2 ký tự.")
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
          questionId: item._id,
          questionContent: item.questionContent,
          suggestedAnswer: item.suggestedAnswer,
        }));
        console.log("Câu hỏi:", questions);
        setInitialValues({
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

  const handleSaveAll = async (values, { setSubmitting }) => {
    try {
      // Validate groupTextEditor
      if (!groupTextEditor || groupTextEditor.trim() === "") {
        toast.error("groupText phải có giá trị.", { autoClose: 1000 });
        setSubmitting(false);
        return;
      }
      // Cập nhật groupText
      const groupFormData = new FormData();
      groupFormData.append("groupText", groupTextEditor);
      await QuestionGroupService.update(groupId, groupFormData);
      console.log("Cập nhật groupText thành công");

      // Cập nhật từng câu hỏi
      await Promise.all(
        initialValues.questions.map(async (q, idx) => {
          console.log(`Cập nhật câu hỏi ${idx + 1}:`, q._id);
          const formData = new FormData();
          formData.append("sectionId", sectionId);
          // formData.append("questionId", q._id);
          formData.append("questionContent", values[`questionContent${idx}`]);
          formData.append("suggestedAnswer", values[`suggestedAnswer${idx}`]);
          await QuestionService.update(q.questionId, formData);
        })
      );

      toast.success("Cập nhật thành công!", { autoClose: 1000 });
      retrieveQuestions();
      if (onClose) onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu!", { autoClose: 1000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialValues.questions.length) return <div>Đang tải...</div>;

  return (
    <div className="question-edit-no5to7-page">
      <Formik
        enableReinitialize
        initialValues={{
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
                <label htmlFor="groupText" className="form-label">
                  Đoạn văn nhóm câu hỏi<span className="required-field">*</span>
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
                  <div className="col-md-4 mb-4" key={q._id}>
                    <div className="form-group mb-3">
                      <label htmlFor={`questionContent${idx}`}>
                        Nội dung câu hỏi {idx + 1}
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
                        Gợi ý trả lời<span className="required-field">*</span>
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

export default QuestionEditNo5To7;