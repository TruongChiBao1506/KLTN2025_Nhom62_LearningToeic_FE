import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import SectionService from '../../../../services/sectionsService';

const SectionAdd = ({ retrieveSections, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    // Validation schema
    const sectionFormSchema = Yup.object().shape({
        name: Yup
            .string()
            .required("Tên phải có giá trị.")
            .min(2, "Tên phải ít nhất 2 ký tự.")
            .max(50, "Tên có nhiều nhất 50 ký tự."),
        description: Yup
            .string()
            .required("Mô tả phải có giá trị.")
            .min(2, "Mô tả phải ít nhất 2 ký tự.")
            .max(255, "Mô tả không được vượt quá 255 ký tự."),
        type: Yup.string().required("Loại phải được chọn."),
        image: Yup
            .mixed()
            .nullable()
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                if (!value) return true;
                // Kiểm tra nếu value là File object
                if (value instanceof File) {
                    const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                    return allowedFormats.includes(value.type);
                }
                return true;
            })
            .test("fileSize", "Tệp ảnh quá lớn", (value) => {
                if (!value) return true;
                // Kiểm tra nếu value là File object
                if (value instanceof File) {
                    return value.size <= 1024 * 1024;
                }
                return true;
            }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            type: '',
            image: null
        },
        validationSchema: sectionFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addSection(values, resetForm);
        }
    });

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            formik.setFieldValue('image', file);
            // Trigger validation for the image field
            formik.setFieldTouched('image', true);
        } else {
            setSelectedFile(null);
            formik.setFieldValue('image', null);
        }
    };

    const addSection = async (values, resetForm) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("type", values.type);
            if (selectedFile) {
                formData.append("image", selectedFile, selectedFile.name);
            }

            await SectionService.create(formData);
            retrieveSections();
            
            // Reset form
            resetForm();
            setSelectedFile(null);
            
            //   Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm dạng phần thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log(error);
            let errorMessage = 'Có lỗi xảy ra khi thêm section';
            
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

    return (
        <div>
            <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <div className="modal-body text-start p-4">
                    {/* Name Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="name" className="form-label">
                            Name<span className="required-field">*</span>
                        </label>
                        <input
                            name="name"
                            type="text"
                            id="name"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                            }`}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="error-feedback">{formik.errors.name}</div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="description" className="form-label">
                            Description<span className="required-field">*</span>
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            className={`form-control border-secondary custom-font ${
                                formik.touched.description && formik.errors.description ? 'is-invalid' : ''
                            }`}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            style={{ resize: 'none', height: '100px', width: '100%' }}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <div className="error-feedback">{formik.errors.description}</div>
                        )}
                    </div>

                    {/* Image Field */}
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
                            onChange={onFileChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.image && formik.errors.image && (
                            <div className="error-feedback">{formik.errors.image}</div>
                        )}
                    </div>

                    {/* Type Field */}
                    <div className="form-group mb-3">
                        <label htmlFor="type" className="form-label">
                            Type<span className="required-field">*</span>
                        </label>
                        <select
                            name="type"
                            id="type"
                            className={`form-select border-secondary custom-font ${
                                formik.touched.type && formik.errors.type ? 'is-invalid' : ''
                            }`}
                            value={formik.values.type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <option value="" disabled>Select an option</option>
                            <option value="1">Nghe</option>
                            <option value="2">Đọc</option>
                            <option value="3">Nói</option>
                            <option value="4">Viết</option>
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <div className="error-feedback">{formik.errors.type}</div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                            formik.resetForm();
                            setSelectedFile(null);
                            if (onClose) onClose();
                        }}
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

export default SectionAdd;