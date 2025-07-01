import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import './style.css';

const AdminLogin = ({ onSubmit, onSubmitSignIn, message }) => {
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

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-container">
      {/* Background decorative elements */}
      <div className="login-decorative-element login-decorative-element-1"></div>
      <div className="login-decorative-element login-decorative-element-2"></div>
      <div className="login-decorative-element login-decorative-element-3"></div>

      <div className="login-card">
        {/* Header with avatar */}
        <div className="login-header">
          <div className="login-avatar">
            <FontAwesomeIcon 
              icon={faUser} 
              style={{ 
                fontSize: '1.8rem', 
                color: 'white' 
              }} 
            />
          </div>
          <h2 className="login-title">ADMIN LOGIN</h2>
          <p className="login-subtitle">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {message && (
          <div className="login-error-message">
            {message}
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={signInFormSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            {/* Username Field */}
            <div className="login-form-group">
              <label className="login-label">Username</label>
              <div className="login-input-wrapper">
                <Field
                  name="username"
                  type="text"
                  className="login-input"
                />
                <FontAwesomeIcon
                  icon={faUser}
                  className="login-icon"
                />
              </div>
              <ErrorMessage 
                name="username" 
                component="div" 
                className="login-error"
              />
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-password"
                />
                <FontAwesomeIcon
                  icon={faLock}
                  className="login-icon"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    style={{ fontSize: '1rem' }}
                  />
                </button>
              </div>
              <ErrorMessage 
                name="password" 
                component="div" 
                className="login-error"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
            >
              SIGN IN
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default AdminLogin;