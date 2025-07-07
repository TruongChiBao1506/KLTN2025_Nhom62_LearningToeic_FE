import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import CKEditorOptimized from '../../../../../components/Admin/EditorOptimized';
import QuestionService from '../../../../../services/questionService';
import QuestionGroupService from '../../../../../services/questionGroupService';
import './style.css';

const QuestionAddSection3 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);
    const imageInputRef = useRef(null);
    const audioInputRef = useRef(null);

    // State cho 3 questions với full options
    const [questions, setQuestions] = useState([
        { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '' },
        { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '' },
        { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '' }
    ]);

    // Validation schema
    const questionFormSchema = Yup.object().shape({
        groupImage: Yup
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
        groupAudio: Yup
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
        ...[0, 1, 2].reduce((acc, i) => ({
            ...acc,
            [`questionContent${i}`]: Yup.string().required("questionContent phải có giá trị.").min(2).max(500),
            [`optionA${i}`]: Yup.string().required("OptionA phải có giá trị.").min(2).max(500),
            [`optionB${i}`]: Yup.string().required("OptionB phải có giá trị.").min(2).max(500),
            [`optionC${i}`]: Yup.string().required("OptionC phải có giá trị.").min(2).max(500),
            [`optionD${i}`]: Yup.string().required("OptionD phải có giá trị.").min(2).max(500),
            [`correctOption${i}`]: Yup.string().required("correctOption phải có giá trị."),
            [`questionType${i}`]: Yup.string().required("Loại phải được chọn."),
        }), {})
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            groupImage: null,
            groupAudio: null,
            questionContent0: '', questionContent1: '', questionContent2: '',
            optionA0: '', optionA1: '', optionA2: '',
            optionB0: '', optionB1: '', optionB2: '',
            optionC0: '', optionC1: '', optionC2: '',
            optionD0: '', optionD1: '', optionD2: '',
            correctOption0: '', correctOption1: '', correctOption2: '',
            questionType0: '', questionType1: '', questionType2: ''
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
        formik.setFieldValue('groupImage', file);
        formik.setFieldTouched('groupImage', true);
    };

    const onAudioChange = (event) => {
        const file = event.target.files[0];
        setSelectedAudio(file);
        formik.setFieldValue('groupAudio', file);
        formik.setFieldTouched('groupAudio', true);
    };

    // Update questions state khi formik values thay đổi
    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    // CKEditorOptimized event handlers
    const onEditorReady = (editor) => {
        editorRef.current = editor;
    };

    const onEditorBlur = () => {
        // Nếu muốn validate khi blur, có thể set touched ở đây
    };

    const addQuestion = async (values, resetForm) => {
        try {
            if (!editorData || editorData.trim() === '') {
                toast.error('Question Group Script phải có giá trị', { autoClose: 1000 });
                return;
            }

            // Tạo thông tin nhóm câu hỏi trước
            const groupFormData = new FormData();
            groupFormData.append("sectionId", sectionId);
            if (selectedImage) groupFormData.append("groupImage", selectedImage, selectedImage.name);
            if (selectedAudio) groupFormData.append("groupAudio", selectedAudio, selectedAudio.name);
            groupFormData.append("groupScript", editorData);

            // Gửi dữ liệu nhóm câu hỏi lên server và lấy groupId
            const response = await QuestionGroupService.create(groupFormData);
            const groupId = response.groupId;

            // Gửi dữ liệu từng câu hỏi con lên server
            for (let i = 0; i < 3; i++) {
                const formData = new FormData();
                formData.append("sectionId", sectionId);
                formData.append("groupId", groupId);
                formData.append("questionContent", values[`questionContent${i}`]);
                formData.append("optionA", values[`optionA${i}`]);
                formData.append("optionB", values[`optionB${i}`]);
                formData.append("optionC", values[`optionC${i}`]);
                formData.append("optionD", values[`optionD${i}`]);
                // Xác định đáp án được chọn và đặt giá trị cho correctOption
                switch (values[`correctOption${i}`]) {
                    case "A":
                        formData.append("correctOption", values[`optionA${i}`]);
                        break;
                    case "B":
                        formData.append("correctOption", values[`optionB${i}`]);
                        break;
                    case "C":
                        formData.append("correctOption", values[`optionC${i}`]);
                        break;
                    case "D":
                        formData.append("correctOption", values[`optionD${i}`]);
                        break;
                    default:
                        formData.append("correctOption", "");
                }
                formData.append("questionType", values[`questionType${i}`]);
                await QuestionService.create(formData);
            }

            retrieveQuestions();
            resetFormAndState(resetForm);

            if (onClose) onClose();

            toast.success('Thêm câu hỏi thành công', { autoClose: 1000 });
        } catch (error) {
            let errorMessage = 'Lỗi khi thêm câu hỏi';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.request?.response) {
                try {
                    const jsonResponse = JSON.parse(error.request.response);
                    errorMessage = jsonResponse.message;
                } catch {}
            }
            toast.error(errorMessage, { autoClose: 1000, position: 'top-right' });
        }
    };

    const resetFormAndState = (resetForm) => {
        resetForm();
        setSelectedImage(null);
        setSelectedAudio(null);
        setEditorData('');
        setQuestions([
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '' },
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '' },
            { questionContent: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '', questionType: '' }
        ]);
        if (editorRef.current) editorRef.current.setData('');
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (audioInputRef.current) audioInputRef.current.value = '';
    };

    return (
        <div className="question-add-section3-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start p-4">
                    {/* Group Image */}
                    <div className="form-group mb-3">
                        <label htmlFor="groupImage">
                            Question Group Image<span className="required-field">*</span>
                        </label>
                        <input
                            ref={imageInputRef}
                            name="groupImage"
                            id="groupImage"
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.groupImage && formik.errors.groupImage ? 'is-invalid' : ''
                            }`}
                            onChange={onImageChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.groupImage && formik.errors.groupImage && (
                            <div className="error-feedback">{formik.errors.groupImage}</div>
                        )}
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
                    {/* Group Audio */}
                    <div className="form-group mb-3">
                        <label htmlFor="groupAudio">
                            Question Group Audio<span className="required-field">*</span>
                        </label>
                        <input
                            ref={audioInputRef}
                            name="groupAudio"
                            id="groupAudio"
                            type="file"
                            accept="audio/mpeg"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.groupAudio && formik.errors.groupAudio ? 'is-invalid' : ''
                            }`}
                            onChange={onAudioChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.groupAudio && formik.errors.groupAudio && (
                            <div className="error-feedback">{formik.errors.groupAudio}</div>
                        )}
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
                    {/* Group Script với CKEditorOptimized */}
                    <div className="form-group mb-3">
                        <label className="form-label">
                            Question Group Script<span className="required-field">*</span>
                        </label>
                        <div className="ckeditor-container">
                            <CKEditorOptimized
                                data={editorData}
                                onChange={setEditorData}
                                onReady={onEditorReady}
                                onBlur={onEditorBlur}
                                placeholder="Nhập nội dung script cho part 3..."
                                height="250px"
                            />
                        </div>
                        {!editorData && formik.submitCount > 0 && (
                            <div className="error-feedback">Question Group Script phải có giá trị.</div>
                        )}
                    </div>
                    <hr />
                    {/* 3 Questions */}
                    <div className="row">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="col-md-4">
                                {/* Question Content */}
                                <div className="form-group">
                                    <label htmlFor={`questionContent${index}`}>
                                        Question Content {index + 1}<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`questionContent${index}`}
                                        type="text"
                                        id={`questionContent${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`questionContent${index}`] && formik.errors[`questionContent${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`questionContent${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'questionContent', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder={`Nhập nội dung câu hỏi ${index + 1}`}
                                    />
                                    {formik.touched[`questionContent${index}`] && formik.errors[`questionContent${index}`] && (
                                        <div className="error-feedback">{formik.errors[`questionContent${index}`]}</div>
                                    )}
                                </div>
                                {/* Option A */}
                                <div className="form-group">
                                    <label htmlFor={`optionA${index}`}>
                                        Option A<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionA${index}`}
                                        type="text"
                                        id={`optionA${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionA${index}`] && formik.errors[`optionA${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionA${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionA', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option A"
                                    />
                                    {formik.touched[`optionA${index}`] && formik.errors[`optionA${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionA${index}`]}</div>
                                    )}
                                </div>
                                {/* Option B */}
                                <div className="form-group">
                                    <label htmlFor={`optionB${index}`}>
                                        Option B<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionB${index}`}
                                        type="text"
                                        id={`optionB${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionB${index}`] && formik.errors[`optionB${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionB${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionB', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option B"
                                    />
                                    {formik.touched[`optionB${index}`] && formik.errors[`optionB${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionB${index}`]}</div>
                                    )}
                                </div>
                                {/* Option C */}
                                <div className="form-group">
                                    <label htmlFor={`optionC${index}`}>
                                        Option C<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionC${index}`}
                                        type="text"
                                        id={`optionC${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionC${index}`] && formik.errors[`optionC${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionC${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionC', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option C"
                                    />
                                    {formik.touched[`optionC${index}`] && formik.errors[`optionC${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionC${index}`]}</div>
                                    )}
                                </div>
                                {/* Option D */}
                                <div className="form-group">
                                    <label htmlFor={`optionD${index}`}>
                                        Option D<span className="required-field">*</span>
                                    </label>
                                    <input
                                        name={`optionD${index}`}
                                        type="text"
                                        id={`optionD${index}`}
                                        className={`form-control border-secondary custom-font ${
                                            formik.touched[`optionD${index}`] && formik.errors[`optionD${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`optionD${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'optionD', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        placeholder="Nhập option D"
                                    />
                                    {formik.touched[`optionD${index}`] && formik.errors[`optionD${index}`] && (
                                        <div className="error-feedback">{formik.errors[`optionD${index}`]}</div>
                                    )}
                                </div>
                                {/* Correct Answer Radio Buttons */}
                                <div className="form-group">
                                    <label>Correct Answer<span className="required-field">*</span></label>
                                    <div>
                                        {['A', 'B', 'C', 'D'].map((option) => (
                                            <div key={option} className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    id={`option${option}${index}`}
                                                    name={`correctOption${index}`}
                                                    value={option}
                                                    checked={formik.values[`correctOption${index}`] === option}
                                                    onChange={(e) => {
                                                        formik.handleChange(e);
                                                        updateQuestion(index, 'correctOption', e.target.value);
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                />
                                                <label className="form-check-label" htmlFor={`option${option}${index}`}>
                                                    {option}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {formik.touched[`correctOption${index}`] && formik.errors[`correctOption${index}`] && (
                                        <div className="error-feedback">{formik.errors[`correctOption${index}`]}</div>
                                    )}
                                </div>
                                {/* Question Type */}
                                <div className="form-group mb-3">
                                    <label htmlFor={`questionType${index}`} className="form-label">
                                        Type<span className="required-field">*</span>
                                    </label>
                                    <select
                                        name={`questionType${index}`}
                                        id={`questionType${index}`}
                                        className={`form-select border-secondary custom-font ${
                                            formik.touched[`questionType${index}`] && formik.errors[`questionType${index}`] ? 'is-invalid' : ''
                                        }`}
                                        value={formik.values[`questionType${index}`]}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            updateQuestion(index, 'questionType', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                    >
                                        <option value="" disabled>Select an option</option>
                                        <option value="[Part 3] Câu hỏi kết hợp bảng biểu">[Part 3] Câu hỏi kết hợp bảng biểu</option>
                                        <option value="[Part 3] Câu hỏi về chi tiết cuộc hội thoại">[Part 3] Câu hỏi về chi tiết cuộc hội thoại</option>
                                        <option value="[Part 3] Câu hỏi về chủ đề, mục đích">[Part 3] Câu hỏi về chủ đề, mục đích</option>
                                        <option value="[Part 3] Câu hỏi về danh tính người nói">[Part 3] Câu hỏi về danh tính người nói</option>
                                        <option value="[Part 3] Câu hỏi về địa điểm hội thoại">[Part 3] Câu hỏi về địa điểm hội thoại</option>
                                        <option value="[Part 3] Câu hỏi về hàm ý câu nói">[Part 3] Câu hỏi về hàm ý câu nói</option>
                                        <option value="[Part 3] Câu hỏi về hành động tương lai">[Part 3] Câu hỏi về hành động tương lai</option>
                                        <option value="[Part 3] Câu hỏi về yêu cầu, gợi ý">[Part 3] Câu hỏi về yêu cầu, gợi ý</option>
                                    </select>
                                    {formik.touched[`questionType${index}`] && formik.errors[`questionType${index}`] && (
                                        <div className="error-feedback">{formik.errors[`questionType${index}`]}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary rounded-5"
                        onClick={() => {
                            formik.resetForm();
                            resetFormAndState(() => {});
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

export default QuestionAddSection3;