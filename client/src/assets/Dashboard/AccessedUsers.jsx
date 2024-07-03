import React from "react";
import styles from "./AccessedUsers.module.css";
const AccessedUsers = () => {
  return (
    <>
      <div className={styles.users}>
        <div className={`${styles.user} ${styles.userA}`}>
          {" "}
          <p>A</p>{" "}
        </div>
        <div className={`${styles.user} ${styles.userB}`}>
          {" "}
          <p>B</p>{" "}
        </div>
      </div>
      <p className={styles.userNumber}>+3 others</p>
    </>
  );
};

export default AccessedUsers;
