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

const EditQuestionGroup = ({ sectionId, groupId, retrieveQuestions }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    groupImage: null,
    groupText: "",
    questions: [],
  });
  const editorRef = useRef();

  // Tạo schema động cho từng câu hỏi
  const getValidationSchema = (questions) => {
    const shape = {
      groupImage: Yup.mixed()
        // .required("Vui lòng chọn một tệp ảnh.")
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
    const getQuestion = async () => {
      try {
        const data = await QuestionService.getQuestionsByQuestionGroup(groupId);
        const questions = data.map((item) => ({
          questionId: item.questionId,
          questionContent: item.questionContent,
          suggestedAnswer: item.suggestedAnswer,
        }));
        setInitialValues({
          groupImage: null,
          groupText: data[0]?.questionGroup?.groupText || "",
          questions,
        });
        setQuestion(data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestion();
  }, [groupId]);

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
      formData.append("suggestedAnswer", values[`suggestedAnswer${idx}`]);
      await QuestionService.update(questionId, formData);
      toast.success("Chỉnh sửa câu hỏi thành công", { autoClose: 1000 });
      retrieveQuestions();
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi chỉnh sửa câu hỏi", { autoClose: 1000 });
    }
  };

  // Cập nhật group text và group image
  const updateQuestionGroup = async (values) => {
    try {
      const groupFormData = new FormData();
      if (values.groupImage) {
        groupFormData.append("groupImage", values.groupImage, values.groupImage.name);
      }
      groupFormData.append("groupText", values.groupText);
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
                <label htmlFor="groupText" className="form-label">
                  Question Group Text<span className="required-field">*</span>
                </label>
                <CKEditor
                  editor={ClassicEditor}
                  data={values.groupText}
                  onReady={handleEditorReady}
                  onChange={(_, editor) => setFieldValue("groupText", editor.getData())}
                  className="form-control border-secondary custom-font"
                />
                <ErrorMessage name="groupText" component="div" className="error-feedback" />
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

export default EditQuestionGroup;