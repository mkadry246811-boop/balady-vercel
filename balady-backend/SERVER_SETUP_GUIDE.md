# ⚙️ دليل إعداد السيرفر — Server Setup Guide

## البنية العامة

```
Frontend (Vercel) ──► Backend API (Express.js / Vercel) ──► MongoDB Atlas + Cloudinary
```

- **Backend**: Express.js على Vercel (Serverless) أو أي VPS
- **Database**: MongoDB Atlas (NoSQL)
- **Images**: Cloudinary (رفع وتخزين الصور)
- **Auth**: JWT Tokens (صالح 8 ساعات)

---

## متغيرات البيئة (.env)

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
JWT_SECRET=<مفتاح_عشوائي_طويل_64_حرف>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
PORT=5000
SWAGGER_SERVER_URL=https://your-api.vercel.app   # اختياري - للإنتاج
```

> ⚠️ لو كلمة مرور MongoDB فيها `#` حولها لـ `%23`

---

## النشر على Vercel

| الإعداد | القيمة |
|---------|--------|
| **Root Directory** | `backend` |
| **Framework** | `Other` |
| **Environment Variables** | أضف كل متغيرات `.env` أعلاه |

---

## CORS — إضافة دومين جديد

لو عندك فرونت على دومين جديد، أضفه في `server.js`:

```javascript
const allowedOrigins = [
    'https://appbalady.vercel.app',
    'https://balabygov.vercel.app',
    'https://your-new-domain.com',    // ← أضف هنا
    'http://localhost:5173',
];
```

---

## ربط الفرونت بالباك

الفرونت يحتاج **شيء واحد**: رابط الـ API:

```env
VITE_API_URL=https://your-backend-api.vercel.app
```

---

## كل الـ Endpoints

| Method | Endpoint | Auth | الوصف |
|--------|----------|------|-------|
| `POST` | `/api/login` | ❌ | تسجيل الدخول |
| `GET` | `/api/certificates` | ✅ | قائمة الشهادات |
| `POST` | `/api/certificates` | ✅ | إنشاء شهادة (multipart) |
| `GET` | `/api/certificates/:id` | ❌ | عرض شهادة (عام - QR) |
| `PUT` | `/api/certificates/:id` | ✅ | تحديث شهادة |
| `DELETE` | `/api/certificates/:id` | ✅ | حذف شهادة |
| `GET` | `/api/certificates/license/:num` | ✅ | بحث برقم الرخصة |
| `GET` | `/api/certificates-next-number` | ✅ | الرقم التسلسلي التالي |
| `GET` | `/api/certificates-backup` | ✅ | تحميل نسخة احتياطية |
| `POST` | `/api/certificates-restore` | ✅ | استيراد نسخة احتياطية |
| `GET` | `/api-docs` | ❌ | Swagger UI |

> **Auth ✅** = أرسل Header: `Authorization: Bearer <token>`

---

## اختبار سريع

```bash
# اختبار الاتصال بـ MongoDB + Cloudinary
node test-connection.js

# اختبار Login
curl -X POST http://localhost:5000/api/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"123456\"}"
```

---

## أشهر المشاكل

| المشكلة | الحل |
|---------|------|
| فشل اتصال MongoDB | تأكد من `Network Access → 0.0.0.0/0` على Atlas |
| خطأ CORS | أضف دومين الفرونت في `allowedOrigins` بـ `server.js` |
| 401 Unauthorized | التوكن منتهي — سجّل دخول من جديد |
| Vercel 500 Error | تأكد Root Directory = `backend` + كل الـ env vars مضافة |
| الصور لا تظهر | راجع Cloudinary credentials في `.env` |
