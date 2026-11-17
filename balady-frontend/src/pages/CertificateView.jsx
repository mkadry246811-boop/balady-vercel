import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "../styles/CertificateView.css";
import { API_URL } from "../api";
import visionLogo from "../vision2030_logo_transparent.png";
import accessIcon from "../accessibility_person_only.png";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "201143019264";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const CertificateView = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/certificates/${id}`);
        setCertificate(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "حدث خطأ أثناء تحميل بيانات الشهادة.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.certificate-view-container');
      if (container) {
        if (window.scrollY > 40) {
          container.classList.add('scrolled-mode');
        } else {
          container.classList.remove('scrolled-mode');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Countdown + auto-redirect when certificate is locked
  useEffect(() => {
    if (!certificate?.isLocked) return;
    if (countdown <= 0) {
      window.location.href = WHATSAPP_URL;
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [certificate, countdown]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>جاري تحميل الشهادة...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px 20px", textAlign: "center", minHeight: "50vh" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#d32f2f", marginBottom: "12px" }}>
            {error || "الشهادة غير موجودة"}
          </h2>
          <p style={{ color: "#555", fontSize: "16px" }}>
            لم يتم العثور على بيانات هذه الشهادة. قد تكون محذوفة أو الرابط غير صحيح.
          </p>
        </div>
      </>
    );
  }

  if (certificate?.isLocked) {
    return (
      <>
        <Header />
        <div className="certificate-view-container">
          <div className="locked-card">
            {/* Lock Icon */}
            <div className="locked-icon-wrapper">
              <span className="locked-icon">🔒</span>
            </div>

            {/* Title */}
            <h2 className="locked-title">الشهادة مغلقة</h2>

            {/* Main Message */}
            <p className="locked-message">
              تم إيقاف هذه الشهادة <strong>لعدم سداد المستحقات المالية.</strong>
            </p>
            <p className="locked-sub-message">
              يرجى التواصل مع الوكيل على رقم واتساب:
              <br />
              <span className="locked-phone-number" dir="ltr">01143019264</span>
            </p>

            {/* WhatsApp Button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="locked-whatsapp-btn"
              id="whatsapp-contact-btn"
            >
              <FaWhatsapp className="locked-whatsapp-icon" />
              تواصل عبر واتساب
            </a>

            {/* Countdown */}
            <div className="locked-countdown">
              <p>سيتم تحويلك تلقائياً إلى واتساب خلال</p>
              <span className="locked-countdown-number">{countdown}</span>
              <p>ثواني</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="certificate-view-container">
        <div className="certificate-view-card">

          <div className="certificate-view-title-group">
            <h2 className="certificate-view-title-ar">
              شهادة صحية للأنشطة التجارية
            </h2>
          </div>

          <div className="certificate-content-wrapper">
            <div className="certificate-view-photo-container" style={{ margin: "0 auto 16px" }}>
              {certificate.photoUrl ? (
                <img
                  src={certificate.photoUrl}
                  alt="Photo"
                  className="certificate-view-photo"
                />
              ) : (
                <div className="photo-placeholder">لا توجد صورة</div>
              )}
            </div>

            <div className="certificate-view-info-grid">

              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الأمانة</span>
                <div className="input-box">{certificate.amana || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">البلدية</span>
                <div className="input-box">{certificate.baladiya || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الاسم</span>
                <div className="input-box">{certificate.name || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم الهوية</span>
                <div className="input-box">{certificate.nationalId || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الجنس</span>
                <div className="input-box">{certificate.gender || ''}</div>
              </div>

              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الجنسية</span>
                <div className="input-box">{certificate.nationality || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">المهنة</span>
                <div className="input-box">{certificate.job || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم الشهادة الصحية</span>
                <div className="input-box">{certificate.healthCertificateNumber || ''}</div>
              </div>


              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ إصدار الشهادة الصحية</span>
                <div className="input-box">
                  {certificate.healthCertIssueDate ? new Date(certificate.healthCertIssueDate).toLocaleDateString("en-GB") : ''}
                </div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ نهاية الشهادة الصحية</span>
                <div className="input-box">
                  {certificate.healthCertExpiryDate ? new Date(certificate.healthCertExpiryDate).toLocaleDateString("en-GB") : ''}
                </div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">نوع البرنامج التثقيفي</span>
                <div className="input-box">{certificate.educationalProgram || ''}</div>
              </div>

              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ انتهاء البرنامج التثقيفي</span>
                <div className="input-box">
                  {certificate.educationalProgramEndDate ? new Date(certificate.educationalProgramEndDate).toLocaleDateString("en-GB") : ''}
                </div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم الرخصة</span>
                <div className="input-box">{certificate.licenseNumber || ''}</div>
              </div>

              <div className="certificate-view-info-row">
                <span className="certificate-view-label">اسم المنشأة</span>
                <div className="input-box">{certificate.establishmentName || ''}</div>
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم المنشأة</span>
                <div className="input-box">{certificate.establishmentNumber || ''}</div>
              </div>
            </div>

            {/* Removed old footer from inside card */}
          </div>
        </div>
      </div>


      {/* Main Footer - Dark Green with Final Layout */}
      <footer className="main-footer">
        <div className="footer-content">
          {/* Right Section - Links and Copyright Stacked in RTL */}
          <div className="footer-right-section">
            <div className="footer-links-row">
              <div className="footer-links">
                <a href="#">خريطة الموقع</a>
                <span className="separator">|</span>
                <a href="#">RSS</a>
                <span className="separator">|</span>
                <a href="#">شروط الاستخدام</a>
              </div>
            </div>

            <div className="footer-copyright">
              <p>جميع الحقوق محفوظة لوزارة البلديات والإسكان © 2026</p>
              <p className="footer-subtitle">تم تطويره وصيانته بواسطة وزارة البلديات والإسكان</p>
            </div>
          </div>

          {/* Left Section - Bottom Logos (RTL: rightmost = first) */}
          <div className="footer-left-section">
            {/* Balady Branding moved here: Right of DGA in RTL */}
            <a href="https://balady.gov.sa" target="_blank" rel="noopener noreferrer" className="balady-branding-link">
              <span className="balady-text-stamp">balady</span>
            </a>

            <a href="https://raqmi.dga.gov.sa/platforms/DigitalStamp/ShowCertificate/316" target="_blank" rel="noopener noreferrer" className="dga-link">
              <img src="/dga-digital-stamp.png" alt="Digital Government Authority" className="dga-stamp-logo" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CertificateView;
