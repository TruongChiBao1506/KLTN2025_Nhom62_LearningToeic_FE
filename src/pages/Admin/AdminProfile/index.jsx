import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

import UserService from '../../../services/userService';
import ProfileImageService from '../../../services/profileImageService';
import '../../../assets/breadcrumb.css';
import './style.css';

const Profile = () => {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [showProfilePage, setShowProfilePage] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        document.title = "Admin - Profile";
    }, []);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    // Validation schemas
    const userFormSchema = Yup.object().shape({
        address: Yup.string().required("Địa chỉ không được để trống."),
        phoneNumber: Yup
            .string()
            .required("Số điện thoại không được để trống.")
            .matches(/^\d{10}$/, "Số điện thoại phải có đúng 10 chữ số."),
        gender: Yup.string().required("Giới tính phải được chọn."),
    });

    const profileImageFormSchema = Yup.object().shape({
        image: Yup
            .mixed()
            .test("fileType", "Chỉ chấp nhận tệp ảnh jpeg, png hoặc gif", (value) => {
                if (!value) return true;
                const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
                return allowedFormats.includes(value.type);
            })
            .test("fileSize", "Tệp ảnh quá lớn", (value) => {
                if (!value) return true;
                return value.size <= 1024 * 1024; // 1 MB
            }),
    });

    const passwordFormSchema = Yup.object().shape({
        oldPassWord: Yup.string().required("Mật khẩu cũ không được để trống."),
        newPassWord: Yup.string().required("Mật khẩu mới không được để trống."),
    });

    // Formik for profile update
    const profileFormik = useFormik({
        initialValues: {
            username: '',
            email: '',
            address: '',
            phoneNumber: '',
            gender: ''
        },
        validationSchema: userFormSchema,
        onSubmit: async (values) => {
            try {
                await UserService.update(userId, values);
                getUserById();
                toast.success('Chỉnh sửa thông tin cá nhân thành công', {
                    autoClose: 2000
                });
            } catch (error) {
                console.log(error);
                const jsonResponse = JSON.parse(error.request.response);
                toast.error(jsonResponse.message, {
                    autoClose: 2000,
                    position: 'top-right',
                });
            }
        }
    });

    // Formik for password change
    const passwordFormik = useFormik({
        initialValues: {
            oldPassWord: '',
            newPassWord: ''
        },
        validationSchema: passwordFormSchema,
        onSubmit: async (values) => {
            try {
                await UserService.changePassword(userId, values);
                getUserById();
                toast.success('Đổi mật khẩu thành công', {
                    autoClose: 2000
                });
                passwordFormik.resetForm();
            } catch (error) {
                console.log(error);
                const jsonResponse = JSON.parse(error.request.response);
                toast.error(jsonResponse.message, {
                    autoClose: 2000,
                    position: 'top-right',
                });
            }
        }
    });

    const getUserById = async () => {
        try {
            setIsLoading(true);
            const adminToken = localStorage.getItem("adminToken");
            const decoded = jwtDecode(adminToken);
            const username = decoded.username;
            const userIdResult = await UserService.getUserIdByUsername(username);
            setUserId(userIdResult.userId);

            const data = await UserService.getUserById(userIdResult.userId);
            console.log(data);

            // Update formik values
            profileFormik.setValues({
                username: data.username,
                email: data.email,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender
            });

            setUser(data);
            setProfileImage(data.image);
            console.log(data.image);

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (imageName) => {
        if (imageName) {
            return `http://localhost:9004/images/${imageName}`;
        }
        return "http://localhost:9004/images/anhdaidienmacdinh.jpg";
    };

    const onFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await profileImageFormSchema.validate({ image: file });

                // Create preview
                const reader = new FileReader();
                reader.onload = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);

                updateProfileImage(file);
            } catch (error) {
                console.log('Validation error: The selected file is not valid.');
                toast.error(error.message);
            }
        }
    };

    const updateProfileImage = async (file) => {
        try {
            const formData = new FormData();
            if (file) {
                formData.append("image", file, file.name);
            }
            await ProfileImageService.update(userId, formData);
            getUserById();
            toast.success('Upload ảnh đại diện thành công', {
                autoClose: 2000,
            });
        } catch (error) {
            console.log(error);
            const jsonResponse = JSON.parse(error.request.response);
            toast.error(jsonResponse.message, {
                autoClose: 2000,
                position: 'top-right',
            });
        }
    };

    useEffect(() => {
        getUserById();
    }, []);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li className="current">
                            <FontAwesomeIcon icon={faUserCircle} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Profile
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
            >
                {isLoading ? (
                    <div
                        className="text-center py-5"
                        data-aos="zoom-in"
                        data-aos-duration="600"
                    >
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Đang tải thông tin profile...</p>
                    </div>
                ) : (
                    <div className="profile-container">
                        <div className="profile-wrapper">
                            <div className="profile-header">
                                <h1 className="profile-title">
                                    <i className="fas fa-user-circle me-3"></i>
                                    Hồ Sơ Cá Nhân
                                </h1>
                                <p className="profile-subtitle">Quản lý thông tin tài khoản của bạn</p>
                            </div>

                            <div className="profile-card">
                                <div className="profile-content">
                                    {/* Avatar Section */}
                                    <div className="avatar-section">
                                        <div className="avatar-container">
                                            <div className="avatar-wrapper">
                                                <img
                                                    className="avatar-image"
                                                    src={imagePreview || getImageUrl(profileImage)}
                                                    alt="Profile Avatar"
                                                />
                                            </div>
                                            <div className="avatar-info">
                                                <h3 className="username">{profileFormik.values.username}</h3>
                                                <p className="user-role">Administrator</p>
                                                <div className="upload-section">
                                                    <label htmlFor="fileInput" className="upload-btn">
                                                        <i className="fas fa-upload me-2"></i>
                                                        Tải ảnh lên
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="fileInput"
                                                        ref={fileInputRef}
                                                        className="file-input"
                                                        onChange={onFileChange}
                                                        accept="image/*"
                                                    />
                                                    <span className="upload-hint">JPG, PNG, GIF (Max 1MB)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs and Forms Section */}
                                    <div className="forms-section">
                                        {/* Tab Navigation */}
                                        <div className="tab-navigation">
                                            <button
                                                type="button"
                                                className={`tab-btn ${showProfilePage ? 'active' : ''}`}
                                                onClick={() => setShowProfilePage(true)}
                                            >
                                                <i className="fas fa-user me-2"></i>
                                                Thông tin chung
                                            </button>
                                            <button
                                                type="button"
                                                className={`tab-btn ${!showProfilePage ? 'active' : ''}`}
                                                onClick={() => setShowProfilePage(false)}
                                            >
                                                <i className="fas fa-lock me-2"></i>
                                                Đổi mật khẩu
                                            </button>
                                        </div>

                                        {/* Profile Form */}
                                        {showProfilePage && (
                                            <div className="form-container">
                                                <form onSubmit={profileFormik.handleSubmit} className="profile-form">
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-user me-2"></i>
                                                                Tên đăng nhập
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                className="form-input disabled"
                                                                value={profileFormik.values.username}
                                                                disabled
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-envelope me-2"></i>
                                                                Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                className="form-input disabled"
                                                                value={profileFormik.values.email}
                                                                disabled
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-venus-mars me-2"></i>
                                                                Giới tính
                                                            </label>
                                                            <select
                                                                name="gender"
                                                                className={`form-input ${profileFormik.touched.gender && profileFormik.errors.gender ? 'error' : ''}`}
                                                                value={profileFormik.values.gender}
                                                                onChange={profileFormik.handleChange}
                                                                onBlur={profileFormik.handleBlur}
                                                            >
                                                                <option value="" disabled>Chọn giới tính</option>
                                                                <option value="0">Nam</option>
                                                                <option value="1">Nữ</option>
                                                            </select>
                                                            {profileFormik.touched.gender && profileFormik.errors.gender && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {profileFormik.errors.gender}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-phone me-2"></i>
                                                                Số điện thoại
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="phoneNumber"
                                                                className={`form-input ${profileFormik.touched.phoneNumber && profileFormik.errors.phoneNumber ? 'error' : ''}`}
                                                                value={profileFormik.values.phoneNumber}
                                                                onChange={profileFormik.handleChange}
                                                                onBlur={profileFormik.handleBlur}
                                                                placeholder="Nhập số điện thoại"
                                                            />
                                                            {profileFormik.touched.phoneNumber && profileFormik.errors.phoneNumber && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {profileFormik.errors.phoneNumber}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group full-width">
                                                            <label className="form-label">
                                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                                Địa chỉ
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="address"
                                                                className={`form-input ${profileFormik.touched.address && profileFormik.errors.address ? 'error' : ''}`}
                                                                value={profileFormik.values.address}
                                                                onChange={profileFormik.handleChange}
                                                                onBlur={profileFormik.handleBlur}
                                                                placeholder="Nhập địa chỉ"
                                                            />
                                                            {profileFormik.touched.address && profileFormik.errors.address && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {profileFormik.errors.address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-actions">
                                                        <button type="submit" className="submit-btn">
                                                            <i className="fas fa-save me-2"></i>
                                                            Cập nhật thông tin
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Password Change Form */}
                                        {!showProfilePage && (
                                            <div className="form-container">
                                                <form onSubmit={passwordFormik.handleSubmit} className="password-form">
                                                    <div className="form-grid single-column">
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-key me-2"></i>
                                                                Mật khẩu hiện tại
                                                            </label>
                                                            <input
                                                                type="password"
                                                                name="oldPassWord"
                                                                className={`form-input ${passwordFormik.touched.oldPassWord && passwordFormik.errors.oldPassWord ? 'error' : ''}`}
                                                                placeholder="Nhập mật khẩu hiện tại"
                                                                value={passwordFormik.values.oldPassWord}
                                                                onChange={passwordFormik.handleChange}
                                                                onBlur={passwordFormik.handleBlur}
                                                            />
                                                            {passwordFormik.touched.oldPassWord && passwordFormik.errors.oldPassWord && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {passwordFormik.errors.oldPassWord}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-lock me-2"></i>
                                                                Mật khẩu mới
                                                            </label>
                                                            <input
                                                                type="password"
                                                                name="newPassWord"
                                                                className={`form-input ${passwordFormik.touched.newPassWord && passwordFormik.errors.newPassWord ? 'error' : ''}`}
                                                                placeholder="Nhập mật khẩu mới"
                                                                value={passwordFormik.values.newPassWord}
                                                                onChange={passwordFormik.handleChange}
                                                                onBlur={passwordFormik.handleBlur}
                                                            />
                                                            {passwordFormik.touched.newPassWord && passwordFormik.errors.newPassWord && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {passwordFormik.errors.newPassWord}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-actions">
                                                        <button type="submit" className="submit-btn danger">
                                                            <i className="fas fa-shield-alt me-2"></i>
                                                            Đổi mật khẩu
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;