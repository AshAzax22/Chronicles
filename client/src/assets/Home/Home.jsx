import React from "react";
import styles from "./Home.module.css";
import HomeDialogueBox from "./HomeDialogueBox";
import man from "./Vectors/man.svg";
import woman from "./Vectors/woman.svg";

const Home = () => {
  return (
    <>
      <div className={styles.home_container}>
        <div className={styles.content}>
          <div className={styles.logo}>Chronicles</div>
          <HomeDialogueBox ckassname={styles.HomeDialogueBox} />
        </div>
        <div className={styles.manContainer}>
          <img src={man} className={styles.man} alt="man standing" />
        </div>
        <div className={styles.womanContainer}>
          <img src={woman} className={styles.woman} alt="woman cycling" />
        </div>
      </div>
    </>
  );
};

export default Home;
