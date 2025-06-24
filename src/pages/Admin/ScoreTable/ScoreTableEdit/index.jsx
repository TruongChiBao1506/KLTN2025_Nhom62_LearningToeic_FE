// ✅ Create src/components/Admin/ScoreTableEdit/index.jsx
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ScoreTableService from '../../../../services/scoreTableService';
import './style.css';

const ScoreTableEdit = ({ scoreTableId, getTableScores, onClose }) => {
    const [tableScore, setTableScore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Validation schema
    const tableScoreFormSchema = Yup.object().shape({
        score: Yup
            .string()
            .required("Điểm phải có giá trị.")
            .matches(/^\d+$/, "Điểm phải là số nguyên dương")
    });

    // ✅ Formik form handling
    const formik = useFormik({
        initialValues: {
            score: ''
        },
        validationSchema: tableScoreFormSchema,
        onSubmit: async (values) => {
            await updateScore(values);
        }
    });

    // ✅ Get score data
    const getScore = async () => {
        try {
            setIsLoading(true);
            console.log('Getting score with ID:', scoreTableId);
            
            const data = await ScoreTableService.get(scoreTableId);
            console.log('Score data:', data);
            
            setTableScore(data);
            
            // ✅ Set form values
            formik.setValues({
                score: data.score || ''
            });
            
        } catch (error) {
            console.log('Error getting score:', error);
            toast.error('Lỗi khi tải dữ liệu điểm', {
                autoClose: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Update score
    const updateScore = async (values) => {
        try {
            setIsLoading(true);
            console.log('Updating score:', values.score);
            
            // ✅ Create JSON data (not FormData like Vue version)
            const scoreData = {
                score: parseInt(values.score, 10) // Convert to number
            };
            
            await ScoreTableService.update(scoreTableId, scoreData);
            
            // ✅ Refresh score list
            if (getTableScores) {
                getTableScores();
            }
            
            // ✅ Close modal
            if (onClose) {
                onClose();
            }
            
            toast.success('Chỉnh sửa điểm thành công', {
                autoClose: 2000,
            });
            
        } catch (error) {
            console.log('Error updating score:', error);
            
            let errorMessage = 'Lỗi khi cập nhật điểm';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage, {
                autoClose: 2000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Load score data on component mount
    useEffect(() => {
        if (scoreTableId) {
            getScore();
        }
    }, [scoreTableId]);

    if (!tableScore && !isLoading) {
        return (
            <div className="text-center py-4">
                <p className="text-muted">Không tìm thấy dữ liệu điểm</p>
            </div>
        );
    }

    return (
        <div>
            {isLoading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body text-start">
                        <div className="form-group mb-3">
                            <label className="form-label">
                                Score<span className="required-field">*</span>
                            </label>
                            <input
                                name="score"
                                type="number"
                                className={`form-control border-secondary custom-font ${
                                    formik.touched.score && formik.errors.score ? 'is-invalid' : ''
                                }`}
                                value={formik.values.score}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Nhập điểm số"
                            />
                            {formik.touched.score && formik.errors.score && (
                                <div className="error-feedback">
                                    {formik.errors.score}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !formik.isValid}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ScoreTableEdit;