import React from "react";
import styles from "./Login.module.css";
import LoginForm from "./LoginForm";
import man from "./Vectors/man.svg";

const Login = () => {
  return (
    <>
      <div className={styles.LoginContainer}>
        <LoginForm className={styles.LoginForm} />
        <p className={styles.brandLogo}>Chronicles</p>
        <div className={styles.manContainer}>
          <img className={styles.man} src={man} alt="man" />
        </div>
      </div>
    </>
  );
};

export default Login;
