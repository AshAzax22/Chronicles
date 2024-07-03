import React from "react";
import styles from "./Note.module.css";
import Notepad from "./Vectors/Notepad.svg";
import AccessedUsers from "./AccessedUsers";
const Note = () => {
  return (
    <>
      <div className={styles.container}>
        <img src={Notepad} alt="notepad" className={styles.notepad} />
        <div className={styles.title}>Title</div>
        <div className={styles.accessUsers}>
          <AccessedUsers />
        </div>

        <p className={styles.content}>
          Content Lorem ipsum dolor sit amet consectetur, adipisicing elit.
          Illum maiores ea sunt laudantium fugit eum exercitationem quas, autem
          numquam aperiam. Lorem ipsum, dolor sit amet consectetur adipisicing
          elit. Sint dolorum aperiam, quisquam itaque suscipit quod eligendi
          neque iusto ipsa atque.
        </p>
      </div>
    </>
  );
};

export default Note;
