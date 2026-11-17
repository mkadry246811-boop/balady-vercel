import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/Login.css";

import { API_URL } from "../api";

function ChangePassword() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_URL}/api/change-password`, {
        username,
        newPassword,
        masterKey,
      });

      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2 seconds
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("حدث خطأ أثناء تغيير كلمة المرور");
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleChangePassword} className="login-box">
        <h2>تغيير كلمة المرور</h2>

        <div className="login-form">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="password-input-container">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className="password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <div className="password-input-container">
            <input
              type={showMasterKey ? "text" : "password"}
              placeholder="الماستر كاي"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              required
            />
            <span className="password-toggle-icon" onClick={() => setShowMasterKey(!showMasterKey)}>
              {showMasterKey ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {error && <p className="login-error" style={{ color: 'red' }}>{error}</p>}
          {success && <p className="login-success" style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

          <button type="submit" className="login-btn">تغيير كلمة المرور</button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>العودة لتسجيل الدخول</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
