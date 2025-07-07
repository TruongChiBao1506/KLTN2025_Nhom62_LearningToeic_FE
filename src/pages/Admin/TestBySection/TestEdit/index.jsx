import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TestService from '../../../../services/testService';
import './style.css';

const TestEdit = ({ testId, sectionId, retrieveTests, onClose }) => {
    const [test, setTest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Validation schema
    const testFormSchema = Yup.object().shape({
        testName: Yup
            .string()
            .required("Tên bài kiểm tra phải có giá trị.")
            .min(2, "Tên bài kiểm tra phải ít nhất 2 ký tự.")
            .max(100, "Tên bài kiểm tra có nhiều nhất 100 ký tự."),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            testName: ''
        },
        validationSchema: testFormSchema,
        enableReinitialize: true, // Important: Allow form to reinitialize when test data loads
        onSubmit: async (values, { resetForm }) => {
            await updateTest(values, resetForm);
        }
    });

    // Get test data
    const getTest = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Fetching test with ID:', testId);
            
            const data = await TestService.get(testId);
            console.log('📄 Test data received:', data);
            
            setTest(data);
            
            // Update formik values
            formik.setValues({
                testName: data.testName || ''
            });
            
            console.log('  Test data loaded successfully');
            
        } catch (error) {
            console.log('❌ Error fetching test:', error);
            toast.error('Lỗi khi tải dữ liệu bài kiểm tra', {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Update test function
    const updateTest = async (values, resetForm) => {
        try {
            console.log('🚀 Starting updateTest with values:', values);
            console.log('🚀 Test ID:', testId);
            console.log('🚀 Section ID:', sectionId);
            
            const updateData = {
                testName: values.testName,
                sectionId: sectionId
            };
            
            console.log('📤 Sending update request to server...');
            await TestService.update(testId, updateData);
            console.log('  Test updated successfully');
            
            retrieveTests();
            
            // Close modal
            if (onClose) {
                onClose();
            }
            
            toast.success('Chỉnh sửa bài kiểm tra thành công', {
                autoClose: 1000,
            });
            
        } catch (error) {
            console.log('❌ Error updating test:', error);
            let errorMessage = 'Lỗi khi chỉnh sửa bài kiểm tra';
            
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

        // Validate form
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            console.log('❌ Form has validation errors:', errors);
            formik.setTouched({
                testName: true
            });
            return;
        }

        console.log('  Validation passed, submitting...');
        // Submit form
        await updateTest(formik.values, formik.resetForm);
    };

    // Load test data when component mounts or testId changes
    useEffect(() => {
        if (testId) {
            getTest();
        }
    }, [testId]);

    // Show loading while fetching test data
    if (isLoading) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu bài kiểm tra...</p>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Đóng
                    </button>
                </div>
            </>
        );
    }

    // Show error if test not found
    if (!test) {
        return (
            <>
                <div className="modal-body text-center">
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Không thể tải dữ liệu bài kiểm tra
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
                </div>
            </>
        );
    }

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start p-4">
                <div className="form-group mb-3">
                    <label htmlFor="edit-testName" className="form-label">
                        Test Name<span className="required-field">*</span>
                    </label>
                    <input
                        name="testName"
                        id="edit-testName"
                        type="text"
                        className={`form-control border-secondary custom-font ${
                            formik.touched.testName && formik.errors.testName ? 'is-invalid' : ''
                        }`}
                        value={formik.values.testName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập tên bài kiểm tra..."
                    />
                    {formik.touched.testName && formik.errors.testName && (
                        <div className="error-feedback">{formik.errors.testName}</div>
                    )}
                </div>
            </div>

            {/* Modal Footer */}
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
                    disabled={formik.isSubmitting || isLoading}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }}
                >
                    {formik.isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang lưu...
                        </>
                    ) : (
                        'Lưu'
                    )}
                </button>
            </div>
        </>
    );
};

export default TestEdit;