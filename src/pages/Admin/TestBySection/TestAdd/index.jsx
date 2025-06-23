import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import TestService from '../../../../services/testService';
import './style.css';

const TestAdd = ({ sectionId, retrieveTests, onClose }) => {
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
        onSubmit: async (values, { resetForm }) => {
            await addTest(values, resetForm);
        }
    });

    const addTest = async (values, resetForm) => {
        try {
            console.log('🚀 Starting addTest with values:', values);
            console.log('🚀 Section ID:', sectionId);

            const testData = {
                testName: values.testName
            };

            console.log('📤 Sending request to server...');
            await TestService.create(sectionId, testData);
            console.log('✅ Test created successfully');
            
            retrieveTests();
            
            // Reset form
            resetForm();
            
            // Close modal
            if (onClose) {
                onClose();
            }

            toast.success('Thêm bài kiểm tra thành công', {
                autoClose: 1000,
            });
        } catch (error) {
            console.log('❌ Error creating test:', error);
            let errorMessage = 'Lỗi khi thêm bài kiểm tra';
            
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

        console.log('✅ Validation passed, submitting...');
        // Submit form
        await addTest(formik.values, formik.resetForm);
    };

    return (
        <>
            {/* Modal Body */}
            <div className="modal-body text-start">
                <div className="form-group mb-3">
                    <label htmlFor="testName" className="form-label">
                        Test Name<span className="required-field">*</span>
                    </label>
                    <input
                        name="testName"
                        type="text"
                        id="testName"
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

                {/* Display section info */}
                <div className="alert alert-info">
                    <small>
                        <strong>📋 Section ID:</strong> {sectionId}
                    </small>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleClose}
                >
                    Đóng
                </button>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    disabled={formik.isSubmitting}
                    onClick={handleSubmit}
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

export default TestAdd;