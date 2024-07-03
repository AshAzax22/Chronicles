import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import Note from "./Note";

const api_url =
  "chroniclesserver-d0kdjoxxa-ashutosh-purushottams-projects.vercel.app";
const Dashboard = () => {
  const handleLogOut = async () => {
    const response = await fetch(`${api_url}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("jwt"),
        token_version: localStorage.getItem("token_version"),
      }),
    });
    if (!response.ok) {
      alert("logout failed");
      return;
    }
    localStorage.removeItem("jwt");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_version");
    window.location.href = "/login";
  };
  return (
    <>
      <div className={styles.container}>
        <Note />
        <button onClick={handleLogOut}>logout</button>
      </div>
    </>
  );
};

export default Dashboard;
