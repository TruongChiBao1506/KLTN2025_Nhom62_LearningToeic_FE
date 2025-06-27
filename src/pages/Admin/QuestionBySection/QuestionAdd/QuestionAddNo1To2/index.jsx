import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import CKEditorOptimized from '../../../../../components/Admin/EditorOptimized';
import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddNo1To2 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);

    const questionFormSchema = Yup.object().shape({
        questionText: Yup.string()
            .required("questionText phải có giá trị.")
            .min(2, "questionText phải ít nhất 2 ký tự."),
    });

    const formik = useFormik({
        initialValues: {
            questionText: '',
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    const addQuestion = async (values, resetForm) => {
        try {
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("questionText", values.questionText);
            await QuestionService.create(formData);
            retrieveQuestions();
            toast.success('Thêm câu hỏi thành công', { autoClose: 1000 });
            resetForm();
            setEditorData('');
            if (editorRef.current) {
                editorRef.current.setData('');
            }
            if (onClose) onClose();
        } catch (error) {
            toast.error('Lỗi khi thêm câu hỏi', { autoClose: 1000 });
        }
    };

    const onEditorReady = (editor) => {
        editorRef.current = editor;
        setTimeout(() => {
            if (editor && editor.editing && editor.editing.view) {
                editor.editing.view.change(writer => {
                    writer.setStyle('height', '170px', editor.editing.view.document.getRoot());
                });
            }
        }, 100);
    };

    return (
        <div className="question-add-no1to2-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start p-4">
                    <div className="row">
                        <div className="col">
                            <div className="form-group mb-3">
                                <label htmlFor="questionText" className="form-label">
                                    Question Group Text<span className="required-field">*</span>
                                </label>
                                <div className='ckeditor-container'>
                                    <CKEditorOptimized
                                        data={formik.values.questionText}
                                        onChange={data => {
                                            setEditorData(data);
                                            formik.setFieldValue('questionText', data);
                                        }}
                                        onReady={onEditorReady}
                                        placeholder="Nhập nội dung..."
                                        height="170px"
                                    />
                                </div>

                                {formik.touched.questionText && formik.errors.questionText && (
                                    <div className="error-feedback">{formik.errors.questionText}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            formik.resetForm();
                            setEditorData('');
                            if (editorRef.current) editorRef.current.setData('');
                            if (onClose) onClose();
                        }}
                    >
                        Đóng
                    </button>
                    <button className="btn btn-primary" type="submit">
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionAddNo1To2;