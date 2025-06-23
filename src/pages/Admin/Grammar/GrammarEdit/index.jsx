import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GrammarService from '../../../../services/grammarService';
import './style.css';

const GrammarEdit = ({ grammarId, retrieveGrammars, onClose }) => {
    const [grammar, setGrammar] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validation schema - Giống AddGrammar
    const grammarFormSchema = Yup.object().shape({
        grammarName: Yup
            .string()
            .required("Tên phải có giá trị.")
            .min(2, "Tên phải ít nhất 2 ký tự.")
            .max(50, "Tên có nhiều nhất 50 ký tự."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            grammarName: ''
        },
        validationSchema: grammarFormSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            await updateGrammar(values);
        }
    });

    // Get grammar data
    const getGrammar = async () => {
        try {
            setLoading(true);
            const data = await GrammarService.get(grammarId);

            // Set grammar data
            setGrammar(data);

            // Set form initial values
            formik.setValues({
                grammarName: data.grammarName || ''
            });
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi tải dữ liệu grammar', {
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Load grammar data on component mount
    useEffect(() => {
        if (grammarId) {
            getGrammar();
        }
    }, [grammarId]);

    // Update grammar
    const updateGrammar = async (values) => {
        try {
            console.log('🚀 Starting updateGrammar with values:', values);
            
            const formData = new FormData();
            formData.append("grammarName", values.grammarName);

            console.log('📤 Sending update request to server...');
            await GrammarService.update(grammarId, formData);
            console.log('✅ Grammar updated successfully');
            
            retrieveGrammars();

            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Chỉnh sửa ngữ pháp thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error updating grammar:', error);
            let errorMessage = 'Có lỗi xảy ra khi cập nhật ngữ pháp';

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

    // Handle submit function - Giống AddGrammar
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
                grammarName: true
            });
            return;
        }

        console.log('✅ Validation passed, submitting...');
        // Submit form
        await updateGrammar(formik.values);
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

    if (!grammar) {
        return (
            <div className="text-center py-4">
                <p className="text-danger">Không thể tải dữ liệu grammar</p>
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
                    <label htmlFor="grammarName" className="form-label">
                        Grammar Name<span className="required-field">*</span>
                    </label>
                    <input
                        name="grammarName"
                        id="grammarName"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.grammarName && formik.errors.grammarName ? 'is-invalid' : ''
                        }`}
                        value={formik.values.grammarName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.grammarName && formik.errors.grammarName && (
                        <div className="error-feedback">{formik.errors.grammarName}</div>
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

export default GrammarEdit;