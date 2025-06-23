import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopicService from '../../../../services/topicService';
import './style.css';

const AddTopic = ({ retrieveTopics, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    // Validation schema - Copy từ SectionEdit
    const topicFormSchema = Yup.object().shape({
        topicName: Yup
            .string()
            .required("Tên phải có giá trị.")
            .min(2, "Tên phải ít nhất 2 ký tự.")
            .max(50, "Tên có nhiều nhất 50 ký tự."),
        image: Yup
            .mixed()
            .nullable()
            .required("Vui lòng chọn một tệp ảnh.")
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                // Nếu không có file thì pass validation
                if (!value) return true;

                // Nếu không phải File object thì pass (có thể là string path)
                if (!(value instanceof File)) {
                    console.log('Not a File object, skipping validation');
                    return true;
                }
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                const isValid = allowedFormats.includes(value.type);
                console.log('File type:', value.type, 'Is valid:', isValid);
                return isValid;
            })
            .test("fileSize", "Tệp ảnh quá lớn", (value) => {
                console.log('📏 Validating file size:', value?.size); // ✅ Debug

                // Nếu không có file thì pass
                if (!value) return true;

                // Nếu không phải File object thì pass
                if (!(value instanceof File)) return true;

                // Check size chỉ khi là File object
                const isValid = value.size <= 1024 * 1024; // 1MB
                console.log('File size:', value.size, 'Is valid:', isValid);
                return isValid;
            }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            topicName: '',
            image: null
        },
        validationSchema: topicFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addTopic(values, resetForm);
        }
    });

    // Handle file change - Copy từ SectionEdit
    const onFileChange = (event) => {
        const file = event.target.files[0];
        console.log('📁 File selected:', file);

        if (file) {
            console.log('File details:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            setSelectedFile(file);
            formik.setFieldValue('image', file);

            // Clear previous validation errors
            formik.setFieldError('image', undefined);
        } else {
            setSelectedFile(null);
            formik.setFieldValue('image', null);
        }
    };

    // Add topic function
    const addTopic = async (values, resetForm) => {
        try {
            const formData = new FormData();
            formData.append("topicName", values.topicName);
            
            // Only append image if a file was selected
            if (selectedFile) {
                formData.append("image", selectedFile, selectedFile.name);
            }
            
            await TopicService.create(formData);
            retrieveTopics();
            
            // Reset form
            resetForm();
            setSelectedFile(null);
            
            // Reset file input
            const fileInput = document.getElementById('image');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Close modal
            if (onClose) {
                onClose();
            }
            
            toast.success('Thêm chủ đề thành công', {
                autoClose: 1000,
            });
            
        } catch (error) {
            console.log(error);
            let errorMessage = 'Có lỗi xảy ra khi thêm topic';
            
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

    // Handle close
    const handleClose = () => {
        formik.resetForm();
        setSelectedFile(null);
        const fileInput = document.getElementById('image');
        if (fileInput) {
            fileInput.value = '';
        }
        if (onClose) {
            onClose();
        }
    };

    // Handle submit function - Copy từ SectionEdit
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);

        console.log('Field values:');
        console.log('  topicName:', `"${formik.values.topicName}"`, typeof formik.values.topicName);
        console.log('  image:', formik.values.image);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                topicName: true,
                image: true
            });
            return;
        }

        // Submit form
        await addTopic(formik.values, formik.resetForm);
    };

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start">
                <div className="form-group mb-3">
                    <label className="form-label">
                        Topic Name<span className="required-field">*</span>
                    </label>
                    <input
                        name="topicName"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.topicName && formik.errors.topicName ? 'is-invalid' : ''
                        }`}
                        value={formik.values.topicName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.topicName && formik.errors.topicName && (
                        <div className="error-feedback">{formik.errors.topicName}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="image" className="form-label">
                        Image<span className="required-field">*</span>
                    </label>
                    <input
                        name="image"
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.image && formik.errors.image ? 'is-invalid' : ''
                        }`}
                        onChange={(event) => {
                            onFileChange(event);
                            formik.handleChange(event);
                        }}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.image && formik.errors.image && (
                        <div className="error-feedback">{formik.errors.image}</div>
                    )}
                    {selectedFile && (
                        <small className="text-success d-block mt-1">
                            Đã chọn: {selectedFile.name}
                        </small>
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

export default AddTopic;