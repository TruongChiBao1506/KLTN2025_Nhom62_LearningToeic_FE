import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./style.css";

const EditQuestion = ({ sectionId, questionId, retrieveQuestions }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    optionA: "",
    optionB: "",
    optionC: "",
    correctOption: "",
    questionType: "",
    questionAudio: null,
    questionScript: "",
  });
  const editorRef = useRef();

  const questionFormSchema = Yup.object().shape({
    questionAudio: Yup.mixed()
      // .required("Vui lòng chọn một tệp âm thanh.")
      .test("fileType", "Chỉ chấp nhận tệp âm thanh MP3", (value) => {
        if (!value) return true;
        const allowedFormats = ["audio/mpeg"];
        return allowedFormats.includes(value.type);
      })
      .test("fileSize", "Tệp âm thanh quá lớn", (value) => {
        if (!value) return true;
        return value.size <= 1024 * 1024 * 10;
      }),
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
    questionType: Yup.string().required("Loại phải được chọn."),
  });

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        setInitialValues({
          optionA: data.optionA || "",
          optionB: data.optionB || "",
          optionC: data.optionC || "",
          correctOption: getCorrectOptionLetter(data),
          questionType: data.questionType || "",
          questionAudio: null,
          questionScript: data.questionScript || "",
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
    return "";
  }

  const handleAudioChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue("questionAudio", file);
  };

  const handleEditorReady = (editor) => {
    editor.editing.view.change((writer) => {
      writer.setStyle("height", "250px", editor.editing.view.document.getRoot());
    });
    editorRef.current = editor;
  };

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("optionA", values.optionA);
      formData.append("optionB", values.optionB);
      formData.append("optionC", values.optionC);

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
        default:
          formData.append("correctOption", values.correctOption);
      }

      formData.append("questionType", values.questionType);

      if (values.questionAudio) {
        formData.append("questionAudio", values.questionAudio, values.questionAudio.name);
      }
      formData.append("questionScript", values.questionScript);

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
    <div className="question-edit-section2-page">
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
                    <label htmlFor="optionA" className="form-label">
                      Option A<span className="required-field">*</span>
                    </label>
                    <Field
                      name="optionA"
                      id="optionA"
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
                      id="optionB"
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
                      id="optionC"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="optionC" component="div" className="error-feedback" />
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
                      <option value="[Part 2] Câu hỏi đuôi">[Part 2] Câu hỏi đuôi</option>
                      <option value="[Part 2] Câu hỏi HOW">[Part 2] Câu hỏi HOW</option>
                      <option value="[Part 2] Câu hỏi lựa chọn">[Part 2] Câu hỏi lựa chọn</option>
                      <option value="[Part 2] Câu hỏi WHAT">[Part 2] Câu hỏi WHAT</option>
                      <option value="[Part 2] Câu hỏi WHEN">[Part 2] Câu hỏi WHEN</option>
                      <option value="[Part 2] Câu hỏi WHERE">[Part 2] Câu hỏi WHERE</option>
                      <option value="[Part 2] Câu hỏi WHO">[Part 2] Câu hỏi WHO</option>
                      <option value="[Part 2] Câu hỏi WHY">[Part 2] Câu hỏi WHY</option>
                      <option value="[Part 2] Câu hỏi YES/NO">[Part 2] Câu hỏi YES/NO</option>
                      <option value="[Part 2] Câu trần thuật">[Part 2] Câu trần thuật</option>
                      <option value="[Part 2] Câu yêu cầu, đề nghị">[Part 2] Câu yêu cầu, đề nghị</option>
                    </Field>
                    <ErrorMessage name="questionType" component="div" className="error-feedback" />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group mb-3">
                    <label htmlFor="questionAudio" className="form-label">
                      Question Audio<span className="required-field">*</span>
                    </label>
                    <input
                      name="questionAudio"
                      id="questionAudio"
                      type="file"
                      className="form-control border-secondary custom-font"
                      onChange={(e) => handleAudioChange(e, setFieldValue)}
                      accept="audio/mpeg"
                    />
                    <ErrorMessage name="questionAudio" component="div" className="error-feedback" />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">
                      Question Script<span className="required-field">*</span>
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={values.questionScript}
                      onReady={handleEditorReady}
                      onChange={(_, editor) => setFieldValue("questionScript", editor.getData())}
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage name="questionScript" component="div" className="error-feedback" />
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

export default EditQuestion;