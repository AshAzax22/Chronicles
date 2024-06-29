import React from "react";
import { useState } from "react";
import styles from "./LoginForm.module.css";
import googleLogo from "./Vectors/google.svg";
import facebookLogo from "./Vectors/facebook.svg";

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState("login");
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
          <form>
            <input type="email" placeholder="email" />
            <input type="password" placeholder="password" />
            {activeTab === "signUp" && (
              <>
                <input type="password" placeholder="confirm password" />
              </>
            )}

            <button type="submit">submit</button>
          </form>

          <div className={styles.otherOptions}>
            <button
              className={`${styles.googleAuthContainer} ${styles.otherOption}`}
            >
              <img src={googleLogo} alt="google" />
              <p>Sign in with Google</p>
            </button>
            <button
              className={`${styles.facebookAuthContainer} ${styles.otherOption}`}
            >
              <img src={facebookLogo} alt="facebook" />
              <p>Sign in with FaceBook</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
