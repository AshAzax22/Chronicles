import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./assets/Home/Home";
import Login from "./assets/Login/Login";
import ProtectedRoute from "./assets/Login/ProtectedRoute";
import Dashboard from "./assets/Dashboard/Dashboard";
import { AuthProvider } from "./assets/AuthProvider/AuthProvider";
import { useEffect } from "react";

const resetLocalStorage = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_version");
};

function App() {
  useEffect(() => {
    window.addEventListener("offline", resetLocalStorage);

    return () => {
      window.removeEventListener("offline", resetLocalStorage);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
