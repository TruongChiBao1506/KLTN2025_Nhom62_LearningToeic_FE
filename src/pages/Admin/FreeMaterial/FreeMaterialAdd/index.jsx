import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FreeMaterialService from '../../../../services/freeMaterialService';
import './style.css';

const FreeMaterialAdd = ({ retrieveFreeMaterials, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    // Validation schema
    const freeMaterialFormSchema = Yup.object().shape({
        title: Yup
            .string()
            .required("Tiêu đề phải được chọn.")
            .min(2, "Tiêu đề phải chứa ít nhất 2 ký tự")
            .max(50, "Tiêu đề không vượt quá 50 ký tự"),
        description: Yup
            .string()
            .max(255, "Mô tả không được vượt quá 255 ký tự"),
        filePdf: Yup
            .mixed()
            .nullable()
            .required("Vui lòng chọn file pdf")
            .test("fileType", "Only accept PDF files", (value) => {
                if (!value) return true;

                // Kiểm tra nếu không phải File object
                if (!(value instanceof File)) {
                    console.log('Not a File object, skipping validation');
                    return false;
                }

                const isValid = value.type === "application/pdf";
                console.log('File type:', value.type, 'Is valid:', isValid);
                return isValid;
            })
            .test("fileSize", "File is too large (max 10MB)", (value) => {
                if (!value) return true;

                // Kiểm tra nếu không phải File object
                if (!(value instanceof File)) return false;

                const isValid = value.size <= 1024 * 1024 * 10; // 10 MB
                console.log('File size:', value.size, 'Is valid:', isValid);
                return isValid;
            }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            filePdf: null
        },
        validationSchema: freeMaterialFormSchema,
        onSubmit: async (values, { resetForm }) => {
            await addFreeMaterial(values, resetForm);
        }
    });

    // Handle file change
    const onFilePdfChange = (event) => {
        const filePdf = event.target.files[0];
        console.log('📁 File change event:', event);
        console.log('📁 File selected:', filePdf);

        if (filePdf) {
            console.log('File details:', {
                name: filePdf.name,
                type: filePdf.type,
                size: filePdf.size
            });

            setSelectedFile(filePdf);

            // QUAN TRỌNG: Không gọi formik.handleChange
            // Chỉ set field value trực tiếp với File object
            formik.setFieldValue('filePdf', filePdf);

            // Clear validation errors
            formik.setFieldError('filePdf', undefined);

            console.log('✅ File set to formik:', filePdf);
        } else {
            setSelectedFile(null);
            formik.setFieldValue('filePdf', null);
        }
    };

    // Add free material function
    const addFreeMaterial = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addFreeMaterial with values:', values);
            console.log('🚀 Selected file:', selectedFile);

            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);

            if (selectedFile) {
                formData.append("filePdf", selectedFile, selectedFile.name);
                console.log('📎 PDF file appended to FormData');
            }

            console.log('📤 Sending request to server...');
            await FreeMaterialService.create(formData);
            console.log('✅ Free Material created successfully');

            retrieveFreeMaterials();

            // Reset form
            resetForm();
            setSelectedFile(null);

            // Reset file input
            const fileInput = document.getElementById('filePdf');
            if (fileInput) {
                fileInput.value = '';
            }

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm tài liệu miễn phí thành công', {
                autoClose: 1000,
            });

        } catch (error) {
            console.log('❌ Error creating free material:', error);
            let errorMessage = 'Lỗi khi thêm tài liệu miễn phí';

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
        const fileInput = document.getElementById('filePdf');
        if (fileInput) {
            fileInput.value = '';
        }
        if (onClose) {
            onClose();
        }
    };

    // Handle submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Handle submit called');
        console.log('Form values:', formik.values);
        console.log('Form errors:', formik.errors);
        console.log('Form isValid:', formik.isValid);
        console.log('Selected file:', selectedFile);

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                title: true,
                description: true,
                filePdf: true
            });
            return;
        }

        console.log('✅ Validation passed, submitting...');
        // Submit form
        await addFreeMaterial(formik.values, formik.resetForm);
    };

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start">
                <div className="form-group mb-3">
                    <label htmlFor="title" className="form-label">
                        Title<span className="required-field">*</span>
                    </label>
                    <input
                        name="title"
                        id="title"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.title && formik.errors.title ? 'is-invalid' : ''
                        }`}
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.title && formik.errors.title && (
                        <div className="error-feedback">{formik.errors.title}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="description" className="form-label">
                        Description
                    </label>
                    <input
                        name="description"
                        id="description"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.description && formik.errors.description ? 'is-invalid' : ''
                        }`}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.description && formik.errors.description && (
                        <div className="error-feedback">{formik.errors.description}</div>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="filePdf" className="form-label">
                        File PDF<span className="required-field">*</span>
                    </label>
                    <input
                        name="filePdf"
                        id="filePdf"
                        type="file"
                        accept="application/pdf"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.filePdf && formik.errors.filePdf ? 'is-invalid' : ''
                        }`}
                        onChange={onFilePdfChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.filePdf && formik.errors.filePdf && (
                        <div className="error-feedback">{formik.errors.filePdf}</div>
                    )}
                    {selectedFile && (
                        <small className="text-success d-block mt-1">
                            Đã chọn: {selectedFile.name}
                        </small>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
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
                    Close
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
                    {formik.isSubmitting ? 'Đang lưu...' : 'Save'}
                </button>
            </div>
        </>
    );
};

export default FreeMaterialAdd;