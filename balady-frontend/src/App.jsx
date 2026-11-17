import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddCertificate from "./pages/AddCertificate";
import EditCertificate from "./pages/EditCertificate";
import CertificatePage from "./pages/CertificatePage";
import CertificateView from "./pages/CertificateView";
import AllCertificates from "./pages/AllCertificates";
import IslamicReminder from "./components/IslamicReminder";
import ChangePassword from "./pages/ChangePassword";

import PublicWelcome from "./pages/PublicWelcome";

function App() {
  const location = useLocation();
  const isViewPage = location.pathname.startsWith('/view/');

  return (
    <>
      {!isViewPage && <IslamicReminder />}
      <Routes>
        <Route path="/" element={<PublicWelcome />} />
        <Route path="*" element={<PublicWelcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-certificate" element={<AddCertificate />} />
        <Route path="/edit-certificate/:id" element={<EditCertificate />} />
        <Route path="/certificate/:id" element={<CertificatePage />} />
        <Route path="/view/:id" element={<CertificateView />} />
        <Route path="/certificates" element={<AllCertificates />} />
      </Routes>
    </>
  );
}

export default App;
