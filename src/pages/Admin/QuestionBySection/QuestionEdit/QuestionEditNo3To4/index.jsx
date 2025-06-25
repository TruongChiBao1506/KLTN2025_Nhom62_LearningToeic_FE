import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionService from "../../../../../services/questionService";
import "./style.css";

const EditQuestion = ({ sectionId, questionId, retrieveQuestions }) => {
  const [question, setQuestion] = useState(null);
  const [initialValues, setInitialValues] = useState({
    questionImage: null,
    suggestedAnswer: "",
  });

  const questionFormSchema = Yup.object().shape({
    suggestedAnswer: Yup.string()
      .required("suggestedAnswer phải có giá trị.")
      .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
      .max(1000, "suggestedAnswer có nhiều nhất 1000 ký tự."),
    questionImage: Yup.mixed()
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
  });

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        setInitialValues({
          questionImage: null,
          suggestedAnswer: data.suggestedAnswer || "",
        });
        setQuestion(data);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestion();
  }, [questionId]);

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue("questionImage", file);
  };

  const updateQuestion = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("suggestedAnswer", values.suggestedAnswer);
      if (values.questionImage) {
        formData.append("questionImage", values.questionImage, values.questionImage.name);
      }
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
    <div className="question-edit-no3to4-page">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={questionFormSchema}
        onSubmit={updateQuestion}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form encType="multipart/form-data">
            <div className="modal-body text-start">
              <div className="row">
                <div className="col">
                  <div className="form-group mb-3">
                    <label htmlFor="questionImage" className="form-label">
                      Question Image<span className="required-field">*</span>
                    </label>
                    <input
                      id="questionImage"
                      name="questionImage"
                      type="file"
                      className="form-control border-secondary custom-font"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                      accept="image/jpeg,image/png,image/gif"
                    />
                    <ErrorMessage name="questionImage" component="div" className="error-feedback" />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="suggestedAnswer" className="form-label">
                      Suggested Answer<span className="required-field">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="suggestedAnswer"
                      id="suggestedAnswer"
                      style={{ height: "150px", resize: "none" }}
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