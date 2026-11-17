import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/Login.css";

import { API_URL } from "../api";

function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      setError("اسم المستخدم أوو كلمة السر غير صحيحة");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-box">
        <h2>تسجيل الدخول</h2>

        <div className="login-form">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">دخول</button>
          
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Link to="/change-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>هل ترغب بتغيير كلمة المرور؟</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
