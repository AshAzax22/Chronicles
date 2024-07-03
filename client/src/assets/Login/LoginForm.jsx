import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginForm.module.css";
import googleLogo from "./Vectors/google.svg";
import facebookLogo from "./Vectors/facebook.svg";
import { RefreshContext } from "../AuthProvider/AuthProvider";
import { useGoogleLogin } from "@react-oauth/google";

const api_url = "http://localhost:3000";

const LoginForm = () => {
  const RefreshCheck = useContext(RefreshContext);
  const Navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [otpRequired, setOtpRequired] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();
    let email = credentials.email;
    let password = credentials.password;
    let confirmPassword = credentials.confirmPassword;

    if (otpRequired) {
      const otp = credentials.otp;
      const verified = await verifyOtp(otp, email, password);
      if (!verified) {
        return;
      }
      setOtpRequired(false);
      return;
    }

    if (activeTab === "login") {
      await loginHandler(email, password);
    } else {
      await signUpHandler(email, password, confirmPassword);
    }
  };

  //function to handle login requests
  const loginHandler = async (email, password) => {
    const response = await fetch(`${api_url}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    login(response);
  };

  const login = async (response) => {
    const data = await response.json();
    if (response.ok) {
      if (!data.token || !data.refresh_token || !data.token_version) {
        alert("login failed retry ");
        return;
      }
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_version", data.token_version);
      RefreshCheck.RefreshCheck();
      Navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  //function to handle signUp requests
  const signUpHandler = async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setCredentials({ ...credentials, password: "", confirmPassword: "" });
      return;
    }
    await verifyEmail(email);
  };

  const verifyEmail = async (email) => {
    const response = await fetch(`${api_url}/verifyemail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      if (data.message === "OTP sent") {
        setCredentials({
          email: "",
          password: "",
          confirmPassword: "",
          otp: "",
        });
        alert("OTP sent to your email");
        setOtpRequired(true);
      }
    } else {
      console.log(data.message);
      alert("invalid otp");
    }
  };

  const verifyOtp = async (otp, email, password) => {
    const response = await fetch(`${api_url}/verifyotp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      if (data.message === "OTP verified") {
        alert(data.message);
        await signUpReqHandler(email, password);
        return true;
      }
    } else {
      alert(data.message);
    }
    return false;
  };

  const signUpReqHandler = async (email, password) => {
    const response = await fetch(`${api_url}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    signUp(response);
  };

  const signUp = async (response) => {
    const data = await response.json();
    if (response.ok) {
      alert("sign up successfull");
      setActiveTab("login");
      return;
    } else {
      alert(data.message);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse); // Log the token response
      fetchUserData(tokenResponse.access_token); // Fetch user data
    },
  });

  // Function to fetch user data
  function fetchUserData(accessToken) {
    const userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("User Data:", data);
        localStorage.setItem("email", data.email);
        if (activeTab == "login") {
          googleAuthLoginHandler(data.email);
          return;
        }
        googleAuthSignUpHandler(data.email);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  //when user tries to login via google
  const googleAuthLoginHandler = async (email) => {
    console.log(email);
    const response = await fetch(`${api_url}/googleauth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });
    if (!response.ok) {
      alert("login failed");
      return;
    }
    login(response);
  };

  //when user tries to sign up via google
  const googleAuthSignUpHandler = async (email) => {
    const response = await fetch(`${api_url}/googleauth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });
    if (!response.ok) {
      alert("sign up failed");
      return;
    }
    signUp(response);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.headers}>
          <button
            className={`${styles.login} ${
              activeTab === "login" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`${styles.sign_up} ${
              activeTab === "signUp" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("signUp")}
          >
            Sign Up
          </button>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={HandleSubmit}>
            {otpRequired ? (
              <>
                <input
                  value={credentials.otp}
                  type="password"
                  name="otp"
                  placeholder="OTP"
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <input
                  value={credentials.email}
                  type="email"
                  name="email"
                  placeholder="email"
                  onChange={handleChange}
                />
                <input
                  value={credentials.password}
                  type="password"
                  name="password"
                  placeholder="password"
                  onChange={handleChange}
                />
                {activeTab === "signUp" && (
                  <>
                    <input
                      value={credentials.confirmPassword}
                      type="password"
                      name="confirmPassword"
                      placeholder="confirm password"
                      onChange={handleChange}
                    />
                  </>
                )}
              </>
            )}

            <div className={styles.buttonContainer}>
              <button type="submit">submit</button>
              {otpRequired && (
                <>
                  <button
                    onClick={() => {
                      setOtpRequired(false);
                    }}
                  >
                    cancel
                  </button>
                </>
              )}
            </div>
          </form>

          <div className={styles.otherOptions}>
            <button
              className={`${styles.googleAuthContainer} ${styles.otherOption}`}
              onClick={googleLoginHandler}
            >
              <img src={googleLogo} alt="google" />
              <p>Sign in with Google</p>
            </button>
            {/* <button
              className={`${styles.facebookAuthContainer} ${styles.otherOption}`}
            >
              <img src={facebookLogo} alt="facebook" />
              <p>Sign in with FaceBook</p>
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
