import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { setLearnerCredentials } from "../../../store/learnerStore";
import authService from "../../../services/authService";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Avatar,
  Alert,
  Carousel,
  Spin,
  message,
} from "antd";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  BookOpen,
  Trophy,
  Target,
  Star,
  Globe,
  ArrowRight,
  Home,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object({
    username: Yup.string().required("Tên đăng nhập không được để trống"),
    password: Yup.string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .required("Mật khẩu không được để trống"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await authService.signIn(values);
        console.log("🚀 ~ onSubmit: ~ response:", response);

        if (response && response.data && response.data.token) {
          const token = response.data.token;
          const roles = response.data.roles;
          const refreshToken = response.data.refreshToken;
          const jwtExpirationTime = response.data.jwtExpirationTime;
          const refreshTokenExpirationTime =
            response.data.refreshTokenExpirationTime;

          const user = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            name: response.data.name,
            roles: response.data.roles,
          };

          // Lưu token và thông tin
          localStorage.setItem("learnerToken", token);
          localStorage.setItem("learnerRefreshToken", refreshToken);
          localStorage.setItem(
            "learnerAccessTokenExpirationTime",
            (Date.now() + jwtExpirationTime).toString()
          );
          localStorage.setItem(
            "learnerRefreshTokenExpirationTime",
            (Date.now() + refreshTokenExpirationTime).toString()
          );
          localStorage.setItem("learnerAuthenticated", "true");
          
          // Lưu thông tin user
          localStorage.setItem("learnerUser", JSON.stringify(user));

          // Remember me
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("rememberedUsername", formik.values.username);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("rememberedUsername");
          }

          // Kiểm tra role
          if (roles.includes("ROLE_LEARNER") || roles.includes("ROLE_ADMIN")) {
            // Sử dụng cả toast và message để đảm bảo hiển thị
            toast.success(
              "🎉 Đăng nhập thành công! Chào mừng bạn đến với TOEIC Learning!",
              {
                position: "top-right",
                autoClose: 3000,
              }
            );


            setTimeout(() => {
              navigate("/learner/", { replace: true });
            }, 1500);
          } else {
            toast.error("❌ Bạn không có quyền truy cập vào trang học viên!", {
              position: "top-right",
              autoClose: 4000,
            });

            message.error("❌ Bạn không có quyền truy cập vào trang học viên!");

            localStorage.removeItem("learnerToken");
            localStorage.removeItem("learnerRefreshToken");
            localStorage.removeItem("learnerAccessTokenExpirationTime");
            localStorage.removeItem("learnerRefreshTokenExpirationTime");
            localStorage.removeItem("learnerAuthenticated");
            localStorage.removeItem("learnerUser");
          }
        }
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        let errorMessage =
          "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";

        if (error.response?.status === 401) {
          errorMessage = "❌ Tên đăng nhập hoặc mật khẩu không đúng.";
        } else if (error.response?.status === 403) {
          errorMessage = "❌ Tài khoản của bạn đã bị khóa.";
        } else if (error.response?.status === 404) {
          errorMessage = "❌ Tài khoản không tồn tại.";
        } else if (error.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        }

        // Sử dụng cả toast và message
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        });

        message.error(errorMessage);
      }
      setLoading(false);
    },
  });

  // Load remembered username
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    const isRemembered = localStorage.getItem("rememberMe");

    if (isRemembered === "true" && rememberedUsername) {
      setRememberMe(true);
      formik.setFieldValue("username", rememberedUsername);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = () => {
    toast.info(
      "🚧 Tính năng đăng nhập với Google đang được phát triển. Vui lòng sử dụng tài khoản thông thường.",
      {
        position: "top-right",
        autoClose: 4000,
      }
    );

    message.info(
      "🚧 Tính năng đăng nhập với Google đang được phát triển. Vui lòng sử dụng tài khoản thông thường."
    );
  };

  const carouselContent = [
    {
      title: "Luyện Thi TOEIC Hiệu Quả",
      description: "Hệ thống luyện thi TOEIC toàn diện với AI hỗ trợ",
      icon: <BookOpen size={48} />,
      color: "#1890ff",
    },
    {
      title: "Đạt Điểm Cao",
      description: "Phương pháp học tập khoa học, nâng cao điểm số TOEIC",
      icon: <Trophy size={48} />,
      color: "#52c41a",
    },
    {
      title: "Mục Tiêu Rõ Ràng",
      description: "Theo dõi tiến độ học tập và đạt mục tiêu của bạn",
      icon: <Target size={48} />,
      color: "#722ed1",
    },
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Row gutter={[16, 16]} style={{ width: "100%", maxWidth: "1100px" }}>
          {/* Left Side - Login Form */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                border: "none",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Avatar
                  size={56}
                  style={{
                    backgroundColor: "#1890ff",
                    marginBottom: "12px",
                  }}
                  icon={<BookOpen size={28} />}
                />
                <Title level={2} style={{ margin: 0, color: "#1890ff", marginBottom: "8px" }}>
                  TOEIC Learning
                </Title>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Đăng nhập để bắt đầu hành trình học TOEIC
                </Text>
              </div>

              <Form layout="vertical" onFinish={formik.handleSubmit}>
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
                          marginTop: "2px",
                          color: "#52c41a",
                          fontSize: "11px",
                        }}
                      >
                        ✓ Tên đăng nhập hợp lệ
                      </div>
                    )}
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  validateStatus={
                    formik.touched.password && formik.errors.password
                      ? "error"
                      : formik.touched.password && !formik.errors.password
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
                  {formik.touched.password &&
                    !formik.errors.password &&
                    formik.values.password && (
                      <div
                        style={{
                          marginTop: "2px",
                          color: "#52c41a",
                          fontSize: "11px",
                        }}
                      >
                        ✓ Mật khẩu hợp lệ
                      </div>
                    )}
                </Form.Item>

                <Form.Item>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    >
                      Ghi nhớ đăng nhập
                    </Checkbox>
                    <Link
                      to="/forgot-password"
                      style={{ color: "#1890ff", textDecoration: "none" }}
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                    style={{
                      height: "44px",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </Button>
                </Form.Item>

                <Divider>Hoặc</Divider>

                <Form.Item>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={signInWithGoogle}
                    style={{
                      height: "44px",
                      borderRadius: "8px",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Globe size={18} />
                    Đăng nhập bằng Google
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Space direction="vertical" size="small">
                  <Text style={{ fontSize: "14px" }}>
                    Thành viên mới?{" "}
                    <Link
                      to="/auth/signup"
                      style={{ color: "#1890ff", fontWeight: "600" }}
                    >
                      Đăng ký ngay
                    </Link>
                  </Text>
                  <Text style={{ fontSize: "13px" }}>
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
                      <Home size={14} />
                      Trở về trang chủ
                    </Link>
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Right Side - Carousel */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                border: "none",
                height: "100%",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
              bodyStyle={{ padding: "32px", height: "100%" }}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Carousel autoplay effect="fade" style={{ height: "100%" }}>
                  {carouselContent.map((item, index) => (
                    <div key={index}>
                      <div
                        style={{
                          textAlign: "center",
                          color: "white",
                          padding: "24px 16px",
                          height: "320px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            marginBottom: "20px",
                            padding: "16px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {item.icon}
                        </div>
                        <Title
                          level={2}
                          style={{ color: "white", marginBottom: "12px" }}
                        >
                          {item.title}
                        </Title>
                        <Paragraph
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: "16px",
                            lineHeight: "1.5",
                            maxWidth: "280px",
                            marginBottom: "16px",
                          }}
                        >
                          {item.description}
                        </Paragraph>
                        <div style={{ marginTop: "16px" }}>
                          <Space>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                fill="rgba(255,255,255,0.8)"
                                color="rgba(255,255,255,0.8)"
                              />
                            ))}
                          </Space>
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default SignIn;
