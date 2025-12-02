import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import authService from "../../../services/authService";
import { useAuthStore } from "../../../hooks/useAuthStore";
import achievementService from "../../../services/achievementService";
import {
  determineUserRole,
  getSuccessMessage,
  getRedirectRoute,
  getErrorMessage,
  rateLimiter,
} from "../../../utils/authHelpers";
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
  // Hook lưu thông tin user vào Redux
  const { setInfo, setIsAuthenticated, setRole } = useAuthStore();

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
      // ✅ Check rate limiting
      const lockoutStatus = rateLimiter.checkLockout();
      if (lockoutStatus.isLocked) {
        toast.error(`❌ Tài khoản bị khóa. Vui lòng thử lại sau ${lockoutStatus.remainingTime} phút.`, {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      setLoading(true);
      try {
        const response = await authService.signIn(values);
        console.log("� ~ onSubmit: ~ response:", response);

        if (response && response.data && response.data.token) {
          const { token, roles, refreshToken, jwtExpirationTime, refreshTokenExpirationTime } = response.data;

          // ✅ Construct user object with avatar from backend
          const user = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            name: response.data.name,
            roles: response.data.roles,
            avatar: response.data.image || response.data.avatar,
          };
          console.log("👤 User object with avatar:", user);

          // ✅ FIXED: Save tokens for ALL user roles (support multi-role users)
          // For multi-role users (e.g., TEACHER + LEARNER), save tokens to ALL role-specific keys
          // This ensures Protected Routes can validate tokens regardless of which route user visits
          if (roles.includes("ROLE_ADMIN")) {
            await authService.saveToken(token, refreshToken, jwtExpirationTime, refreshTokenExpirationTime, 'admin');
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          if (roles.includes("ROLE_TEACHER")) {
            await authService.saveToken(token, refreshToken, jwtExpirationTime, refreshTokenExpirationTime, 'teacher');
            localStorage.setItem('user', JSON.stringify(user)); // Admin & Teacher share 'user' key
          }
          
          if (roles.includes("ROLE_LEARNER")) {
            await authService.saveToken(token, refreshToken, jwtExpirationTime, refreshTokenExpirationTime, 'learner');
            localStorage.setItem('learnerUser', JSON.stringify(user)); // Learner uses 'learnerUser'
            sessionStorage.setItem("learnerAuthenticated", "true");
          }

          console.log("🔑 Tokens saved for all roles:", roles);

          // ✅ Update Redux store with initial user data
          setInfo(user);
          setIsAuthenticated(true);
          setRole(determineUserRole(roles));
          
          // ✅ Fetch full user profile to get avatar (non-blocking)
          try {
            const userService = (await import('../../../services/userService')).default;
            const userProfile = await userService.getCurrentUser();
            
            if (userProfile) {
              const avatarUrl = userProfile.image || userProfile.avatar || userProfile.profileImage || null;
              console.log('🖼️ Learner avatar from profile API:', avatarUrl);
              
              // ✅ Update Redux with complete profile including avatar
              setInfo({
                ...user,
                avatar: avatarUrl, // ✅ Override with avatar from profile API
              });
              
              console.log('✅ Learner Redux store updated with avatar');
            }
          } catch (profileError) {
            console.warn('⚠️ Failed to fetch learner profile, avatar may not display:', profileError);
          }

          // ✅ Record login streak (non-blocking)
          achievementService.recordLogin(user.id).catch(err => 
            console.warn("⚠️ Streak recording failed:", err)
          );

          // ✅ Remember me
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("rememberedUsername", values.username);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("rememberedUsername");
          }

          // ✅ Reset login attempts on success
          rateLimiter.resetAttempts();

          // ✅ Get redirect route and show success message
          const route = getRedirectRoute(roles);
          
          if (route) {
            toast.success(getSuccessMessage(roles), {
              position: "top-right",
              autoClose: 2000,
            });
            
            // ✅ Direct redirect (no setTimeout)
            navigate(route, { replace: true });
          } else {
            toast.error("❌ Bạn không có quyền truy cập hệ thống!", {
              position: "top-right",
              autoClose: 3000,
            });
            // ✅ Clear all tokens if no valid route
            authService.clearAuth();
          }
        }
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        
        // ✅ Record failed attempt
        const attemptStatus = rateLimiter.recordAttempt();
        
        // ✅ Get error message using helper
        const errorMessage = getErrorMessage(error);
        
        if (attemptStatus.shouldLockout) {
          toast.error(`❌ Quá nhiều lần đăng nhập thất bại. Tài khoản bị khóa 15 phút.`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (attemptStatus.attemptsLeft > 0) {
          toast.error(`${errorMessage} Còn ${attemptStatus.attemptsLeft} lần thử.`, {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 4000,
          });
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Load remembered username
  useEffect(() => {

    document.title = "Đăng nhập | TOEIC Learning";

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
      color: "var(--color-primary)",
    },
    {
      title: "Đạt Điểm Cao",
      description: "Phương pháp học tập khoa học, nâng cao điểm số TOEIC",
      icon: <Trophy size={48} />,
      color: "var(--color-success)",
    },
    {
      title: "Mục Tiêu Rõ Ràng",
      description: "Theo dõi tiến độ học tập và đạt mục tiêu của bạn",
      icon: <Target size={48} />,
      color: "var(--color-chart-4)",
    },
  ];

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
        <Row gutter={[32, 32]} style={{ width: "100%", maxWidth: "1200px" }}>
          {/* Left Side - Login Form */}
          <Col xs={24} lg={12} style={{ animation: "slideInLeft 0.6s ease-out" }}>
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
                border: "none",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
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
                  <BookOpen size={40} color="white" />
                </div>
                <Title level={1} style={{ margin: 0, fontSize: "32px", fontWeight: "700", marginBottom: "12px", color: "#2C5F8D" }}>
                  Chào mừng trở lại
                </Title>
                <Text style={{ fontSize: "16px", color: "#64748b" }}>
                  Đăng nhập để tiếp tục hành trình học TOEIC
                </Text>
              </div>

              <Form layout="vertical" onFinish={formik.handleSubmit}>
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

                <Form.Item
                  label={<span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Mật khẩu</span>}
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
                  {formik.touched.password &&
                    !formik.errors.password &&
                    formik.values.password && (
                      <div
                        style={{
                          marginTop: "6px",
                          color: "#10b981",
                          fontSize: "13px",
                          fontWeight: "500",
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
                      marginTop: "-8px",
                    }}
                  >
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ fontSize: "14px", color: "#64748b" }}
                    >
                      Ghi nhớ đăng nhập
                    </Checkbox>
                    <Link
                      to="/auth/forgot-password"
                      style={{ 
                        color: "#2C5F8D", 
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "color 0.3s ease",
                      }}
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </Form.Item>

                <Form.Item style={{ marginBottom: "16px" }}>
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
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </Button>
                </Form.Item>

                <Divider style={{ margin: "24px 0", color: "#cbd5e1" }}>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>Hoặc đăng nhập với</span>
                </Divider>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={signInWithGoogle}
                    style={{
                      height: "52px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      border: "2px solid #e2e8f0",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#2C5F8D";
                      e.currentTarget.style.color = "#2C5F8D";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "inherit";
                    }}
                  >
                    <Globe size={20} />
                    Đăng nhập bằng Google
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <Space direction="vertical" size="middle">
                  <Text style={{ fontSize: "15px", color: "#64748b" }}>
                    Thành viên mới?{" "}
                    <Link
                      to="/auth/signup"
                      style={{ 
                        color: "#2C5F8D", 
                        fontWeight: "600",
                        textDecoration: "none",
                        transition: "color 0.3s ease",
                      }}
                    >
                      Đăng ký ngay
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
                    <Home size={16} />
                    Trở về trang chủ
                  </Link>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Right Side - Feature Showcase */}
          <Col xs={24} lg={12} style={{ animation: "slideInRight 0.6s ease-out" }}>
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
                border: "none",
                height: "100%",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: "48px 40px", height: "100%" }}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "48px", animation: "fadeIn 1s ease-out" }}>
                  <Title level={1} style={{ color: "white", fontSize: "36px", fontWeight: "700", marginBottom: "16px", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                    TOEIC Learning Platform
                  </Title>
                  <Paragraph
                    style={{
                      color: "rgba(255,255,255,0.95)",
                      fontSize: "18px",
                      lineHeight: "1.6",
                      maxWidth: "400px",
                      margin: "0 auto",
                    }}
                  >
                    Nền tảng học TOEIC hiện đại với AI hỗ trợ, giúp bạn đạt điểm số mục tiêu
                  </Paragraph>
                </div>

                <div style={{ animation: "fadeIn 1.2s ease-out" }}>
                  <Carousel autoplay effect="fade" dotPosition="bottom">
                    {carouselContent.map((item, index) => (
                      <div key={index}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            minHeight: "350px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              marginBottom: "32px",
                              padding: "24px",
                              borderRadius: "24px",
                              background: "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(10px)",
                              display: "inline-flex",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            }}
                          >
                            {item.icon}
                          </div>
                          <Title
                            level={2}
                            style={{ color: "white", marginBottom: "16px", fontSize: "28px", fontWeight: "600" }}
                          >
                            {item.title}
                          </Title>
                          <Paragraph
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              fontSize: "17px",
                              lineHeight: "1.6",
                              maxWidth: "360px",
                              margin: "0 auto",
                            }}
                          >
                            {item.description}
                          </Paragraph>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>

                <div style={{ textAlign: "center", marginTop: "48px", animation: "fadeIn 1.4s ease-out" }}>
                  <Space size="small">
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
                    style={{ 
                      color: "rgba(255,255,255,0.95)", 
                      marginTop: "16px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Được tin dùng bởi hơn 10,000+ học viên
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default SignIn;
