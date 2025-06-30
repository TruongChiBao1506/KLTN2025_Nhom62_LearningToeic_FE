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
  faRefresh,
  faExclamationTriangle,
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
  const [refreshing, setRefreshing] = useState(false); // New state for refresh loading
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
      setErrors({});
      
      console.log("Bắt đầu tải dữ liệu profile...");

      // Gọi các API song song để tối ưu hiệu năng
      const [profileResponse, statisticsResponse, activityResponse] = await Promise.allSettled([
        userService.getCurrentUser(),
        userService.getUserStatistics(),
        userService.getRecentActivity(10)
      ]);
      console.log("🚀 ~ fetchUserProfile ~ activityResponse:", activityResponse);

      console.log("🚀 ~ fetchUserProfile ~ statisticsResponse:", statisticsResponse);

      console.log("🚀 ~ fetchUserProfile ~ profileResponse:", profileResponse);


      let userData = null;
      let statisticsData = {};
      let activityData = [];

      // Xử lý response từ profile API
      if (profileResponse.status === 'fulfilled') {
        const response = profileResponse.value;
        // Backend trả về user object trực tiếp
        userData = response;
        console.log("✅ Profile data loaded successfully:", userData);
      } else {
        console.warn("⚠️ Profile API failed:", profileResponse.reason?.message);
      }

      // Xử lý response từ statistics API
      if (statisticsResponse.status === 'fulfilled') {
        const response = statisticsResponse.value;
        // Backend trả về statistics object trực tiếp
        statisticsData = response;
        console.log("✅ Statistics data loaded successfully:", statisticsData);
      } else {
        console.warn("⚠️ Statistics API failed:", statisticsResponse.reason?.message);
      }

      // Xử lý response từ activity API
      if (activityResponse.status === 'fulfilled') {
        const response = activityResponse.value;
        // Backend trả về activities array trực tiếp
        activityData = Array.isArray(response) ? response : [];
        console.log("✅ Activity data loaded successfully:", activityData);
      } else {
        console.warn("⚠️ Activity API failed:", activityResponse.reason?.message);
      }

      // Nếu không có dữ liệu từ API profile chính, sử dụng fallback
      if (!userData || (typeof userData !== 'object') || (!userData._id && !userData.id)) {
        console.info("📋 Sử dụng dữ liệu mẫu do API chưa sẵn sàng");
        userData = {
          _id: "fallback_user",
          name: "Người dùng",
          email: "user@example.com",
          phoneNumber: "0123456789",
          address: "Địa chỉ mẫu",
          gender: "male",
          status: 1,
          roles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      // Kết hợp dữ liệu từ các API và normalize
      const combinedUserData = {
        // Profile data - mapping từ backend response
        id: userData._id || userData.id || "unknown",
        fullName: userData.name || userData.fullName || userData.full_name || "Người dùng",
        email: userData.email || "user@example.com",
        phone: userData.phoneNumber || userData.phone || "",
        dateOfBirth: userData.dateOfBirth || userData.date_of_birth || userData.birthDate || "",
        gender: userData.gender || "",
        address: userData.address || "",
        bio: userData.bio || userData.biography || "",
        profileImage: userData.image || userData.profileImage || userData.profile_image || userData.avatar || null,
        emailVerified: userData.emailVerified || userData.email_verified || userData.status === 1 || false,
        createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
        updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),

        // Statistics data - mapping từ backend response
        totalExamsTaken: parseInt(statisticsData?.examsCompleted || statisticsData?.totalExams || statisticsData?.total_exams || 0),
        studyHours: parseFloat(statisticsData?.totalStudyTime || statisticsData?.studyTime || statisticsData?.study_hours || 0),
        highestScore: parseInt(statisticsData?.bestScore || statisticsData?.highestScore || statisticsData?.highest_score || 0),
        averageScore: parseFloat(statisticsData?.averageScore || statisticsData?.average_score || 0),
        currentStreak: parseInt(statisticsData?.currentStreak || statisticsData?.current_streak || 0),
        longestStreak: parseInt(statisticsData?.longestStreak || statisticsData?.longest_streak || 0),
        activeDays: Array.isArray(statisticsData?.activeDays) ? statisticsData.activeDays : 
                   Array.isArray(statisticsData?.active_days) ? statisticsData.active_days : [],
        completedLessons: parseInt(statisticsData?.completedLessons || statisticsData?.completed_lessons || 0),
        certificatesEarned: parseInt(statisticsData?.certificates || statisticsData?.certificates_earned || 0),
        
        // Activity data - mapping từ backend response
        recentActivity: activityData.length > 0 
          ? activityData.slice(0, 10).map((activity, index) => ({
              id: activity.id || activity._id || index,
              type: activity.type || "exam",
              name: activity.title || activity.description || activity.name || "Hoạt động học tập",
              score: activity.score || null,
              timestamp: activity.date || activity.timestamp || activity.completedAt || activity.completed_at || activity.createdAt || activity.created_at || new Date().toISOString(),
              duration: activity.duration || activity.time_spent || null,
              category: activity.category || activity.subject || null,
              status: activity.status || "completed",
              icon: activity.icon || (activity.type === "exam" ? "📝" : "📖")
            }))
          : [
              {
                id: 1,
                type: "exam",
                name: "TOEIC Practice Test 1",
                score: 720,
                timestamp: "2025-06-28T10:00:00Z",
                duration: 120,
                status: "completed",
                icon: "📝"
              },
              {
                id: 2,
                type: "practice", 
                name: "Listening Skills Practice",
                score: 85,
                timestamp: "2025-06-27T14:30:00Z",
                duration: 45,
                status: "completed",
                icon: "💪"
              },
              {
                id: 3,
                type: "lesson",
                name: "Grammar Advanced Lesson",
                timestamp: "2025-06-26T16:00:00Z",
                duration: 30,
                status: "completed",
                icon: "📚"
              }
            ]
      };

      console.log("🎉 Combined user data:", combinedUserData);
      console.log("📊 Original Statistics Data:", statisticsData);
      console.log("📈 Original Activity Data:", activityData);
      console.log("👤 Original Profile Data:", userData);

      setUser(combinedUserData);
      setEditedUser({
        fullName: combinedUserData.fullName || "",
        email: combinedUserData.email || "",
        phone: combinedUserData.phone || "",
        dateOfBirth: combinedUserData.dateOfBirth
          ? new Date(combinedUserData.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: combinedUserData.gender || "",
        address: combinedUserData.address || "",
        bio: combinedUserData.bio || "",
      });

    } catch (error) {
      console.error("❌ Lỗi khi tải thông tin hồ sơ:", error);
      
      // Xử lý các loại lỗi HTTP cụ thể
      if (error?.response?.status === 401) {
        setErrors({
          general: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        });
      } else if (error?.response?.status === 403) {
        setErrors({
          general: "Bạn không có quyền truy cập thông tin này."
        });
      } else if (error?.response?.status === 404) {
        setErrors({
          general: "Không tìm thấy thông tin người dùng."
        });
      } else if (error?.response?.status >= 500) {
        setErrors({
          general: "Lỗi server. Vui lòng thử lại sau."
        });
      } else if (error?.code === 'NETWORK_ERROR' || !error?.response) {
        // Lỗi mạng hoặc không có response - dùng fallback data
        console.info("🔄 Lỗi mạng, sử dụng dữ liệu offline");
        const fallbackUser = {
          id: "offline_user",
          fullName: "Người dùng offline",
          email: "user@example.com",
          phone: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          bio: "",
          profileImage: null,
          emailVerified: false,
          totalExamsTaken: 0,
          studyHours: 0,
          highestScore: 0,
          averageScore: 0,
          currentStreak: 0,
          activeDays: [],
          recentActivity: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(fallbackUser);
        setEditedUser({
          fullName: fallbackUser.fullName,
          email: fallbackUser.email,
          phone: fallbackUser.phone,
          dateOfBirth: fallbackUser.dateOfBirth,
          gender: fallbackUser.gender,
          address: fallbackUser.address,
          bio: fallbackUser.bio,
        });
        
        setErrors({
          general: "Không thể kết nối đến server. Hiển thị dữ liệu offline."
        });
      } else {
        setErrors({
          general: "Có lỗi không xác định xảy ra. Vui lòng thử lại."
        });
      }
    } finally {
      setLoading(false);
      console.log("✅ Profile loading completed");
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
      setErrors({});

      // Chuẩn bị data để gửi lên server  
      const profileUpdateData = {
        name: editedUser.fullName.trim(), // Backend expects 'name' not 'fullName'
        email: editedUser.email.trim(),
        phoneNumber: editedUser.phone?.trim() || null, // Backend expects 'phoneNumber' not 'phone'  
        dateOfBirth: editedUser.dateOfBirth || null,
        gender: editedUser.gender || null,
        address: editedUser.address?.trim() || null,
        bio: editedUser.bio?.trim() || null,
      };

      console.log("Đang cập nhật profile với data:", profileUpdateData);

      // Gọi API cập nhật profile
      const updateResponse = await userService.updateProfile(profileUpdateData);
      console.log("Response từ update profile API:", updateResponse);

      // Xử lý upload ảnh nếu có
      let imageUploadResponse = null;
      if (profileImage) {
        console.log("Đang upload ảnh profile...");
        imageUploadResponse = await userService.uploadProfileImage(profileImage);
        console.log("Response từ upload image API:", imageUploadResponse);
      }

      // Cập nhật local state với dữ liệu mới
      const updatedUser = {
        ...user,
        fullName: profileUpdateData.name, // Map back to frontend format
        email: profileUpdateData.email,
        phone: profileUpdateData.phoneNumber, // Map back to frontend format
        dateOfBirth: profileUpdateData.dateOfBirth,
        gender: profileUpdateData.gender,
        address: profileUpdateData.address,
        bio: profileUpdateData.bio,
        profileImage: imageUploadResponse?.imageUrl || imagePreview || user?.profileImage,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      setEditMode(false);
      setImagePreview(null);
      setProfileImage(null);
      
      setSuccessMessage("Cập nhật hồ sơ thành công!");

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Lỗi validation từ server
          const serverErrors = {};
          errorData.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setErrors(serverErrors);
        } else {
          setErrors({
            general: errorData.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
          });
        }
      } else if (error.response?.status === 401) {
        setErrors({
          general: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        });
      } else if (error.response?.status === 403) {
        setErrors({
          general: "Bạn không có quyền cập nhật thông tin này."
        });
      } else if (error.response?.status === 409) {
        setErrors({
          email: "Email này đã được sử dụng bởi tài khoản khác."
        });
      } else if (error.response?.status >= 500) {
        setErrors({
          general: "Lỗi server. Vui lòng thử lại sau."
        });
      } else {
        setErrors({
          general: "Có lỗi khi cập nhật hồ sơ. Vui lòng thử lại sau."
        });
      }
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
      setErrors({});

      console.log("Đang thay đổi mật khẩu...");

      // Gọi API đổi mật khẩu
      const response = await userService.changeUserPassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      console.log("Response từ change password API:", response);

      // Thành công
      setChangePasswordMode(false);
      setSuccessMessage("Mật khẩu đã được cập nhật thành công!");

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Lỗi khi thay đổi mật khẩu:", error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes("current password")) {
          setErrors({
            currentPassword: "Mật khẩu hiện tại không đúng."
          });
        } else if (errorData.message?.includes("password requirements")) {
          setErrors({
            newPassword: "Mật khẩu mới không đáp ứng yêu cầu bảo mật."
          });
        } else {
          setErrors({
            general: errorData.message || "Dữ liệu không hợp lệ."
          });
        }
      } else if (error.response?.status === 401) {
        setErrors({
          general: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        });
      } else if (error.response?.status === 403) {
        setErrors({
          currentPassword: "Mật khẩu hiện tại không đúng."
        });
      } else if (error.response?.status >= 500) {
        setErrors({
          general: "Lỗi server. Vui lòng thử lại sau."
        });
      } else {
        setErrors({
          general: "Có lỗi khi thay đổi mật khẩu. Vui lòng thử lại sau."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setImagePreview(null);
    setProfileImage(null);
    setErrors({});

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

  const cancelChangePassword = () => {
    setChangePasswordMode(false);
    setErrors({});
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const refreshProfile = async () => {
    if (loading) return; // Prevent refresh while already loading
    
    try {
      setRefreshing(true);
      setErrors({});
      setSuccessMessage("");
      
      await fetchUserProfile();
      
      setSuccessMessage("Dữ liệu đã được cập nhật!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Lỗi khi refresh profile:", error);
      setErrors({
        general: "Không thể làm mới dữ liệu. Vui lòng thử lại."
      });
    } finally {
      setRefreshing(false);
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
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {errors.general}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrors(prev => ({ ...prev, general: null }))}
          ></button>
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
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={refreshProfile}
                    disabled={loading || refreshing}
                    title="Làm mới dữ liệu"
                  >
                    <FontAwesomeIcon icon={faRefresh} className={(loading || refreshing) ? "fa-spin" : ""} />
                  </button>
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
              </div>
              <div className="profile-card-body">
                <div className="profile-image-container">
                  {editMode ? (
                    <div className="edit-profile-image">
                      <img
                        src={
                          imagePreview ||
                          (user && user.profileImage && `http://localhost:5000/images/${user.profileImage}`) ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%233498db'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='white'%3EUser%3C/text%3E%3C/svg%3E"
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
                        (user && user.profileImage && `http://localhost:5000/images/${user.profileImage}`) || 
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%233498db'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='white'%3EUser%3C/text%3E%3C/svg%3E"
                      }
                      alt="Ảnh đại diện"
                      className="profile-image"
                    />
                  )}
                </div>

                {!editMode ? (
                  <div className="profile-info">
                    <h4>{user?.fullName || "Người dùng"}</h4>
                    <p className="text-muted">{user?.email || ""}</p>

                    <div className="profile-details">
                      <div className="profile-detail-item">
                        <span className="detail-label">Số điện thoại:</span>
                        <span className="detail-value">
                          {user?.phone || "Chưa cung cấp"}
                        </span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="detail-label">Ngày sinh:</span>
                        <span className="detail-value">
                          {user?.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Chưa cung cấp"}
                        </span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="detail-label">Giới tính:</span>
                        <span className="detail-value">
                          {user?.gender === "male"
                            ? "Nam"
                            : user?.gender === "female"
                            ? "Nữ"
                            : user?.gender === "other"
                            ? "Khác"
                            : "Chưa cung cấp"}
                        </span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="detail-label">Địa chỉ:</span>
                        <span className="detail-value">
                          {user?.address || "Chưa cung cấp"}
                        </span>
                      </div>
                    </div>

                    {user?.bio && (
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
                        disabled={user?.emailVerified}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                      {user?.emailVerified && (
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
                        onClick={cancelChangePassword}
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
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={refreshProfile}
                  disabled={loading || refreshing}
                  title="Làm mới thống kê"
                >
                  <FontAwesomeIcon icon={faRefresh} className={(loading || refreshing) ? "fa-spin" : ""} />
                </button>
              </div>
              <div className="profile-card-body">
                <div className="row stats-row">
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-icon">📊</div>
                      <div className="stat-value">
                        {user?.totalExamsTaken || 0}
                      </div>
                      <div className="stat-label">Bài kiểm tra đã làm</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-icon">⏰</div>
                      <div className="stat-value">{user?.studyHours || 0}</div>
                      <div className="stat-label">Giờ học tập</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box">
                      <div className="stat-icon">🏆</div>
                      <div className="stat-value">{user?.highestScore || 0}</div>
                      <div className="stat-label">Điểm cao nhất</div>
                    </div>
                  </div>
                </div>

                {/* Additional stats row */}
                <div className="row stats-row">
                  <div className="col-md-4">
                    <div className="stat-box stat-box-secondary">
                      <div className="stat-icon">📚</div>
                      <div className="stat-value">
                        {user?.completedLessons || 0}
                      </div>
                      <div className="stat-label">Bài học hoàn thành</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box stat-box-secondary">
                      <div className="stat-icon">📈</div>
                      <div className="stat-value">{Math.round(user?.averageScore || 0)}</div>
                      <div className="stat-label">Điểm trung bình</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box stat-box-secondary">
                      <div className="stat-icon">🏅</div>
                      <div className="stat-value">{user?.certificatesEarned || 0}</div>
                      <div className="stat-label">Chứng chỉ đạt được</div>
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
                          user?.activeDays && user.activeDays.includes(dayIndex);

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
                    <strong>{user?.currentStreak || 0} ngày</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h5>Hoạt động gần đây</h5>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={refreshProfile}
                  disabled={loading || refreshing}
                  title="Làm mới hoạt động"
                >
                  <FontAwesomeIcon icon={faRefresh} className={(loading || refreshing) ? "fa-spin" : ""} />
                </button>
              </div>
              <div className="profile-card-body">
                {user?.recentActivity && user.recentActivity.length > 0 ? (
                  <div className="activity-timeline">
                    {user.recentActivity.map((activity, index) => (
                      <div key={activity.id || index} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === "exam" && "📝"}
                          {activity.type === "practice" && "💪"}
                          {activity.type === "lesson" && "📚"}
                          {!["exam", "practice", "lesson"].includes(activity.type) && "📖"}
                        </div>
                        <div className="activity-date">
                          {new Date(activity.timestamp).toLocaleDateString("vi-VN", {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {activity.type === "exam" && "Hoàn thành bài thi"}
                            {activity.type === "practice" && "Hoàn thành bài luyện tập"}
                            {activity.type === "lesson" && "Hoàn thành bài học"}
                            {!["exam", "practice", "lesson"].includes(activity.type) && "Hoạt động học tập"}
                          </div>
                          <div className="activity-details">
                            <div className="activity-name">{activity.name}</div>
                            <div className="activity-meta">
                              {activity.score !== null && activity.score !== undefined && (
                                <span className="activity-score">
                                  Điểm: {activity.score}
                                </span>
                              )}
                              {activity.duration && (
                                <span className="activity-duration">
                                  ⏱️ {activity.duration} phút
                                </span>
                              )}
                              {activity.category && (
                                <span className="activity-category">
                                  📂 {activity.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <p className="text-muted">Chưa có hoạt động nào gần đây.</p>
                      <small className="text-muted">
                        Bắt đầu làm bài thi hoặc luyện tập để xem hoạt động tại đây!
                      </small>
                    </div>
                  </div>
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
