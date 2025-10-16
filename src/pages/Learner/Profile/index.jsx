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
import { useAuthStore } from "../../../hooks/useAuthStore";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Profile = () => {
  const { setInfo } = useAuthStore(); // Hook để update Redux store
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
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

      const token = localStorage.getItem("token");
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
        
        // Update Redux store để avatar hiển thị ở LearnerLayout
        setInfo({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name || userData.fullName,
          roles: userData.roles,
          avatar: userData.image || userData.avatar, // Cập nhật avatar vào store
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
      const response = await userService.getUserStatistics();
      if (response?.data) {
        setStatistics(response.data);
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
        activeDays: []
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

      await userService.changeUserPassword(
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
                            : `${process.env.LOCALHOST}/images/${user.profileImage}`;
                          
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
                      color: showProfileInfo && !changePasswordMode ? "#1890ff" : "#666",
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
                      color: changePasswordMode ? "#1890ff" : "#666",
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
                      style={{ borderRadius: "8px" }}
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
              {/* Statistics */}
              <Card 
                title="Thống kê học tập"
                style={{ marginBottom: "24px" }}
                extra={
                  <Button 
                    type="text" 
                    icon={<ReloadOutlined spin={loading || refreshing} />}
                    onClick={refreshProfile}
                    disabled={loading || refreshing}
                  />
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Bài kiểm tra đã làm"
                      value={statistics?.totalExamsTaken || user?.totalExamsTaken || 0}
                      prefix={<BookOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Giờ học tập"
                      value={statistics?.studyHours || user?.studyHours || 0}
                      prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Điểm cao nhất"
                      value={statistics?.highestScore || user?.highestScore || 0}
                      prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Bài học hoàn thành"
                      value={statistics?.completedLessons || user?.completedLessons || 0}
                      prefix={<StarOutlined style={{ color: "#722ed1" }} />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Điểm trung bình"
                      value={Math.round(statistics?.averageScore || user?.averageScore || 0)}
                      prefix={<FireOutlined style={{ color: "#eb2f96" }} />}
                      valueStyle={{ color: "#eb2f96" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Chứng chỉ đạt được"
                      value={statistics?.certificatesEarned || user?.certificatesEarned || 0}
                      prefix={<TrophyOutlined style={{ color: "#fa8c16" }} />}
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Col>
                </Row>

                <Divider />

                {/* Learning Streak */}
                <div>
                  <Title level={5}>Chuỗi ngày học</Title>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    {Array(7).fill().map((_, index) => {
                      const today = new Date();
                      const dayIndex = (today.getDay() - 6 + index) % 7;
                      const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dayIndex];
                      const active = statistics?.activeDays?.includes(dayIndex) || 
                                   user?.activeDays?.includes(dayIndex);

                      return (
                        <div
                          key={index}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background: active ? "#52c41a" : "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: active ? "white" : "#999",
                            fontSize: "12px",
                            fontWeight: "500"
                          }}
                        >
                          {dayName}
                        </div>
                      );
                    })}
                  </div>
                  <Text type="secondary">
                    Streak hiện tại: <Text strong>{statistics?.currentStreak || user?.currentStreak || 0}</Text> ngày
                  </Text>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card title="Hoạt động gần đây">
                {recentActivity && recentActivity.length > 0 ? (
                  <Timeline>
                    {recentActivity.map((activity, index) => (
                      <Timeline.Item
                        key={activity.id || index}
                        color={activity.type === "exam" ? "blue" : 
                               activity.type === "practice" ? "green" : "purple"}
                      >
                        <div>
                          <Text strong>{activity.name || activity.title}</Text>
                          {activity.score && (
                            <Tag color="blue" style={{ marginLeft: "8px" }}>
                              {activity.score} điểm
                            </Tag>
                          )}
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary">
                              {dayjs(activity.timestamp || activity.createdAt).format("DD/MM/YYYY HH:mm")}
                            </Text>
                            {activity.duration && (
                              <Text type="secondary" style={{ marginLeft: "8px" }}>
                                • {activity.duration} phút
                              </Text>
                            )}
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty 
                    description="Chưa có hoạt động nào"
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
