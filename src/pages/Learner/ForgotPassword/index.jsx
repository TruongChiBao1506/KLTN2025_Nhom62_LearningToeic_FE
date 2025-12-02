import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Result,
} from "antd";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  // Validation Schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Email không được để trống"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await authService.forgotPassword(values.email);
        
        // Backend returns: { message: "Password reset link has been sent to your email" }
        const data = response?.data || response;
        
        if (data && data.message) {
          setSentEmail(values.email);
          setEmailSent(true);
          toast.success("✅ Email khôi phục mật khẩu đã được gửi!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        let errorMessage = "❌ Không thể gửi email khôi phục. Vui lòng thử lại.";
        
        // Handle validation errors from backend
        if (error.response?.status === 400) {
          const errorMsg = error.response.data?.errors?.[0]?.msg || 
                          error.response.data?.message || 
                          'Email không hợp lệ';
          errorMessage = `❌ ${errorMsg}`;
        } else if (error.response?.status === 404) {
          errorMessage = "❌ Email không tồn tại trong hệ thống.";
        } else if (error.response?.data?.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        } else if (!error.response) {
          errorMessage = "❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
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

  if (emailSent) {
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
                Email đã được gửi!
              </Title>
            }
            subTitle={
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Paragraph style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
                  Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến:
                </Paragraph>
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#2C5F8D",
                    display: "block",
                    padding: "12px",
                    background: "#EBF5FB",
                    borderRadius: "8px",
                  }}
                >
                  {sentEmail}
                </Text>
                <Paragraph style={{ fontSize: "15px", color: "#64748b", margin: "16px 0 0 0" }}>
                  Vui lòng kiểm tra hộp thư đến (và cả thư spam) để hoàn tất việc đặt lại mật khẩu.
                </Paragraph>
              </Space>
            }
            extra={[
              <Button
                key="signin"
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
                Về trang đăng nhập
              </Button>,
              <Button
                key="resend"
                type="default"
                size="large"
                onClick={() => {
                  setEmailSent(false);
                  formik.resetForm();
                }}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "500",
                  border: "2px solid #e2e8f0",
                  minWidth: "180px",
                  marginTop: "12px",
                }}
              >
                Gửi lại email
              </Button>,
            ]}
          />
        </Card>
      </Layout>
    );
  }

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
              <AlertCircle size={40} color="white" />
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
              Quên mật khẩu?
            </Title>
            <Text style={{ fontSize: "16px", color: "#64748b" }}>
              Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
            </Text>
          </div>

          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <Form.Item
              label={
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Email
                </span>
              }
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
                placeholder="Nhập địa chỉ email của bạn"
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

            <Form.Item style={{ marginTop: "32px", marginBottom: "16px" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                icon={<Send size={20} />}
                style={{
                  height: "52px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  background: "#2C5F8D",
                  border: "none",
                  boxShadow: "0 10px 25px rgba(44, 95, 141, 0.3)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
                {loading ? "Đang gửi..." : "Gửi email khôi phục"}
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
              <ArrowLeft size={18} />
              Quay lại đăng nhập
            </Link>
          </div>

          <div
            style={{
              marginTop: "32px",
              padding: "20px",
              background: "#EBF5FB",
              borderRadius: "12px",
              border: "1px solid #AED6F1",
            }}
          >
            <Space direction="vertical" size="small">
              <Text strong style={{ color: "#2C5F8D", fontSize: "14px" }}>
                💡 Lưu ý:
              </Text>
              <Text style={{ color: "#64748b", fontSize: "13px" }}>
                • Email khôi phục sẽ hết hạn sau 1 giờ
              </Text>
              <Text style={{ color: "#64748b", fontSize: "13px" }}>
                • Kiểm tra cả thư mục spam nếu không thấy email
              </Text>
              <Text style={{ color: "#64748b", fontSize: "13px" }}>
                • Liên hệ hỗ trợ nếu gặp vấn đề
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
