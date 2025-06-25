import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import QuestionGroupService from "../../../../../services/questionGroupService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./style.css";

const EditQuestionSection4 = ({ sectionId, groupId, retrieveQuestions }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    groupImage: null,
    groupAudio: null,
    groupScript: "",
    questions: [],
  });
  const editorRef = useRef();

  // Tạo schema động cho từng câu hỏi
  const getValidationSchema = (questions) => {
    const shape = {
      groupImage: Yup.mixed()
        .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
          if (!value) return true;
          const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
          return allowedFormats.includes(value.type);
        })
        .test("fileSize", "Tệp ảnh quá lớn", (value) => {
          if (!value) return true;
          return value.size <= 1024 * 1024;
        }),
      groupAudio: Yup.mixed()
        .test("fileType", "Chỉ chấp nhận tệp âm thanh MP3", (value) => {
          if (!value) return true;
          const allowedFormats = ["audio/mpeg"];
          return allowedFormats.includes(value.type);
        })
        .test("fileSize", "Tệp âm thanh quá lớn", (value) => {
          if (!value) return true;
          return value.size <= 1024 * 1024 * 10;
        }),
      groupScript: Yup.string().required("groupScript phải có giá trị."),
    };
    questions.forEach((q, idx) => {
      shape[`questionContent${idx}`] = Yup.string()
        .required("questionContent phải có giá trị.")
        .min(2, "questionContent phải ít nhất 2 ký tự.")
        .max(500, "questionContent có nhiều nhất 500 ký tự.");
      ["A", "B", "C", "D"].forEach((opt) => {
        shape[`option${opt}${idx}`] = Yup.string()
          .required(`Option${opt} phải có giá trị.`)
          .min(2, `Option${opt} phải ít nhất 2 ký tự.`)
          .max(500, `Option${opt} có nhiều nhất 500 ký tự.`);
      });
      shape[`questionType${idx}`] = Yup.string().required("Loại phải được chọn.");
    });
    return Yup.object().shape(shape);
  };

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.getQuestionsByQuestionGroup(groupId);
        const questions = data.map((item) => ({
          questionId: item.questionId,
          questionContent: item.questionContent,
          optionA: item.optionA,
          optionB: item.optionB,
          optionC: item.optionC,
          optionD: item.optionD,
          correctOption: getCorrectOptionLetter(item),
          questionType: item.questionType,
        }));
        setInitialValues({
          groupImage: null,
          groupAudio: null,
          groupScript: data[0]?.questionGroup?.groupScript || "",
          questions,
        });
        setQuestion(data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestion();
  }, [groupId]);

  function getCorrectOptionLetter(item) {
    if (item.correctOption === item.optionA) return "A";
    if (item.correctOption === item.optionB) return "B";
    if (item.correctOption === item.optionC) return "C";
    if (item.correctOption === item.optionD) return "D";
    return "";
  }

  const handleEditorReady = (editor) => {
    editor.editing.view.change((writer) => {
      writer.setStyle("height", "170px", editor.editing.view.document.getRoot());
    });
    editorRef.current = editor;
  };

  // Cập nhật từng câu hỏi
  const updateQuestion = async (questionId, values, idx) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("questionId", questionId);
      formData.append("questionContent", values[`questionContent${idx}`]);
      formData.append("optionA", values[`optionA${idx}`]);
      formData.append("optionB", values[`optionB${idx}`]);
      formData.append("optionC", values[`optionC${idx}`]);
      formData.append("optionD", values[`optionD${idx}`]);
      // Xác định đáp án đúng dựa trên radio
      switch (values[`correctOption${idx}`]) {
        case "A":
          formData.append("correctOption", values[`optionA${idx}`]);
          break;
        case "B":
          formData.append("correctOption", values[`optionB${idx}`]);
          break;
        case "C":
          formData.append("correctOption", values[`optionC${idx}`]);
          break;
        case "D":
          formData.append("correctOption", values[`optionD${idx}`]);
          break;
        default:
          formData.append("correctOption", values[`correctOption${idx}`]);
      }
      formData.append("questionType", values[`questionType${idx}`]);
      await QuestionService.update(questionId, formData);
      toast.success("Chỉnh sửa câu hỏi thành công", { autoClose: 1000 });
      retrieveQuestions();
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi chỉnh sửa câu hỏi", { autoClose: 1000 });
    }
  };

  // Cập nhật group
  const updateQuestionGroup = async (values) => {
    try {
      const groupFormData = new FormData();
      if (values.groupImage) {
        groupFormData.append("groupImage", values.groupImage, values.groupImage.name);
      }
      if (values.groupAudio) {
        groupFormData.append("groupAudio", values.groupAudio, values.groupAudio.name);
      }
      groupFormData.append("groupScript", values.groupScript);
      await QuestionGroupService.update(groupId, groupFormData);
      toast.success("Chỉnh sửa nhóm thành công", { autoClose: 1000 });
      retrieveQuestions();
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi chỉnh sửa nhóm", { autoClose: 1000 });
    }
  };

  if (!initialValues.questions.length) return null;

  return (
    <div className="question-edit-section4-page">
      <Formik
        enableReinitialize
        initialValues={{
          groupImage: null,
          groupAudio: null,
          groupScript: initialValues.groupScript,
          ...initialValues.questions.reduce((acc, q, idx) => {
            acc[`questionContent${idx}`] = q.questionContent;
            acc[`optionA${idx}`] = q.optionA;
            acc[`optionB${idx}`] = q.optionB;
            acc[`optionC${idx}`] = q.optionC;
            acc[`optionD${idx}`] = q.optionD;
            acc[`correctOption${idx}`] = q.correctOption;
            acc[`questionType${idx}`] = q.questionType;
            return acc;
          }, {}),
        }}
        validationSchema={getValidationSchema(initialValues.questions)}
        onSubmit={() => { }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form encType="multipart/form-data">
            <div className="modal-body text-start">
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
                <label htmlFor="groupAudio">
                  Question Group Audio<span className="required-field">*</span>
                </label>
                <input
                  type="file"
                  name="groupAudio"
                  className="form-control border-secondary custom-font"
                  onChange={(e) => setFieldValue("groupAudio", e.currentTarget.files[0])}
                  accept="audio/mpeg"
                />
                <ErrorMessage name="groupAudio" component="div" className="error-feedback" />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="groupScript" className="form-label">
                  Question Group Script<span className="required-field">*</span>
                </label>
                <CKEditor
                  editor={ClassicEditor}
                  data={values.groupScript}
                  onReady={handleEditorReady}
                  onChange={(_, editor) => setFieldValue("groupScript", editor.getData())}
                  className="form-control border-secondary custom-font"
                />
                <ErrorMessage name="groupScript" component="div" className="error-feedback" />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => updateQuestionGroup(values)}
              >
                Update Question Group
              </button>
              <hr />
              <div className="row">
                {initialValues.questions.map((q, idx) => (
                  <div className="col-md-4" key={q.questionId}>
                    <div className="form-group">
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
                    {["A", "B", "C", "D"].map((opt) => (
                      <div className="form-group" key={opt}>
                        <label htmlFor={`option${opt}${idx}`}>
                          Option {opt}
                          <span className="required-field">*</span>
                        </label>
                        <Field
                          name={`option${opt}${idx}`}
                          type="text"
                          className="form-control border-secondary custom-font"
                        />
                        <ErrorMessage
                          name={`option${opt}${idx}`}
                          component="div"
                          className="error-feedback"
                        />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>
                        Correct Answer<span className="required-field">*</span>
                      </label>
                      <div>
                        {["A", "B", "C", "D"].map((opt) => (
                          <div className="form-check form-check-inline" key={opt}>
                            <Field
                              type="radio"
                              name={`correctOption${idx}`}
                              id={`correctOption${opt}${idx}`}
                              value={opt}
                              checked={values[`correctOption${idx}`] === opt}
                              className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor={`correctOption${opt}${idx}`}>
                              {opt}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="form-group mb-3">
                      <label htmlFor={`questionType${idx}`} className="form-label">
                        Type<span className="required-field">*</span>
                      </label>
                      <Field
                        as="select"
                        name={`questionType${idx}`}
                        id={`questionType${idx}`}
                        className="form-select border-secondary custom-font"
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        <option value="[Part 4] Câu hỏi kết hợp bảng biểu">
                          [Part 4] Câu hỏi kết hợp bảng biểu
                        </option>
                        <option value="[Part 4] Câu hỏi về chi tiết">
                          [Part 4] Câu hỏi về chi tiết
                        </option>
                        <option value="[Part 4] Câu hỏi về chủ đề, mục đích">
                          [Part 4] Câu hỏi về chủ đề, mục đích
                        </option>
                        <option value="[Part 4] Câu hỏi về danh tính, địa điểm">
                          [Part 4] Câu hỏi về danh tính, địa điểm
                        </option>
                        <option value="[Part 4] Câu hỏi về hàm ý câu nói">
                          [Part 4] Câu hỏi về hàm ý câu nói
                        </option>
                        <option value="[Part 4] Câu hỏi về hành động tương lai">
                          [Part 4] Câu hỏi về hành động tương lai
                        </option>
                        <option value="[Part 4] Câu hỏi yêu cầu, gợi ý">
                          [Part 4] Câu hỏi yêu cầu, gợi ý
                        </option>
                      </Field>
                      <ErrorMessage
                        name={`questionType${idx}`}
                        component="div"
                        className="error-feedback"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary mt-2"
                      onClick={() => updateQuestion(q.questionId, values, idx)}
                    >
                      Save
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                CLOSE
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditQuestionSection4;