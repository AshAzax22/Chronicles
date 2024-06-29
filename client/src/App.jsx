import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./assets/Home/Home";
import Login from "./assets/Login/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" component={Dashboard} /> */}
      </Routes>
    </Router>
  );
}

export default App;
