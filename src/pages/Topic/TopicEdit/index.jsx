import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopicService from '../../../services/topicService';
import './style.css';

const EditTopic = ({ topicId, retrieveTopics, onClose }) => {
    const [topic, setTopic] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validation schema - Giống TopicAdd
    const topicFormSchema = Yup.object().shape({
        topicName: Yup
            .string()
            .required("Tên phải có giá trị.")
            .min(2, "Tên phải ít nhất 2 ký tự.")
            .max(50, "Tên có nhiều nhất 50 ký tự."),
        image: Yup
            .mixed()
            .nullable()
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                // Nếu không có file thì pass validation (cho edit)
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
            .test("fileSize", "Tệp ảnh quá lớn (tối đa 1MB)", (value) => {
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
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateTopic(values);
        }
    });

    // Get topic data
    const getTopic = async () => {
        try {
            setLoading(true);
            const data = await TopicService.get(topicId);

            // Set topic data
            setTopic(data);

            // Set form initial values
            formik.setValues({
                topicName: data.topicName || '',
                image: null // Start with null image to not update image if no changes
            });
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi tải dữ liệu topic', {
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Load topic data on component mount
    useEffect(() => {
        if (topicId) {
            getTopic();
        }
    }, [topicId]);

    // Handle file change - Giống TopicAdd
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
            
            // QUAN TRỌNG: Chỉ set field value trực tiếp với File object
            formik.setFieldValue('image', file);

            // Clear previous validation errors
            formik.setFieldError('image', undefined);
            
            console.log('✅ File set to formik:', file);
        } else {
            setSelectedFile(null);
            formik.setFieldValue('image', null);
        }
    };

    // Update topic
    const updateTopic = async (values) => {
        try {
            console.log('🚀 Starting updateTopic with values:', values);
            console.log('🚀 Selected file:', selectedFile);
            
            const formData = new FormData();
            formData.append("topicName", values.topicName);

            // Only append image if a new file was selected
            if (selectedFile) {
                formData.append("image", selectedFile, selectedFile.name);
                console.log('📎 Image appended to FormData');
            }

            console.log('📤 Sending update request to server...');
            await TopicService.update(topicId, formData);
            console.log('✅ Topic updated successfully');
            
            retrieveTopics();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa chủ đề thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error updating topic:', error);
            let errorMessage = 'Có lỗi xảy ra khi cập nhật topic';

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

    // Handle submit function - Giống TopicAdd
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
                topicName: true,
                image: true
            });
            return;
        }

        console.log('✅ Validation passed, submitting...');
        // Submit form
        await updateTopic(formik.values);
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

    if (!topic) {
        return (
            <div className="text-center py-4">
                <p className="text-danger">Không thể tải dữ liệu topic</p>
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
                        Image
                    </label>
                    <input
                        name="image"
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.image && formik.errors.image ? 'is-invalid' : ''
                        }`}
                        onChange={onFileChange} // Chỉ gọi onFileChange, KHÔNG gọi formik.handleChange
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.image && formik.errors.image && (
                        <div className="error-feedback">{formik.errors.image}</div>
                    )}
                    {topic.image && !selectedFile && (
                        <small className="text-muted d-block mt-1">
                            Ảnh hiện tại: {topic.image}
                        </small>
                    )}
                    {selectedFile && (
                        <small className="text-success d-block mt-1">
                            Ảnh mới: {selectedFile.name}
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

export default EditTopic;