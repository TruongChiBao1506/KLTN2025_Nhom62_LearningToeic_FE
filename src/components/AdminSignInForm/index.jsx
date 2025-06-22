import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';


const AdminLogin = ({ onSubmit, onSubmitSignIn }) => { // Accept both props
  const initialValues = {
    username: '',
    password: '',
  };
  

  const signInFormSchema = Yup.object().shape({
    username: Yup.string().required('Username không được để trống.'),
    password: Yup.string().required('Mật khẩu không được để trống.'),
  });

  const handleSubmit = (values) => {
    // Use whichever prop is available
    if (onSubmitSignIn && typeof onSubmitSignIn === 'function') {
      onSubmitSignIn(values);
    } else if (onSubmit && typeof onSubmit === 'function') {
      onSubmit(values);
    } else {
      console.error('No submit handler provided');
    }
  };

  return (
    <div
      className="container-fluid"
      style={{
        background: "url('https://media.istockphoto.com/vectors/white-and-blue-swirl-abstract-background-computer-image-vector-id460340487?k=20&m=460340487&s=170667a&w=0&h=BhUlEVmiTDRuHgXk9kmbNqySPgW6qvOLPyCsPvQN0eo=')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
      }}
    >
      <div className="row p-5" style={{ height: '825px' }}>
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
                <label
                  htmlFor="password"
                  className="font-500 text-secondary fst-bolder d-flex justify-content-start"
                  style={{ fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" }}
                >
                  Password
                </label>
                <Field
                  name="password"
                  type="password"
                  className="form-control form-control-lg"
                />
                <ErrorMessage name="password" component="div" className="error-feedback d-flex justify-content-start" />
                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-lg mt-3">
                  SIGN IN
                </button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;