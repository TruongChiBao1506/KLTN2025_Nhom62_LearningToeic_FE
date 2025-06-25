import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import QuestionService from '../../../../../services/questionService';
import './style.css';

const QuestionAddSection2 = ({ sectionId, retrieveQuestions, onClose }) => {
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [editorData, setEditorData] = useState('');
    const editorRef = useRef(null);
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
        correctOption: Yup
            .string()
            .required("correctOption phải có giá trị."),
        questionType: Yup.string().required("Loại phải được chọn."),
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
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            optionA: '',
            optionB: '',
            optionC: '',
            correctOption: '',
            questionType: '',
            questionAudio: null
        },
        validationSchema: questionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addQuestion(values, resetForm);
        }
    });

    // Audio change handler
    const onAudioChange = (event) => {
        const file = event.target.files[0];
        setSelectedAudio(file);
        formik.setFieldValue('questionAudio', file);
        formik.setFieldTouched('questionAudio', true);
        console.log('Selected audio:', file);
    };

    // CKEditor event handlers
    const onEditorReady = (editor) => {
        console.log('Editor is ready to use!', editor);
        editorRef.current = editor;
        
        // Set height của editor (250px)
        editor.editing.view.change(writer => {
            writer.setStyle('height', '250px', editor.editing.view.document.getRoot());
        });
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

            // Xác định đáp án được chọn và đặt giá trị cho correctOption
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
                    formData.append("correctOption", "");
            }

            formData.append("questionType", values.questionType);
            
            // Add audio file
            if (selectedAudio) {
                formData.append("questionAudio", selectedAudio, selectedAudio.name);
            }

            formData.append("questionScript", editorData);

            await QuestionService.create(formData);
            retrieveQuestions();

            // Reset form và các state
            resetForm();
            setSelectedAudio(null);
            setEditorData('');
            if (editorRef.current) {
                editorRef.current.setData('');
            }
            if (audioInputRef.current) {
                audioInputRef.current.value = '';
            }

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

    const handleClose = () => {
        formik.resetForm();
        setSelectedAudio(null);
        setEditorData('');
        if (editorRef.current) {
            editorRef.current.setData('');
        }
        if (audioInputRef.current) {
            audioInputRef.current.value = '';
        }
        if (onClose) onClose();
    };

    return (
        <div className="question-add-section2-page page">
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start">
                    <div className="row">
                        {/* Left Column - Options */}
                        <div className="col">
                            {/* Option A */}
                            <div className="form-group mb-3">
                                <label htmlFor="optionA" className="form-label">
                                    Option A<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionA"
                                    type="text"
                                    id="optionA"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionA && formik.errors.optionA ? 'is-invalid' : ''
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
                                    Option B<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionB"
                                    type="text"
                                    id="optionB"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionB && formik.errors.optionB ? 'is-invalid' : ''
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
                                    Option C<span className="required-field">*</span>
                                </label>
                                <input
                                    name="optionC"
                                    type="text"
                                    id="optionC"
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.optionC && formik.errors.optionC ? 'is-invalid' : ''
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

                            {/* Correct Option Radio Buttons (Only A, B, C) */}
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    Correct Option<span className="required-field">*</span>
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
                                </div>
                                {formik.touched.correctOption && formik.errors.correctOption && (
                                    <div className="error-feedback">{formik.errors.correctOption}</div>
                                )}
                            </div>

                            {/* Question Type với Part 2 options */}
                            <div className="form-group mb-3">
                                <label htmlFor="questionType" className="form-label">
                                    Type<span className="required-field">*</span>
                                </label>
                                <select
                                    name="questionType"
                                    id="questionType"
                                    className={`form-select border-secondary custom-font ${
                                        formik.touched.questionType && formik.errors.questionType ? 'is-invalid' : ''
                                    }`}
                                    value={formik.values.questionType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="" disabled>Select an option</option>
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
                                </select>
                                {formik.touched.questionType && formik.errors.questionType && (
                                    <div className="error-feedback">{formik.errors.questionType}</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Audio & Script */}
                        <div className="col">
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
                                    className={`form-control border-secondary custom-font ${
                                        formik.touched.questionAudio && formik.errors.questionAudio ? 'is-invalid' : ''
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
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={editorData}
                                        onReady={onEditorReady}
                                        onChange={onEditorChange}
                                        onBlur={onEditorBlur}
                                        onFocus={onEditorFocus}
                                        config={{
                                            placeholder: 'Nhập nội dung script cho part 2...',
                                            toolbar: [
                                                'heading',
                                                '|',
                                                'bold',
                                                'italic',
                                                'underline',
                                                '|',
                                                'link',
                                                'bulletedList',
                                                'numberedList',
                                                '|',
                                                'outdent',
                                                'indent',
                                                '|',
                                                'blockQuote',
                                                'insertTable',
                                                '|',
                                                'undo',
                                                'redo'
                                            ],
                                            language: 'vi'
                                        }}
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
                        className="btn btn-secondary" 
                        onClick={handleClose}
                    >
                        Đóng
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionAddSection2;