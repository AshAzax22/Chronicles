import React from "react";
import styles from "./HomeDialogueBox.module.css";
import { Link } from "react-router-dom";

const HomeDialogueBox = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.border_top}></div>
        <div className={styles.text}>
          Enjoy effortless, real-time collaboration on your notes. Log in,
          create, and <span style={{ backgroundColor: "#ffd600" }}>share</span>{" "}
          your <span style={{ backgroundColor: "#ffd600" }}>notes</span> with
          others. See changes unfold instantly, keeping everyone on the same
          page, no matter the distance.
        </div>
        <Link to={"/login"}>
          <button className={styles.get_started}>Get Started</button>
        </Link>
      </div>
    </>
  );
};

export default HomeDialogueBox;
