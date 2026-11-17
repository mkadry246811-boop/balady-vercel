import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/EditCertificate.css";
import { baladyData } from "../data/baladyData";
import { API_URL } from "../api";
import ImageCropper from "../components/ImageCropper";

function EditCertificate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    amana: "",
    baladiya: "",
    nationalId: "",
    healthCertificateNumber: "",
    gender: "",
    nationality: "",
    job: "",
    healthCertIssueDate: "",
    healthCertExpiryDate: "",
    healthCertIssueDateHijri: "",
    healthCertExpiryDateHijri: "",
    educationalProgram: "",
    educationalProgramEndDate: "",
    licenseNumber: "",
    establishmentName: "",
    establishmentNumber: "",
    selectedLogo: "logos/الرياض.png",
    isLocked: false,
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [municipalities, setMunicipalities] = useState([]);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/certificates/${id}`);
        const cert = res.data;

        setForm({
          name: cert.name || "",
          amana: cert.amana || "",
          baladiya: cert.baladiya || "",
          nationalId: cert.nationalId || "",
          healthCertificateNumber: cert.healthCertificateNumber || "",
          gender: cert.gender || "",
          nationality: cert.nationality || "",
          job: cert.job || "",
          healthCertIssueDate: cert.healthCertIssueDate ? cert.healthCertIssueDate.split('T')[0] : "",
          healthCertExpiryDate: cert.healthCertExpiryDate ? cert.healthCertExpiryDate.split('T')[0] : "",
          healthCertIssueDateHijri: cert.healthCertIssueDateHijri || "",
          healthCertExpiryDateHijri: cert.healthCertExpiryDateHijri || "",
          educationalProgram: cert.educationalProgram || "",
          educationalProgramEndDate: cert.educationalProgramEndDate ? cert.educationalProgramEndDate.split('T')[0] : "",
          licenseNumber: cert.licenseNumber || "",
          establishmentName: cert.establishmentName || "",
          establishmentNumber: cert.establishmentNumber || "",
          selectedLogo: cert.selectedLogo || "logos/الرياض.png",
          isLocked: cert.isLocked || false,
        });

        if (cert.photoUrl) {
          const resolvedPhotoUrl = cert.photoUrl.startsWith("http") ? cert.photoUrl : `${API_URL}/${cert.photoUrl}`;
          setPhotoPreview(resolvedPhotoUrl);
          setExistingPhotoUrl(resolvedPhotoUrl);
        }

        if (cert.amana && baladyData[cert.amana]) {
          setMunicipalities(baladyData[cert.amana].municipalities);
        }

        setLoading(false);
      } catch (err) {
        console.log(err);
        alert("حدث خطأ أثناء تحميل البيانات");
        navigate("/dashboard");
      }
    };
    fetchCertificate();
  }, [id, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleAmanaChange = (e) => {
    const selectedAmana = e.target.value;
    const selectedData = baladyData[selectedAmana];
    const correspondingLogo = selectedData?.logo || form.selectedLogo || "logos/الرياض.png";
    const availableMunicipalities = selectedData?.municipalities || [];

    setForm({
      ...form,
      amana: selectedAmana,
      baladiya: "", // Reset municipality
      selectedLogo: correspondingLogo
    });
    setMunicipalities(availableMunicipalities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("amana", form.amana);
      formData.append("baladiya", form.baladiya);
      formData.append("nationalId", form.nationalId);
      formData.append("healthCertificateNumber", form.healthCertificateNumber);
      formData.append("gender", form.gender);
      formData.append("nationality", form.nationality);
      formData.append("job", form.job);
      formData.append("healthCertIssueDate", form.healthCertIssueDate);
      formData.append("healthCertExpiryDate", form.healthCertExpiryDate);

      if (form.healthCertIssueDateHijri) {
        formData.append("healthCertIssueDateHijri", form.healthCertIssueDateHijri);
      }
      if (form.healthCertExpiryDateHijri) {
        formData.append("healthCertExpiryDateHijri", form.healthCertExpiryDateHijri);
      }

      formData.append("isLocked", form.isLocked);
      formData.append("educationalProgram", form.educationalProgram);
      formData.append("educationalProgramEndDate", form.educationalProgramEndDate);
      formData.append("licenseNumber", form.licenseNumber);
      formData.append("establishmentName", form.establishmentName);
      formData.append("establishmentNumber", form.establishmentNumber);
      formData.append("selectedLogo", form.selectedLogo);

      if (photo) {
        formData.append("photo", photo);
      }

      await axios.put(
        `${API_URL}/api/certificates/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert("تم تعديل الشهادة بنجاح");
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("حدث خطأ أثناء التعديل");
    }
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>جاري التحميل...</div>;
  }

  return (
    <div className="edit-certificate-container">
      <div className="edit-certificate-header">
        <h2>تعديل الشهادة الصحية</h2>
      </div>

      <form className="edit-certificate-form" onSubmit={handleSubmit}>

        <div>
          <label>اسم الشخص *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="أدخل الاسم الكامل" required />
        </div>

        <div style={{ gridColumn: '1 / -1', background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0d47a1' }}>بيانات الرخصة</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <label>رقم الرخصة</label>
              <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="أدخل رقم الرخصة" />
            </div>
            <div>
              <label>اسم المنشأة</label>
              <input type="text" name="establishmentName" value={form.establishmentName} onChange={handleChange} placeholder="أدخل اسم المنشأة" />
            </div>
            <div>
              <label>رقم المنشأة</label>
              <input type="text" name="establishmentNumber" value={form.establishmentNumber} onChange={handleChange} placeholder="أدخل رقم المنشأة" />
            </div>
          </div>
        </div>

        <div>
          <label>الأمانة / المنطقة *</label>
          <select
            name="amana"
            value={Object.keys(baladyData).includes(form.amana) ? form.amana : ""}
            onChange={handleAmanaChange}
            style={{ marginBottom: '10px' }}
          >
            <option value="">-- اختر الأمانة من القائمة --</option>
            {Object.keys(baladyData).map((amanaName) => (
              <option key={amanaName} value={amanaName}>
                {amanaName}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="amana"
            value={form.amana}
            onChange={handleChange}
            placeholder="أو اكتب اسم الأمانة يدوياً هنا غير القائمة..."
            required
          />

          <div style={{ marginTop: '15px' }}>
            <label>مسار اللوجو (يمكن تعديله يدوياً)</label>
            <input type="text" name="selectedLogo" value={form.selectedLogo} onChange={handleChange} placeholder="مثال: logos/الرياض.png" />
          </div>

          {form.selectedLogo && (
            <img
              src={`/${form.selectedLogo}`}
              alt="لوجو الأمانة"
              style={{ width: '100px', height: '100px', objectFit: 'contain', marginTop: '10px', border: '1px solid #ddd', padding: '5px', borderRadius: '4px', backgroundColor: 'white' }}
              onError={(e) => { e.target.style.display = 'none'; }}
              onLoad={(e) => { e.target.style.display = 'block'; }}
            />
          )}
        </div>

        <div>
          <label>البلدية</label>
          <select
            name="baladiya"
            value={municipalities.includes(form.baladiya) ? form.baladiya : ""}
            onChange={handleChange}
            style={{ marginBottom: '10px' }}
          >
            <option value="">-- اختر البلدية من القائمة --</option>
            {municipalities.map((municipality, index) => (
              <option key={index} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="baladiya"
            value={form.baladiya}
            onChange={handleChange}
            placeholder="أو اكتب اسم البلدية يدوياً هنا غير القائمة..."
          />
        </div>

        <div>
          <label>رقم الهوية *</label>
          <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="أدخل رقم الهوية" required />
        </div>

        <div>
          <label>الجنس</label>
          <input type="text" name="gender" value={form.gender} onChange={handleChange} placeholder="ذكر / أنثى" />
        </div>

        <div>
          <label>رقم الشهادة الصحية</label>
          <input type="text" name="healthCertificateNumber" value={form.healthCertificateNumber} onChange={handleChange} placeholder="أدخل رقم الشهادة الصحية" />
        </div>

        <div>
          <label>الجنسية</label>
          <input type="text" name="nationality" value={form.nationality} onChange={handleChange} placeholder="أدخل الجنسية" />
        </div>

        <div>
          <label>المهنة</label>
          <input type="text" name="job" value={form.job} onChange={handleChange} placeholder="أدخل المهنة" />
        </div>

        <div>
          <label>تاريخ إصدار الشهادة الصحية (مستند / ميلادي)</label>
          <input type="date" name="healthCertIssueDate" value={form.healthCertIssueDate} onChange={handleChange} placeholder="تاريخ الإصدار" />
        </div>

        <div>
          <label>تاريخ إصدار الشهادة الصحية (هجري)</label>
          <input type="text" name="healthCertIssueDateHijri" value={form.healthCertIssueDateHijri} onChange={handleChange} placeholder="مثال: 1445/05/12" />
        </div>

        <div>
          <label>تاريخ انتهاء الشهادة الصحية (مستند / ميلادي)</label>
          <input type="date" name="healthCertExpiryDate" value={form.healthCertExpiryDate} onChange={handleChange} placeholder="تاريخ الانتهاء" />
        </div>

        <div>
          <label>تاريخ انتهاء الشهادة الصحية (هجري)</label>
          <input type="text" name="healthCertExpiryDateHijri" value={form.healthCertExpiryDateHijri} onChange={handleChange} placeholder="مثال: 1446/05/12" />
        </div>

        <div>
          <label>نوع البرنامج التثقيفي</label>
          <input type="text" name="educationalProgram" value={form.educationalProgram} onChange={handleChange} placeholder="أدخل نوع البرنامج التثقيفي" />
        </div>

        <div>
          <label>تاريخ انتهاء البرنامج التثقيفي</label>
          <input type="date" name="educationalProgramEndDate" value={form.educationalProgramEndDate} onChange={handleChange} placeholder="تاريخ انتهاء البرنامج" />
        </div>

        <div className="photo-edit-section">
          <label className="photo-label">صورة الشخص (اختياري)</label>
          
          <div className="photo-controls-wrapper">
            {photoPreview ? (
              <div className="photo-preview-container">
                <img
                  src={photoPreview}
                  alt="معاينة"
                  className="photo-preview-img"
                />
                <div className="photo-preview-info">
                  {photo ? (
                    <span className="photo-status-badge new">✓ تم اقتصاص صورة جديدة</span>
                  ) : (
                    <span className="photo-status-badge existing">✓ الصورة الحالية للشهادة</span>
                  )}
                  
                  <div className="photo-actions-buttons">
                    <button
                      type="button"
                      className="photo-action-btn edit"
                      onClick={() => setCropSrc(photoPreview)}
                    >
                      ✂️ تعديل وقص الصورة
                    </button>

                    {photo && existingPhotoUrl && (
                      <button
                        type="button"
                        className="photo-action-btn reset"
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview(existingPhotoUrl);
                        }}
                      >
                        ↺ استعادة الأصلية
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-photo-placeholder">
                لا توجد صورة حالية للشهادة
              </div>
            )}

            <div className="photo-upload-input-group">
              <span className="upload-input-label">
                {photoPreview ? "أو اختر صورة أخرى من جهازك:" : "اختر صورة من جهازك:"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="photo-file-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setCropSrc(ev.target.result);
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-group-checkbox" style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '15px', background: '#ffe4e4', borderRadius: '8px', border: '1px solid #ffcccc' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#d32f2f', margin: 0 }}>
            <input
              type="checkbox"
              name="isLocked"
              checked={form.isLocked}
              onChange={handleChange}
              style={{ width: '24px', height: '24px', marginLeft: '10px' }}
            />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>قفل الشهادة (منع العرض عند المسح)</span>
          </label>
        </div>

        <div className="edit-certificate-btn-group">
          <button type="submit" className="edit-certificate-btn edit-certificate-submit">✓ حفظ التعديلات</button>
          <button type="button" onClick={() => navigate("/dashboard")} className="edit-certificate-btn edit-certificate-cancel">
            إلغاء
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          aspectRatio={1}
          onCrop={(blob) => {
            const croppedFile = new File([blob], 'photo-cropped.jpg', { type: 'image/jpeg' });
            setPhoto(croppedFile);
            setPhotoPreview(URL.createObjectURL(blob));
            setCropSrc(null);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  );
}

export default EditCertificate;
