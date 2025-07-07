import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FreeMaterialService from '../../../../services/freeMaterialService';
import './style.css';

const EditFreeMaterial = ({ materialId, retrieveFreeMaterials, onClose }) => {
    const [freeMaterial, setFreeMaterial] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validation schema - Giống EditTopic nhưng cho PDF
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
            .test("fileType", "Only accept PDF files", (value) => {
                // Nếu không có file thì pass validation (cho edit)
                if (!value) return true;

                // Nếu không phải File object thì pass (có thể là string path)
                if (!(value instanceof File)) {
                    console.log('Not a File object, skipping validation');
                    return true;
                }
                
                const isValid = value.type === "application/pdf";
                console.log('File type:', value.type, 'Is valid:', isValid);
                return isValid;
            })
            .test("fileSize", "File is too large (max 10MB)", (value) => {
                // Nếu không có file thì pass
                if (!value) return true;

                // Nếu không phải File object thì pass
                if (!(value instanceof File)) return true;

                // Check size chỉ khi là File object
                const isValid = value.size <= 1024 * 1024 * 10; // 10MB
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
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateFreeMaterial(values);
        }
    });

    // Get free material data
    const getFreeMaterial = async () => {
        try {
            setLoading(true);
            const data = await FreeMaterialService.get(materialId);

            // Set free material data
            setFreeMaterial(data);

            // Set form initial values
            formik.setValues({
                title: data.title || '',
                description: data.description || '',
                filePdf: null // Start with null file to not update file if no changes
            });
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi tải dữ liệu free material', {
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Load free material data on component mount
    useEffect(() => {
        if (materialId) {
            getFreeMaterial();
        }
    }, [materialId]);

    // Handle file change - Giống EditTopic nhưng cho PDF
    const onFilePdfChange = (event) => {
        const filePdf = event.target.files[0];
        console.log('📁 PDF file selected:', filePdf);

        if (filePdf) {
            console.log('File details:', {
                name: filePdf.name,
                type: filePdf.type,
                size: filePdf.size
            });

            setSelectedFile(filePdf);
            
            // QUAN TRỌNG: Chỉ set field value trực tiếp với File object
            formik.setFieldValue('filePdf', filePdf);

            // Clear previous validation errors
            formik.setFieldError('filePdf', undefined);
            
            console.log('  PDF file set to formik:', filePdf);
        } else {
            setSelectedFile(null);
            formik.setFieldValue('filePdf', null);
        }
    };

    // Update free material
    const updateFreeMaterial = async (values) => {
        try {
            console.log('🚀 Starting updateFreeMaterial with values:', values);
            console.log('🚀 Selected file:', selectedFile);
            
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);

            // Only append PDF file if a new file was selected
            if (selectedFile) {
                formData.append("filePdf", selectedFile, selectedFile.name);
                console.log('📎 PDF file appended to FormData');
            }

            console.log('📤 Sending update request to server...');
            await FreeMaterialService.update(materialId, formData);
            console.log('  Free Material updated successfully');
            
            retrieveFreeMaterials();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa Free Material thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error updating free material:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa Free Material';

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

    // Handle submit function - Giống EditTopic
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

        console.log('  Validation passed, submitting...');
        // Submit form
        await updateFreeMaterial(formik.values);
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

    if (!freeMaterial) {
        return (
            <div className="text-center py-4">
                <p className="text-danger">Không thể tải dữ liệu free material</p>
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
                        onChange={onFilePdfChange} // Chỉ gọi onFilePdfChange, KHÔNG gọi formik.handleChange
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.filePdf && formik.errors.filePdf && (
                        <div className="error-feedback">{formik.errors.filePdf}</div>
                    )}
                    {freeMaterial.fileName && !selectedFile && (
                        <small className="text-muted d-block mt-1">
                            File hiện tại: {freeMaterial.fileName}
                        </small>
                    )}
                    {selectedFile && (
                        <small className="text-success d-block mt-1">
                            File mới: {selectedFile.name}
                        </small>
                    )}
                </div>
            </div>

            {/* Modal Footer - Tách riêng khỏi form */}
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary rounded-5"
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
                    className="btn btn-primary rounded-5"
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

export default EditFreeMaterial;