// Update src/components/Admin/AdminSignInForm/index.jsx
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './style.css';

const AdminLogin = ({ onSubmit, onSubmitSignIn, message }) => {
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    username: '',
    password: '',
  };

  const signInFormSchema = Yup.object().shape({
    username: Yup.string().required('Username không được để trống.'),
    password: Yup.string().required('Mật khẩu không được để trống.'),
  });

  const handleSubmit = (values) => {
    if (onSubmitSignIn && typeof onSubmitSignIn === 'function') {
      onSubmitSignIn(values);
    } else if (onSubmit && typeof onSubmit === 'function') {
      onSubmit(values);
    } else {
      console.error('No submit handler provided');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div
      className="container-fluid"
      style={{
        background: "url('https://media.istockphoto.com/vectors/white-and-blue-swirl-abstract-background-computer-image-vector-id460340487?k=20&m=460340487&s=170667a&w=0&h=BhUlEVmiTDRuHgXk9kmbNqySPgW6qvOLPyCsPvQN0eo=')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="col-lg-6 col-12 mx-auto" style={{ width: '35%' }}>
        <div className="text-center image-size-small position-relative">
          <img
            src="https://annedece.sirv.com/Images/user-vector.jpg"
            className="rounded-circle p-2 bg-white"
            alt="User avatar"
          />
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={signInFormSchema}
          onSubmit={handleSubmit}
        >
          <Form className="mt-3">
            <div className="p-5 bg-white rounded-4 shadow-lg">
              <h3 className="mb-2 text-center pt-5">ADMIN LOGIN</h3>
              {message && (
                <div className="alert alert-danger text-center py-2 mb-3" style={{ fontSize: 15 }}>
                  {message}
                </div>
              )}
              {/* Username Field */}
              <label
                htmlFor="username"
                className="font-500 text-secondary fst-bolder d-flex justify-content-start"
                style={{ fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" }}
              >
                Username
              </label>
              <Field
                name="username"
                type="text"
                className="form-control form-control-lg mb-3"
              />
              <ErrorMessage name="username" component="div" className="error-feedback d-flex justify-content-start" />

              {/* Password Field with toggle button */}
              <label
                htmlFor="password"
                className="font-500 text-secondary fst-bolder d-flex justify-content-start"
                style={{ fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" }}
              >
                Password
              </label>

              {/* Password input container with relative positioning */}
              <div className="position-relative">
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  style={{ paddingRight: '50px' }} // Make space for the button
                />
                {/* Toggle password visibility button */}
                <button
                  type="button"
                  className="btn position-absolute"
                  style={{
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    padding: '0.375rem',
                    zIndex: 10
                  }}
                  onClick={togglePasswordVisibility}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    style={{ fontSize: '1.1rem' }}
                  />
                </button>
              </div>

              <ErrorMessage name="password" component="div" className="error-feedback d-flex justify-content-start" />

              <button
                type="submit"
                style={{ backgroundColor: "#1c75bc", color: "#fff", height: "50px" }}
                className="btn btn-lg w-100 rounded-5 shadow-lg mt-3"
              >
                SIGN IN
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default AdminLogin;