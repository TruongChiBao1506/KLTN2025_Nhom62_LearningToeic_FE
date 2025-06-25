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
    questionText: "",
    suggestedAnswer: "",
  });

  const questionFormSchema = Yup.object().shape({
    questionText: Yup.string()
      .required("questionText phải có giá trị.")
      .min(2, "questionText phải ít nhất 2 ký tự.")
      .max(500, "questionText có nhiều nhất 500 ký tự."),
    suggestedAnswer: Yup.string()
      .required("suggestedAnswer phải có giá trị.")
      .min(2, "suggestedAnswer phải ít nhất 2 ký tự.")
      .max(2000, "suggestedAnswer có nhiều nhất 2000 ký tự."),
  });

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const data = await QuestionService.get(questionId);
        setInitialValues({
          questionText: data.questionText,
          suggestedAnswer: data.suggestedAnswer,
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
    <div className="question-edit-no11-page">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={questionFormSchema}
        onSubmit={updateQuestion}
      >
        {({ isSubmitting }) => (
          <Form encType="multipart/form-data">
            <div className="modal-body text-start">
              <div className="row">
                <div className="col">
                  <div className="form-group mb-3">
                    <label htmlFor="questionText" className="form-label">
                      Text<span className="required-field">*</span>
                    </label>
                    <Field
                      name="questionText"
                      type="text"
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage
                      name="questionText"
                      component="div"
                      className="error-feedback"
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="suggestedAnswer" className="form-label">
                      Suggested Answer<span className="required-field">*</span>
                    </label>
                    <Field
                      name="suggestedAnswer"
                      as="textarea"
                      style={{ height: "150px", resize: "none" }}
                      className="form-control border-secondary custom-font"
                    />
                    <ErrorMessage
                      name="suggestedAnswer"
                      component="div"
                      className="error-feedback"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Đóng
              </button>
              <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" disabled={isSubmitting}>
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