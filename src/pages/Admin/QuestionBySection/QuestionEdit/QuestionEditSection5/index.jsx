import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./style.css";

const EditQuestionPart5 = ({ sectionId, questionId, retrieveQuestions }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    questionContent: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
    questionType: "",
    questionExplanation: "",
  });
  const editorRef = useRef();

  const questionFormSchema = Yup.object().shape({
    questionContent: Yup.string()
      .required("questionContent phải có giá trị.")
      .min(2, "questionContent phải ít nhất 2 ký tự.")
      .max(500, "questionContent có nhiều nhất 500 ký tự."),
    optionA: Yup.string()
      .required("OptionA phải có giá trị.")
      .min(2, "OptionA phải ít nhất 2 ký tự.")
      .max(500, "OptionA có nhiều nhất 500 ký tự."),
    optionB: Yup.string()
      .required("OptionB phải có giá trị.")
      .min(2, "OptionB phải ít nhất 2 ký tự.")
      .max(500, "OptionB có nhiều nhất 500 ký tự."),
    optionC: Yup.string()
      .required("OptionC phải có giá trị.")
      .min(2, "OptionC phải ít nhất 2 ký tự.")
      .max(500, "OptionC có nhiều nhất 500 ký tự."),
    optionD: Yup.string()
      .required("OptionD phải có giá trị.")
      .min(2, "OptionD phải ít nhất 2 ký tự.")
      .max(500, "OptionD có nhiều nhất 500 ký tự."),
    questionType: Yup.string().required("Loại phải được chọn."),
  });

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        setInitialValues({
          questionContent: data.questionContent || "",
          optionA: data.optionA || "",
          optionB: data.optionB || "",
          optionC: data.optionC || "",
          optionD: data.optionD || "",
          correctOption: getCorrectOptionLetter(data),
          questionType: data.questionType || "",
          questionExplanation: data.questionExplanation || "",
        });
        setQuestion(data);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestion();
  }, [questionId]);

  function getCorrectOptionLetter(data) {
    if (data.correctOption === data.optionA) return "A";
    if (data.correctOption === data.optionB) return "B";
    if (data.correctOption === data.optionC) return "C";
    if (data.correctOption === data.optionD) return "D";
    return "";
  }

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
      formData.append("questionContent", values.questionContent);
      formData.append("optionA", values.optionA);
      formData.append("optionB", values.optionB);
      formData.append("optionC", values.optionC);
      formData.append("optionD", values.optionD);

      // Xác định đáp án đúng dựa trên radio
      switch (values.correctOption) {
        case "A":
          formData.append("correctOption", values.optionA);
          break;
        case "B":
          formData.append("correctOption", values.optionB);
          break;
        case "C":
          formData.append("correctOption", values.optionC);
          break;
        case "D":
          formData.append("correctOption", values.optionD);
          break;
        default:
          formData.append("correctOption", values.correctOption);
      }

      formData.append("questionType", values.questionType);
      formData.append("questionExplanation", values.questionExplanation);

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
    <div className="question-edit-section5-page">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={questionFormSchema}
        onSubmit={updateQuestion}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form encType="multipart/form-data">
            <div className="modal-body text-start">
              <div className="row">
                <div className="col">
                  <div className="form-group mb-3">
                    <label htmlFor="questionContent" className="form-label">
                      Question Content<span className="required-field">*</span>
                    </label>
                    <Field
                      name="questionContent"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="questionContent" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="optionA" className="form-label">
                      Option A<span className="required-field">*</span>
                    </label>
                    <Field
                      name="optionA"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="optionA" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="optionB" className="form-label">
                      Option B<span className="required-field">*</span>
                    </label>
                    <Field
                      name="optionB"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="optionB" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="optionC" className="form-label">
                      Option C<span className="required-field">*</span>
                    </label>
                    <Field
                      name="optionC"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="optionC" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="optionD" className="form-label">
                      Option D<span className="required-field">*</span>
                    </label>
                    <Field
                      name="optionD"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="optionD" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="correctOption" className="form-label">
                      Correct Option<span className="required-field">*</span>
                    </label>
                    <div className="d-flex">
                      <div className="form-check">
                        <Field
                          type="radio"
                          name="correctOption"
                          id="correctOptionA"
                          value="A"
                          checked={values.correctOption === "A"}
                          className="form-check-input"
                        />
                        <label className="form-check-label me-3" htmlFor="correctOptionA">
                          A
                        </label>
                      </div>
                      <div className="form-check">
                        <Field
                          type="radio"
                          name="correctOption"
                          id="correctOptionB"
                          value="B"
                          checked={values.correctOption === "B"}
                          className="form-check-input"
                        />
                        <label className="form-check-label me-3" htmlFor="correctOptionB">
                          B
                        </label>
                      </div>
                      <div className="form-check">
                        <Field
                          type="radio"
                          name="correctOption"
                          id="correctOptionC"
                          value="C"
                          checked={values.correctOption === "C"}
                          className="form-check-input"
                        />
                        <label className="form-check-label me-3" htmlFor="correctOptionC">
                          C
                        </label>
                      </div>
                      <div className="form-check">
                        <Field
                          type="radio"
                          name="correctOption"
                          id="correctOptionD"
                          value="D"
                          checked={values.correctOption === "D"}
                          className="form-check-input"
                        />
                        <label className="form-check-label me-3" htmlFor="correctOptionD">
                          D
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="questionType" className="form-label">
                      Type<span className="required-field">*</span>
                    </label>
                    <Field
                      as="select"
                      name="questionType"
                      id="questionType"
                      className="form-select border-secondary custom-font"
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      <option value="[Part 5] Câu hỏi ngữ pháp">[Part 5] Câu hỏi ngữ pháp</option>
                      <option value="[Part 5] Câu hỏi từ vựng">[Part 5] Câu hỏi từ vựng</option>
                      <option value="[Part 5] Câu hỏi từ loại">[Part 5] Câu hỏi từ loại</option>
                    </Field>
                    <ErrorMessage name="questionType" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="questionExplanation" className="form-label">
                      Question Explanation<span className="required-field">*</span>
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={values.questionExplanation}
                      onReady={handleEditorReady}
                      onChange={(_, editor) => setFieldValue("questionExplanation", editor.getData())}
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="questionExplanation" component="div" className="error-feedback" />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Đóng
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} data-bs-dismiss="modal">
                Lưu
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditQuestionPart5;