import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../../../services/authService";
import userService from "../../../services/userService";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Avatar,
  Steps,
  Progress,
  message,
  Tooltip,
} from "antd";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  UserPlus,
  BookOpen,
  Trophy,
  Target,
  Star,
  Globe,
  ArrowLeft,
  CheckCircle,
  Shield,
  Zap,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  // Validation Schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Tên đăng nhập không được để trống")
      .min(4, "Tên đăng nhập phải có ít nhất 4 ký tự"),
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Email không được để trống"),
    password: Yup.string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .required("Mật khẩu không được để trống"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
      .required("Vui lòng xác nhận mật khẩu"),
    fullName: Yup.string().required("Họ tên không được để trống"),
    phoneNumber: Yup.string().required("Số điện thoại không được để trống"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Kiểm tra email đã tồn tại chưa
        try {
          await userService.checkEmailExists(values.email);
        } catch (emailError) {
          if (emailError.response && emailError.response.status === 409) {
            message.error({
              content: "❌ Email đã được sử dụng. Vui lòng chọn email khác.",
              duration: 4,
            });
            setLoading(false);
            return;
          }
        }

        const signUpData = {
          username: values.username,
          email: values.email,
          password: values.password,
          name: values.fullName,
          phoneNumber: values.phoneNumber,
        };

        console.log("Đang gửi dữ liệu đăng ký:", signUpData);
        const response = await authService.signUp(signUpData);
        console.log("🚀 ~ onSubmit: ~ response:", response);

        if (response && response.data) {
          message.success({
            content:
              "🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
            duration: 5,
          });
          setTimeout(() => {
            navigate("/auth/signin");
          }, 2000);
        }
      } catch (error) {
        console.error("Đăng ký thất bại:", error);
        let errorMessage = "❌ Đăng ký thất bại. Vui lòng thử lại.";

        if (error.response?.data?.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        } else if (error.response?.status === 400) {
          errorMessage =
            "❌ Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
        } else if (error.response?.status === 409) {
          errorMessage = "❌ Tên đăng nhập hoặc email đã tồn tại.";
        } else if (error.response?.status === 500) {
          errorMessage = "❌ Lỗi hệ thống. Vui lòng thử lại sau.";
        }

        message.error({
          content: errorMessage,
          duration: 5,
        });
      }
      setLoading(false);
    },
  });

  const features = [
    {
      icon: <BookOpen size={32} />,
      title: "Học TOEIC Hiệu Quả",
      description:
        "Hệ thống bài học được thiết kế khoa học, phù hợp với từng trình độ",
      color: "var(--color-primary)",
    },
    {
      icon: <Target size={32} />,
      title: "Mục Tiêu Rõ Ràng",
      description: "Theo dõi tiến độ học tập và đạt mục tiêu điểm số mong muốn",
      color: "var(--color-success)",
    },
    {
      icon: <Trophy size={32} />,
      title: "Thành Tích Cao",
      description: "Hàng nghìn học viên đã đạt điểm cao trong kỳ thi TOEIC",
      color: "var(--color-chart-6)",
    },
    {
      icon: <Zap size={32} />,
      title: "AI Hỗ Trợ",
      description: "Trí tuệ nhân tạo giúp cá nhân hóa quá trình học tập",
      color: "var(--color-chart-4)",
    },
  ];

  const passwordStrength = calculatePasswordStrength(formik.values.password);
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "var(--color-danger)";
    if (passwordStrength < 80) return "var(--color-warning)";
    return "var(--color-success)";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 80) return "Trung bình";
    return "Mạnh";
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#2C5F8D",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "40%",
            height: "40%",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "40%",
            height: "40%",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, 50px) scale(1.1); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div
        style={{
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Row gutter={[32, 32]} style={{ width: "100%", maxWidth: "1400px" }}>
          {/* Left Side - Features */}
          <Col xs={24} lg={10} style={{ animation: "slideInLeft 0.6s ease-out" }}>
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
                border: "none",
                height: "100%",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
              }}
              bodyStyle={{ padding: "48px", color: "white" }}
            >
              <div style={{ textAlign: "center", marginBottom: "40px", animation: "fadeIn 0.8s ease-out" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  }}
                >
                  <UserPlus size={40} color="white" />
                </div>
                <Title level={2} style={{ color: "white", margin: 0, fontSize: "32px", fontWeight: "700", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  Gia Nhập Cộng Đồng TOEIC
                </Title>
                <Paragraph
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: "17px",
                    marginTop: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  Hàng nghìn học viên đã tin tưởng và đạt điểm cao
                </Paragraph>
              </div>

              <Row gutter={[16, 24]}>
                {features.map((feature, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        padding: "24px",
                        textAlign: "center",
                        height: "100%",
                        border: "1px solid rgba(255,255,255,0.3)",
                        transition: "all 0.3s ease",
                        animation: `fadeIn ${0.8 + index * 0.2}s ease-out`,
                      }}
                    >
                      <div
                        style={{
                          color: "white",
                          marginBottom: "16px",
                          display: "flex",
                          justifyContent: "center",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                        }}
                      >
                        {feature.icon}
                      </div>
                      <Title
                        level={5}
                        style={{ color: "white", margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}
                      >
                        {feature.title}
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "14px",
                          lineHeight: "1.5",
                        }}
                      >
                        {feature.description}
                      </Text>
                    </div>
                  </Col>
                ))}
              </Row>

              <div style={{ textAlign: "center", marginTop: "40px", animation: "fadeIn 1.2s ease-out" }}>
                <Space>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      fill="white"
                      color="white"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                    />
                  ))}
                </Space>
                <Paragraph
                  style={{ color: "rgba(255,255,255,0.95)", marginTop: "16px", fontSize: "16px", fontWeight: "500" }}
                >
                  Được đánh giá 5 sao bởi hơn 10,000 học viên
                </Paragraph>
              </div>
            </Card>
          </Col>

          {/* Right Side - Registration Form */}
          <Col xs={24} lg={14} style={{ animation: "slideInRight 0.6s ease-out" }}>
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
                border: "none",
                height: "100%",
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(20px)",
              }}
              bodyStyle={{ padding: "48px 40px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "40px", animation: "fadeIn 0.8s ease-out" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#2C5F8D",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    boxShadow: "0 10px 30px rgba(44, 95, 141, 0.3)",
                  }}
                >
                  <UserPlus size={40} color="white" />
                </div>
                <Title level={1} style={{ margin: 0, fontSize: "32px", fontWeight: "700", marginBottom: "12px", color: "#2C5F8D" }}>
                  Tạo Tài Khoản Mới
                </Title>
                <Text style={{ fontSize: "16px", color: "#64748b" }}>
                  Điền thông tin để bắt đầu hành trình TOEIC của bạn
                </Text>
              </div>

              <Form layout="vertical" onFinish={formik.handleSubmit}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Họ và tên</span>}
                      validateStatus={
                        formik.touched.fullName && formik.errors.fullName
                          ? "error"
                          : formik.touched.fullName && !formik.errors.fullName
                          ? "success"
                          : ""
                      }
                      help={formik.touched.fullName && formik.errors.fullName}
                      hasFeedback
                    >
                      <Input
                        size="large"
                        prefix={<User size={20} style={{ color: "#94a3b8" }} />}
                        placeholder="Nhập họ và tên"
                        name="fullName"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "15px",
                          border: "2px solid #e2e8f0",
                          transition: "all 0.3s ease",
                        }}
                      />
                      {formik.touched.fullName &&
                        !formik.errors.fullName &&
                        formik.values.fullName && (
                          <div
                            style={{
                              marginTop: "6px",
                              color: "#10b981",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            ✓ Họ tên hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Tên đăng nhập</span>}
                      validateStatus={
                        formik.touched.username && formik.errors.username
                          ? "error"
                          : formik.touched.username && !formik.errors.username
                          ? "success"
                          : ""
                      }
                      help={formik.touched.username && formik.errors.username}
                      hasFeedback
                    >
                      <Input
                        size="large"
                        prefix={<User size={20} style={{ color: "#94a3b8" }} />}
                        placeholder="Nhập tên đăng nhập"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "15px",
                          border: "2px solid #e2e8f0",
                          transition: "all 0.3s ease",
                        }}
                      />
                      {formik.touched.username &&
                        !formik.errors.username &&
                        formik.values.username && (
                          <div
                            style={{
                              marginTop: "6px",
                              color: "#10b981",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            ✓ Tên đăng nhập hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Email</span>}
                      validateStatus={
                        formik.touched.email && formik.errors.email
                          ? "error"
                          : formik.touched.email && !formik.errors.email
                          ? "success"
                          : ""
                      }
                      help={formik.touched.email && formik.errors.email}
                      hasFeedback
                    >
                      <Input
                        size="large"
                        prefix={<Mail size={20} style={{ color: "#94a3b8" }} />}
                        placeholder="Nhập địa chỉ email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "15px",
                          border: "2px solid #e2e8f0",
                          transition: "all 0.3s ease",
                        }}
                      />
                      {formik.touched.email &&
                        !formik.errors.email &&
                        formik.values.email && (
                          <div
                            style={{
                              marginTop: "6px",
                              color: "#10b981",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            ✓ Email hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Số điện thoại</span>}
                      validateStatus={
                        formik.touched.phoneNumber && formik.errors.phoneNumber
                          ? "error"
                          : formik.touched.phoneNumber &&
                            !formik.errors.phoneNumber
                          ? "success"
                          : ""
                      }
                      help={
                        formik.touched.phoneNumber && formik.errors.phoneNumber
                      }
                      hasFeedback
                    >
                      <Input
                        size="large"
                        prefix={
                          <Phone size={20} style={{ color: "#94a3b8" }} />
                        }
                        placeholder="Nhập số điện thoại"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          fontSize: "15px",
                          border: "2px solid #e2e8f0",
                          transition: "all 0.3s ease",
                        }}
                      />
                      {formik.touched.phoneNumber &&
                        !formik.errors.phoneNumber &&
                        formik.values.phoneNumber && (
                          <div
                            style={{
                              marginTop: "6px",
                              color: "#10b981",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            ✓ Số điện thoại hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Mật khẩu</span>}
                  validateStatus={
                    formik.touched.password && formik.errors.password
                      ? "error"
                      : formik.touched.password &&
                        !formik.errors.password &&
                        passwordStrength >= 60
                      ? "success"
                      : ""
                  }
                  help={formik.touched.password && formik.errors.password}
                  hasFeedback
                >
                  <Input.Password
                    size="large"
                    prefix={<Lock size={20} style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập mật khẩu"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    iconRender={(visible) =>
                      visible ? <Eye size={20} /> : <EyeOff size={20} />
                    }
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontSize: "15px",
                      border: "2px solid #e2e8f0",
                      transition: "all 0.3s ease",
                    }}
                  />
                  {formik.values.password && (
                    <div style={{ marginTop: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <Text style={{ fontSize: "13px", color: "#64748b" }}>Độ mạnh mật khẩu:</Text>
                        <Text style={{ color: getPasswordStrengthColor(), fontSize: "13px", fontWeight: "600" }}>
                          {getPasswordStrengthText()}
                        </Text>
                      </div>
                      <Progress
                        percent={passwordStrength}
                        showInfo={false}
                        strokeColor={getPasswordStrengthColor()}
                        strokeWidth={8}
                        trailColor="#e2e8f0"
                      />
                      {formik.touched.password &&
                        !formik.errors.password &&
                        passwordStrength >= 60 && (
                          <div
                            style={{
                              marginTop: "8px",
                              color: "#10b981",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            ✓ Mật khẩu đủ mạnh
                          </div>
                        )}
                      {formik.values.password && passwordStrength < 60 && (
                        <div
                          style={{
                            marginTop: "8px",
                            color: "#f59e0b",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          ⚠ Nên sử dụng mật khẩu mạnh hơn (chữ hoa, số, ký tự
                          đặc biệt)
                        </div>
                      )}
                    </div>
                  )}
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Xác nhận mật khẩu</span>}
                  validateStatus={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "error"
                      : formik.touched.confirmPassword &&
                        !formik.errors.confirmPassword &&
                        formik.values.confirmPassword
                      ? "success"
                      : ""
                  }
                  help={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                  hasFeedback
                >
                  <Input.Password
                    size="large"
                    prefix={<Shield size={20} style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập lại mật khẩu"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    iconRender={(visible) =>
                      visible ? <Eye size={20} /> : <EyeOff size={20} />
                    }
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontSize: "15px",
                      border: "2px solid #e2e8f0",
                      transition: "all 0.3s ease",
                    }}
                  />
                  {formik.values.confirmPassword &&
                    formik.values.password ===
                      formik.values.confirmPassword && (
                      <div
                        style={{
                          marginTop: "8px",
                          color: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        <CheckCircle size={16} />
                        Mật khẩu khớp
                      </div>
                    )}
                  {formik.values.confirmPassword &&
                    formik.values.password !==
                      formik.values.confirmPassword && (
                      <div
                        style={{
                          marginTop: "8px",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        ✗ Mật khẩu không khớp
                      </div>
                    )}
                </Form.Item>

                <Form.Item style={{ marginTop: "32px", marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                    style={{
                      height: "52px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      background: "#2C5F8D",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(44, 95, 141, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 15px 35px rgba(44, 95, 141, 0.4)";
                      e.currentTarget.style.background = "#3498DB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(44, 95, 141, 0.3)";
                      e.currentTarget.style.background = "#2C5F8D";
                    }}
                  >
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <Space direction="vertical" size="middle">
                  <Text style={{ fontSize: "15px", color: "#64748b" }}>
                    Đã có tài khoản?{" "}
                    <Link
                      to="/auth/signin"
                      style={{ 
                        color: "#2C5F8D", 
                        fontWeight: "600",
                        textDecoration: "none",
                        transition: "color 0.3s ease",
                      }}
                    >
                      Đăng nhập ngay
                    </Link>
                  </Text>
                  <Link
                    to="/"
                    style={{
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                  >
                    <ArrowLeft size={16} />
                    Trở về trang chủ
                  </Link>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default SignUp;
