import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../../../services/authService";
import userService from "../../../services/userService";
import "./style.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
          // Nếu không có lỗi, tiếp tục đăng ký
        } catch (emailError) {
          // Nếu email đã tồn tại, hiển thị thông báo lỗi
          if (emailError.response && emailError.response.status === 400) {
            toast.error("Email đã được sử dụng. Vui lòng chọn email khác.", {
              position: "top-center",
              autoClose: 3000,
            });
            setLoading(false);
            return;
          }
        }

        // Tạo dữ liệu đăng ký
        const signUpData = {
          username: values.username,
          email: values.email,
          password: values.password,
          name: values.fullName, // Chuyển fullName thành name cho BE
          phoneNumber: values.phoneNumber, // Thêm phoneNumber
          role: ["learner"], // Gán vai trò là học viên
        }; // Gọi API đăng ký
        await authService.signUp(signUpData);

        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );

        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        setTimeout(() => {
          navigate("/auth/signin");
        }, 3000);
      } catch (error) {
        console.error("Đăng ký thất bại:", error);
        toast.error(
          error.response?.data?.message ||
            "Đăng ký thất bại. Vui lòng thử lại sau.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
      }
      setLoading(false);
    },
  });

  return (
    <div className="sign-up-container">
      <div className="row">
        <div className="col-lg-6 col-md-8 col-sm-12 mx-auto">
          <div className="card sign-up-card">
            <div className="row g-0">
              <div className="col-md-6">
                <div className="sign-up-form-container">
                  <div className="logo mb-4">
                    <span className="logo-text">TOEIC</span>
                  </div>
                  <h3 className="header-title mb-4">ĐĂNG KÝ</h3>

                  <form onSubmit={formik.handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className={`form-control ${
                          formik.touched.username && formik.errors.username
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Tên đăng nhập"
                        id="username"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.username && formik.errors.username && (
                        <div className="invalid-feedback">
                          {formik.errors.username}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="text"
                        className={`form-control ${
                          formik.touched.fullName && formik.errors.fullName
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Họ và tên"
                        id="fullName"
                        name="fullName"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.fullName && formik.errors.fullName && (
                        <div className="invalid-feedback">
                          {formik.errors.fullName}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="email"
                        className={`form-control ${
                          formik.touched.email && formik.errors.email
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Email"
                        id="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="invalid-feedback">
                          {formik.errors.email}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="tel"
                        className={`form-control ${
                          formik.touched.phoneNumber && formik.errors.phoneNumber
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Số điện thoại"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                        <div className="invalid-feedback">
                          {formik.errors.phoneNumber}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="password"
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Mật khẩu"
                        id="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="password"
                        className={`form-control ${
                          formik.touched.confirmPassword &&
                          formik.errors.confirmPassword
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Xác nhận mật khẩu"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.confirmPassword &&
                        formik.errors.confirmPassword && (
                          <div className="invalid-feedback">
                            {formik.errors.confirmPassword}
                          </div>
                        )}
                    </div>

                    <div className="text-center mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <span>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Đang xử lý...
                          </span>
                        ) : (
                          "Đăng ký"
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="links-container text-center">
                    <div className="mb-2">
                      Đã có tài khoản?{" "}
                      <Link to="/auth/signin" className="text-decoration-none">
                        Đăng nhập
                      </Link>
                    </div>
                    <div>
                      Hoặc{" "}
                      <Link to="/" className="text-decoration-none">
                        Trở về trang chủ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 d-none d-md-block">
                <div className="sign-up-image-container">
                  <div className="sign-up-content">
                    <h2 className="mb-4">Học TOEIC cùng chúng tôi</h2>
                    <p className="mb-4">
                      Đăng ký tài khoản để mở khóa tất cả các tính năng và tài
                      nguyên học tập. Bắt đầu hành trình đạt điểm TOEIC cao ngay
                      hôm nay!
                    </p>
                    <ul className="benefits-list">
                      <li>
                        <i className="fas fa-check-circle me-2"></i> 100+ bài
                        tập TOEIC chất lượng cao
                      </li>
                      <li>
                        <i className="fas fa-check-circle me-2"></i> Các đề thi
                        thử mới mỗi tuần
                      </li>
                      <li>
                        <i className="fas fa-check-circle me-2"></i> Theo dõi
                        tiến độ và phân tích điểm yếu
                      </li>
                      <li>
                        <i className="fas fa-check-circle me-2"></i> Cộng đồng
                        học tập năng động
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
