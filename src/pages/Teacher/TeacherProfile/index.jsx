import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

import UserService from '../../../services/userService';
import ProfileImageService from '../../../services/profileImageService';
import authService from '../../../services/authService';
import '../../../assets/breadcrumb.css';
import '../../Admin/AdminProfile/style.css'; // Sử dụng chung CSS với AdminProfile

const TeacherProfile = () => {
    const [userId, setUserId] = useState(null);
    const [, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [showProfilePage, setShowProfilePage] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        document.title = "Teacher - Profile";
    }, []);

    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    // Validation schemas (same as AdminProfile)
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
        currentPassword: Yup.string().required("Mật khẩu hiện tại không được để trống."),
        newPassword: Yup.string()
            .required("Mật khẩu mới không được để trống.")
            .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
        confirmPassword: Yup.string()
            .required("Xác nhận mật khẩu không được để trống.")
            .oneOf([Yup.ref('newPassword'), null], "Xác nhận mật khẩu không khớp với mật khẩu mới.")
    });

    // Formik configurations
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

    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: passwordFormSchema,
        onSubmit: async (values) => {
            try {
                await authService.changePassword(
                    values.currentPassword,
                    values.newPassword
                );
                getUserById();
                toast.success('Đổi mật khẩu thành công', {
                    autoClose: 2000
                });
                passwordFormik.resetForm();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
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
            // ✅ Sử dụng sessionStorage thay vì localStorage
            const teacherToken = sessionStorage.getItem("teacherToken");
            if (!teacherToken) {
                toast.error("Không tìm thấy token teacher. Vui lòng đăng nhập lại.");
                return;
            }
            
            const decoded = jwtDecode(teacherToken);
            const username = decoded.username || decoded.name;
            const userIdResult = await UserService.getUserIdByUsername(username);
            setUserId(userIdResult.userId);

            const data = await UserService.getUserById(userIdResult.userId);
            console.log('👤 Teacher data received:', data);
            
            const imageUrl = data.profileImage || data.profileImageUrl || data.image;
            console.log('📷 Profile image URL:', imageUrl);

            profileFormik.setValues({
                username: data.username,
                email: data.email,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender
            });

            setUser(data);
            setProfileImage(imageUrl);

        } catch (error) {
            console.log(error);
            toast.error("Lỗi khi tải thông tin profile");
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (imageName) => {
        if (imageName) {
            if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
                return imageName;
            }
            return `http://localhost:5000/images/${imageName}`;
        }
        return "https://media.istockphoto.com/id/1223671392/vi/vec-to/%E1%BA%A3nh-h%E1%BB%93-s%C6%A1-m%E1%BA%B7c-%C4%91%E1%BB%8Bnh-h%C3%ACnh-%C4%91%E1%BA%A1i-di%E1%BB%87n-ch%E1%BB%97-d%C3%A0nh-s%E1%BA%B5n-cho-%E1%BA%A3nh-minh-h%E1%BB%8Da-vect%C6%A1.jpg?s=612x612&w=0&k=20&c=l9x3h9RMD16-z4kNjo3z7DXVEORzkxKCMn2IVwn9liI=";
    };

    const onFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await profileImageFormSchema.validate({ image: file });

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
                formData.append("profileImage", file, file.name);
            }
            await ProfileImageService.update(userId, formData);
            
            await getUserById();
            setImagePreview(null);
            
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

    // Password visibility toggle functions
    const toggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(prev => !prev);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(prev => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev);
    };

    useEffect(() => {
        getUserById();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            <div
                className="mt-2 shadow-lg rounded-4 px-2 py-1"
                style={{
                    background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                    minHeight: 70,
                    border: 'none'
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
                        <li className="current d-flex align-items-center">
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                }}
                            >
                                <FontAwesomeIcon icon={faUserCircle} color="var(--color-bg-primary)" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 22 }}>
                                Teacher Profile
                            </span>
                        </li>
                    </ol>
                </nav>
            </div>

            <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
                {isLoading ? (
                    <div className="text-center py-5" data-aos="zoom-in" data-aos-duration="600">
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
                                    Hồ Sơ Giáo Viên
                                </h1>
                                <p className="profile-subtitle">Quản lý thông tin tài khoản giáo viên của bạn</p>
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
                                                <p className="user-role">Teacher</p>
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

                                    {/* Forms Section */}
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
                                                        {/* Current Password */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-key me-2"></i>
                                                                Mật khẩu hiện tại
                                                            </label>
                                                            <div className="password-input-wrapper">
                                                                <input
                                                                    type={showCurrentPassword ? "text" : "password"}
                                                                    name="currentPassword"
                                                                    className={`form-input password-input ${passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? 'error' : ''}`}
                                                                    placeholder="Nhập mật khẩu hiện tại"
                                                                    value={passwordFormik.values.currentPassword}
                                                                    onChange={passwordFormik.handleChange}
                                                                    onBlur={passwordFormik.handleBlur}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="password-toggle"
                                                                    onClick={toggleCurrentPasswordVisibility}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={showCurrentPassword ? faEyeSlash : faEye}
                                                                    />
                                                                </button>
                                                            </div>
                                                            {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {passwordFormik.errors.currentPassword}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* New Password */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-lock me-2"></i>
                                                                Mật khẩu mới
                                                            </label>
                                                            <div className="password-input-wrapper">
                                                                <input
                                                                    type={showNewPassword ? "text" : "password"}
                                                                    name="newPassword"
                                                                    className={`form-input password-input ${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? 'error' : ''}`}
                                                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                                                    value={passwordFormik.values.newPassword}
                                                                    onChange={passwordFormik.handleChange}
                                                                    onBlur={passwordFormik.handleBlur}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="password-toggle"
                                                                    onClick={toggleNewPasswordVisibility}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={showNewPassword ? faEyeSlash : faEye}
                                                                    />
                                                                </button>
                                                            </div>
                                                            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {passwordFormik.errors.newPassword}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Confirm Password */}
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                <i className="fas fa-shield-alt me-2"></i>
                                                                Xác nhận mật khẩu mới
                                                            </label>
                                                            <div className="password-input-wrapper">
                                                                <input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    name="confirmPassword"
                                                                    className={`form-input password-input ${passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'error' : ''}`}
                                                                    placeholder="Nhập lại mật khẩu mới"
                                                                    value={passwordFormik.values.confirmPassword}
                                                                    onChange={passwordFormik.handleChange}
                                                                    onBlur={passwordFormik.handleBlur}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="password-toggle"
                                                                    onClick={toggleConfirmPasswordVisibility}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={showConfirmPassword ? faEyeSlash : faEye}
                                                                    />
                                                                </button>
                                                            </div>
                                                            {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                                                                <div className="error-message">
                                                                    <i className="fas fa-exclamation-circle me-1"></i>
                                                                    {passwordFormik.errors.confirmPassword}
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

export default TeacherProfile;