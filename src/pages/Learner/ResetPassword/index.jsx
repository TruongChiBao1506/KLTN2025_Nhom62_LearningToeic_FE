import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../../../services/authService";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Progress,
  Result,
  Spin,
} from "antd";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setVerifying(false);
        toast.error("❌ Liên kết không hợp lệ. Vui lòng thử lại.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      try {
        const response = await authService.verifyResetToken(token);
        
        // Backend returns: { valid: true, message: "Reset token is valid" }
        if (response && response.valid === true) {
          setTokenValid(true);
          toast.success("✅ Xác thực thành công! Vui lòng đặt mật khẩu mới.", {
            position: "top-right",
            autoClose: 2500,
          });
        } else {
          setTokenValid(false);
          const errorMsg = response?.message || "Liên kết không hợp lệ.";
          toast.error(`❌ ${errorMsg}`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        setTokenValid(false);
        
        // Handle specific error responses from backend
        let errorMessage = "❌ Liên kết không hợp lệ hoặc đã hết hạn.";
        
        if (error.response?.status === 400) {
          // Bad request - invalid token format or expired
          const backendMsg = error.response.data?.errors?.[0]?.msg || 
                            error.response.data?.message;
          errorMessage = backendMsg ? `❌ ${backendMsg}` : "❌ Liên kết không hợp lệ.";
        } else if (error.response?.status === 404) {
          errorMessage = "❌ Token không tồn tại hoặc đã được sử dụng.";
        } else if (error.response?.status === 410) {
          errorMessage = "❌ Liên kết đã hết hạn. Vui lòng yêu cầu khôi phục mới.";
        } else if (error.response?.data?.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

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
    newPassword: Yup.string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .required("Mật khẩu không được để trống"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Mật khẩu xác nhận không khớp")
      .required("Vui lòng xác nhận mật khẩu"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await authService.resetPassword(token, values.newPassword);
        
        // Backend returns: { message: "Password has been reset successfully. You can now login with your new password." }
        if (response && response.message) {
          setResetSuccess(true);
          toast.success("✅ Mật khẩu đã được đặt lại thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            navigate("/auth/signin");
          }, 3000);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        // Handle specific error responses from backend
        let errorMessage = "❌ Không thể đặt lại mật khẩu. Vui lòng thử lại.";
        
        if (error.response?.status === 400) {
          // Validation errors from backend (express-validator)
          const backendMsg = error.response.data?.errors?.[0]?.msg || 
                            error.response.data?.message;
          errorMessage = backendMsg ? `❌ ${backendMsg}` : 
                        "❌ Token không hợp lệ hoặc mật khẩu không đúng định dạng.";
        } else if (error.response?.status === 404) {
          errorMessage = "❌ Token không tồn tại hoặc đã hết hạn.";
        } else if (error.response?.status === 410) {
          errorMessage = "❌ Liên kết đã được sử dụng. Vui lòng yêu cầu khôi phục mới.";
        } else if (error.response?.data?.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const passwordStrength = calculatePasswordStrength(formik.values.newPassword);
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

  // Loading state while verifying token
  if (verifying) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          background: "#2C5F8D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text style={{ color: "white", fontSize: "18px" }}>
            Đang xác thực liên kết...
          </Text>
        </Space>
      </Layout>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          background: "#2C5F8D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Card
          style={{
            maxWidth: "500px",
            width: "100%",
            borderRadius: "24px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
            border: "none",
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
          }}
          bodyStyle={{ padding: "48px 40px" }}
        >
          <Result
            status="error"
            icon={<XCircle size={80} color="#ef4444" />}
            title={
              <Title level={2} style={{ color: "#ef4444", marginTop: "24px" }}>
                Liên kết không hợp lệ
              </Title>
            }
            subTitle={
              <Paragraph style={{ fontSize: "16px", color: "#64748b" }}>
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu khôi phục mật khẩu mới.
              </Paragraph>
            }
            extra={[
              <Button
                key="forgot"
                type="primary"
                size="large"
                onClick={() => navigate("/forgot-password")}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  background: "#2C5F8D",
                  border: "none",
                  minWidth: "200px",
                }}
              >
                Yêu cầu khôi phục mới
              </Button>,
              <Button
                key="signin"
                type="default"
                size="large"
                onClick={() => navigate("/auth/signin")}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "500",
                  border: "2px solid #e2e8f0",
                  minWidth: "200px",
                  marginTop: "12px",
                }}
              >
                Về trang đăng nhập
              </Button>,
            ]}
          />
        </Card>
      </Layout>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          background: "#2C5F8D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Card
          style={{
            maxWidth: "500px",
            width: "100%",
            borderRadius: "24px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
            border: "none",
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
          }}
          bodyStyle={{ padding: "48px 40px" }}
        >
          <Result
            status="success"
            icon={<CheckCircle size={80} color="#10b981" />}
            title={
              <Title level={2} style={{ color: "#2C5F8D", marginTop: "24px" }}>
                Đặt lại mật khẩu thành công!
              </Title>
            }
            subTitle={
              <Paragraph style={{ fontSize: "16px", color: "#64748b" }}>
                Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
              </Paragraph>
            }
            extra={
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/auth/signin")}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  background: "#2C5F8D",
                  border: "none",
                  minWidth: "180px",
                }}
              >
                Đăng nhập ngay
              </Button>
            }
          />
        </Card>
      </Layout>
    );
  }

  // Reset password form
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#2C5F8D",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background */}
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
        <Card
          style={{
            maxWidth: "500px",
            width: "100%",
            borderRadius: "24px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
            border: "none",
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            animation: "fadeIn 0.6s ease-out",
          }}
          bodyStyle={{ padding: "48px 40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
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
              <Shield size={40} color="white" />
            </div>
            <Title
              level={1}
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "12px",
                color: "#2C5F8D",
              }}
            >
              Đặt lại mật khẩu
            </Title>
            <Text style={{ fontSize: "16px", color: "#64748b" }}>
              Nhập mật khẩu mới cho tài khoản của bạn
            </Text>
          </div>

          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <Form.Item
              label={
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Mật khẩu mới
                </span>
              }
              validateStatus={
                formik.touched.newPassword && formik.errors.newPassword
                  ? "error"
                  : formik.touched.newPassword &&
                    !formik.errors.newPassword &&
                    passwordStrength >= 60
                  ? "success"
                  : ""
              }
              help={formik.touched.newPassword && formik.errors.newPassword}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<Lock size={20} style={{ color: "#94a3b8" }} />}
                placeholder="Nhập mật khẩu mới"
                name="newPassword"
                value={formik.values.newPassword}
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
              {formik.values.newPassword && (
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <Text style={{ fontSize: "13px", color: "#64748b" }}>
                      Độ mạnh mật khẩu:
                    </Text>
                    <Text
                      style={{
                        color: getPasswordStrengthColor(),
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
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
                  {formik.touched.newPassword &&
                    !formik.errors.newPassword &&
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
                </div>
              )}
            </Form.Item>

            <Form.Item
              label={
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Xác nhận mật khẩu mới
                </span>
              }
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
                placeholder="Nhập lại mật khẩu mới"
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
                formik.values.newPassword ===
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
                  e.currentTarget.style.boxShadow =
                    "0 15px 35px rgba(44, 95, 141, 0.4)";
                  e.currentTarget.style.background = "#3498DB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(44, 95, 141, 0.3)";
                  e.currentTarget.style.background = "#2C5F8D";
                }}
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link
              to="/auth/signin"
              style={{
                color: "#2C5F8D",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "600",
                transition: "color 0.3s ease",
              }}
            >
              Nhớ mật khẩu? Đăng nhập ngay
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
