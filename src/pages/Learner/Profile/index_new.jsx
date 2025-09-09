import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Progress,
  Badge,
  Space,
  Divider,
  Tag,
  Empty,
  Modal,
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
  CalendarOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import userService from "../../../services/userService";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bio: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setErrors({});

      const token = localStorage.getItem("token");
      if (!token) {
        setErrors({
          general: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
        });
        return;
      }

      const response = await userService.getUserProfile();
      
      if (response?.data) {
        const userData = response.data;
        setUser(userData);
        setEditedUser({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender || "",
          address: userData.address || "",
          bio: userData.bio || "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleImageChange = (e) => {
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

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editedUser.fullName?.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    } else if (editedUser.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!editedUser.email?.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (editedUser.phone && !/^[0-9+\-\s()]{10,15}$/.test(editedUser.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
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

      const formData = new FormData();
      Object.keys(editedUser).forEach((key) => {
        if (editedUser[key]) {
          formData.append(key, editedUser[key]);
        }
      });

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const response = await userService.updateUserProfile(formData);

      if (response?.data) {
        setUser(response.data);
        setEditMode(false);
        setImagePreview(null);
        setSelectedImage(null);
        setSuccessMessage("Cập nhật thông tin thành công!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      
      if (error?.response?.data?.message) {
        setErrors({
          general: error.response.data.message,
        });
      } else if (error?.response?.status === 400) {
        setErrors({
          general: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
        });
      } else {
        setErrors({
          general: "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
        });
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

      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

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

  const cancelEdit = () => {
    setEditMode(false);
    setErrors({});
    setImagePreview(null);
    setSelectedImage(null);
    setEditedUser({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      address: user?.address || "",
      bio: user?.bio || "",
    });
  };

  const refreshProfile = async () => {
    if (loading) return;
    
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
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(true)}
                    disabled={editMode || changePasswordMode}
                  >
                    Chỉnh sửa
                  </Button>
                ]}
              >
                {/* Profile Header */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <Avatar 
                      size={120} 
                      src={
                        imagePreview ||
                        (user?.profileImage && `http://localhost:5000/images/${user.profileImage}`) ||
                        null
                      }
                      icon={<UserOutlined />}
                      style={{ 
                        border: "4px solid #fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    />
                    {editMode && (
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleImageChange({ target: { files: [file] } });
                          return false;
                        }}
                      >
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<CameraOutlined />}
                          size="small"
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                          }}
                        />
                      </Upload>
                    )}
                  </div>
                  
                  <Title level={3} style={{ margin: "16px 0 8px 0" }}>
                    {user?.fullName || "Người dùng"}
                  </Title>
                  
                  <Space>
                    <Tag color={user?.emailVerified ? "green" : "orange"}>
                      {user?.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </Tag>
                    <Text type="secondary">System Administrator</Text>
                  </Space>
                </div>

                {/* Profile Information */}
                {editMode ? (
                  <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item 
                      label="Họ và tên"
                      validateStatus={errors.fullName ? "error" : ""}
                      help={errors.fullName}
                    >
                      <Input
                        value={editedUser.fullName}
                        onChange={(e) => handleChange({ target: { name: "fullName", value: e.target.value } })}
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>

                    <Form.Item 
                      label="Email"
                      validateStatus={errors.email ? "error" : ""}
                      help={errors.email}
                    >
                      <Input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => handleChange({ target: { name: "email", value: e.target.value } })}
                        disabled={user?.emailVerified}
                        placeholder="Nhập email"
                        prefix={<MailOutlined />}
                      />
                    </Form.Item>

                    <Form.Item label="Số điện thoại">
                      <Input
                        value={editedUser.phone}
                        onChange={(e) => handleChange({ target: { name: "phone", value: e.target.value } })}
                        placeholder="Nhập số điện thoại"
                        prefix={<PhoneOutlined />}
                      />
                    </Form.Item>

                    <Form.Item label="Ngày sinh">
                      <DatePicker
                        style={{ width: "100%" }}
                        value={editedUser.dateOfBirth ? dayjs(editedUser.dateOfBirth) : null}
                        onChange={(date) => handleChange({ 
                          target: { 
                            name: "dateOfBirth", 
                            value: date ? date.format("YYYY-MM-DD") : "" 
                          } 
                        })}
                        placeholder="Chọn ngày sinh"
                      />
                    </Form.Item>

                    <Form.Item label="Giới tính">
                      <Select
                        value={editedUser.gender}
                        onChange={(value) => handleChange({ target: { name: "gender", value } })}
                        placeholder="Chọn giới tính"
                      >
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Địa chỉ">
                      <Input
                        value={editedUser.address}
                        onChange={(e) => handleChange({ target: { name: "address", value: e.target.value } })}
                        placeholder="Nhập địa chỉ"
                        prefix={<EnvironmentOutlined />}
                      />
                    </Form.Item>

                    <Form.Item label="Giới thiệu">
                      <Input.TextArea
                        rows={3}
                        value={editedUser.bio}
                        onChange={(e) => handleChange({ target: { name: "bio", value: e.target.value } })}
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
                          Lưu thay đổi
                        </Button>
                        <Button onClick={cancelEdit} icon={<CloseOutlined />}>
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
                            {user?.gender === "male" ? "Nam" : 
                             user?.gender === "female" ? "Nữ" : 
                             user?.gender === "other" ? "Khác" : "Chưa cập nhật"}
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
                      icon={<LockOutlined />}
                      onClick={() => setChangePasswordMode(true)}
                      disabled={changePasswordMode}
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                )}

                {/* Change Password Form */}
                {changePasswordMode && (
                  <Card 
                    title="Đổi mật khẩu" 
                    size="small"
                    style={{ marginTop: "16px" }}
                    extra={
                      <Button 
                        type="text" 
                        icon={<CloseOutlined />}
                        onClick={() => setChangePasswordMode(false)}
                      />
                    }
                  >
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
                        >
                          Cập nhật mật khẩu
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
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
                      value={user?.totalExamsTaken || 0}
                      prefix={<BookOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Giờ học tập"
                      value={user?.studyHours || 0}
                      prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Điểm cao nhất"
                      value={user?.highestScore || 0}
                      prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Bài học hoàn thành"
                      value={user?.completedLessons || 0}
                      prefix={<StarOutlined style={{ color: "#722ed1" }} />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Điểm trung bình"
                      value={Math.round(user?.averageScore || 0)}
                      prefix={<FireOutlined style={{ color: "#eb2f96" }} />}
                      valueStyle={{ color: "#eb2f96" }}
                    />
                  </Col>
                  <Col xs={12} lg={8}>
                    <Statistic
                      title="Chứng chỉ đạt được"
                      value={user?.certificatesEarned || 0}
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
                      const active = user?.activeDays && user.activeDays.includes(dayIndex);

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
                    Streak hiện tại: <Text strong>{user?.currentStreak || 0}</Text> ngày
                  </Text>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card title="Hoạt động gần đây">
                {user?.recentActivity && user.recentActivity.length > 0 ? (
                  <Timeline>
                    {user.recentActivity.slice(0, 5).map((activity, index) => (
                      <Timeline.Item
                        key={activity.id || index}
                        color={activity.type === "exam" ? "blue" : 
                               activity.type === "practice" ? "green" : "purple"}
                      >
                        <div>
                          <Text strong>{activity.name}</Text>
                          {activity.score && (
                            <Tag color="blue" style={{ marginLeft: "8px" }}>
                              {activity.score} điểm
                            </Tag>
                          )}
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary">
                              {dayjs(activity.timestamp).format("DD/MM/YYYY HH:mm")}
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
