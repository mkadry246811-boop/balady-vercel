import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import { CiGlobe } from "react-icons/ci";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import "../styles/CertificatePage.css";
import QRCodeStyling from "qr-code-styling";
import { API_URL } from "../api";
import starIcon from "../star.png";

const CERTIFICATE_TYPES = {
  annual: { name: 'شهادة صحية سنوية', color: '#42ce23ff' },
  basic: { name: 'شهادة صحية', color: '#8bcb6c' },
  health: { name: 'شهادة صحية', color: '#428181', headerColor: '#3f8585ff' },
  unified: { name: 'الشهادة الصحية الموحدة', color: '#428181', headerColor: '#3f8585ff' }
};

const formatToHijri = (hijriStr, gregStr) => {
  // If we already have a saved Hijri string from DB (e.g. "1447-08-05")
  if (hijriStr) {
    try {
      const dateOnly = hijriStr.split('T')[0];
      const parts = dateOnly.split('-');
      if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
      const d = new Date(hijriStr);
      if (!isNaN(d)) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${yyyy}/${mm}/${dd}`;
      }
      return hijriStr;
    } catch (e) {
      return hijriStr;
    }
  }

  // Fallback: Calculate from Gregorian Date
  if (gregStr) {
    try {
      const date = new Date(gregStr);
      if (isNaN(date.getTime())) return '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', calendar: 'islamic-umalqura' };
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', options).formatToParts(date);
      const y = parts.find(p => p.type === 'year')?.value;
      const m = parts.find(p => p.type === 'month')?.value;
      const d = parts.find(p => p.type === 'day')?.value;
      if (y && m && d) return `${y}/${m}/${d}`;

      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${yyyy}/${mm}/${dd}`;
    } catch (e) {
      try {
        const date2 = new Date(gregStr);
        if (!isNaN(date2)) {
          const dd2 = String(date2.getDate()).padStart(2, '0');
          const mm2 = String(date2.getMonth() + 1).padStart(2, '0');
          const yyyy2 = date2.getFullYear();
          return `${yyyy2}/${mm2}/${dd2}`;
        }
      } catch (err) { }
      return gregStr;
    }
  }
  return '';
};

const CertificatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [certificateType, setCertificateType] = useState('unified'); // النوع الافتراضي
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const certRef = useRef();
  const certTopRef = useRef(null);
  const certFooterRef = useRef(null);
  const qrContainerRef = useRef(null);
  const qrInstanceRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/certificates/${id}`
        );
        setCertificate(res.data);
      } catch (err) {
        console.error("Error fetching certificate:", err);
        if (err.response?.status === 401) {
          alert("خطأ في المصادقة - الرجاء تسجيل الدخول مرة أخرى");
        } else if (err.response?.status === 404) {
          alert("الشهادة غير موجودة");
        }
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!certificate) return;
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = 297;
      const pdfHeight = 210;

      await document.fonts.ready;

      // PAGE 1: Certificate Header/Body
      const topDataUrl = await toPng(certTopRef.current, { cacheBust: true, pixelRatio: 3, quality: 1 });
      pdf.addImage(topDataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      // ── Add clickable link annotation over the QR code area ──
      const viewId = certificate.uuid || certificate._id;
      const verificationUrl = `${window.location.origin}/view/${viewId}`;

      if (qrContainerRef.current && certTopRef.current) {
        const topRect = certTopRef.current.getBoundingClientRect();
        const qrRect = qrContainerRef.current.getBoundingClientRect();

        // Position of QR relative to certTopRef (ratio 0–1)
        const relX = (qrRect.left - topRect.left) / topRect.width;
        const relY = (qrRect.top - topRect.top) / topRect.height;
        const relW = qrRect.width / topRect.width;
        const relH = qrRect.height / topRect.height;

        // Convert ratios to PDF mm coordinates
        const pdfX = relX * pdfWidth;
        const pdfY = relY * pdfHeight;
        const pdfW = relW * pdfWidth;
        const pdfH = relH * pdfHeight;

        pdf.link(pdfX, pdfY, pdfW, pdfH, { url: verificationUrl });
      }

      // PAGE 2: Instructions (Footer)
      const footerDataUrl = await toPng(certFooterRef.current, { cacheBust: true, pixelRatio: 3, quality: 1 });
      pdf.addPage();
      pdf.addImage(footerDataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Use certificate holder name for filename
      pdf.save(`certificate-${certificate.name || certificate.id}.pdf`);

      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("حدث خطأ أثناء تحميل الملف. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Initialize or update styled QR code
  useEffect(() => {
    if (!certificate) return;
    const viewId = certificate.uuid || certificate._id;
    const dataUrl = `${window.location.origin}/view/${viewId}`;

    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling({
        width: 133,
        height: 133,
        type: "svg",
        data: dataUrl,
        dotsOptions: { type: "square", color: "#040404ff" },
        cornersSquareOptions: { type: "square", color: "#010101ff" },
        cornersDotOptions: { type: "square", color: "#000000ff" },
        backgroundOptions: { color: "#ffffff" },
      });
      if (qrContainerRef.current) {
        qrInstanceRef.current.append(qrContainerRef.current);
      }
    } else {
      qrInstanceRef.current.update({ data: dataUrl });
    }
  }, [certificate]);

  // Auto-fit name on one line: compress letter-spacing first, then shrink font
  useEffect(() => {
    if (!nameRef.current || !certificate?.name) return;

    const applyFit = () => {
      const el = nameRef.current;
      if (!el) return;
      const maxWidth = el.parentElement.clientWidth - 10;

      // Guard: if container not rendered yet, skip
      if (maxWidth <= 50) return;

      // Reset to starting values
      el.style.fontSize = '38px';
      el.style.letterSpacing = '3px';
      el.style.wordSpacing = '8px';

      // Phase 1: compress word-spacing
      while (el.scrollWidth > maxWidth) {
        const cur = parseFloat(el.style.wordSpacing);
        if (cur <= 2) break;
        el.style.wordSpacing = (cur - 0.5).toFixed(1) + 'px';
      }

      // Phase 2: compress letter-spacing
      while (el.scrollWidth > maxWidth) {
        const cur = parseFloat(el.style.letterSpacing);
        if (cur <= -1) break;
        el.style.letterSpacing = (cur - 0.1).toFixed(1) + 'px';
      }

      // Phase 3: shrink font size (min 14px)
      while (el.scrollWidth > maxWidth && parseFloat(el.style.fontSize) > 14) {
        el.style.fontSize = (parseFloat(el.style.fontSize) - 0.5) + 'px';
      }
    };

    // Wait for fonts to load before measuring
    document.fonts.ready.then(applyFit);
  }, [certificate]);

  if (!certificate) return <p style={{ textAlign: "center" }}>Loading…</p>;

  return (
    <>
      <div className="cert-container">
        <div className="cert-wrapper">
          {/* أزرار اختيار نوع الشهادة */}
          <div className="cert-type-selector">
            {Object.entries(CERTIFICATE_TYPES).map(([key, { name, color }]) => (
              <button
                key={key}
                className={`type-button ${certificateType === key ? 'active' : ''}`}
                style={{
                  backgroundColor: certificateType === key ? color : 'transparent',
                  borderColor: color,
                  color: certificateType === key ? '#fff' : color
                }}
                onClick={() => setCertificateType(key)}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="cert-card" ref={certRef}>
            <div className="containerTop" ref={certTopRef}>
              {/* TOP HEADER + LOGOS */}
              <div className="header-section">
                <div className="cert-header">
                  <img src="/logo1.png" alt="logo1" className="cert-logo" />
                  <div className="line"></div>
                  <img src="/logo3.png" alt="logo2" className="cert-logo" />
                  <div className="line"></div>
                  <img
                    src={`/${certificate.selectedLogo || "logo2.png"}`}
                    alt="selected logo"
                    className="cert-logo"
                  />
                </div>
                <div
                  className="header-color"
                  style={{ backgroundColor: CERTIFICATE_TYPES[certificateType].headerColor || CERTIFICATE_TYPES[certificateType].color }}
                >
                  <h1 className="main-title">{CERTIFICATE_TYPES[certificateType].name}</h1>
                </div>
              </div>

              {/* LEFT IMAGE + QR + RIGHT INFO */}
              <div className="cert-top-section">
                {/* LEFT SIDE PHOTO + QR */}
                <div className="cert-left">
                  <div className="cert-photo-box">
                    {certificate.photoUrl && (
                      <img
                        className="cert-photo"
                        src={certificate.photoUrl}
                        alt="person"
                      />
                    )}
                  </div>

                  <div
                    className="cert-qr-box"
                    onClick={() => {
                      const viewId = certificate.uuid || certificate._id;
                      window.open(`${window.location.origin}/view/${viewId}`, '_blank');
                    }}
                    title="انقر للتحقق من الشهادة"
                  >
                    <div ref={qrContainerRef} />
                  </div>
                </div>

                {/* RIGHT INFORMATION GRID */}
                <div className="cert-right">
                  <h2 className="cert-name" ref={nameRef}>{certificate.name}</h2>

                  <div className="cert-info-grid">
                    {certificate.nationalId && (
                      <div className="info-row">
                        <span>رقم الهوية</span>
                        <p>{certificate.nationalId}</p>
                      </div>
                    )}

                    {certificate.nationality && (
                      <div className="info-row">
                        <span>الجنسية</span>
                        <p>{certificate.nationality}</p>
                      </div>
                    )}

                    {certificate.healthCertificateNumber && (
                      <div className="info-row">
                        <span>رقم الشهادة الصحية</span>
                        <p>{certificate.healthCertificateNumber}</p>
                      </div>
                    )}

                    {certificate.job && (
                      <div className="info-row">
                        <span>المهنة</span>
                        <p>{certificate.job}</p>
                      </div>
                    )}

                    {(certificate.healthCertIssueDateHijri || certificate.healthCertIssueDate) && (
                      <div className="info-row">
                        <span>تاريخ إصدار الشهادة الصحية</span>
                        <p>
                          {formatToHijri(certificate.healthCertIssueDateHijri, certificate.healthCertIssueDate)}
                        </p>
                      </div>
                    )}

                    {(certificate.healthCertExpiryDateHijri || certificate.healthCertExpiryDate) && (
                      <div className="info-row">
                        <span>تاريخ نهاية الشهادة الصحية</span>
                        <p>
                          {formatToHijri(certificate.healthCertExpiryDateHijri, certificate.healthCertExpiryDate)}
                        </p>
                      </div>
                    )}

                    {certificate.educationalProgram && (
                      <div className="info-row">
                        <span>نوع البرنامج التثقيفي</span>
                        <p>{certificate.educationalProgram}</p>
                      </div>
                    )}

                    {certificate.educationalProgramEndDate && (
                      <div className="info-row">
                        <span>تاريخ انتهاء البرنامج التثقيفي</span>
                        <p>
                          {formatToHijri(certificate.educationalProgramEndDate, null)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="links">
                {/* Website Area (Starts Right in RTL, Icon on its Left) */}
                <div className="link-item">
                  <span className="link-text">www.balady.gov.sa</span>
                  <span className="icon-wrapper"><CiGlobe /></span>
                </div>

                {/* Socials Area (Icon on its Left) */}
                <div className="link-item">
                  <span className="link-text">saudimomra</span>
                  <div className="icon-social-group">
                    <span className="icon-wrapper"><FaTwitter /></span>
                    <span className="icon-wrapper"><FaFacebookF /></span>
                    <span className="icon-wrapper"><FaYoutube /></span>
                  </div>
                </div>

                {/* Balady_cs Area (Icon on its Left) */}
                <div className="link-item">
                  <span className="link-text">Balady_cs</span>
                  <span className="icon-wrapper"><FaTwitter /></span>
                </div>

                <div className="footer-line-divider"></div>

                {/* Phone Area (Ends Left in RTL, Circle on its far left) */}
                <div className="link-item customer-care-new">
                  <span className="label">مركز العناية بالعملاء</span>
                  <span className="num">199040</span>
                  <span className="icon-wrapper"><FaPhone /></span>
                </div>
              </div>
            </div>

            {/* FOOTER SECTION */}
            <div
              className="cert-footer"
              ref={certFooterRef}
              style={{ backgroundColor: CERTIFICATE_TYPES[certificateType].color }}
            >
              {/* Watermark as real DOM element for PDF export compatibility */}
              <img
                src="/back.png"
                alt=""
                className="cert-footer-watermark"
              />
              <div className="cert-footer-header">
                <div className="cert-footer-logos">
                  {/* Vision/Ministry Logo (Skyline) */}
                  <img src="/vision_logo_new.png" alt="Vision Logo" className="cert-footer-logo" />

                  {/* Ministry Logo Group (Text + Palm) */}
                  <div className="cert-footer-ministry-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/ministry_text.png" alt="Ministry Text" className="cert-footer-text-logo" />
                    <div className="cert-footer-palm">
                      <img src="/footer_palm_icon.png" alt="palm" className="palm-icon" />
                    </div>
                  </div>
                </div>
                <h2 className="cert-footer-title">تعليمات وإرشادات</h2>
              </div>



              <div className="cert-footer-content">
                <div className="cert-instruction-item">
                  <img src={starIcon} className="cert-star-icon" alt="star" />
                  <p>شهادة صحية تجدد سنوياً.</p>
                </div>
                <div className="cert-instruction-item">
                  <img src={starIcon} className="cert-star-icon" alt="star" />
                  <p>يسمح لحامل الشهادة الصحية بالعمل في منشآت الغذاء أو الصحة العامة وفق المهنة المسموح بها نظاماً.</p>
                </div>
                <div className="cert-instruction-item">
                  <img src={starIcon} className="cert-star-icon" alt="star" />
                  <p>يلزم حامل هذه الشهادة بإجراء فحص طبي عند عودته من الخارج قبل البدء بممارسة العمل.</p>
                </div>
                <div className="cert-instruction-item">
                  <img src={starIcon} className="cert-star-icon" alt="star" />
                  <p>لا تعتبر الشهادة إثبات هوية.</p>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="cert-actions">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{ backgroundColor: '#2c3e50', color: 'white' }}
            >
              {isGeneratingPdf ? 'جاري التحميل...' : '📥 تحميل PDF'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ backgroundColor: '#6c757d', color: 'white' }}
            >
              🔙 العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificatePage;
