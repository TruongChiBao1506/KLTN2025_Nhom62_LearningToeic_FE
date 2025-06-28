import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamService from '../../../../services/examService';
import './style.css';

const EditExam = ({ examId, retrieveExams, onClose }) => {
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validation schema - Giống AddExam
    const examFormSchema = Yup.object().shape({
        examName: Yup
            .string()
            .required("Tên phải có giá trị.")
            .min(2, "Tên phải ít nhất 2 ký tự.")
            .max(50, "Tên có nhiều nhất 50 ký tự."),
        examType: Yup.string().required("Loại phải được chọn."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            examName: '',
            examType: ''
        },
        validationSchema: examFormSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateExam(values);
        }
    });

    // Get exam data
    const getExam = async () => {
        try {
            setLoading(true);
            const data = await ExamService.get(examId);

            // Set exam data
            setExam(data);

            // Set form initial values
            formik.setValues({
                examName: data.examName || '',
                examType: data.examType || ''
            });
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi tải dữ liệu exam', {
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Load exam data on component mount
    useEffect(() => {
        if (examId) {
            getExam();
        }
    }, [examId]);

    // Update exam
    const updateExam = async (values) => {
        try {
            console.log('🚀 Starting updateExam with values:', values);
            console.log('Exam Name:', values.examName);
            console.log('Exam Type:', values.examType);
            
            const formData = new FormData();
            formData.append("examName", values.examName);
            formData.append("examType", values.examType);

            console.log('📤 Sending update request to server...');
            await ExamService.update(examId, formData);
            console.log('  Exam updated successfully');
            
            retrieveExams();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa Exam thành công', {
                autoClose: 2000,
            });
        } catch (error) {
            console.log('❌ Error updating exam:', error);
            let errorMessage = 'Có lỗi xảy ra khi cập nhật exam';

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
                autoClose: 2000,
                position: 'top-right',
            });
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // Handle submit function - Giống AddExam
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                examName: true,
                examType: true
            });
            return;
        }

        console.log('  Validation passed, submitting...');
        // Submit form
        await updateExam(formik.values);
    };

    if (loading) {
        return (
            <div className="modal-body text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="text-center py-4">
                <p className="text-danger">Không thể tải dữ liệu exam</p>
                <button
                    className="btn btn-secondary"
                    onClick={handleClose}
                >
                    Đóng
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="examName" className="form-label">
                        Name<span className="required-field">*</span>
                    </label>
                    <input
                        name="examName"
                        id="examName"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.examName && formik.errors.examName ? 'is-invalid' : ''
                        }`}
                        value={formik.values.examName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.examName && formik.errors.examName && (
                        <div className="error-feedback">{formik.errors.examName}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="examType" className="form-label">
                        Type<span className="required-field">*</span>
                    </label>
                    <select
                        name="examType"
                        id="examType"
                        className={`form-select border-secondary custom-font ${
                            formik.touched.examType && formik.errors.examType ? 'is-invalid' : ''
                        }`}
                        value={formik.values.examType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    >
                        <option value="" disabled>Select an option</option>
                        <option value="0">MiniTest</option>
                        <option value="1">FullTest</option>
                    </select>
                    {formik.touched.examType && formik.errors.examType && (
                        <div className="error-feedback">{formik.errors.examType}</div>
                    )}
                </div>
            </div>

            {/* Modal Footer - Tách riêng khỏi form */}
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClose();
                    }}
                >
                    Đóng
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={formik.isSubmitting}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }}
                >
                    {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </>
    );
};

export default EditExam;