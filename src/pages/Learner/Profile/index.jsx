import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUser,
  faEdit,
  faSave,
  faTimes,
  faKey,
  faCamera,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import userService from "../../../services/userService";
import "./style.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editedUser, setEditedUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bio: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "Hồ sơ cá nhân | TOEIC Learning Platform";
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      setUser(response.user);
      setEditedUser({
        fullName: response.user.fullName || "",
        email: response.user.email || "",
        phone: response.user.phone || "",
        dateOfBirth: response.user.dateOfBirth
          ? new Date(response.user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: response.user.gender || "",
        address: response.user.address || "",
        bio: response.user.bio || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải thông tin hồ sơ:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editedUser.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!editedUser.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(editedUser.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      editedUser.phone &&
      !/^[0-9]{10,11}$/.test(editedUser.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await userService.updateProfile(editedUser);

      // Handle profile image upload if changed
      if (profileImage) {
        await userService.uploadProfileImage(profileImage);
      }

      setEditMode(false);
      setSuccessMessage("Cập nhật hồ sơ thành công!");
      fetchUserProfile();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      setErrors({
        general: "Có lỗi khi cập nhật hồ sơ. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setChangePasswordMode(false);
      setSuccessMessage("Mật khẩu đã được cập nhật thành công!");

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi thay đổi mật khẩu:", error);
      setErrors({
        general:
          "Có lỗi khi thay đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setImagePreview(null);
    setProfileImage(null);

    // Reset form to original values
    if (user) {
      setEditedUser({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        address: user.address || "",
        bio: user.bio || "",
      });
    }
  };

  return (
    <div className="profile-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/learner/dashboard">
                <FontAwesomeIcon icon={faHouse} className="me-2" />
                Trang chủ
              </Link>
            </li>
            <li className="breadcrumb-item active">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Hồ sơ cá nhân
            </li>
          </ol>
        </nav>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="alert alert-danger" role="alert">
          {errors.general}
        </div>
      )}

      {loading && !user ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin hồ sơ...</p>
        </div>
      ) : (
        <div className="row">
          {/* Left Column - User Info */}
          <div className="col-md-4">
            <div className="profile-card">
              <div className="profile-card-header">
                <h5>Thông tin cá nhân</h5>
                {!editMode && !changePasswordMode && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setEditMode(true)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="profile-card-body">
                <div className="profile-image-container">
                  {editMode ? (
                    <div className="edit-profile-image">
                      <img
                        src={
                          imagePreview ||
                          user.profileImage ||
                          "/assets/images/default-avatar.png"
                        }
                        alt="Ảnh đại diện"
                        className="profile-image"
                      />
                      <div className="image-upload">
                        <label
                          htmlFor="profile-image-upload"
                          className="image-upload-label"
                        >
                          <FontAwesomeIcon icon={faCamera} />
                        </label>
                        <input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={
                        user.profileImage || "/assets/images/default-avatar.png"
                      }
                      alt="Ảnh đại diện"
                      className="profile-image"
                    />
                  )}
                </div>

                {!editMode ? (
                  <div className="profile-info">
                    <h4>{user.fullName}</h4>
                    <p className="text-muted">{user.email}</p>

                    <div className="profile-details">
                      <div className="profile-detail-item">
                        <span className="detail-label">Số điện thoại:</span>
                        <span className="detail-value">
                          {user.phone || "Chưa cung cấp"}
                        </span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="detail-label">Ngày sinh:</span>
                        <span className="detail-value">
                          {user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Chưa cung cấp"}
                        </span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="detail-label">Giới tính:</span>
                        <span className="detail-value">
                          {user.gender === "male"
                            ? "Nam"
                            : user.gender === "female"
                            ? "Nữ"
                            : user.gender === "other"
                            ? "Khác"
                            : "Chưa cung cấp"}
                        </span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="detail-label">Địa chỉ:</span>
                        <span className="detail-value">
                          {user.address || "Chưa cung cấp"}
                        </span>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="bio-section">
                        <h6>Giới thiệu</h6>
                        <p>{user.bio}</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setChangePasswordMode(true)}
                      >
                        <FontAwesomeIcon icon={faKey} className="me-2" />
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.fullName ? "is-invalid" : ""
                        }`}
                        id="fullName"
                        name="fullName"
                        value={editedUser.fullName}
                        onChange={handleChange}
                      />
                      {errors.fullName && (
                        <div className="invalid-feedback">
                          {errors.fullName}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className={`form-control ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        id="email"
                        name="email"
                        value={editedUser.email}
                        onChange={handleChange}
                        disabled={user.emailVerified}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                      {user.emailVerified && (
                        <small className="text-success">
                          Email đã được xác thực
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        id="phone"
                        name="phone"
                        value={editedUser.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="dateOfBirth" className="form-label">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={editedUser.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="gender" className="form-label">
                        Giới tính
                      </label>
                      <select
                        className="form-select"
                        id="gender"
                        name="gender"
                        value={editedUser.gender}
                        onChange={handleChange}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={editedUser.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="bio" className="form-label">
                        Giới thiệu
                      </label>
                      <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        rows="3"
                        value={editedUser.bio}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={cancelEdit}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                )}

                {changePasswordMode && (
                  <form
                    onSubmit={handleChangePassword}
                    className="profile-edit-form"
                  >
                    <h5 className="mb-4">Đổi mật khẩu</h5>

                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        className={`form-control ${
                          errors.currentPassword ? "is-invalid" : ""
                        }`}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      {errors.currentPassword && (
                        <div className="invalid-feedback">
                          {errors.currentPassword}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className={`form-control ${
                          errors.newPassword ? "is-invalid" : ""
                        }`}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                      {errors.newPassword && (
                        <div className="invalid-feedback">
                          {errors.newPassword}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className={`form-control ${
                          errors.confirmPassword ? "is-invalid" : ""
                        }`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setChangePasswordMode(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        {loading ? "Đang lưu..." : "Cập nhật mật khẩu"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Activity */}
          <div className="col-md-8">
            {/* Statistics Card */}
            <div className="profile-card mb-4">
              <div className="profile-card-header">
                <h5>Thống kê học tập</h5>
              </div>
              <div className="profile-card-body">
                <div className="row stats-row">
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-value">
                        {user.totalExamsTaken || 0}
                      </div>
                      <div className="stat-label">Bài kiểm tra đã làm</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-value">{user.studyHours || 0}</div>
                      <div className="stat-label">Giờ học tập</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-value">{user.highestScore || 0}</div>
                      <div className="stat-label">Điểm cao nhất</div>
                    </div>
                  </div>
                </div>

                <div className="streak-section">
                  <h6>Chuỗi ngày học</h6>
                  <div className="streak-days">
                    {Array(7)
                      .fill()
                      .map((_, index) => {
                        const today = new Date();
                        const dayIndex = (today.getDay() - 6 + index) % 7;
                        const dayName = [
                          "CN",
                          "T2",
                          "T3",
                          "T4",
                          "T5",
                          "T6",
                          "T7",
                        ][dayIndex];
                        const active =
                          user.activeDays && user.activeDays.includes(dayIndex);

                        return (
                          <div
                            key={index}
                            className={`day-circle ${active ? "active" : ""}`}
                          >
                            <div className="day-name">{dayName}</div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="current-streak">
                    <span>Chuỗi ngày hiện tại: </span>
                    <strong>{user.currentStreak || 0} ngày</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h5>Hoạt động gần đây</h5>
              </div>
              <div className="profile-card-body">
                {user.recentActivity && user.recentActivity.length > 0 ? (
                  <div className="activity-timeline">
                    {user.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-date">
                          {new Date(activity.timestamp).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {activity.type === "exam" && "Hoàn thành bài thi"}
                            {activity.type === "practice" &&
                              "Hoàn thành bài luyện tập"}
                            {activity.type === "learn" && "Hoàn thành bài học"}
                          </div>
                          <div className="activity-details">
                            {activity.name}
                            {activity.score && (
                              <span className="activity-score">
                                Điểm: {activity.score}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">
                    Chưa có hoạt động nào gần đây.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
