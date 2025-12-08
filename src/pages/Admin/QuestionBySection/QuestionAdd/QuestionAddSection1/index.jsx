import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import CKEditorOptimized from '../../../../../components/Admin/EditorOptimized';

import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddSection1 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);
    const imageInputRef = useRef(null);
    const audioInputRef = useRef(null);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        optionA: Yup
            .string()
            .required("OptionA phải có giá trị.")
            .min(2, "OptionA phải ít nhất 2 ký tự.")
            .max(500, "OptionA có nhiều nhất 500 ký tự."),
        optionB: Yup
            .string()
            .required("OptionB phải có giá trị.")
            .min(2, "OptionB phải ít nhất 2 ký tự.")
            .max(500, "OptionB có nhiều nhất 500 ký tự."),
        optionC: Yup
            .string()
            .required("OptionC phải có giá trị.")
            .min(2, "OptionC phải ít nhất 2 ký tự.")
            .max(500, "OptionC có nhiều nhất 500 ký tự."),
        optionD: Yup
            .string()
            .required("OptionD phải có giá trị.")
            .min(2, "OptionD phải ít nhất 2 ký tự.")
            .max(500, "OptionD có nhiều nhất 500 ký tự."),
        correctOption: Yup
            .string()
            .required("CorrectOption phải có giá trị."),
        questionImage: Yup
            .mixed()
            .required("Vui lòng chọn một tệp ảnh.")
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                if (!value) return true;
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Tệp ảnh quá lớn", (value) => {
                if (!value) return true;
                return value.size <= 1024 * 1024; // 1MB
            }),
        questionAudio: Yup
            .mixed()
            .required("Vui lòng chọn một tệp âm thanh.")
            .test("fileType", "Chỉ chấp nhận tệp âm thanh MP3", (value) => {
                if (!value) return true;
                const allowedFormats = ["audio/mpeg"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Tệp âm thanh quá lớn", (value) => {
                if (!value) return true;
                return value.size <= 1024 * 1024 * 10; // 10MB
            }),
        questionType: Yup.string().required("Loại phải được chọn."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: '',
            questionType: '',
            questionImage: null,
            questionAudio: null
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    // File change handlers
    const onImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
        formik.setFieldValue('questionImage', file);
        formik.setFieldTouched('questionImage', true);
        console.log('Selected image:', file);
    };

    const onAudioChange = (event) => {
        const file = event.target.files[0];
        setSelectedAudio(file);
        formik.setFieldValue('questionAudio', file);
        formik.setFieldTouched('questionAudio', true);
        console.log('Selected audio:', file);
    };

    // CKEditor event handlers
    const onEditorReady = (editor) => {
        try {
            console.log('Editor is ready to use!', editor);
            editorRef.current = editor;

            // Delay để tránh ResizeObserver warning
            setTimeout(() => {
                if (editor && editor.editing && editor.editing.view) {
                    editor.editing.view.change(writer => {
                        writer.setStyle('height', '250px', editor.editing.view.document.getRoot());
                    });
                }
            }, 100);
        } catch (error) {
            console.warn('CKEditor setup warning:', error);
        }
    };

    const onEditorChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data);
        console.log('Editor data:', data);
    };

    const onEditorBlur = (event, editor) => {
        console.log('Blur.', editor);
    };

    const onEditorFocus = (event, editor) => {
        console.log('Focus.', editor);
    };

    const addQuestion = async (values, resetForm) => {
        try {
            console.log('Section ID:', sectionId);
            console.log('Form values:', values);
            console.log('Editor data:', editorData);

            // Validate question script
            if (!editorData || editorData.trim() === '') {
                toast.error('Question Script phải có giá trị', {
                    autoClose: 1000,
                });
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("sectionId", sectionId);
            formData.append("optionA", values.optionA);
            formData.append("optionB", values.optionB);
            formData.append("optionC", values.optionC);
            formData.append("optionD", values.optionD);

            // ✅ Lưu correctOption là chữ cái A/B/C/D (KHÔNG phải nội dung đầy đủ)
            formData.append("correctOption", values.correctOption);

            // ✅ Thêm questionSubType (giá trị chi tiết như "[Part 1] Tranh tả người")
            formData.append("questionSubType", values.questionType);
            
            // ✅ Tự động set questionType là "listening" cho Part 1
            formData.append("questionType", "listening");

            // Add files
            if (selectedImage) {
                formData.append("questionImage", selectedImage, selectedImage.name);
            }

            if (selectedAudio) {
                formData.append("questionAudio", selectedAudio, selectedAudio.name);
            }

            formData.append("questionScript", editorData);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetFormAndState(resetForm);

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm câu hỏi thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('Error adding question:', error);
            let errorMessage = 'Lỗi khi thêm câu hỏi';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.request?.response) {
                try {
                    const jsonResponse = JSON.parse(error.request.response);
                    errorMessage = jsonResponse.message;
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                }
            }

            toast.error(errorMessage, {
                autoClose: 1000,
                position: 'top-right',
            });
        }
    };

    const resetFormAndState = (resetForm) => {
        resetForm();
        setSelectedImage(null);
        setSelectedAudio(null);
        setEditorData('');
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
        if (audioInputRef.current) {
            audioInputRef.current.value = '';
        }
    };

    return (
        <div className='question-add-section1-page'>
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        {/* Left Column - Options */}
                        <div className="col">
                            {/* Option A */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionA" className="form-label">
                                    Lựa chọn A<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionA"
                                    type="text"
                                    id="optionA"
                                    className={`form-control border-secondary custom-font ${formik.touched.optionA && formik.errors.optionA ? 'is-invalid' : ''
                                        }`}
                                    value={formik.values.optionA}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập nội dung option A"
                                />
                                {formik.touched.optionA && formik.errors.optionA && (
                                    <div className="error-feedback">{formik.errors.optionA}</div>
                                )}
                            </div>

                            {/* Option B */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionB" className="form-label">
                                    Lựa chọn B<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionB"
                                    type="text"
                                    id="optionB"
                                    className={`form-control border-secondary custom-font ${formik.touched.optionB && formik.errors.optionB ? 'is-invalid' : ''
                                        }`}
                                    value={formik.values.optionB}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập nội dung option B"
                                />
                                {formik.touched.optionB && formik.errors.optionB && (
                                    <div className="error-feedback">{formik.errors.optionB}</div>
                                )}
                            </div>

                            {/* Option C */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionC" className="form-label">
                                    Lựa chọn C<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionC"
                                    type="text"
                                    id="optionC"
                                    className={`form-control border-secondary custom-font ${formik.touched.optionC && formik.errors.optionC ? 'is-invalid' : ''
                                        }`}
                                    value={formik.values.optionC}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập nội dung option C"
                                />
                                {formik.touched.optionC && formik.errors.optionC && (
                                    <div className="error-feedback">{formik.errors.optionC}</div>
                                )}
                            </div>

                            {/* Option D */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionD" className="form-label">
                                    Lựa chọn D<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionD"
                                    type="text"
                                    id="optionD"
                                    className={`form-control border-secondary custom-font ${formik.touched.optionD && formik.errors.optionD ? 'is-invalid' : ''
                                        }`}
                                    value={formik.values.optionD}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập nội dung option D"
                                />
                                {formik.touched.optionD && formik.errors.optionD && (
                                    <div className="error-feedback">{formik.errors.optionD}</div>
                                )}
                            </div>

                            {/* Correct Option Radio Buttons */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Đáp án đúng<span className="required-field">*</span>
                                </label>
                                <div className="d-flex">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id="correctOptionA"
                                            name="correctOption"
                                            value="A"
                                            checked={formik.values.correctOption === 'A'}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="form-check-label me-3" htmlFor="correctOptionA">A</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id="correctOptionB"
                                            name="correctOption"
                                            value="B"
                                            checked={formik.values.correctOption === 'B'}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="form-check-label me-3" htmlFor="correctOptionB">B</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id="correctOptionC"
                                            name="correctOption"
                                            value="C"
                                            checked={formik.values.correctOption === 'C'}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="form-check-label me-3" htmlFor="correctOptionC">C</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id="correctOptionD"
                                            name="correctOption"
                                            value="D"
                                            checked={formik.values.correctOption === 'D'}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="form-check-label me-3" htmlFor="correctOptionD">D</label>
                                    </div>
                                </div>
                                {formik.touched.correctOption && formik.errors.correctOption && (
                                    <div className="error-feedback">{formik.errors.correctOption}</div>
                                )}
                            </div>

                            {/* Question Type */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionType" className="form-label">
                                    Type<span className="required-field">*</span>
                                </label>
                                <input
                                    name="questionType"
                                    type="text"
                                    id="questionType"
                                    className={`form-control border-secondary custom-font ${formik.touched.questionType && formik.errors.questionType ? 'is-invalid' : ''
                                        }`}
                                    value={formik.values.questionType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Nhập loại câu hỏi (ví dụ: [Part 1] Tranh tả người)"
                                />
                                {formik.touched.questionType && formik.errors.questionType && (
                                    <div className="error-feedback">{formik.errors.questionType}</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Media & Script */}
                        <div className="col">
                            {/* Question Image */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionImage" className="form-label">
                                    Question Image<span className="required-field">*</span>
                                </label>
                                <input
                                    ref={imageInputRef}
                                    name="questionImage"
                                    id="questionImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    className={`form-control border-secondary custom-font ${formik.touched.questionImage && formik.errors.questionImage ? 'is-invalid' : ''
                                        }`}
                                    onChange={onImageChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.questionImage && formik.errors.questionImage && (
                                    <div className="error-feedback">{formik.errors.questionImage}</div>
                                )}

                                {/* Image preview */}
                                {selectedImage && (
                                    <div className="file-preview mt-2">
                                        <small className="text-muted">
                                            Đã chọn: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                                        </small>
                                        <div className="image-preview mt-2">
                                            <img
                                                src={URL.createObjectURL(selectedImage)}
                                                alt="Preview"
                                                className="img-thumbnail"
                                                style={{ maxWidth: '200px', maxHeight: '150px' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Question Audio */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionAudio" className="form-label">
                                    Question Audio<span className="required-field">*</span>
                                </label>
                                <input
                                    ref={audioInputRef}
                                    name="questionAudio"
                                    id="questionAudio"
                                    type="file"
                                    accept="audio/mpeg"
                                    className={`form-control border-secondary custom-font ${formik.touched.questionAudio && formik.errors.questionAudio ? 'is-invalid' : ''
                                        }`}
                                    onChange={onAudioChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.questionAudio && formik.errors.questionAudio && (
                                    <div className="error-feedback">{formik.errors.questionAudio}</div>
                                )}

                                {/* Audio preview */}
                                {selectedAudio && (
                                    <div className="file-preview mt-2">
                                        <small className="text-muted">
                                            Đã chọn: {selectedAudio.name} ({(selectedAudio.size / (1024 * 1024)).toFixed(2)} MB)
                                        </small>
                                        <div className="audio-preview mt-2">
                                            <audio controls className="w-100">
                                                <source src={URL.createObjectURL(selectedAudio)} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Question Script với CKEditor */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Question Script<span className="required-field">*</span>
                                </label>
                                <div className="ckeditor-container">
                                    <CKEditorOptimized
                                        data={editorData}
                                        onChange={setEditorData}
                                        onReady={onEditorReady}
                                        onBlur={onEditorBlur}
                                        placeholder="Nhập nội dung script cho part 1..."
                                        height="250px"
                                    />
                                </div>
                                {/* Custom validation error display */}
                                {!editorData && formik.submitCount > 0 && (
                                    <div className="error-feedback">Question Script phải có giá trị.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary rounded-5"
                        onClick={() => {
                            formik.resetForm();
                            resetFormAndState(() => { });
                            if (onClose) onClose();
                        }}
                    >
                        Đóng
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary rounded-5"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionAddSection1;