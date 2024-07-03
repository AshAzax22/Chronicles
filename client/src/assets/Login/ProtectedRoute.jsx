import React from "react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const api_url =
  "chroniclesserver-d0kdjoxxa-ashutosh-purushottams-projects.vercel.app";

const isAuthenticated = async () => {
  const jwt = localStorage.getItem("jwt");
  const token_version = localStorage.getItem("token_version");
  if (!jwt) return false;
  try {
    const response = await fetch(`${api_url}/protected`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${jwt} ${token_version}`,
      },
    });
    if (response.ok) {
      console.log("authentication successful");
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <p>Loading...</p>; // Or any other loading indicator
  }

  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
