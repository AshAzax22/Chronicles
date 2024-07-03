import React, { createContext } from "react";
import { jwtDecode } from "jwt-decode";

const RefreshContext = createContext();

const api_url = import.meta.env.VITE_API_URL;

const RefreshCheck = () => {
  console.log("refresh check called");
  const jwt = localStorage.getItem("jwt");
  const token_version = localStorage.getItem("token_version");
  const refresh_token = localStorage.getItem("refresh_token");
  const tokenData = jwtDecode(jwt);
  const expTime = tokenData.exp;
  const currentTime = Date.now();
  const timeLeft = expTime * 1000 - currentTime - 6000;
  console.log(timeLeft);
  setTimeout(async () => {
    if (await RefreshToken(tokenData, refresh_token, token_version)) {
      RefreshCheck();
    } else {
      alert("refresh failed, login again");
      localStorage.clear();
      logout(jwt, token_version);
      return;
    }
  }, timeLeft);
};

// const RefreshCheck = () => {
//   const jwt = localStorage.getItem("jwt");
//   const token_version = localStorage.getItem("token_version");
//   const refresh_token = localStorage.getItem("refresh_token");
//   console.log(jwt, token_version, refresh_token);
// };

const logout = async (jwt, token_version) => {
  const response = await fetch(`${api_url}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: jwt,
      token_version: token_version,
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

const RefreshToken = async (tokenData, refresh_token, token_version) => {
  try {
    console.log(tokenData.email, refresh_token, token_version);
    const response = await fetch(`${api_url}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: tokenData.email,
        refresh_token: refresh_token,
        token_version: token_version,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("refreshed");
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("token_version", data.token_version);
      return true;
    } else {
      alert(data.message);
      return false;
    }
  } catch (err) {
    alert("refresh failed");
    return false;
  }
};

const AuthProvider = ({ children }) => {
  return (
    <RefreshContext.Provider value={{ RefreshCheck }}>
      {children}
    </RefreshContext.Provider>
  );
};

export { AuthProvider, RefreshContext };
