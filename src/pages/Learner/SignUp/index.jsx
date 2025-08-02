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
      color: "#1890ff",
    },
    {
      icon: <Target size={32} />,
      title: "Mục Tiêu Rõ Ràng",
      description: "Theo dõi tiến độ học tập và đạt mục tiêu điểm số mong muốn",
      color: "#52c41a",
    },
    {
      icon: <Trophy size={32} />,
      title: "Thành Tích Cao",
      description: "Hàng nghìn học viên đã đạt điểm cao trong kỳ thi TOEIC",
      color: "#fa8c16",
    },
    {
      icon: <Zap size={32} />,
      title: "AI Hỗ Trợ",
      description: "Trí tuệ nhân tạo giúp cá nhân hóa quá trình học tập",
      color: "#722ed1",
    },
  ];

  const passwordStrength = calculatePasswordStrength(formik.values.password);
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "#ff4d4f";
    if (passwordStrength < 80) return "#faad14";
    return "#52c41a";
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Row gutter={[24, 24]} style={{ width: "100%", maxWidth: "1400px" }}>
          {/* Left Side - Features */}
          <Col xs={24} lg={10}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                border: "none",
                height: "100%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              bodyStyle={{ padding: "48px", color: "white" }}
            >
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <Avatar
                  size={80}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    marginBottom: "20px",
                  }}
                  icon={<UserPlus size={40} />}
                />
                <Title level={2} style={{ color: "white", margin: 0 }}>
                  Gia Nhập Cộng Đồng TOEIC
                </Title>
                <Paragraph
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "16px",
                    marginTop: "12px",
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
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "12px",
                        padding: "24px",
                        textAlign: "center",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          color: "white",
                          marginBottom: "16px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {feature.icon}
                      </div>
                      <Title
                        level={5}
                        style={{ color: "white", margin: "0 0 8px 0" }}
                      >
                        {feature.title}
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "14px",
                        }}
                      >
                        {feature.description}
                      </Text>
                    </div>
                  </Col>
                ))}
              </Row>

              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Space>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      fill="rgba(255,255,255,0.8)"
                      color="rgba(255,255,255,0.8)"
                    />
                  ))}
                </Space>
                <Paragraph
                  style={{ color: "rgba(255,255,255,0.9)", marginTop: "12px" }}
                >
                  Được đánh giá 5 sao bởi hơn 10,000 học viên
                </Paragraph>
              </div>
            </Card>
          </Col>

          {/* Right Side - Registration Form */}
          <Col xs={24} lg={14}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                border: "none",
                height: "100%",
              }}
              bodyStyle={{ padding: "48px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: "#1890ff",
                    marginBottom: "16px",
                  }}
                  icon={<UserPlus size={32} />}
                />
                <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                  Tạo Tài Khoản Mới
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  Điền thông tin để bắt đầu hành trình TOEIC của bạn
                </Text>
              </div>

              <Form layout="vertical" onFinish={formik.handleSubmit}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Họ và tên"
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
                        prefix={<User size={20} style={{ color: "#bfbfbf" }} />}
                        placeholder="Nhập họ và tên"
                        name="fullName"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.fullName &&
                        !formik.errors.fullName &&
                        formik.values.fullName && (
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#52c41a",
                              fontSize: "12px",
                            }}
                          >
                            ✓ Họ tên hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Tên đăng nhập"
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
                        prefix={<User size={20} style={{ color: "#bfbfbf" }} />}
                        placeholder="Nhập tên đăng nhập"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.username &&
                        !formik.errors.username &&
                        formik.values.username && (
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#52c41a",
                              fontSize: "12px",
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
                      label="Email"
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
                        prefix={<Mail size={20} style={{ color: "#bfbfbf" }} />}
                        placeholder="Nhập địa chỉ email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email &&
                        !formik.errors.email &&
                        formik.values.email && (
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#52c41a",
                              fontSize: "12px",
                            }}
                          >
                            ✓ Email hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Số điện thoại"
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
                          <Phone size={20} style={{ color: "#bfbfbf" }} />
                        }
                        placeholder="Nhập số điện thoại"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.phoneNumber &&
                        !formik.errors.phoneNumber &&
                        formik.values.phoneNumber && (
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#52c41a",
                              fontSize: "12px",
                            }}
                          >
                            ✓ Số điện thoại hợp lệ
                          </div>
                        )}
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Mật khẩu"
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
                    prefix={<Lock size={20} style={{ color: "#bfbfbf" }} />}
                    placeholder="Nhập mật khẩu"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    iconRender={(visible) =>
                      visible ? <Eye size={20} /> : <EyeOff size={20} />
                    }
                  />
                  {formik.values.password && (
                    <div style={{ marginTop: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary">Độ mạnh mật khẩu:</Text>
                        <Text style={{ color: getPasswordStrengthColor() }}>
                          {getPasswordStrengthText()}
                        </Text>
                      </div>
                      <Progress
                        percent={passwordStrength}
                        showInfo={false}
                        strokeColor={getPasswordStrengthColor()}
                        size="small"
                      />
                      {formik.touched.password &&
                        !formik.errors.password &&
                        passwordStrength >= 60 && (
                          <div
                            style={{
                              marginTop: "4px",
                              color: "#52c41a",
                              fontSize: "12px",
                            }}
                          >
                            ✓ Mật khẩu đủ mạnh
                          </div>
                        )}
                      {formik.values.password && passwordStrength < 60 && (
                        <div
                          style={{
                            marginTop: "4px",
                            color: "#faad14",
                            fontSize: "12px",
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
                  label="Xác nhận mật khẩu"
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
                    prefix={<Shield size={20} style={{ color: "#bfbfbf" }} />}
                    placeholder="Nhập lại mật khẩu"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    iconRender={(visible) =>
                      visible ? <Eye size={20} /> : <EyeOff size={20} />
                    }
                  />
                  {formik.values.confirmPassword &&
                    formik.values.password ===
                      formik.values.confirmPassword && (
                      <div
                        style={{
                          marginTop: "8px",
                          color: "#52c41a",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CheckCircle size={16} />
                        <Text style={{ color: "#52c41a" }}>
                          ✓ Mật khẩu khớp
                        </Text>
                      </div>
                    )}
                  {formik.values.confirmPassword &&
                    formik.values.password !==
                      formik.values.confirmPassword && (
                      <div
                        style={{
                          marginTop: "8px",
                          color: "#ff4d4f",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                        }}
                      >
                        ✗ Mật khẩu không khớp
                      </div>
                    )}
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Space direction="vertical" size="small">
                  <Text>
                    Đã có tài khoản?{" "}
                    <Link
                      to="/auth/signin"
                      style={{ color: "#1890ff", fontWeight: "600" }}
                    >
                      Đăng nhập ngay
                    </Link>
                  </Text>
                  <Text>
                    <Link
                      to="/"
                      style={{
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <ArrowLeft size={16} />
                      Trở về trang chủ
                    </Link>
                  </Text>
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
