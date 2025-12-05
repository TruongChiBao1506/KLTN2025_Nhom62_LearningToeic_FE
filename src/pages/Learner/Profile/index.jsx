import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Spin,
  Alert,
  Breadcrumb,
  Statistic,
  Space,
  Divider,
  Tag,
  Empty,
  Timeline
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  CameraOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import userService from "../../../services/userService";
import ProfileImageService from "../../../services/profileImageService";
import authService from "../../../services/authService";
import { useAuthStore } from "../../../hooks/useAuthStore";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Profile = () => {
  const { info, setInfo } = useAuthStore(); // ✅ Get info to preserve roles
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [dashboardData, setDashboardData] = useState(null); // Dashboard data with skill analysis
  const [recentActivity, setRecentActivity] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showProfileInfo, setShowProfileInfo] = useState(true); // Tab state like Admin
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.title = "Hồ sơ cá nhân | TOEIC Learning Platform";
    fetchUserProfile();
    fetchUserStatistics();
    fetchRecentActivity();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setErrors({});
      setImagePreview(null); // Clear preview when fetching new data

      // ✅ Check sessionStorage for tokens (support multi-role users)
      const learnerToken = sessionStorage.getItem("learnerToken");
      const adminToken = sessionStorage.getItem("adminToken");
      const teacherToken = sessionStorage.getItem("teacherToken");
      
      const token = learnerToken || adminToken || teacherToken;
      
      if (!token) {
        setErrors({
          general: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
        });
        return;
      }

      const response = await userService.getCurrentUser();
      console.log("Raw response from getCurrentUser:", response);
      // Nếu response là object hợp lệ (không phải null, không phải mảng)
      if (response && typeof response === "object" && !Array.isArray(response)) {
        const userData = response;
        console.log("Raw userData from server:", userData);
        // Map server data structure to component expected structure
        const mappedUser = {
          ...userData,
          fullName: userData.name || userData.fullName || "",
          phone: userData.phoneNumber || userData.phone || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender === 1 ? "male" : userData.gender === 2 ? "female" : userData.gender === 3 ? "other" : userData.gender || "",
          bio: userData.bio || "",
          // BE returns 'image' field, not 'profileImage'
          profileImage: userData.image || userData.profileImage || userData.profileImageUrl || null,
          emailVerified: userData.emailVerified || Boolean(userData.status),
          // Add statistics fields if they exist
          totalExamsTaken: userData.totalExamsTaken || 0,
          studyHours: userData.studyHours || 0,
          highestScore: userData.highestScore || 0,
          averageScore: userData.averageScore || 0,
          completedLessons: userData.completedLessons || 0,
          certificatesEarned: userData.certificatesEarned || 0,
          currentStreak: userData.currentStreak || 0,
          activeDays: userData.activeDays || [],
          recentActivity: userData.recentActivity || []
        };
        console.log("Mapped user data:", mappedUser);
        console.log("📷 Profile image from DB:", userData.image);
        console.log("📷 Mapped profile image:", mappedUser.profileImage);
        setUser(mappedUser);
        
        // ✅ CRITICAL: Update Redux store, but PRESERVE roles from existing store or localStorage
        // If API doesn't return roles field, we must preserve existing roles to prevent losing multi-role access
        const existingRoles = info?.roles || (() => {
          // Fallback: try to get roles from localStorage (where login saved user data)
          const learnerUser = localStorage.getItem('learnerUser');
          const adminUser = localStorage.getItem('user');
          const userStr = learnerUser || adminUser;
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              return user.roles || [];
            } catch (e) {
              console.warn("⚠️ Failed to parse user roles from localStorage");
              return [];
            }
          }
          return [];
        })();
        
        console.log("🔄 Updating Redux store with roles:", userData.roles || existingRoles);
        
        setInfo({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name || userData.fullName,
          roles: userData.roles || existingRoles, // ✅ Preserve roles if API doesn't return them
          avatar: userData.image || userData.avatar,
        });
      } else {
        setErrors({
          general: "Không thể tải thông tin người dùng. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải profile:", error);

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
        console.info("🔄 Lỗi mạng, sử dụng dữ liệu offline");
        const fallbackUser = {
          _id: "offline_user",
          name: "Người dùng offline",
          fullName: "Người dùng offline",
          email: "user@example.com",
          phoneNumber: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          bio: "",
          profileImage: null,
          emailVerified: false,
          status: 1,
          isActive: 1,
          totalExamsTaken: 0,
          studyHours: 0,
          highestScore: 0,
          averageScore: 0,
          completedLessons: 0,
          certificatesEarned: 0,
          currentStreak: 0,
          activeDays: [],
          recentActivity: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(fallbackUser);
        
        setErrors({
          general: "Đang hoạt động offline. Một số tính năng có thể bị hạn chế."
        });
      } else {
        setErrors({
          general: error?.response?.data?.message || "Có lỗi xảy ra khi tải thông tin người dùng.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      // Fetch dashboard data with skill analysis
      const dashboardResponse = await userService.getLearnerDashboard();
      if (dashboardResponse?.data) {
        setDashboardData(dashboardResponse.data);
        
        // Also set statistics for backward compatibility
        const { overview, skillAnalysis } = dashboardResponse.data;
        setStatistics({
          totalExamsTaken: overview?.completedExamsCount || 0,
          studyHours: overview?.studyHours || 0,
          highestScore: overview?.bestScore || 0,
          averageScore: overview?.averageScore || 0,
          completedLessons: overview?.completedLessons || 0,
          certificatesEarned: overview?.certificatesEarned || 0,
          currentStreak: overview?.learningStreak || 0,
          activeDays: overview?.activeDays || [],
          listening: skillAnalysis?.listening || 0,
          reading: skillAnalysis?.reading || 0,
          listeningPercentage: skillAnalysis?.listeningPercentage || 0,
          readingPercentage: skillAnalysis?.readingPercentage || 0,
          overallAccuracy: overview?.overallAccuracy || 0,
          goalProgress: overview?.goalProgress || 0,
          goalScore: overview?.goalScore || 0
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
      // Set fallback statistics
      setStatistics({
        totalExamsTaken: 0,
        studyHours: 0,
        highestScore: 0,
        averageScore: 0,
        completedLessons: 0,
        certificatesEarned: 0,
        currentStreak: 0,
        activeDays: [],
        listening: 0,
        reading: 0,
        listeningPercentage: 0,
        readingPercentage: 0,
        overallAccuracy: 0,
        goalProgress: 0
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await userService.getRecentActivity(5);
      if (response?.data) {
        setRecentActivity(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải hoạt động gần đây:", error);
      setRecentActivity([]);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        message.error("Vui lòng chọn file ảnh");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload immediately (like Admin Profile)
      await updateProfileImage(file);
    }
  };

  // Separate function to update profile image
  const updateProfileImage = async (file) => {
    try {
      setLoading(true);
      console.log('📤 Uploading profile image...');
      
      const imageFormData = new FormData();
      imageFormData.append("profileImage", file, file.name);
      
      const imageResult = await ProfileImageService.updateMyProfile(imageFormData);
      
      if (imageResult.success) {
        console.log('✅ Profile image uploaded successfully');
        message.success('Cập nhật ảnh đại diện thành công!');
        
        // Refresh user data to get new image URL
        await fetchUserProfile();
        
        // Clear preview to show actual uploaded image
        setImagePreview(null);
      } else {
        console.error('❌ Failed to upload image:', imageResult.error);
        message.error('Không thể tải lên ảnh đại diện');
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Có lỗi xảy ra khi tải lên ảnh');
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setErrors({});

      console.log('📤 Updating profile information...');
      
      // Map frontend field names to backend expected field names
      const backendData = {
        name: values.fullName,
        email: values.email,
        phoneNumber: values.phone,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        gender: values.gender === "male" ? 1 : values.gender === "female" ? 2 : values.gender === "other" ? 3 : values.gender,
        address: values.address,
        bio: values.bio
      };

      // Send as JSON (image is uploaded separately on change)
      const response = await userService.updateProfile(backendData);
      console.log('✅ Profile updated successfully:', response);

      // First: Turn off edit mode
      setEditMode(false);
      
      // Second: Refresh to get latest data from server
      await fetchUserProfile();
      
      // Third: Show success message (after data is refreshed)
      message.success("Cập nhật thông tin thành công!", 2);
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);

      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error?.response?.status === 400) {
        message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
      } else {
        message.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setChangePasswordMode(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Đổi mật khẩu thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      
      if (error?.response?.data?.message) {
        setErrors({
          currentPassword: error.response.data.message,
        });
      } else {
        setErrors({
          general: "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = (form) => {
    setEditMode(false);
    setErrors({});
    setImagePreview(null);
    form.resetFields();
  };

  const refreshProfile = async () => {
    if (loading) return;
    
    try {
      setRefreshing(true);
      setErrors({});
      
      await Promise.all([
        fetchUserProfile(),
        fetchUserStatistics(),
        fetchRecentActivity()
      ]);
      
      message.success("Dữ liệu đã được cập nhật!", 2);
    } catch (error) {
      console.error("Lỗi khi refresh profile:", error);
      message.error("Không thể làm mới dữ liệu. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f8fafc", 
      padding: "24px" 
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <Breadcrumb 
          style={{ marginBottom: "24px" }}
          items={[
            {
              href: "/learner/dashboard",
              title: (
                <span>
                  <HomeOutlined style={{ marginRight: "8px" }} />
                  Trang chủ
                </span>
              ),
            },
            {
              title: (
                <span>
                  <UserOutlined style={{ marginRight: "8px" }} />
                  Hồ sơ cá nhân
                </span>
              ),
            },
          ]}
        />

        {/* Success Alert */}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            closable
            style={{ marginBottom: "16px" }}
            onClose={() => setSuccessMessage("")}
          />
        )}

        {/* Error Alert */}
        {errors.general && (
          <Alert
            message={errors.general}
            type="error"
            showIcon
            closable
            style={{ marginBottom: "16px" }}
            onClose={() => setErrors(prev => ({ ...prev, general: null }))}
          />
        )}

        {/* Loading State */}
        {loading && !user ? (
          <Card style={{ textAlign: "center", padding: "48px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Đang tải thông tin hồ sơ...</Text>
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Left Column - User Profile */}
            <Col xs={24} lg={8}>
              <Card
                style={{ marginBottom: "24px" }}
                actions={[
                  <Button
                    type="text"
                    icon={<ReloadOutlined spin={loading || refreshing} />}
                    onClick={refreshProfile}
                    disabled={loading || refreshing}
                  >
                    Làm mới
                  </Button>
                ]}
              >
                {/* Profile Header */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <Avatar 
                      size={120} 
                      src={(() => {
                        console.log('🖼️ Avatar render - imagePreview:', imagePreview);
                        console.log('🖼️ Avatar render - user?.profileImage:', user?.profileImage);
                        
                        if (imagePreview) {
                          return imagePreview;
                        }
                        
                        if (user?.profileImage) {
                          // Check if profileImage is already a full URL (from S3)
                          const isFullUrl = user.profileImage.startsWith('http://') || user.profileImage.startsWith('https://');
                          const finalUrl = isFullUrl 
                            ? user.profileImage 
                            : `http://localhost:5000/images/${user.profileImage}`;
                          
                          console.log('🖼️ Avatar final URL:', finalUrl);
                          return finalUrl;
                        }
                        
                        console.log('🖼️ Avatar - no image, showing default icon');
                        return null;
                      })()}
                      icon={<UserOutlined />}
                      style={{ 
                        border: "4px solid #fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    />
                    {/* Always show upload button (not just in edit mode) */}
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        handleImageChange({ target: { files: [file] } });
                        return false;
                      }}
                      disabled={loading}
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        size="small"
                        loading={loading}
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                        }}
                      />
                    </Upload>
                  </div>
                  
                  <Title level={3} style={{ margin: "16px 0 8px 0" }}>
                    {user?.fullName || user?.name || "Người dùng"}
                  </Title>
                  
                  <Space>
                    <Tag color={user?.emailVerified || user?.status === 1 ? "green" : "orange"}>
                      {user?.emailVerified || user?.status === 1 ? "Đã xác thực" : "Chưa xác thực"}
                    </Tag>
                    {/* <Text type="secondary">
                      {user?.roles?.[0]?.name || "System Administrator"}
                    </Text> */}
                  </Space>
                </div>

                {/* Tabs Navigation - like Admin Profile */}
                <div style={{ 
                  display: "flex", 
                  borderBottom: "2px solid #f0f0f0",
                  marginBottom: "24px"
                }}>
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    onClick={() => {
                      setShowProfileInfo(true);
                      setChangePasswordMode(false);
                      setEditMode(false);
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 0,
                      borderBottom: showProfileInfo && !changePasswordMode ? "2px solid #1890ff" : "none",
                      color: showProfileInfo && !changePasswordMode ? "var(--color-primary)" : "var(--color-text-secondary)",
                      fontWeight: showProfileInfo && !changePasswordMode ? "600" : "normal"
                    }}
                  >
                    Thông tin chung
                  </Button>
                  <Button
                    type="text"
                    icon={<LockOutlined />}
                    onClick={() => {
                      setShowProfileInfo(false);
                      setChangePasswordMode(true);
                      setEditMode(false);
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 0,
                      borderBottom: changePasswordMode ? "2px solid #1890ff" : "none",
                      color: changePasswordMode ? "var(--color-primary)" : "var(--color-text-secondary)",
                      fontWeight: changePasswordMode ? "600" : "normal"
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>

                {/* Profile Information Tab */}
                {showProfileInfo && !changePasswordMode && (
                  editMode ? (
                  <Form 
                    form={form}
                    layout="vertical" 
                    onFinish={handleSubmit}
                    initialValues={{
                      fullName: user?.fullName || user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
                      gender: user?.gender === 1 ? "male" : user?.gender === 2 ? "female" : user?.gender === 3 ? "other" : user?.gender || "",
                      address: user?.address || "",
                      bio: user?.bio || "",
                    }}
                  >
                    <Form.Item 
                      label="Họ và tên"
                      name="fullName"
                      validateStatus={errors.fullName ? "error" : ""}
                      help={errors.fullName}
                      rules={[
                        { required: true, message: "Họ và tên không được để trống" },
                        { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" }
                      ]}
                    >
                      <Input
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>

                    <Form.Item 
                      label="Email"
                      name="email"
                      validateStatus={errors.email ? "error" : ""}
                      help={errors.email}
                      rules={[
                        { required: true, message: "Email không được để trống" },
                        { type: "email", message: "Email không hợp lệ" }
                      ]}
                    >
                      <Input
                        type="email"
                        disabled={user?.emailVerified}
                        placeholder="Nhập email"
                        prefix={<MailOutlined />}
                      />
                    </Form.Item>

                    <Form.Item 
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { pattern: /^[0-9+\-\s()]{10,15}$/, message: "Số điện thoại không hợp lệ" }
                      ]}
                    >
                      <Input
                        placeholder="Nhập số điện thoại"
                        prefix={<PhoneOutlined />}
                      />
                    </Form.Item>

                    <Form.Item 
                      label="Ngày sinh"
                      name="dateOfBirth"
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Chọn ngày sinh"
                      />
                    </Form.Item>

                    <Form.Item 
                      label="Giới tính"
                      name="gender"
                    >
                      <Select
                        placeholder="Chọn giới tính"
                      >
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item 
                      label="Địa chỉ"
                      name="address"
                    >
                      <Input
                        placeholder="Nhập địa chỉ"
                        prefix={<EnvironmentOutlined />}
                      />
                    </Form.Item>

                    <Form.Item 
                      label="Giới thiệu"
                      name="bio"
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Viết vài dòng giới thiệu về bản thân"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          icon={<SaveOutlined />}
                          loading={loading}
                          style={{ borderRadius: "8px",
                            background: "var(--color-primary)",
                            borderColor: "var(--color-primary)",
                            color: "#fff"
                          }}
                        >
                          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button 
                          onClick={() => cancelEdit(form)} 
                          icon={<CloseOutlined />}
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <div>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                      <div>
                        <Text type="secondary">Email</Text>
                        <div style={{ marginTop: "4px" }}>
                          <Text>{user?.email || "Chưa cập nhật"}</Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary">Số điện thoại</Text>
                        <div style={{ marginTop: "4px" }}>
                          <Text>{user?.phone || "Chưa cập nhật"}</Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary">Ngày sinh</Text>
                        <div style={{ marginTop: "4px" }}>
                          <Text>
                            {user?.dateOfBirth 
                              ? dayjs(user.dateOfBirth).format("DD/MM/YYYY")
                              : "Chưa cập nhật"
                            }
                          </Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary">Giới tính</Text>
                        <div style={{ marginTop: "4px" }}>
                          <Text>
                            {user?.gender === "male" || user?.gender === 1 ? "Nam" : 
                             user?.gender === "female" || user?.gender === 2 ? "Nữ" : 
                             user?.gender === "other" || user?.gender === 3 ? "Khác" : "Chưa cập nhật"}
                          </Text>
                        </div>
                      </div>

                      <div>
                        <Text type="secondary">Địa chỉ</Text>
                        <div style={{ marginTop: "4px" }}>
                          <Text>{user?.address || "Chưa cập nhật"}</Text>
                        </div>
                      </div>

                      {user?.bio && (
                        <div>
                          <Text type="secondary">Giới thiệu</Text>
                          <div style={{ marginTop: "4px" }}>
                            <Paragraph>{user.bio}</Paragraph>
                          </div>
                        </div>
                      )}
                    </Space>
                    
                    <Divider />
                    
                    <Button 
                      block
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setEditMode(true)}
                      style={{ borderRadius: "8px",
                        background: "var(--color-primary)",
                        borderColor: "var(--color-primary)",
                        color: "#fff"
                       }}
                    >
                      Chỉnh sửa thông tin
                    </Button>
                  </div>
                  )
                )}

                {/* Change Password Tab */}
                {changePasswordMode && (
                  <div>
                    <Form layout="vertical" onFinish={handlePasswordSubmit}>
                      <Form.Item label="Mật khẩu hiện tại">
                        <Input.Password
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            currentPassword: e.target.value
                          }))}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </Form.Item>

                      <Form.Item label="Mật khẩu mới">
                        <Input.Password
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            newPassword: e.target.value
                          }))}
                          placeholder="Nhập mật khẩu mới"
                        />
                      </Form.Item>

                      <Form.Item label="Xác nhận mật khẩu mới">
                        <Input.Password
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          block
                          loading={loading}
                          icon={<LockOutlined />}
                          style={{ borderRadius: "8px",
                            background: "var(--color-primary)",
                            borderColor: "var(--color-primary)",
                            color: "#fff"
                          }}
                        >
                          Cập nhật mật khẩu
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                )}
              </Card>
            </Col>

            {/* Right Column - Statistics and Activity */}
            <Col xs={24} lg={16}>
              {/* Statistics Overview */}
              <Card 
                title="Tổng quan thống kê"
                style={{ marginBottom: "24px" }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Bài kiểm tra"
                      value={statistics?.totalExamsTaken || 0}
                      prefix={<BookOutlined style={{ color: "var(--color-primary)" }} />}
                      valueStyle={{ color: "var(--color-primary)", fontSize: "28px" }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Điểm trung bình"
                      value={Math.round(statistics?.averageScore || 0)}
                      prefix={<FireOutlined style={{ color: "var(--color-success)" }} />}
                      valueStyle={{ color: "var(--color-success)", fontSize: "28px" }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Giờ học tập"
                      value={statistics?.studyHours || 0}
                      suffix="h"
                      prefix={<ClockCircleOutlined style={{ color: "var(--color-info)" }} />}
                      valueStyle={{ color: "var(--color-info)", fontSize: "28px" }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic
                      title="Điểm cao nhất"
                      value={statistics?.highestScore || 0}
                      prefix={<TrophyOutlined style={{ color: "var(--color-warning)" }} />}
                      valueStyle={{ color: "var(--color-warning)", fontSize: "28px" }}
                    />
                  </Col>
                </Row>

                {/* Additional metrics row */}
                {(statistics?.overallAccuracy > 0 || statistics?.goalProgress > 0) && (
                  <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                    {statistics?.overallAccuracy > 0 && (
                      <Col xs={12} md={8}>
                        <Statistic
                          title="Độ chính xác"
                          value={Math.round(statistics.overallAccuracy)}
                          suffix="%"
                          prefix={<StarOutlined style={{ color: "var(--color-secondary)" }} />}
                          valueStyle={{ color: "var(--color-secondary)", fontSize: "24px" }}
                        />
                      </Col>
                    )}
                    {statistics?.goalProgress > 0 && (
                      <Col xs={12} md={8}>
                        <Statistic
                          title="Tiến độ mục tiêu"
                          value={Math.round(statistics.goalProgress)}
                          suffix="%"
                          prefix={<TrophyOutlined style={{ color: "var(--color-chart-4)" }} />}
                          valueStyle={{ color: "var(--color-chart-4)", fontSize: "24px" }}
                        />
                        {statistics?.goalScore > 0 && (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Mục tiêu: {statistics.goalScore} điểm
                          </Text>
                        )}
                      </Col>
                    )}
                    {statistics?.currentStreak > 0 && (
                      <Col xs={12} md={8}>
                        <Statistic
                          title="Chuỗi học tập"
                          value={statistics.currentStreak}
                          suffix="ngày"
                          prefix={<FireOutlined style={{ color: "var(--color-danger)" }} />}
                          valueStyle={{ color: "var(--color-danger)", fontSize: "24px" }}
                        />
                      </Col>
                    )}
                  </Row>
                )}

                <Divider />

                {/* Skill Analysis - Listening & Reading */}
                <div style={{ marginBottom: "24px" }}>
                  <Title level={5} style={{ marginBottom: "16px" }}>
                    <BookOutlined style={{ marginRight: "8px" }} />
                    Phân tích kỹ năng
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <div style={{
                        border: "2px solid var(--color-info)",
                        borderRadius: "12px",
                        padding: "20px",
                        height: "100%"
                      }}>
                        <Title level={5} style={{ color: "var(--color-info)", marginBottom: "12px" }}>
                          🎧 Listening
                        </Title>
                        <Title level={2} style={{ color: "var(--color-info)", marginBottom: "12px" }}>
                          {statistics?.listening || 0}/495
                        </Title>
                        <div style={{
                          height: "10px",
                          background: "#e0e0e0",
                          borderRadius: "5px",
                          overflow: "hidden",
                          marginBottom: "8px"
                        }}>
                          <div style={{
                            width: `${statistics?.listeningPercentage || ((statistics?.listening || 0) / 495) * 100}%`,
                            height: "100%",
                            background: "var(--color-info)",
                            transition: "width 0.3s ease"
                          }} />
                        </div>
                        <Text type="secondary">
                          {Math.round(statistics?.listeningPercentage || ((statistics?.listening || 0) / 495) * 100)}% hoàn thành
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <div style={{
                        border: "2px solid var(--color-success)",
                        borderRadius: "12px",
                        padding: "20px",
                        height: "100%"
                      }}>
                        <Title level={5} style={{ color: "var(--color-success)", marginBottom: "12px" }}>
                          📖 Reading
                        </Title>
                        <Title level={2} style={{ color: "var(--color-success)", marginBottom: "12px" }}>
                          {statistics?.reading || 0}/495
                        </Title>
                        <div style={{
                          height: "10px",
                          background: "#e0e0e0",
                          borderRadius: "5px",
                          overflow: "hidden",
                          marginBottom: "8px"
                        }}>
                          <div style={{
                            width: `${statistics?.readingPercentage || ((statistics?.reading || 0) / 495) * 100}%`,
                            height: "100%",
                            background: "var(--color-success)",
                            transition: "width 0.3s ease"
                          }} />
                        </div>
                        <Text type="secondary">
                          {Math.round(statistics?.readingPercentage || ((statistics?.reading || 0) / 495) * 100)}% hoàn thành
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Learning Streak */}
                <div>
                  <Title level={5} style={{ marginBottom: "16px" }}>
                    <FireOutlined style={{ marginRight: "8px", color: "var(--color-danger)" }} />
                    Chuỗi ngày học
                  </Title>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {Array(7).fill().map((_, index) => {
                      const today = new Date();
                      const dayIndex = (today.getDay() - 6 + index) % 7;
                      const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dayIndex];
                      const active = statistics?.activeDays?.includes(dayIndex);

                      return (
                        <div
                          key={index}
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "8px",
                            background: active ? "var(--color-success)" : "var(--color-bg-tertiary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: active ? "white" : "var(--color-text-disabled)",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            cursor: "default"
                          }}
                        >
                          {dayName}
                        </div>
                      );
                    })}
                  </div>
                  <Alert
                    message={
                      <Text>
                        Streak hiện tại: <Text strong style={{ fontSize: "16px", color: "var(--color-success)" }}>
                          {statistics?.currentStreak || 0}
                        </Text> ngày 🔥
                      </Text>
                    }
                    type="success"
                    showIcon
                  />
                </div>
              </Card>

              {/* Recent Exams */}
              <Card title={
                <span>
                  <TrophyOutlined style={{ marginRight: "8px" }} />
                  Kết quả thi gần đây
                </span>
              }>
                {dashboardData?.recentExams && dashboardData.recentExams.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {dashboardData.recentExams.map((exam, index) => {
                      const getScoreColor = (score) => {
                        if (score >= 800) return "var(--color-success)";
                        if (score >= 650) return "var(--color-info)";
                        if (score >= 500) return "var(--color-warning)";
                        return "var(--color-danger)";
                      };

                      const getScoreStatus = (score) => {
                        if (score >= 800) return "success";
                        if (score >= 650) return "processing";
                        if (score >= 500) return "warning";
                        return "error";
                      };

                      return (
                        <div
                          key={exam.id || index}
                          style={{
                            padding: "16px",
                            border: "1px solid var(--color-border-light)",
                            borderRadius: "8px",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            background: "var(--color-bg-primary)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                            e.currentTarget.style.boxShadow = "var(--shadow-md)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-border-light)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: "15px", color: "var(--color-text-primary)" }}>
                                {exam.examName || "Bài thi TOEIC"}
                              </Text>
                              <div style={{ marginTop: "4px" }}>
                                <Text type="secondary" style={{ fontSize: "13px" }}>
                                  <ClockCircleOutlined style={{ marginRight: "4px" }} />
                                  {dayjs(exam.completedAt).format("DD/MM/YYYY HH:mm")}
                                </Text>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                color: getScoreColor(exam.totalScore)
                              }}>
                                {exam.totalScore}
                              </div>
                              <Tag color={getScoreStatus(exam.totalScore)} style={{ marginTop: "4px" }}>
                                {exam.totalScore >= 800 ? "Xuất sắc" :
                                 exam.totalScore >= 650 ? "Tốt" :
                                 exam.totalScore >= 500 ? "Khá" : "Cần cải thiện"}
                              </Tag>
                            </div>
                          </div>
                          
                          <Divider style={{ margin: "12px 0" }} />
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <div style={{ textAlign: "center", padding: "8px", background: "var(--color-bg-secondary)", borderRadius: "6px" }}>
                                <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>🎧 Listening</Text>
                                <Text strong style={{ fontSize: "16px", color: "var(--color-info)" }}>
                                  {exam.listeningScore || 0}
                                </Text>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: "center", padding: "8px", background: "var(--color-bg-secondary)", borderRadius: "6px" }}>
                                <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>📖 Reading</Text>
                                <Text strong style={{ fontSize: "16px", color: "var(--color-success)" }}>
                                  {exam.readingScore || 0}
                                </Text>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty 
                    description="Chưa có kết quả thi nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default Profile;
