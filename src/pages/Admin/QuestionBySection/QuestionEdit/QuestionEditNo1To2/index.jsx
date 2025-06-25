import React, { useEffect, useState, useRef } from "react";
import { Formik, Form } from "formik";
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
  });

  // Ref để truy cập CKEditor instance nếu cần
  const editorRef = useRef();

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        setInitialValues({
          questionText: data.questionText,
        });
        setQuestion(data);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestion();
  }, [questionId]);

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("questionText", values.questionText);
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

  // Hàm để set chiều cao cho editor
  const handleEditorReady = (editor) => {
    editor.editing.view.change((writer) => {
      writer.setStyle("height", "170px", editor.editing.view.document.getRoot());
    });
    editorRef.current = editor;
  };

  if (!question) return null;

  return (
    <div className="question-edit-no1to2-page">
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
                      onChange={(_, editor) => {
                        setFieldValue("questionText", editor.getData());
                      }}
                      config={{
                        // Bạn có thể thêm config cho CKEditor ở đây nếu muốn
                      }}
                      className="form-control border-secondary custom-font"
                    />
                    {/* Nếu muốn validate, có thể thêm ErrorMessage ở đây */}
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