import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../../../services/authService";
import "./style.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      try {        // Kiểm tra tính hợp lệ của Refresh Token
        const response = await authService.signIn(values);
        
        if (response && response.data && response.data.token) {
          const token = response.data.token;
          const roles = response.data.roles;
          const refreshToken = response.data.refreshToken;
          const jwtExpirationTime = response.data.jwtExpirationTime;
          const refreshTokenExpirationTime = response.data.refreshTokenExpirationTime;

          // Lưu token và trạng thái đăng nhập
          localStorage.setItem("learnerToken", token);
          localStorage.setItem("learnerRefreshToken", refreshToken);
          localStorage.setItem("learnerAccessTokenExpirationTime", (Date.now() + jwtExpirationTime).toString());
          localStorage.setItem("learnerRefreshTokenExpirationTime", (Date.now() + refreshTokenExpirationTime).toString());
          localStorage.setItem("LearnerAuthenticated", JSON.stringify({ isAuthenticatedLearner: true }));

          // Kiểm tra role
          if (roles.includes("ROLE_LEARNER")) {
            toast.success("Đăng nhập thành công!", {
              position: "top-center",
              autoClose: 2000,
            });
            navigate("/"); // Chuyển hướng đến trang chủ
          } else {
            toast.error("Bạn không có quyền truy cập vào trang học viên!", {
              position: "top-center",
              autoClose: 2000,
            });
            localStorage.removeItem("learnerToken");
            localStorage.removeItem("learnerRefreshToken");
            localStorage.removeItem("learnerAccessTokenExpirationTime");
            localStorage.removeItem("learnerRefreshTokenExpirationTime");
            localStorage.removeItem("LearnerAuthenticated");
          }
        }
      } catch (error) {
        console.error("Đăng nhập thất bại:", error);
        toast.error(
          error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.",
          {
            position: "top-center",
            autoClose: 2000,
          }
        );
      }
      setLoading(false);
    },
  });

  const signInWithGoogle = () => {
    toast.info("Tính năng đăng nhập với Google đang được phát triển", {
      position: "top-center",
    });
  };

  return (
    <div className="sign-in-container">
      <div className="row">
        <div className="col-lg-6 col-md-8 col-sm-12 mx-auto">
          <div className="card sign-in-card">
            <div className="row g-0">
              <div className="col-md-6">
                <div className="sign-in-form-container">
                  <div className="logo mb-4">
                    <span className="logo-text">TOEIC</span>
                  </div>
                  <h3 className="header-title mb-4">ĐĂNG NHẬP</h3>
                  
                  <form onSubmit={formik.handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className={`form-control ${formik.touched.username && formik.errors.username ? "is-invalid" : ""}`}
                        placeholder="Tên đăng nhập"
                        id="username"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.username && formik.errors.username && (
                        <div className="invalid-feedback">{formik.errors.username}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <input
                        type="password"
                        className={`form-control ${formik.touched.password && formik.errors.password ? "is-invalid" : ""}`}
                        placeholder="Mật khẩu"
                        id="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">{formik.errors.password}</div>
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
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang xử lý...
                          </span>
                        ) : (
                          "Đăng nhập"
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="text-center mb-4">
                    <button 
                      type="button" 
                      className="btn btn-danger w-100"
                      onClick={signInWithGoogle}
                    >
                      <i className="fab fa-google me-2"></i>
                      Đăng nhập bằng Google
                    </button>
                  </div>
                  
                  <div className="links-container text-center">
                    <div className="mb-2">
                      Thành viên mới?{" "}
                      <Link to="/signup" className="text-decoration-none">
                        Đăng ký ngay
                      </Link>
                    </div>
                    <div className="mb-2">
                      <Link to="/forgot-password" className="text-decoration-none">
                        Quên mật khẩu?
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
                <div className="sign-in-carousel">
                  <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    </div>
                    <div className="carousel-inner h-100">
                      <div className="carousel-item active h-100">
                        <div className="slider-feature-card">
                          <img 
                            src="https://efc.edu.vn/wp-content/uploads/2016/11/toeic-la-gi-1.jpg" 
                            alt="Toeic Banner" 
                          />
                          <h3 className="slider-title mt-3">Toeic</h3>
                          <p className="slider-description">
                            Học Toeic để nâng cao cơ hội việc làm
                          </p>
                        </div>
                      </div>
                      <div className="carousel-item h-100">
                        <div className="slider-feature-card">
                          <img 
                            src="https://iigacademy.edu.vn/wp-content/uploads/2021/10/Banner-002-1024x576.jpg" 
                            alt="Toeic Benefits" 
                          />
                          <h3 className="slider-title mt-3">Toeic</h3>
                          <p className="slider-description">
                            Học Toeic để phát triển bản thân nhiều hơn
                          </p>
                        </div>
                      </div>
                    </div>
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

export default SignIn;
