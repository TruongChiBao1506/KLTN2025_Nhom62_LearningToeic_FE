import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./style.css";

const EditQuestion = ({ sectionId, questionId, retrieveQuestions }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    questionText: "",
    suggestedAnswer: "",
  });
  const editorRef = useRef();

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        setInitialValues({
          questionText: data.questionText || "",
          suggestedAnswer: data.suggestedAnswer || "",
        });
        setQuestion(data);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestion();
  }, [questionId]);

  const handleEditorReady = (editor) => {
    editor.editing.view.change((writer) => {
      writer.setStyle("height", "170px", editor.editing.view.document.getRoot());
    });
    editorRef.current = editor;
  };

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("questionText", values.questionText);
      formData.append("suggestedAnswer", values.suggestedAnswer);
      await QuestionService.update(questionId, formData);
      retrieveQuestions();
      toast.success("Chỉnh sửa câu hỏi thành công", { autoClose: 1000 });
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi chỉnh sửa câu hỏi", { autoClose: 1000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) return null;

  return (
    <div className="question-edit-no6to7-page">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={updateQuestion}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form encType="multipart/form-data">
            <div className="modal-body text-start">
              <div className="row">
                <div className="col">
                  <div className="form-group mb-3">
                    <label htmlFor="questionText" className="form-label">
                      Text<span className="required-field">*</span>
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={values.questionText}
                      onReady={handleEditorReady}
                      onChange={(_, editor) => setFieldValue("questionText", editor.getData())}
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="questionText" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="suggestedAnswer" className="form-label">
                      Suggested Answer<span className="required-field">*</span>
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={values.suggestedAnswer}
                      onReady={handleEditorReady}
                      onChange={(_, editor) => setFieldValue("suggestedAnswer", editor.getData())}
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="suggestedAnswer" component="div" className="error-feedback" />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Đóng
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Lưu
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditQuestion;